import { NextRequest, NextResponse } from 'next/server';
import * as v from 'valibot';
import { CheckoutSchema } from '@/types/api';
import { deploymentService, polarService, userService } from '@/services';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/middleware/rate-limit';

/**
 * POST /api/checkout
 * 
 * Creates a new deployment record and Polar checkout session.
 * 
 * Flow:
 * 1. Validate request body using CheckoutSchema
 * 2. Get authenticated user from Clerk
 * 3. Check if user exists in database, create if not
 * 4. Create deployment record in database with status "pending"
 * 5. Create Polar checkout session with one-time payment
 * 6. Return session URL and deployment ID for redirect
 * 
 * Requirements: 2.2, 7.1, 7.4, 7.5, 8.1, 8.6
 * 
 * @param request - Next.js request object with deployment configuration
 * @returns JSON response with sessionUrl and deploymentId, or error
 */
export async function POST(request: NextRequest) {
  try {
    logger.info('Checkout API: Received request');

    // Get authenticated user from Clerk
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      logger.warn('Checkout API: User not authenticated');
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    // Rate limit: 5 checkout requests per user per 60 seconds
    const rateLimitResult = await rateLimit(`checkout:${clerkUserId}`, 5, 60_000);
    if (!rateLimitResult.success) {
      logger.warn('Checkout API: Rate limit exceeded', { clerkUserId });
      return NextResponse.json(
        { error: 'Too many requests. Please wait before trying again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.resetMs / 1000)) } }
      );
    }

    logger.debug('Clerk user authenticated', { clerkUserId });

    // Get user email from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      logger.error('Checkout API: User email not found');
      return NextResponse.json(
        { error: 'User email not found. Please update your profile.' },
        { status: 400 }
      );
    }

    logger.debug('User email retrieved', { email: userEmail });

    // Parse request body
    const body = await request.json();

    // Validate request body using Valibot schema (Requirement 8.6)
    const validationResult = v.safeParse(CheckoutSchema, body);

    if (!validationResult.success) {
      logger.warn('Validation failed', { issues: validationResult.issues });
      // Return validation errors with field-specific messages (Requirement 7.4)
      const errors = validationResult.issues.map(issue => ({
        field: issue.path?.[0]?.key || 'unknown',
        message: issue.message,
      }));

      return NextResponse.json(
        {
          error: 'Validation failed',
          details: errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.output;
    logger.debug('Validation passed');

    // Check if user exists in our database
    let user = await userService.getUserByClerkId(clerkUserId);

    if (!user) {
      logger.info('User not found in database, creating new user');

      // Check if email exists with different Clerk ID (user was deleted and recreated)
      const existingUserByEmail = await userService.getUserByEmail(userEmail);
      if (existingUserByEmail) {
        logger.warn('User with same email exists but different Clerk ID, updating Clerk ID', {
          oldClerkId: existingUserByEmail.clerkUserId,
          newClerkId: clerkUserId
        });

        // Persist the new Clerk ID to the database (Crucial for webhook lookup)
        const updatedUser = await userService.updateClerkId(existingUserByEmail.id, clerkUserId);

        if (updatedUser) {
          // Use the updated user record
          user = updatedUser;
          logger.info('User account linked successfully', { userId: user.id });
        } else {
          logger.error('Failed to update Clerk ID for existing user', { userId: existingUserByEmail.id });
          // Fallback to existing user, but this might cause issues downstream if webhook relies on new ID
          user = existingUserByEmail;
        }
      } else {
        user = await userService.createUserFromClerk(clerkUserId, userEmail);
        logger.info('User created', { userId: user.id });
      }
    } else {
      logger.debug('User found', { userId: user.id });
    }

    // Ensure Polar customer is linked if missing
    if (user && !user.polarCustomerId) {
      try {
        logger.info('Linking missing Polar Customer ID for user', { userId: user.id });
        const polarCustomer = await polarService.createCustomer(userEmail, undefined, clerkUserId);
        await userService.updatePolarCustomerId(user.id, polarCustomer.id);
        user.polarCustomerId = polarCustomer.id;
      } catch (err) {
        logger.warn('Failed to link Polar customer', err);
      }
    }

    // Check for existing pending deployment with same configuration
    // This allows reusing payment links for identical deployments
    logger.debug('Checking for pending duplicate deployment');
    const existingDeployment = await deploymentService.findPendingDuplicate(
      user.id,
      data.model,
      data.channel,
      data.channelToken
    );

    if (existingDeployment) {
      logger.info('Found existing pending deployment, reusing payment link', {
        deploymentId: existingDeployment.id,
        paymentProvider: existingDeployment.paymentProvider,
        polarId: existingDeployment.polarId,
        stripeSessionId: existingDeployment.stripeSessionId
      });

      let sessionUrl: string | undefined;

      // Handle Polar
      if (existingDeployment.paymentProvider === 'polar' && existingDeployment.polarId) {
        const existingSession = await polarService.getCheckoutSession(existingDeployment.polarId);
        if (existingSession && existingSession.status === 'open') {
          sessionUrl = existingSession.url;
        }
      }

      if (sessionUrl) {
        logger.info('Reusing existing checkout session');
        return NextResponse.json({
          sessionUrl: sessionUrl,
          deploymentId: existingDeployment.id,
        });
      }

      logger.warn('Existing session expired or invalid, creating new one');
    }

    // Generate deployment ID upfront
    const deploymentId = crypto.randomUUID();
    logger.debug('Generated deployment ID', { deploymentId });

    // Get the base URL for success/cancel redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/dashboard`;
    // const cancelUrl = baseUrl; // Polar might not require cancelUrl or use it differently? SDK doesn't show it in params I checked.
    // Checked SDK logic: create params. 
    // I noticed in PolarService.createCheckoutSession I only passed successUrl.
    // Let's stick to what I implemented in PolarService.

    // Validate Polar Customer ID to avoid 422 errors
    let polarCustomerId = user.polarCustomerId || undefined;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (polarCustomerId && !uuidRegex.test(polarCustomerId)) {
      logger.warn('Invalid Polar Customer ID validation in checkout', { polarCustomerId });
      polarCustomerId = undefined; // Fallback to creating new customer/guest checkout
    }

    let session;
    try {
      session = await polarService.createCheckoutSession({
        email: userEmail,
        deploymentId: deploymentId,
        successUrl,
        customerId: polarCustomerId, // Integrate with DB: Link checkout to existing Polar customer
        metadata: {
          userId: user.id, // Internal DB ID
          clerkUserId: clerkUserId, // Clerk ID for backup
        },
      });
    } catch (error) {
      const err = error as Error;
      // Check for "Customer does not exist" error from Polar
      if (err.message && (err.message.includes('Customer does not exist') || err.message.includes('Resource not found'))) {
        logger.warn('Stale Polar Customer ID found, creating new customer and retrying', { oldPolarCustomerId: polarCustomerId });

        // Create new Polar customer
        const newPolarCustomer = await polarService.createCustomer(userEmail, undefined, clerkUserId);

        // Update user in DB
        await userService.updatePolarCustomerId(user.id, newPolarCustomer.id);

        // Retry checkout creation with new ID
        session = await polarService.createCheckoutSession({
          email: userEmail,
          deploymentId: deploymentId,
          successUrl,
          customerId: newPolarCustomer.id,
          metadata: {
            userId: user.id,
            clerkUserId: clerkUserId,
          },
        });
      } else {
        throw error; // Re-throw other errors
      }
    }
    logger.info('Polar session created', { sessionId: session.id });

    logger.debug('Creating deployment record');
    const deployment = await deploymentService.createDeployment({
      id: deploymentId,
      userId: user.id,
      email: userEmail,
      model: data.model,
      channel: data.channel,
      channelToken: data.channelToken,
      channelApiKey: undefined,

      // Polar fields
      paymentProvider: 'polar',
      polarId: session.id,
    });
    logger.info('Deployment created', { deploymentId: deployment.id });

    logger.info('Checkout completed successfully');
    // Return session URL and deployment ID
    return NextResponse.json({
      sessionUrl: session.url,
      deploymentId: deployment.id,
    });

  } catch (error) {
    // Log error for debugging (Requirement 7.4)
    logger.error('Checkout API error', error);

    // Return user-friendly error message without exposing technical details
    if (error instanceof Error) {
      // Check if it's a database or Polar/Stripe error
      if (error.message.includes('Polar')) {
        return NextResponse.json(
          { error: 'Payment processing failed. Please try again.' },
          { status: 500 }
        );
      }

      if (error.message.includes('database') || error.message.includes('Database')) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
