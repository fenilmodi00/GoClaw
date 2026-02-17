import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

/**
 * Users table schema
 * 
 * Stores user accounts for GoClaw SaaS platform.
 * Uses Clerk for authentication - stores clerk_user_id to link to Clerk identity.
 * Simplified schema with no trial management or Akash user accounts.
 * 
 * Requirements: 9.1
 */
export const users = sqliteTable(
  'users',
  {
    // Primary identifier (UUID)
    id: text('id').primaryKey(),

    // Clerk authentication
    clerkUserId: text('clerk_user_id').notNull().unique(),
    email: text('email').notNull().unique(),

    // Polar customer linking
    polarCustomerId: text('polar_customer_id').unique(),

    // Subscription details
    tier: text('tier').default('starter'), // 'starter' | 'pro' | 'business'
    subscriptionStatus: text('subscription_status').default('active'), // 'active' | 'incomplete' | 'past_due' | 'canceled' | 'unpaid'

    // Timestamps
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    // Index on clerk_user_id for fast Clerk user lookups
    clerkUserIdx: index('clerk_user_idx').on(table.clerkUserId),
    // Index on email for fast user lookups
    emailIdx: index('email_idx').on(table.email),
    // Index on polar_customer_id for fast Polar lookups
    polarCustomerIdx: index('polar_customer_idx').on(table.polarCustomerId),
  })
);

/**
 * Type for selecting a user record from the database
 */
export type User = typeof users.$inferSelect;

/**
 * Type for inserting a new user record into the database
 */
export type NewUser = typeof users.$inferInsert;

/**
 * Deployments table schema
 * 
 * Stores deployment records for OpenClaw bot deployments to Akash Network.
 * Sensitive fields (channelToken, channelApiKey) are encrypted before storage.
 * 
 * Requirements: 9.2
 */
export const deployments = sqliteTable(
  'deployments',
  {
    // Primary identifier (UUID)
    id: text('id').primaryKey(),

    // User information
    userId: text('user_id').notNull().references(() => users.id),
    email: text('email').notNull(),

    // Deployment configuration
    model: text('model').notNull(), // 'minimax-m2.5' | 'gpt-3.2' | 'gemini-3-flash'
    channel: text('channel').notNull(), // 'telegram' | 'discord' | 'whatsapp'

    // Encrypted credentials
    channelToken: text('channel_token').notNull(), // encrypted
    channelApiKey: text('channel_api_key'), // encrypted, optional

    // Secure deployment credentials
    clawApiKey: text('claw_api_key').unique(), // authenticates the deployed bot against our proxy

    // Akash deployment details (populated after deployment)
    akashDeploymentId: text('akash_deployment_id'),
    akashLeaseId: text('akash_lease_id'),
    providerUrl: text('provider_url'),

    // Status tracking
    status: text('status').notNull(), // 'pending' | 'deploying' | 'active' | 'failed'

    // Payment tracking
    paymentProvider: text('payment_provider').notNull().default('stripe'), // 'stripe' | 'polar'

    // Stripe
    stripeSessionId: text('stripe_session_id'), // Now nullable
    stripePaymentIntentId: text('stripe_payment_intent_id'),

    // Polar.sh
    polarId: text('polar_id'), // Checkout ID or Order ID

    // Error tracking
    errorMessage: text('error_message'),

    // Timestamps
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    // Index on stripe_session_id for fast webhook lookups
    stripeSessionIdx: index('stripe_session_idx').on(table.stripeSessionId),
    // Index on id for fast status queries (primary key already indexed, but explicit for clarity)
    idIdx: index('id_idx').on(table.id),
    // Index on user_id for efficient user deployment queries
    userIdIdx: index('user_id_idx').on(table.userId),
    // Index on status for filtering by deployment status
    statusIdx: index('deployment_status_idx').on(table.status),
    // Composite index for user + status queries (e.g., get user's active deployments)
    userStatusIdx: index('user_status_idx').on(table.userId, table.status),
  })
);

/**
 * Type for selecting a deployment record from the database
 */
export type Deployment = typeof deployments.$inferSelect;

/**
 * Type for inserting a new deployment record into the database
 */
export type NewDeployment = typeof deployments.$inferInsert;

/**
 * LLM Usage Log table schema
 * 
 * Tracks LLM token usage per user and per deployment for quota enforcement.
 * Each record represents a single LLM API call with token consumption.
 * 
 * Requirements: 8.1, 8.4
 */
export const llmUsageLog = sqliteTable(
  'llm_usage_log',
  {
    // Primary identifier (UUID)
    id: text('id').primaryKey(),

    // User reference (required)
    userId: text('user_id')
      .notNull()
      .references(() => users.id),

    // Deployment reference (optional - may be null for direct user API calls)
    deploymentId: text('deployment_id').references(() => deployments.id),

    // Token usage tracking
    tokensUsed: integer('tokens_used').notNull(),

    // LLM provider used for this call
    provider: text('provider').notNull(), // 'openai' | 'google' | 'claude' | 'akashml'

    // Timestamp of the API call
    timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    // Index on user_id for fast user quota queries
    userIdIdx: index('llm_usage_user_idx').on(table.userId),
    // Index on timestamp for time-based queries (billing periods)
    timestampIdx: index('llm_usage_timestamp_idx').on(table.timestamp),
  })
);

/**
 * Type for selecting an LLM usage log record from the database
 */
export type LLMUsageLog = typeof llmUsageLog.$inferSelect;

/**
 * Type for inserting a new LLM usage log record into the database
 */
export type NewLLMUsageLog = typeof llmUsageLog.$inferInsert;

/**
 * Provider Blacklist table schema
 * 
 * Stores Akash providers that should be excluded from deployments.
 * Used to blacklist problematic providers (e.g., those with persistent 503 errors).
 * 
 * Requirements: Blacklisted providers should not receive leases
 */
export const providerBlacklist = sqliteTable(
  'provider_blacklist',
  {
    // Primary identifier - the Akash provider address
    providerAddress: text('provider_address').primaryKey(),

    // Reason for blacklisting (e.g., "Persistent 503 errors", "SSL issues", "High failure rate")
    reason: text('reason').notNull().default('Provider blacklisted'),

    // When the provider was blacklisted
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),

    // When to automatically unblacklist (optional - null means permanent)
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
  },
  (table) => ({
    // Index on created_at for cleanup queries
    createdAtIdx: index('blacklist_created_at_idx').on(table.createdAt),
  })
);

/**
 * Type for selecting a blacklist record from the database
 */
export type ProviderBlacklist = typeof providerBlacklist.$inferSelect;

/**
 * Type for inserting a new blacklist record into the database
 */
export type NewProviderBlacklist = typeof providerBlacklist.$inferInsert;
