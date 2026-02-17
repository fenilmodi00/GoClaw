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
     * Creates a Polar checkout session for a one-time payment or subscription.
     */
    async createCheckoutSession(params: {
        email: string;
        deploymentId: string;
        successUrl: string;
        customerId?: string;
        productId?: string;
        metadata?: Record<string, string>;
    }): Promise<Checkout> {
        const { email, deploymentId, successUrl, customerId, productId } = params;

        const targetProductId = productId || this.productId;

        if (!targetProductId) {
            throw new Error('Polar Product ID is not configured');
        }

        try {
            const checkout = await this.polar.checkouts.create({
                products: [targetProductId],
                successUrl: successUrl,
                customerEmail: email,
                customerId: customerId,
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
     * Gets active subscriptions for a customer
     */
    async getUserSubscriptions(customerId: string) {
        try {
            const response = await this.polar.subscriptions.list({
                customerId: [customerId],
                active: true,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (response as any).items || [];
        } catch (error) {
            console.error('Failed to get user subscriptions:', error);
            return [];
        }
    }

    /**
     * Validates the signature of a Polar webhook request.
     */
    validateWebhookSignature(payload: string, headers: Record<string, string>): unknown {
        if (!this.webhookSecret) {
            throw new Error('Polar webhook secret is not configured');
        }

        try {
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            if (err.message && (err.message.includes('already exists') || JSON.stringify(err).includes('already exists'))) {
                console.log(`Customer ${email} already exists, fetching details...`);
                const list = await this.polar.customers.list({
                    email: email,
                });

                const existing = list.result.items?.find(c => c.email === email);
                if (existing) {
                    return existing;
                }
            }

            throw new Error(`Failed to create Polar customer: ${err.message}`);
        }
    }

    /**
     * Records a usage event for a customer
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

            await cacheService.delete(`polar:meters:${polarCustomerId}`);
        } catch (error) {
            const err = error as Error;
            console.error(`Failed to record usage event: ${err.message}`);
        }
    }

    /**
     * Gets customer meter balance
     */
    async getCustomerMeters(customerId: string): Promise<CustomerMeter[]> {
        const cacheKey = `polar:meters:${customerId}`;
        
        try {
            const cached = await cacheService.get<CustomerMeter[]>(cacheKey);
            if (cached) {
                return cached;
            }
        } catch {
            // Fall through to fetch from API
        }

        try {
            const response = await this.polar.customerMeters.list({
                customerId: [customerId],
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const meters = (response as any).items || [];

            try {
                await cacheService.set(cacheKey, meters, 30);
            } catch {
                // Best effort caching
            }

            return meters;
        } catch (error) {
            console.error('Failed to get customer meters:', error);
            return [];
        }
    }

    /**
     * Validates that the ai_usage meter exists for a customer
     */
    async validateMeterExists(customerId: string): Promise<boolean> {
        try {
            const meters = await this.getCustomerMeters(customerId);
            const hasAiUsageMeter = meters.some((m: CustomerMeter) => 
                m.meter?.name === 'ai_usage'
            );
            
            if (!hasAiUsageMeter) {
                console.warn(`ai_usage meter not found for customer ${customerId}. Please create the meter in Polar dashboard.`);
            }
            
            return hasAiUsageMeter;
        } catch (error) {
            console.error('Failed to validate meter:', error);
            return false;
        }
    }

    /**
     * Records usage with validation and fallback
     */
    async recordUsageSafe(
        polarCustomerId: string, 
        eventName: string, 
        amount: number,
        fallbackToLocal: boolean = true
    ): Promise<{ success: boolean; recorded: boolean; error?: string }> {
        try {
            const meterExists = await this.validateMeterExists(polarCustomerId);
            
            if (!meterExists && !fallbackToLocal) {
                return { 
                    success: false, 
                    recorded: false, 
                    error: 'Meter not configured' 
                };
            }
            
            await this.recordUsage(polarCustomerId, eventName, amount);
            
            return { success: true, recorded: true };
        } catch (error) {
            const err = error as Error;
            console.error(`Failed to record usage to Polar: ${err.message}`);
            
            return { 
                success: fallbackToLocal, 
                recorded: false, 
                error: err.message 
            };
        }
    }

    /**
     * Subscribes a customer to a product (e.g., Free Tier)
     */
    async subscribeCustomer(customerId: string, productId: string): Promise<void> {
        try {
            await this.polar.subscriptions.create({
                productId,
                customerId,
            });
        } catch (error) {
            console.error('Failed to subscribe customer:', error);
        }
    }
}

// Singleton instance
export const polarService = new PolarService();
