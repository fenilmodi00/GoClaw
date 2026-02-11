import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { userService } from '@/services';
import { logger } from '@/lib/logger';

/**
 * POST /api/webhooks/clerk
 * 
 * Handles Clerk webhook events for user registration.
 * 
 * Flow:
 * 1. Verify Clerk webhook signature using Svix
 * 2. Parse user.created events
 * 3. Extract Clerk user ID and email from event
 * 4. Call UserService.createUserFromClerk()
 * 5. Return 200 OK response
 * 
 * Requirements: 1.1, 1.2, 1.3
 */
export async function POST(req: NextRequest) {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Get webhook headers for signature verification
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('Missing Svix headers');
      return NextResponse.json(
        { error: 'Missing webhook headers' },
        { status: 400 }
      );
    }

    // Get the raw body for signature verification
    const body = await req.text();

    // Verify webhook signature using Svix
    const wh = new Webhook(webhookSecret);
    let evt: {
      type: string;
      data: {
        id: string;
        email_addresses?: Array<{ id: string; email_address: string }>;
        primary_email_address_id?: string;
      };
    };

    try {
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as typeof evt;
    } catch (err) {
      console.error('Error verifying webhook signature:', err);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse the event
    const eventType = evt.type;
    logger.info(`Received Clerk webhook event: ${eventType}`);

    // Handle user.created event
    if (eventType === 'user.created') {
      const { id: clerkUserId, email_addresses } = evt.data;

      // Extract primary email address
      const primaryEmail = email_addresses?.find((e: { id: string; email_address: string }) => e.id === evt.data.primary_email_address_id);
      const email = primaryEmail?.email_address;

      if (!email) {
        console.error('No email address found in user.created event');
        return NextResponse.json(
          { error: 'Email address is required' },
          { status: 400 }
        );
      }

      logger.info(`Creating user for Clerk ID: ${clerkUserId}, email: ${email}`);

      // Use the injected userService

      try {
        // Create GoClaw user record
        const user = await userService.createUserFromClerk(clerkUserId, email);
        logger.info(`✅ User created: ${user.id}`);

        // Return success response
        return NextResponse.json({
          success: true,
          userId: user.id,
        });
      } catch (error) {
        console.error('Error processing user registration:', error);

        // Return error response
        // Do not leak internal error details to the caller
        return NextResponse.json(
          {
            error: 'Failed to process user registration',
          },
          { status: 500 }
        );
      }
    }

    // Ignore other event types
    console.log(`Ignoring event type: ${eventType}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Clerk webhook:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
