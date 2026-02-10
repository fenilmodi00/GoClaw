# Database Architecture

SimpleClaw uses **Turso** (distributed SQLite) with a professional repository pattern architecture.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     API Layer                            │
│  (app/api/checkout, app/api/webhooks, etc.)             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Service Layer                           │
│  • DeploymentService (services/deployment/)             │
│  • UserService (services/user/)                         │
│  Business logic, validation, orchestration              │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                Repository Layer                          │
│  • DeploymentRepository (db/repositories/)              │
│  • UserRepository (db/repositories/)                    │
│  Data access, encryption, queries                       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Database Layer                          │
│  Turso (SQLite) + Drizzle ORM                           │
│  Schema: users, deployments, llmUsageLog                │
└─────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Repository Pattern
- Clean separation of data access from business logic
- Centralized query logic
- Easy to test and mock
- Type-safe operations

### 2. Service Layer
- Business logic orchestration
- Cross-repository operations
- Transaction management
- Validation and error handling

### 3. Automatic Encryption
- Sensitive fields encrypted transparently
- AES-256-GCM encryption
- Decryption on retrieval

### 4. Payment Link Reuse
- Detects duplicate pending deployments
- Reuses existing Stripe sessions
- Prevents duplicate charges

### 5. User-Deployment Tracking
- Foreign key relationships
- User dashboard support
- Deployment history queries

## Database Setup

### 1. Install Turso CLI

```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Windows (PowerShell)
irm https://get.tur.so/install.ps1 | iex
```

### 2. Create Database

```bash
turso db create simpleclaw
turso db show simpleclaw
turso db tokens create simpleclaw
```

### 3. Configure Environment

```env
DATABASE_URL="libsql://simpleclaw-[your-username].turso.io"
DATABASE_AUTH_TOKEN="eyJhbGc..."
ENCRYPTION_KEY="<32-byte-hex-string>"
```

Generate encryption key:
```bash
openssl rand -hex 32
```

### 4. Run Migrations

```bash
bun run db:generate
bun run db:migrate
```

## Schema

### Users Table
- `id` - UUID primary key
- `clerk_user_id` - Clerk authentication ID (unique, indexed)
- `email` - User email (unique, indexed)
- `created_at` - Registration timestamp
- `updated_at` - Last update timestamp

### Deployments Table
- `id` - UUID primary key
- `user_id` - Foreign key to users (indexed)
- `email` - User email
- `model` - LLM model selection
- `channel` - Communication channel (telegram/discord/whatsapp)
- `channel_token` - Encrypted bot token
- `channel_api_key` - Encrypted API key (optional)
- `akash_deployment_id` - Akash deployment DSEQ
- `akash_lease_id` - Akash lease identifier
- `provider_url` - Deployment URL
- `status` - Deployment status (pending/deploying/active/failed)
- `stripe_session_id` - Stripe checkout session (indexed)
- `stripe_payment_intent_id` - Stripe payment intent
- `error_message` - Error details for failed deployments
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### LLM Usage Log Table
- `id` - UUID primary key
- `user_id` - Foreign key to users (indexed)
- `deployment_id` - Foreign key to deployments (optional)
- `tokens_used` - Token consumption count
- `provider` - LLM provider name
- `timestamp` - Usage timestamp (indexed)

## Usage Examples

### Create Deployment
```typescript
import { deploymentService } from '@/services/deployment/deployment-service';

const deployment = await deploymentService.createDeployment({
  userId: user.id,
  email: user.email,
  model: 'claude-opus-4.5',
  channel: 'telegram',
  channelToken: 'bot_token_here',
  stripeSessionId: session.id,
});
```

### Get User Deployments
```typescript
const deployments = await deploymentService.getUserDeployments(userId);
```

### Check for Pending Duplicate
```typescript
const existing = await deploymentService.findPendingDuplicate(
  userId,
  'claude-opus-4.5',
  'telegram',
  'bot_token_here'
);

if (existing) {
  // Reuse existing payment link
  const session = await stripeService.getSession(existing.stripeSessionId);
}
```

### Update Deployment Status
```typescript
await deploymentService.updateDeploymentStatus(
  deploymentId,
  'active',
  {
    akashDeploymentId: dseq,
    akashLeaseId: leaseId,
    providerUrl: url,
  }
);
```

## Testing

```bash
bun test __tests__/database.test.ts
bun test __tests__/user-service.test.ts
```

## Files

- `schema.ts` - Drizzle ORM schema definitions
- `repositories/` - Data access layer
  - `deployment-repository.ts` - Deployment queries
  - `user-repository.ts` - User queries
- `migrations/` - SQL migration files
- `README.md` - This file

