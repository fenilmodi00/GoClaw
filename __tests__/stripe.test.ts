import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { StripeService } from '../lib/stripe';
import Stripe from 'stripe';

// Create mock functions that will be reused
const mockCreate = vi.fn();
const mockConstructEvent = vi.fn();

// Create a mock StripeError class
class MockStripeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StripeError';
  }
}

// Mock the Stripe module
vi.mock('stripe', () => {
  const mockStripe = {
    checkout: {
      sessions: {
        create: mockCreate,
      },
    },
    webhooks: {
      constructEvent: mockConstructEvent,
    },
    errors: {
      StripeError: MockStripeError,
    },
  };

  return {
    default: vi.fn(() => mockStripe),
  };
});

describe('StripeService', () => {
  let stripeService: StripeService;

  beforeEach(() => {
    // Reset environment variables
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123';

    // Clear all mocks
    vi.clearAllMocks();

    // Create a new service instance
    stripeService = new StripeService();
  });

  describe('constructor', () => {
    it('should throw error if STRIPE_SECRET_KEY is missing', () => {
      delete process.env.STRIPE_SECRET_KEY;
      expect(() => new StripeService()).toThrow('STRIPE_SECRET_KEY environment variable is required');
    });

    it('should throw error if STRIPE_WEBHOOK_SECRET is missing', () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;
      expect(() => new StripeService()).toThrow('STRIPE_WEBHOOK_SECRET environment variable is required');
    });

    it('should initialize Stripe with correct API version', () => {
      // Stripe constructor is called during service initialization
      expect(Stripe).toHaveBeenCalledWith('sk_test_123', {
        apiVersion: '2025-02-24.acacia',
        typescript: true,
      });
    });
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session with correct parameters', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      };

      mockCreate.mockResolvedValue(mockSession);

      const params = {
        email: 'user@example.com',
        deploymentId: '123e4567-e89b-12d3-a456-426614174000',
        successUrl: 'https://simpleclaw.com/status/123e4567-e89b-12d3-a456-426614174000',
        cancelUrl: 'https://simpleclaw.com',
      };

      const result = await stripeService.createCheckoutSession(params);

      expect(mockCreate).toHaveBeenCalledWith({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: 'user@example.com',
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
          deploymentId: '123e4567-e89b-12d3-a456-426614174000',
        },
        success_url: 'https://simpleclaw.com/status/123e4567-e89b-12d3-a456-426614174000',
        cancel_url: 'https://simpleclaw.com',
      });

      expect(result).toEqual({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });
    });

    it('should create session with exactly $29 (2900 cents)', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      };

      mockCreate.mockResolvedValue(mockSession);

      await stripeService.createCheckoutSession({
        email: 'user@example.com',
        deploymentId: '123e4567-e89b-12d3-a456-426614174000',
        successUrl: 'https://simpleclaw.com/status/123',
        cancelUrl: 'https://simpleclaw.com',
      });

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.line_items[0].price_data.unit_amount).toBe(2900);
    });

    it('should include deployment ID in session metadata', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      };

      mockCreate.mockResolvedValue(mockSession);

      const deploymentId = '123e4567-e89b-12d3-a456-426614174000';

      await stripeService.createCheckoutSession({
        email: 'user@example.com',
        deploymentId,
        successUrl: 'https://simpleclaw.com/status/123',
        cancelUrl: 'https://simpleclaw.com',
      });

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.metadata.deploymentId).toBe(deploymentId);
    });

    it('should throw error if session URL is missing', async () => {
      mockCreate.mockResolvedValue({
        id: 'cs_test_123',
        url: null,
      });

      await expect(
        stripeService.createCheckoutSession({
          email: 'user@example.com',
          deploymentId: '123e4567-e89b-12d3-a456-426614174000',
          successUrl: 'https://simpleclaw.com/status/123',
          cancelUrl: 'https://simpleclaw.com',
        })
      ).rejects.toThrow('Stripe session created but no URL returned');
    });

    it('should handle Stripe API errors gracefully', async () => {
      // Create an error that looks like a Stripe error (has a 'type' property)
      const stripeError = Object.assign(new Error('Invalid API key'), { type: 'StripeInvalidRequestError' });
      mockCreate.mockRejectedValue(stripeError);

      await expect(
        stripeService.createCheckoutSession({
          email: 'user@example.com',
          deploymentId: '123e4567-e89b-12d3-a456-426614174000',
          successUrl: 'https://simpleclaw.com/status/123',
          cancelUrl: 'https://simpleclaw.com',
        })
      ).rejects.toThrow('Stripe API error: Invalid API key');
    });

    it('should propagate non-Stripe errors', async () => {
      const genericError = new Error('Network error');
      mockCreate.mockRejectedValue(genericError);

      await expect(
        stripeService.createCheckoutSession({
          email: 'user@example.com',
          deploymentId: '123e4567-e89b-12d3-a456-426614174000',
          successUrl: 'https://simpleclaw.com/status/123',
          cancelUrl: 'https://simpleclaw.com',
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify webhook signature and return event', () => {
      const mockEvent = {
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_intent: 'pi_test_123',
            metadata: {
              deploymentId: '123e4567-e89b-12d3-a456-426614174000',
            },
          },
        },
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      const payload = JSON.stringify({ test: 'data' });
      const signature = 't=1234567890,v1=signature';

      const result = stripeService.verifyWebhookSignature(payload, signature);

      expect(mockConstructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        'whsec_123'
      );

      expect(result).toEqual(mockEvent);
    });

    it('should throw error if signature verification fails', () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const payload = JSON.stringify({ test: 'data' });
      const signature = 't=1234567890,v1=invalid_signature';

      expect(() => stripeService.verifyWebhookSignature(payload, signature)).toThrow(
        'Webhook signature verification failed: Invalid signature'
      );
    });

    it('should handle non-Error exceptions', () => {
      mockConstructEvent.mockImplementation(() => {
        throw 'String error';
      });

      const payload = JSON.stringify({ test: 'data' });
      const signature = 't=1234567890,v1=invalid_signature';

      expect(() => stripeService.verifyWebhookSignature(payload, signature)).toThrow(
        'Webhook signature verification failed'
      );
    });
  });

  describe('constructWebhookEvent', () => {
    it('should be an alias for verifyWebhookSignature', () => {
      const mockEvent = {
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
          },
        },
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      const payload = JSON.stringify({ test: 'data' });
      const signature = 't=1234567890,v1=signature';

      const result = stripeService.constructWebhookEvent(payload, signature);

      expect(mockConstructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        'whsec_123'
      );

      expect(result).toEqual(mockEvent);
    });
  });
});
