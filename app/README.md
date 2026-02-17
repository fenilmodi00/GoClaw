# App Layer (`app/`)

This directory contains the Next.js App Router surface: public pages, authenticated dashboard pages, shared layouts, and API route handlers.

## Top-level files

- `app/layout.tsx` - root layout; wires Clerk provider, app startup validation, analytics, and toaster UI
- `app/globals.css` - global Tailwind and base styles

## Route groups

### Marketing routes

- `app/(marketing)/page.tsx` - landing page and public marketing content

### Dashboard routes (authenticated)

- `app/(dashboard)/layout.tsx` - dashboard shell with sidebar/header
- `app/(dashboard)/dashboard/page.tsx` - overview page with deployments and call-to-action UI
- `app/(dashboard)/deploy/page.tsx` - deployment flow page (auth-aware, renders deployment form)
- `app/(dashboard)/status/[id]/page.tsx` - deployment details/status page
- `app/(dashboard)/billing/page.tsx` - billing and plan UI
- `app/(dashboard)/purchases/page.tsx` - purchase history or related account billing view
- `app/(dashboard)/settings/page.tsx` - account or app settings
- `app/(dashboard)/listings/page.tsx` - dashboard listing page
- `app/(dashboard)/marketplace/page.tsx` - marketplace page
- `app/(dashboard)/add-employee/page.tsx` - team/user management-style page

## API routes

Most API route handlers live in `app/api/**/route.ts`.

- `app/api/checkout/route.ts` - validates deployment request and creates Polar checkout
- `app/api/deployments/route.ts` - returns current user's deployments
- `app/api/status/route.ts` - deployment status lookup by deployment ID
- `app/api/chat/route.ts` - authenticated chat proxy with token and balance enforcement
- `app/api/user/balance/route.ts` - returns current user balance and credit limit
- `app/api/webhooks/clerk/route.ts` - Clerk webhook handler (`user.created`)
- `app/api/webhooks/polar/route.ts` - Polar webhook handler and deployment trigger logic
- `src/app/api/inngest/route.ts` - Inngest function serve endpoint for async jobs

See `app/api/README.md` for request/response details.

## Auth and protection

- Global route protection is configured in `middleware.ts`.
- Most dashboard and API routes require auth.
- Public routes include marketing paths and selected webhook/status endpoints.
