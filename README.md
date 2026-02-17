# GoClaw

GoClaw is a Next.js 15 SaaS app for launching AI bots on Akash with a hosted UI, authenticated dashboards, paid tiers, and webhook-driven deployment automation.

## What this repo does

- Lets a signed-in user configure a bot deployment (model, channel, token) and purchase a plan through Polar.
- Stores users and deployments in Turso (SQLite via Drizzle), then triggers Akash deployment after payment events.
- Exposes a guarded chat proxy endpoint with token throttling and balance checks.
- Provides dashboard pages for deployment status, billing state, and account views.

## Stack

- Framework: Next.js 15 (App Router) + React 19 + TypeScript strict mode
- Auth: Clerk
- Payments and metering: Polar
- Deployment backend: Akash Console API + AkashML
- Database: Turso (`@libsql/client`) + Drizzle ORM
- Rate limiting: Upstash Redis (with in-memory fallback)
- UI: Tailwind CSS + Radix/shadcn
- Tests: Vitest + Testing Library

## High-level architecture

1. User signs in via Clerk.
2. Frontend calls `POST /api/checkout` with deployment config.
3. API creates/links user, creates pending deployment row, creates Polar checkout.
4. Polar webhook (`/api/webhooks/polar`) confirms payment and triggers Akash deployment.
5. Deployment status updates are persisted and shown in dashboard/status pages.
6. Chat traffic can flow through `POST /api/chat` with credit and token controls.

See also:

- `app/README.md` for route map (pages + API)
- `app/api/README.md` for endpoint behaviors
- `src/README.md` for service/module map
- `src/db/README.md` for schema and repositories

## Quick start

### Prerequisites

- Node.js 18+
- npm
- Turso database
- Clerk app
- Polar account/products/webhook
- Akash Console API key
- AkashML key

### Install

```bash
npm install
```

### Configure env

```bash
cp .env.example .env
```

Required at startup (`src/lib/startup.ts`):

- `DATABASE_URL`
- `DATABASE_AUTH_TOKEN`
- `ENCRYPTION_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `AKASH_CONSOLE_API_URL`
- `AKASH_API_KEY`
- `AKASHML_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `POLAR_ACCESS_TOKEN`
- `POLAR_WEBHOOK_SECRET`

Commonly needed too:

- `POLAR_PRODUCT_ID_STARTER`
- `POLAR_PRODUCT_ID_PRO`
- `POLAR_PRODUCT_ID_BUSINESS`
- `NEXT_PUBLIC_APP_URL`

### Database

```bash
npm run db:generate
npm run db:migrate
```

### Run app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start Next.js dev server
- `npm run dev:turbo` - start with Turbopack
- `npm run build` - production build
- `npm run start` - run built app
- `npm run lint` - Next.js ESLint
- `npm run db:generate` - generate Drizzle migrations
- `npm run db:migrate` - apply migrations
- `npm run db:push` - push schema directly
- `npm test` - run Vitest
- `npm test:ui` - run Vitest UI

## Repo map

- `app/` - App Router pages, layouts, and API routes
- `src/components/` - feature, layout, marketing, and UI components
- `src/services/` - business logic (Akash, Polar, deployment orchestration, user)
- `src/db/` - schema, repository layer, migrations
- `src/lib/` - shared utilities (billing, logging, encryption, startup validation)
- `src/middleware/` - rate limiting and token throttling logic
- `src/config/` - pricing tier config
- `src/types/` - request validation schemas and shared types
- `scripts/` - utility scripts (schema checks)

## API and pages

For route-by-route docs, use:

- `app/README.md`
- `app/api/README.md`

## Testing and CI

- Tests live mainly next to source files with `.test.ts` suffix.
- CI workflow: `.github/workflows/ci.yml` (install, lint, build).

## Security notes

- Sensitive deployment credentials are stored in encrypted form.
- Clerk and Polar webhooks are signature-validated.
- API rate limiting and token throttling are applied on key endpoints.
- Do not commit `.env` or any secrets.
