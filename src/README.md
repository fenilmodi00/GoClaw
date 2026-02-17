# Source Layer (`src/`)

This folder contains application logic used by routes and UI.

## Directory map

- `src/components/` - reusable UI and feature components
- `src/config/` - runtime configuration (pricing tiers)
- `src/db/` - Drizzle schema, repositories, migrations, DB setup
- `src/hooks/` - custom React hooks
- `src/lib/` - cross-cutting utilities (errors, logging, billing, encryption, startup)
- `src/middleware/` - request limiting and throttling helpers
- `src/services/` - business logic services and orchestration
- `src/types/` - shared request/response and schema-derived types

## Services

- `src/services/akash/akash.service.ts`
  - Akash deployment orchestration (SDL generation, bids, lease creation, retries, provider filtering)
- `src/services/deployment/deployment.service.ts`
  - deployment lifecycle management and status transitions
- `src/services/user/user.service.ts`
  - user lookup/create/linking between Clerk and Polar
- `src/services/polar/polar.service.ts`
  - checkout sessions, webhook signature validation, subscriptions, meter usage events
- `src/services/telegram/telegram.service.ts`
  - helper methods for Telegram bot metadata/links
- `src/services/cache/cache.service.ts`
  - cache abstraction used by services
- `src/services/index.ts`
  - central exports used by route handlers

## Core data and repositories

- Schema: `src/db/schema.ts`
- User repository: `src/db/repositories/user-repository.ts`
- Deployment repository: `src/db/repositories/deployment-repository.ts`
- Provider blacklist repository: `src/db/repositories/blacklist-repository.ts`

See `src/db/README.md` for details.

## Shared utilities

- `src/lib/startup.ts` - startup env validation and shutdown hooks
- `src/lib/encryption.ts` - encryption/decryption for sensitive values
- `src/lib/logger.ts` - structured logging helper
- `src/lib/errors.ts` - custom error classes and shared codes
- `src/lib/billing.ts` - credit/balance calculations
- `src/lib/akash-utils.ts` - Akash-specific helper guards and types

## Validation and contracts

- API schemas and types: `src/types/api.ts`
- Pricing tier config: `src/config/pricing.ts`

## Component groups

- `src/components/features/deployment/*` - deployment flow UI (form, selectors, status)
- `src/components/features/billing/*` - billing actions
- `src/components/features/telegram/*` - Telegram connect UX
- `src/components/layout/*` - dashboard/marketing layout pieces
- `src/components/marketing/*` - landing page sections
- `src/components/ui/*` - shadcn/Radix-based primitive components
