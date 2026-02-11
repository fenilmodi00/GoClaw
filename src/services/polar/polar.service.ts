import { Polar } from '@polar-sh/sdk';
import { Webhook } from 'standardwebhooks';
import { Checkout } from '@polar-sh/sdk/models/components/checkout';
import { Customer } from '@polar-sh/sdk/models/components/customer';
import { CustomerMeter } from '@polar-sh/sdk/models/components/customermeter';
import { cacheService } from '../cache/cache.service';

/**
 * PolarService handles all Polar.sh payment operations for GoClaw.
 * 
 * This service provides methods to:
 * - Create checkout sessions for $29 one-time payments
 * - Verify webhook signatures for secure webhook processing
 */
export class PolarService {
    public polar: Polar;
    private webhookSecret: string;
    private productId: string;

    constructor() {
        const accessToken = process.env.POLAR_ACCESS_TOKEN;
        const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
        const productId = process.env.POLAR_PRODUCT_ID;
        const server = process.env.POLAR_SERVER as 'sandbox' | 'production' ?? 'sandbox';

        if (!accessToken) {
            // Warn but don't throw immediately to allow app to start if not using Polar yet
            console.warn('POLAR_ACCESS_TOKEN environment variable is not set');
        }

        if (!webhookSecret) {
            console.warn('POLAR_WEBHOOK_SECRET environment variable is not set');
        }

        if (!productId) {
            console.warn('POLAR_PRODUCT_ID environment variable is not set');
        }

        this.polar = new Polar({
            accessToken: accessToken ?? '',
            server,
        });

        this.webhookSecret = webhookSecret ?? '';
        this.productId = productId ?? '';
    }

    /**
     * Creates a Polar checkout session for a one-time payment.
     * 
     * @param params - Checkout session parameters
     * @param params.email - Customer email address
     * @param params.deploymentId - Unique deployment ID to track in metadata
     * @param params.successUrl - URL to redirect to after successful payment
     * @returns Promise resolving to checkout session with url
     */
    async createCheckoutSession(params: {
        email: string;
        deploymentId: string;
        successUrl: string;
        customerId?: string; // Polar Customer ID from DB
        metadata?: Record<string, string>; // Arbitrary metadata
    }): Promise<Checkout> {
        const { email, deploymentId, successUrl, customerId } = params;

        if (!this.productId) {
            throw new Error('Polar Product ID is not configured');
        }

        try {
            const checkout = await this.polar.checkouts.create({
                products: [this.productId],
                successUrl: successUrl,
                customerEmail: email,
                customerId: customerId, // Link to existing customer if available
                metadata: {
                    deploymentId: deploymentId,
                    ...params.metadata,
                },
            });

            return checkout;
        } catch (error) {
            const err = error as Error;
            throw new Error(`Polar API error: ${err.message}`);
        }
    }

    /**
     * Verifies the signature of a Polar webhook request.
     * 
     * @param payload - Raw webhook request body (as string)
     * @param headers - Request headers
     * @returns The verified webhook payload
     * @throws Error if signature verification fails
     */
    validateWebhookSignature(payload: string, headers: Record<string, string>): any { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!this.webhookSecret) {
            throw new Error('Polar webhook secret is not configured');
        }

        try {
            // Polar secrets are base64 encoded for standardwebhooks
            const base64Secret = Buffer.from(this.webhookSecret).toString('base64');
            const wh = new Webhook(base64Secret);
            return wh.verify(payload, headers);
        } catch (error) {
            const err = error as Error;
            throw new Error(`Webhook signature verification failed: ${err.message}`);
        }
    }

    /**
     * Retrieves an existing checkout session by ID
     * 
     * Used to check if a pending payment link is still valid
     * 
     * @param sessionId - Polar checkout session ID
     * @returns The checkout session or null if not found/expired
     */
    async getCheckoutSession(sessionId: string): Promise<Checkout | null> {
        try {
            const session = await this.polar.checkouts.get({ id: sessionId });
            return session;
        } catch {
            return null;
        }
    }

    /**
     * Creates a new Polar customer
     * 
     * @param email - Customer email
     * @param name - Customer name (optional)
     * @param clerkUserId - Internal User ID (Clerk ID) to map as external_id
     */
    async createCustomer(email: string, name?: string, clerkUserId?: string): Promise<Customer> {
        try {
            const customer = await this.polar.customers.create({
                email,
                name,
                externalId: clerkUserId,
            });
            return customer;
        } catch (error) {
            const err = error as Error;
            throw new Error(`Failed to create Polar customer: ${err.message}`);
        }
    }

    /**
     * Records a usage event for a customer
     * 
     * @param customerId - Polar Customer ID (not Clerk ID)
     * @param eventName - Name of the event (e.g., 'ai_usage')
     * @param amount - Amount to record (e.g., token count)
     */
    async recordUsage(polarCustomerId: string, eventName: string, amount: number): Promise<void> {
        try {
            await this.polar.events.ingest({
                events: [
                    {
                        customerId: polarCustomerId,
                        name: eventName,
                        metadata: {
                            amount: amount,
                        },
                        timestamp: new Date(),
                    }
                ]
            });

            // Invalidate meter cache for this customer
            await cacheService.delete(`polar:meters:${polarCustomerId}`);
        } catch (error) {
            // Log but don't crash the flow usually, but here we might want to know
            const err = error as Error;
            console.error(`Failed to record usage event: ${err.message}`);
        }
    }


    /**
     * Gets customer meter balance
     * 
     * @param customerId - Polar Customer ID
     */
    /**
     * Gets customer meter balance
     * 
     * @param customerId - Polar Customer ID
     */
    async getCustomerMeters(customerId: string): Promise<CustomerMeter[]> {
        const cacheKey = `polar:meters:${customerId}`;
        const cached = await cacheService.get<CustomerMeter[]>(cacheKey);

        if (cached) {
            return cached;
        }

        try {
            const response = await this.polar.customerMeters.list({
                customerId: [customerId],
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const meters = (response as any).items || [];

            // Cache for 1 minute (short TTL for near real-time updates)
            await cacheService.set(cacheKey, meters, 60);

            return meters;
        } catch (error) {
            console.error('Failed to get customer meters:', error);
            return [];
        }
    }
    /**
     * Subscribes a customer to a product (e.g., Free Tier)
     * 
     * @param customerId - Polar Customer ID
     * @param productId - Product ID to subscribe to
     */
    async subscribeCustomer(customerId: string, productId: string): Promise<void> {
        try {
            await this.polar.subscriptions.create({
                productId,
                customerId,
            });
        } catch (error) {
            console.error('Failed to subscribe customer:', error);
            // Don't throw, just log. This is a "nice to have" for free tier.
        }
    }
}

// Singleton instance
export const polarService = new PolarService();
