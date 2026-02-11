import { NextRequest, NextResponse } from 'next/server';
import { polarService } from '@/services/polar/polar.service';
import { getUserRepository } from '@/db/repositories/user-repository';
import { logger } from '@/lib/logger';

const userRepository = getUserRepository();

/**
 * POST /api/webhooks/polar
 * 
 * Handles Polar.sh webhook events.
 * 
 * Key Events:
 * - checkout.created: Used to link a new Polar Customer ID to our internal User if not already linked.
 * - order.created: Backup for linking if checkout event is missed.
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Validate Signature
        const bodyText = await req.text();
        const headers: Record<string, string> = {};
        req.headers.forEach((value, key) => {
            headers[key] = value;
        });

        // This throws if invalid
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let payload: any;
        try {
            payload = polarService.validateWebhookSignature(bodyText, headers);
        } catch (err) {
            logger.warn('Polar webhook signature validation failed', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const eventType = payload.type;
        const data = payload.data;

        logger.info(`Received Polar webhook: ${eventType}`, { id: data.id });

        // 2. Handle Events
        if (eventType === 'checkout.created' || eventType === 'order.created') {
            // Check metadata for our user ID
            // Polar Payload structure: data.metadata or data.custom_fields depending on object
            // For checkout.created, data is a Checkout object which has metadata.
            const metadata = data.metadata || {};
            const clerkUserId = metadata.clerkUserId;
            const customerId = data.customer_id; // The Polar Customer ID

            if (clerkUserId && customerId) {
                logger.info(`Linking Polar Customer ${customerId} to Clerk User ${clerkUserId}`);

                // Find our user
                const user = await userRepository.findByClerkId(clerkUserId);
                if (user) {
                    if (user.polarCustomerId !== customerId) {
                        await userRepository.update(user.id, {
                            polarCustomerId: customerId
                        });
                        logger.info(`✅ Successfully linked Polar Customer ID`);
                    } else {
                        logger.debug('User already linked to this Polar Customer ID');
                    }
                } else {
                    logger.warn(`User not found for Clerk ID: ${clerkUserId}`);
                }
            }
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        logger.error('Error processing Polar webhook', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
