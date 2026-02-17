# API Reference (`app/api`)

This document describes the runtime behavior of API routes in this repository.

## Authentication model

- Most endpoints use Clerk auth (`auth()` from `@clerk/nextjs/server`).
- Webhook endpoints validate signatures instead of requiring user auth.
- Route protection defaults are enforced by `middleware.ts`.

## Endpoints

### `POST /api/checkout`

File: `app/api/checkout/route.ts`

Purpose:

- Validates deployment request payload (`CheckoutSchema` from `src/types/api.ts`)
- Ensures or creates user record
- Optionally links Polar customer
- Reuses open pending checkout where possible
- Creates a new Polar checkout session and pending deployment record

Returns:

- `200` with `{ sessionUrl, deploymentId }`
- `400/401/429/500` for validation, auth, rate-limit, and server issues

### `GET /api/deployments`

File: `app/api/deployments/route.ts`

Purpose:

- Fetches authenticated user deployments
- Auto-creates local user if missing but Clerk user exists
- Applies per-user rate limit
- Returns sanitized deployment objects (no sensitive tokens)

Returns:

- `200` with `{ deployments: [...] }`
- `401/429/500` for auth, rate-limit, and server failures

### `GET /api/status?id=<deployment-uuid>`

File: `app/api/status/route.ts`

Purpose:

- Validates query via `StatusQuerySchema`
- Looks up deployment by ID
- Returns deployment state and connection info
- For active Telegram deployments, resolves bot link from token

Returns:

- `200` with status payload
- `400` invalid/missing ID
- `404` deployment not found
- `500` unexpected error

### `POST /api/chat`

File: `app/api/chat/route.ts`

Purpose:

- Authenticated chat completion proxy to AkashML
- Enforces request size limits
- Applies request rate limiting and token-bucket throttling
- Checks Polar meter usage against remaining balance
- Records token usage via Polar events

Returns:

- `200` provider JSON response
- `400/401/402/413/429/502/500` on validation/auth/billing/rate/provider/server errors

### `GET /api/user/balance`

File: `app/api/user/balance/route.ts`

Purpose:

- Computes user credit limit by active subscriptions/tier
- Reads Polar meters for consumed token usage
- Returns remaining balance and current limit

Returns:

- `200` with `{ balance, creditLimit }`
- `401` if unauthenticated

### `POST /api/webhooks/clerk`

File: `app/api/webhooks/clerk/route.ts`

Purpose:

- Verifies Svix signature
- Handles `user.created`
- Creates local user record via `userService`

Returns:

- `200` success
- `400/401/500` for invalid payload/signature/config errors

### `POST /api/webhooks/polar`

File: `app/api/webhooks/polar/route.ts`

Purpose:

- Validates Polar webhook signature
- Links Polar customer IDs to local users
- Syncs subscription tier/status updates
- On successful checkout/subscription/order events, triggers deployment for pending records

Returns:

- `200` with `{ received: true }`
- `401/500` on verification or processing failures

### `GET|POST|PUT /api/inngest`

File: `src/app/api/inngest/route.ts`

Purpose:

- Exposes the Inngest serve handler for registered background functions
- Registers deployment background function from `src/lib/inngest/deployment.job.ts`
- Receives deployment lifecycle events emitted by the app

Returns:

- Handled by Inngest SDK runtime (health checks, function registration, and event invocation responses)

## Schemas and validation

- Request schema definitions: `src/types/api.ts`
- Pricing/tier mapping: `src/config/pricing.ts`
- Token/rate limiting helpers: `src/middleware/token-throttle.ts`, `src/middleware/rate-limit.ts`
- Background jobs: `src/lib/inngest/client.ts`, `src/lib/inngest/deployment.job.ts`
