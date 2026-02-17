# Database Layer (`src/db`)

GoClaw uses Turso (SQLite) with Drizzle ORM and a repository pattern.

## Layout

- `src/db/index.ts` - database client initialization
- `src/db/schema.ts` - table definitions and inferred TS types
- `src/db/repositories/` - data access classes
- `src/db/migrations/` - SQL migrations + migration metadata

## Tables

### `users`

Purpose:

- maps Clerk identities to internal users
- stores Polar customer linkage and subscription tier/status

Key columns:

- `id` (UUID PK)
- `clerk_user_id` (unique)
- `email` (unique)
- `polar_customer_id` (unique, nullable)
- `tier` (`starter` default)
- `subscription_status` (`active` default)
- `created_at`, `updated_at`

### `deployments`

Purpose:

- stores requested deployment configuration and lifecycle state
- tracks payment linkage and Akash deployment details

Key columns:

- `id` (UUID PK)
- `user_id` (FK to `users.id`)
- `model`, `channel`
- `channel_token`, `channel_api_key` (sensitive values)
- `claw_api_key` (bot auth key)
- `akash_deployment_id`, `akash_lease_id`, `provider_url`
- `status` (`pending` | `deploying` | `active` | `failed`)
- `payment_provider` (`stripe` | `polar`)
- `stripe_session_id`, `stripe_payment_intent_id`
- `polar_id`
- `error_message`
- `created_at`, `updated_at`

### `llm_usage_log`

Purpose:

- records token usage events for quota/billing logic

Key columns:

- `id` (UUID PK)
- `user_id` (FK)
- `deployment_id` (optional FK)
- `tokens_used`
- `provider`
- `timestamp`

### `provider_blacklist`

Purpose:

- excludes Akash providers that repeatedly fail or are unhealthy

Key columns:

- `provider_address` (PK)
- `reason`
- `created_at`
- `expires_at` (nullable)

## Repositories

### User repository

File: `src/db/repositories/user-repository.ts`

- create user
- find by id/clerk/email/polar
- update user fields

### Deployment repository

File: `src/db/repositories/deployment-repository.ts`

- create deployment
- lookup by id/stripe/polar
- find by user
- find pending duplicates
- update status and deployment details

### Provider blacklist repository

File: `src/db/repositories/blacklist-repository.ts`

- add/remove/list blacklisted providers
- supports exclusion logic in Akash deployment selection

## Migration workflow

```bash
npm run db:generate
npm run db:migrate
```

## Notes

- Keep secrets out of migrations and source control.
- `channel_token` and related sensitive fields should only be read through service/repository paths that enforce encryption boundaries.
