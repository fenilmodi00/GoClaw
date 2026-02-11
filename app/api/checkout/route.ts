import { NextRequest, NextResponse } from 'next/server';
import * as v from 'valibot';
import { CheckoutSchema } from '@/lib/validation';
import { deploymentService } from '@/services/deployment/deployment-service';
import { stripeService } from '@/lib/stripe';
import { userService } from '@/services/user/user-service';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { logger } from '@/lib/logger';

/**
 * POST /api/checkout
 * 
 * Creates a new deployment record and Stripe checkout session.
 * 
 * Flow:
 * 1. Validate request body using CheckoutSchema
 * 2. Get authenticated user from Clerk
 * 3. Check if user exists in database, create if not
 * 4. Create deployment record in database with status "pending"
 * 5. Create Stripe checkout session with one-time payment
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
        // Use the existing user record
        user = existingUserByEmail;
      } else {
        user = await userService.createUserFromClerk(clerkUserId, userEmail);
        logger.info('User created', { userId: user.id });
      }
    } else {
      logger.debug('User found', { userId: user.id });
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
        stripeSessionId: existingDeployment.stripeSessionId
      });

      // Retrieve existing Stripe session
      const existingSession = await stripeService.getSession(existingDeployment.stripeSessionId);
      
      if (existingSession && existingSession.url) {
        logger.info('Reusing existing Stripe session');
        return NextResponse.json({
          sessionUrl: existingSession.url,
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
    const successUrl = `${baseUrl}/status/${deploymentId}`;
    const cancelUrl = baseUrl;

    logger.debug('Creating Stripe checkout session');
    const session = await stripeService.createCheckoutSession({
      email: userEmail,
      deploymentId: deploymentId,
      successUrl,
      cancelUrl,
    });
    logger.info('Stripe session created', { sessionId: session.id });

    logger.debug('Creating deployment record');
    const deployment = await deploymentService.createDeployment({
      id: deploymentId,
      userId: user.id,
      email: userEmail,
      model: data.model,
      channel: data.channel,
      channelToken: data.channelToken,
      channelApiKey: undefined,
      stripeSessionId: session.id,
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
      // Check if it's a database or Stripe error
      if (error.message.includes('Stripe')) {
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
