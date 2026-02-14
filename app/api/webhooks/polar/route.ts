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
        // 2. Handle Events
        if (eventType === 'checkout.created' || eventType === 'order.created') {
            // ... existing user linking logic ...
            const metadata = data.metadata || {};
            const clerkUserId = metadata.clerkUserId;
            const customerId = data.customer_id;

            if (clerkUserId && customerId) {
                // ... existing linking logic ...
                const user = await userRepository.findByClerkId(clerkUserId);
                if (user && user.polarCustomerId !== customerId) {
                    await userRepository.update(user.id, { polarCustomerId: customerId });
                    logger.info(`✅ Successfully linked Polar Customer ID from ${eventType}`);
                }
            }
        }

        // 3. Handle Payment Success (Trigger Deployment)
        // checkout.updated (status: succeeded/confirmed), subscription.created, order.paid
        if (
            (eventType === 'checkout.updated' && (data.status === 'succeeded' || data.status === 'confirmed')) ||
            eventType === 'subscription.created' ||
            eventType === 'subscription.updated' ||
            eventType === 'order.paid'
        ) {
            const polarId = data.id;
            const checkoutId = data.checkout_id; // For subscription/order events linked to a checkout

            logger.info(`Processing payment success event: ${eventType}`, { id: polarId });

            // 4. Handle Subscription Tier Sync
            if (eventType === 'subscription.created' || eventType === 'subscription.updated') {
                const productId = data.product_id;
                const customerId = data.customer_id;
                const status = data.status; // 'active', 'canceled', etc.

                if (customerId && productId) {
                    const user = await userRepository.findByPolarId(customerId);
                    if (user) {
                        const { getTierByProductId } = await import('@/config/pricing');
                        const tier = getTierByProductId(productId);

                        // Handle tier changes with grace period support
                        // Keep current tier during grace period unless explicitly canceled/unpaid
                        let newTier: string;
                        if (status === 'active' && tier) {
                            newTier = tier.id;
                        } else if (status === 'canceled' || status === 'unpaid') {
                            // Downgrade to starter after grace period
                            newTier = 'starter';
                        } else {
                            // Keep current tier during grace period (past_due, incomplete, etc.)
                            newTier = user.tier || 'starter';
                        }

                        await userRepository.update(user.id, {
                            tier: newTier,
                            subscriptionStatus: status
                        });
                        logger.info(`✅ Updated user ${user.id} tier to ${tier?.id} (${status})`);
                    }
                }
            }

            // Find deployment by Polar ID (could be the checkout ID stored in DB)
            // We store the checkout session ID in deployment.polarId

            // Try matching by the ID of the event itself (if we stored subscription ID) OR the linked checkout ID
            let deployment = await import('@/services').then(m => m.deploymentService.findPendingDuplicate(
                // This method is for pre-creation check, we need findByPolarId
                // Accessing via repository directly or service? 
                // Let's use the new repository method we just added
                // But wait, we are in the route handler, we can use deploymentService if we expose it or repo
                // We need to import deploymentRepository
                '', '', '', '' // Placeholder, we aren't using this method
            )).catch(() => null);

            // Correct approach: Use DeploymentRepository directly or add findByPolarId to Service
            // Let's assume we added findByPolarId to Repository. 
            // We need to import getDeploymentRepository locally to avoid circular deps if any
            const deploymentRepo = await import('@/db/repositories/deployment-repository').then(m => m.getDeploymentRepository());

            // Search by the ID we have (the session ID)
            // If event is checkout.updated, data.id IS the session ID.
            // If event is subscription.created, data.checkout_id might be the session ID.

            let targetId = polarId;
            if (eventType !== 'checkout.updated' && checkoutId) {
                targetId = checkoutId;
            }

            deployment = await deploymentRepo.findByPolarId(targetId);

            if (deployment && deployment.status === 'pending') {
                logger.info(`🚀 Triggering deployment for ${deployment.id}`);
                await import('@/services').then(m => m.deploymentService.deploy(deployment!));
            } else if (deployment) {
                logger.info(`Deployment ${deployment.id} already in status: ${deployment.status}`);
            } else {
                logger.warn(`No pending deployment found for Polar ID: ${targetId}`);
            }
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        logger.error('Error processing Polar webhook', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
