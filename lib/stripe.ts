import Stripe from 'stripe';

/**
 * StripeService handles all Stripe payment operations for GoClaw.
 * 
 * This service provides methods to:
 * - Create checkout sessions for $29 one-time payments
 * - Verify webhook signatures for secure webhook processing
 * - Construct webhook events from raw payloads
 */
export class StripeService {
  public stripe: Stripe; // Make stripe instance public for custom operations
  private webhookSecret: string;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    });

    this.webhookSecret = webhookSecret;
  }

  /**
   * Creates a Stripe checkout session for a one-time payment of $29.
   * 
   * The session includes:
   * - One-time payment mode
   * - $29 (2900 cents) price
   * - Deployment ID in metadata for webhook processing
   * - Success and cancel URLs for redirect after payment
   * 
   * @param params - Checkout session parameters
   * @param params.email - Customer email address
   * @param params.deploymentId - Unique deployment ID to track in metadata
   * @param params.successUrl - URL to redirect to after successful payment
   * @param params.cancelUrl - URL to redirect to if payment is cancelled
   * @returns Promise resolving to checkout session with id and url
   * 
   * @example
   * const session = await stripeService.createCheckoutSession({
   *   email: 'user@example.com',
   *   deploymentId: '123e4567-e89b-12d3-a456-426614174000',
   *   successUrl: 'https://goclaw.com/status/123e4567-e89b-12d3-a456-426614174000',
   *   cancelUrl: 'https://goclaw.com'
   * });
   * // Returns: { id: 'cs_test_...', url: 'https://checkout.stripe.com/...' }
   */
  async createCheckoutSession(params: {
    email: string;
    deploymentId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ id: string; url: string }> {
    const { email, deploymentId, successUrl, cancelUrl } = params;

    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'OpenClaw Bot Deployment',
                description: 'One-time deployment of OpenClaw AI bot to Akash Network',
              },
              unit_amount: 2900, // $29.00 in cents
            },
            quantity: 1,
          },
        ],
        metadata: {
          deploymentId,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      if (!session.url) {
        throw new Error('Stripe session created but no URL returned');
      }

      return {
        id: session.id,
        url: session.url,
      };
    } catch (error) {
      // Check if it's a Stripe error by checking the error name or type
      if (error && typeof error === 'object' && 'type' in error && typeof (error as Record<string, unknown>).type === 'string') {
        // This is likely a Stripe error
        const err = error as unknown as { message: string };
        throw new Error(`Stripe API error: ${err.message}`);
      }
      throw error;
    }
  }

  /**
   * Verifies the signature of a Stripe webhook request.
   * 
   * This method uses the Stripe webhook secret to verify that the webhook
   * request actually came from Stripe and hasn't been tampered with.
   * 
   * IMPORTANT: Always call this method before processing webhook payloads
   * to prevent unauthorized webhook requests.
   * 
   * @param payload - Raw webhook request body (as string)
   * @param signature - Stripe signature from the 'stripe-signature' header
   * @returns The verified Stripe event object
   * @throws Error if signature verification fails
   * 
   * @example
   * const event = stripeService.verifyWebhookSignature(
   *   rawBody,
   *   request.headers.get('stripe-signature')
   * );
   */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Webhook signature verification failed: ${error.message}`);
      }
      throw new Error('Webhook signature verification failed');
    }
  }

  /**
   * Constructs a Stripe event from a webhook payload.
   * 
   * This is an alias for verifyWebhookSignature() that provides a more
   * descriptive name for the operation.
   * 
   * @param payload - Raw webhook request body (as string)
   * @param signature - Stripe signature from the 'stripe-signature' header
   * @returns The verified Stripe event object
   * @throws Error if signature verification fails
   */
  constructWebhookEvent(payload: string, signature: string): Stripe.Event {
    return this.verifyWebhookSignature(payload, signature);
  }

  /**
   * Retrieves an existing checkout session by ID
   * 
   * Used to check if a pending payment link is still valid
   * 
   * @param sessionId - Stripe checkout session ID
   * @returns The checkout session or null if not found/expired
   */
  async getSession(sessionId: string): Promise<{ id: string; url: string | null } | null> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      
      // Only return sessions that are still open (not expired or completed)
      if (session.status === 'open') {
        return {
          id: session.id,
          url: session.url,
        };
      }
      
      return null;
    } catch (error) {
      // Session not found or error retrieving
      return null;
    }
  }
}

// Export a singleton instance for use across the application
export const stripeService = new StripeService();
