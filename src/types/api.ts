import * as v from 'valibot';

/**
 * Validation schema for Clerk webhook events
 * Validates user.created webhook from Clerk authentication service
 * 
 * Requirements: 1.2, 1.3
 */
export const ClerkWebhookSchema = v.object({
  type: v.literal('user.created'),
  data: v.object({
    id: v.string(),
    email_addresses: v.array(v.object({
      email_address: v.string(),
    })),
  }),
});

/**
 * Validation schema for checkout request
 * Validates user input for creating a new OpenClaw bot deployment
 * 
 * Note: userId is obtained from Clerk authentication context, not from request body
 * Email is obtained from Clerk user profile, not from request body
 * 
 * Requirements: 2.2, 2.3, 2.4, 2.5, 8.6, 13.3
 */
export const CheckoutSchema = v.object({
  model: v.pipe(
    v.string(),
    v.picklist(['MiniMaxAI/MiniMax-M2.5', 'meta-llama/Llama-3.2-3B-Instruct', 'google/gemma-3-4b-it'], 'Invalid model selection')
  ),
  channel: v.pipe(
    v.string(),
    v.picklist(['telegram', 'discord', 'whatsapp'], 'Invalid channel selection')
  ),
  channelToken: v.pipe(
    v.string(),
    v.minLength(1, 'Channel token is required'),
    v.regex(/^\d+:[A-Za-z0-9_-]+$/, 'Invalid Telegram bot token format. Expected format: 123456:ABC-DEF...')
  ),
  tier: v.optional(v.picklist(['starter', 'pro', 'business'], 'Invalid tier selection')),
});

/**
 * Validation schema for status query parameters
 * Validates deployment ID when querying deployment status
 */
export const StatusQuerySchema = v.object({
  id: v.pipe(
    v.string(),
    v.uuid('Invalid deployment ID. Must be a valid UUID')
  ),
});

/**
 * TypeScript type inferred from CheckoutSchema
 * Represents validated checkout request data
 * 
 * Requirements: 13.3
 */
export type CheckoutData = v.InferOutput<typeof CheckoutSchema>;

/**
 * TypeScript type inferred from ClerkWebhookSchema
 * Represents validated Clerk webhook event data
 * 
 * Requirements: 1.2, 1.3
 */
export type ClerkWebhookData = v.InferOutput<typeof ClerkWebhookSchema>;

/**
 * TypeScript type inferred from StatusQuerySchema
 * Represents validated status query parameters
 * 
 * Requirements: 8.4
 */
export type StatusQuery = v.InferOutput<typeof StatusQuerySchema>;

/**
 * Model selection type - extracted from schema for reuse
 * 
 * Requirements: 2.2, 13.3
 */
export type Model = 'minimax-m2.5' | 'gpt-3.2' | 'gemini-3-flash';

/**
 * Channel selection type - extracted from schema for reuse
 * 
 * Requirements: 2.3, 13.3
 */
export type Channel = 'telegram' | 'discord' | 'whatsapp';

