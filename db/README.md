# Database Setup

This directory contains the database schema, migrations, and migration scripts for SimpleClaw.

## Database Provider

SimpleClaw uses **Turso** (distributed SQLite) as the database provider.

## Setup Instructions

### 1. Install Turso CLI

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Windows (PowerShell)
irm https://get.tur.so/install.ps1 | iex
```

### 2. Create a Database

```bash
# Create a new database
turso db create simpleclaw

# Show database details (get URL and auth token)
turso db show simpleclaw

# Create an auth token
turso db tokens create simpleclaw
```

### 3. Configure Environment Variables

Copy the database URL and auth token to your `.env` file:

```env
DATABASE_URL="libsql://simpleclaw-[your-username].turso.io"
DATABASE_AUTH_TOKEN="eyJhbGc..."
```

### 4. Generate and Run Migrations

```bash
# Generate migration files from schema
bun run db:generate

# Run migrations
bun run db:migrate
```

## Schema

The database contains a single `deployments` table that stores:

- User information (email)
- Encrypted credentials (Telegram token, Akash API key, LLM API key)
- Deployment configuration (LLM provider)
- Akash deployment details (deployment ID, lease ID, provider URL)
- Status tracking (pending, deploying, active, failed)
- Stripe payment tracking (session ID, payment intent ID)
- Error messages
- Timestamps (created_at, updated_at)

## Encryption

All sensitive fields (API keys and tokens) are encrypted using AES-256-GCM before storage. The encryption key must be set in the `ENCRYPTION_KEY` environment variable.

Generate an encryption key:

```bash
# Generate a 32-byte hex string
openssl rand -hex 32
```

## Testing

To run database tests, ensure your database is properly configured in `.env`:

```bash
bun test __tests__/database.test.ts
```

**Note**: Tests will be skipped if the database is not configured.

## Files

- `schema.ts` - Drizzle ORM schema definition
- `migrate.ts` - Migration script
- `migrations/` - Generated SQL migration files
- `README.md` - This file
