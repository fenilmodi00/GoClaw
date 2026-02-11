# GoClaw

GoClaw is a Next.js 15 SaaS application that simplifies the deployment of OpenClaw AI bots to users' Akash Network accounts. Users pay a one-time fee of $29 and provide their own API credentials, while the platform handles all deployment complexity.

## Features

- 🚀 One-click deployment to Akash Network
- 💳 Secure payment processing via Stripe
- 🔐 Encrypted credential storage
- 📊 Real-time deployment status tracking
- 🎨 Modern dark-themed UI with shadcn/ui
- ⚡ Built with Next.js 15 and Bun runtime

## Tech Stack

- **Runtime**: Bun 1.1.44
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: Turso (distributed SQLite)
- **ORM**: Drizzle ORM
- **Validation**: Valibot
- **Payments**: Stripe
- **Forms**: TanStack Form
- **UI**: shadcn/ui + Tailwind CSS
- **Testing**: Vitest + fast-check (property-based testing)

## Getting Started

### Prerequisites

- Bun 1.1.44 or later
- Turso account and database
- Stripe account
- Clerk account (for authentication)
- Node.js 18+ (for compatibility)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd goclaw
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your credentials:
- `DATABASE_URL` and `DATABASE_AUTH_TOKEN` from Turso
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` from Stripe
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `CLERK_WEBHOOK_SECRET` from Clerk
- `ENCRYPTION_KEY` (generate with: `openssl rand -hex 32`)
- `NEXT_PUBLIC_APP_URL` (your application URL)
- `AKASH_CONSOLE_API_URL` (Akash Console API endpoint)

4. Run database migrations:
```bash
bun run db:migrate
```

5. Start the development server:
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
goclaw/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── status/            # Status tracking pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions and services
│   ├── stripe.ts         # Stripe service
│   ├── akash.ts          # Akash deployment service
│   ├── database.ts       # Database service
│   ├── encryption.ts     # Encryption service
│   ├── validation.ts     # Valibot schemas
│   └── utils.ts          # Utility functions
├── db/                    # Database schema and migrations
│   ├── schema.ts         # Drizzle schema
│   ├── migrate.ts        # Migration script
│   └── migrations/       # Generated migrations
├── __tests__/            # Test files
│   ├── unit/            # Unit tests
│   ├── properties/      # Property-based tests
│   └── integration/     # Integration tests
├── .env.example          # Environment variables template
├── components.json       # shadcn/ui configuration
├── drizzle.config.ts     # Drizzle ORM configuration
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vitest.config.ts      # Vitest configuration
```

## Development

### Running Tests

```bash
# Run all tests
bun run test

# Run tests with UI
bun run test:ui

# Run tests in watch mode
bun test --watch
```

### Database Operations

```bash
# Generate migration files
bun run db:generate

# Run migrations
bun run db:migrate
```

### Building for Production

```bash
bun run build
bun run start
```

## Environment Variables

See `.env.example` for a complete list of required environment variables.

### Turso Database Setup

1. Install Turso CLI:
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

2. Create a database:
```bash
turso db create goclaw
```

3. Get connection details:
```bash
turso db show goclaw
turso db tokens create goclaw
```

### Clerk Setup

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application in the [Clerk Dashboard](https://dashboard.clerk.com)
3. Get API keys from the API Keys section
4. Create a webhook endpoint pointing to `https://yourdomain.com/api/webhooks/clerk`
5. Configure the webhook to listen for `user.created` events
6. Copy the webhook secret to your environment variables

### Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get API keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
3. Create a webhook endpoint pointing to `https://yourdomain.com/api/webhooks/stripe`
4. Configure the webhook to listen for `checkout.session.completed` events
5. Copy the webhook secret to your environment variables

### Upstash Redis Setup (Rate Limiting)

Upstash provides serverless Redis for rate limiting.

1. Create an account at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. In the database details, find the **REST API** section
4. Copy the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
5. Add them to your `.env` file

**Cost**: Upstash has a free tier (10,000 requests/day) which is sufficient for development and small-scale production.

## Testing Strategy

GoClaw uses a dual testing approach:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property-Based Tests**: Verify universal properties across all inputs (100+ iterations per test)

All correctness properties from the design document are implemented as property-based tests using fast-check.

## Security

- All API keys are encrypted using AES-256-GCM before storage
- Stripe webhook signatures are verified on every request
- Clerk webhook signatures are verified using Svix
- TypeScript strict mode prevents type-related bugs
- Input validation using Valibot schemas
- HTTPS enforced for all API endpoints

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
