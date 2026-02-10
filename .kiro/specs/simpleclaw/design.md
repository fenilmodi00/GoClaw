# Design Document: SimpleClaw

## Overview

SimpleClaw is a streamlined SaaS platform for deploying OpenClaw AI bots to Akash Network. The system follows a simple flow: authentication → form → payment → deployment.

**Core Flow**:
1. **Authentication**: User signs up/in via Clerk
2. **Configuration**: User fills deployment form (model, channel, email)
3. **Payment**: User pays via Stripe (one-time payment)
4. **Deployment**: System deploys to Akash via Console API

The design prioritizes:
- Simplicity: minimal steps from signup to deployment
- Direct deployment: no trial management or background agents
- Clean separation: authentication, payment, and deployment as distinct phases
- Proper error handling and logging
- Property-based testing for correctness

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Clerk        │  │ Deployment   │  │ Status Page  │      │
│  │ Sign Up/In   │  │ Form         │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ Clerk Webhook    │ POST /api/checkout│ GET /api/status
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                    Next.js 15 App Router                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes (app/api/)                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐       │   │
│  │  │ clerk    │  │ checkout │  │   status     │       │   │
│  │  │ webhook  │  │          │  │              │       │   │
│  │  │ stripe   │  │          │  │              │       │   │
│  │  │ webhook  │  │          │  │              │       │   │
│  │  └────┬─────┘  └────┬─────┘  └──────┬───────┘       │   │
│  └───────┼─────────────┼────────────────┼───────────────┘   │
│          │             │                │                    │
│  ┌───────▼─────────────▼────────────────▼───────────────┐   │
│  │              Business Logic Layer                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │   │
│  │  │ User Service │  │ Deployment   │  │ Database   │  │   │
│  │  │ Stripe       │  │ Service      │  │ Service    │  │   │
│  │  │ Service      │  │ Akash        │  │            │  │   │
│  │  │              │  │ Service      │  │            │  │   │
│  │  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘  │   │
│  └─────────┼──────────────────┼─────────────────┼─────────┘   │
└────────────┼──────────────────┼─────────────────┼─────────────┘
             │                  │                 │
    ┌────────▼────────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │  Stripe API     │  │ Akash       │  │   Turso     │
    │  Clerk API      │  │ Console API │  │  Database   │
    └─────────────────┘  └─────────────┘  └─────────────┘
```

### Technology Stack

- **Runtime**: Bun 1.1.44 (JavaScript runtime with native TypeScript support)
- **Framework**: Next.js 15 with App Router (React Server Components, API routes)
- **Language**: TypeScript (strict mode enabled)
- **Authentication**: Clerk.com (user registration, login, session management)
- **Database**: Turso (distributed SQLite)
- **ORM**: Drizzle ORM (type-safe SQL query builder)
- **Validation**: Valibot (lightweight schema validation)
- **Payments**: Stripe (checkout sessions, webhooks)
- **Forms**: TanStack Form (type-safe form management)
- **UI**: shadcn/ui + Tailwind CSS (component library with dark theme)
- **Styling**: Tailwind CSS (utility-first CSS framework)

### Deployment Model

The application runs on a standard Next.js hosting platform (Vercel, Netlify, or self-hosted). User bots are deployed to Akash Network using the Akash Console API.

## Components and Interfaces

### Service Modules

#### 1. UserService
**Purpose**: Manage user registration via Clerk

**Interface**:
```typescript
interface UserService {
  createUserFromClerk(clerkUserId: string, email: string): Promise<User>;
  getUserById(userId: string): Promise<User | null>;
  getUserByClerkId(clerkUserId: string): Promise<User | null>;
}

interface User {
  id: string;
  clerkUserId: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. AkashService
**Purpose**: Handle Akash deployments via Console API

**Interface**:
```typescript
interface AkashService {
  createDeployment(config: DeploymentConfig): Promise<DeploymentResult>;
  pollBids(deploymentId: string): Promise<Bid[]>;
  createLease(deploymentId: string, bidId: string): Promise<Lease>;
  getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>;
}

interface DeploymentConfig {
  model: 'claude-opus-4.5' | 'gpt-3.2' | 'gemini-3-flash';
  channel: 'telegram' | 'discord' | 'whatsapp';
  channelToken: string;
  channelApiKey?: string;
  email: string;
}

interface DeploymentResult {
  deploymentId: string;
  status: 'pending' | 'deploying';
}

interface Bid {
  bidId: string;
  provider: string;
  price: number;
}

interface Lease {
  leaseId: string;
  providerUrl: string;
}
```

#### 3. StripeService
**Purpose**: Handle payment processing

**Interface**:
```typescript
interface StripeService {
  createCheckoutSession(params: CheckoutParams): Promise<CheckoutSession>;
  verifyWebhook(payload: string, signature: string): Promise<WebhookEvent>;
}

interface CheckoutParams {
  deploymentId: string;
  userId: string;
  amount: number;
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutSession {
  sessionId: string;
  sessionUrl: string;
}
```

#### 4. DatabaseService
**Purpose**: Handle database operations

**Interface**:
```typescript
interface DatabaseService {
  createUser(data: CreateUserData): Promise<User>;
  createDeployment(data: CreateDeploymentData): Promise<Deployment>;
  updateDeploymentStatus(id: string, status: DeploymentStatus): Promise<void>;
  getDeploymentById(id: string): Promise<Deployment | null>;
}
```

### API Routes

#### POST /api/webhooks/clerk

**Request Body**: Clerk webhook event (user.created)

**Response**:
```typescript
interface ClerkWebhookResponse {
  success: boolean;
  userId?: string;
}
```

**Flow**:
1. Verify Clerk webhook signature
2. Extract Clerk user ID and email from event
3. Call UserService.createUserFromClerk()
4. Return success response

#### POST /api/checkout

**Request Body**:
```typescript
interface CheckoutRequest {
  userId: string;
  model: 'claude-opus-4.5' | 'gpt-3.2' | 'gemini-3-flash';
  channel: 'telegram' | 'discord' | 'whatsapp';
  channelToken: string;
  channelApiKey?: string;
  email: string;
}
```

**Response**:
```typescript
interface CheckoutResponse {
  sessionUrl: string;
  deploymentId: string;
}
```

**Flow**:
1. Validate user exists
2. Create deployment record
3. Create Stripe checkout session
4. Return session URL

#### POST /api/webhooks/stripe

**Handles**: `checkout.session.completed` - Deployment payment

**Flow**:
1. Verify webhook signature
2. Extract deployment ID from metadata
3. Update deployment status to "deploying"
4. Trigger async Akash deployment

#### GET /api/status

**Query Parameters**:
```typescript
interface StatusQuery {
  deploymentId: string;
}
```

**Response**:
```typescript
interface StatusResponse {
  status: DeploymentStatus;
  deploymentId?: string;
  leaseId?: string;
  providerUrl?: string;
  errorMessage?: string;
  channelLink?: string;
}
```

## Data Models

### Database Schema (Drizzle ORM)

```typescript
// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID
  clerkUserId: text('clerk_user_id').notNull().unique(),
  email: text('email').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Deployments table
export const deployments = sqliteTable('deployments', {
  id: text('id').primaryKey(), // UUID
  userId: text('user_id').notNull().references(() => users.id),
  email: text('email').notNull(),
  model: text('model').notNull(), // 'claude-opus-4.5' | 'gpt-3.2' | 'gemini-3-flash'
  channel: text('channel').notNull(), // 'telegram' | 'discord' | 'whatsapp'
  channelToken: text('channel_token').notNull(), // encrypted
  channelApiKey: text('channel_api_key'), // encrypted, optional
  akashDeploymentId: text('akash_deployment_id'),
  akashLeaseId: text('akash_lease_id'),
  providerUrl: text('provider_url'),
  status: text('status').notNull(), // 'pending' | 'deploying' | 'active' | 'failed'
  stripeSessionId: text('stripe_session_id').notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
```

### Validation Schemas (Valibot)

```typescript
export const ClerkWebhookSchema = v.object({
  type: v.literal('user.created'),
  data: v.object({
    id: v.string(),
    email_addresses: v.array(v.object({
      email_address: v.string(),
    })),
  }),
});

export const CheckoutSchema = v.object({
  userId: v.pipe(v.string(), v.uuid('Invalid user ID')),
  model: v.pipe(
    v.string(),
    v.picklist(['claude-opus-4.5', 'gpt-3.2', 'gemini-3-flash'], 'Invalid model selection')
  ),
  channel: v.pipe(
    v.string(),
    v.picklist(['telegram', 'discord', 'whatsapp'], 'Invalid channel selection')
  ),
  channelToken: v.pipe(v.string(), v.minLength(1, 'Channel token is required')),
  channelApiKey: v.optional(v.string()),
  email: v.pipe(v.string(), v.email('Invalid email format')),
});
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### User Authentication Properties

**Property 1: User Registration Creates Database Record**
*For any* valid Clerk user ID and email, creating a user should create a User record with encrypted credentials.
**Validates: Requirements 1.2, 1.3**

### Form Validation Properties

**Property 2: Form Validation Before Processing**
*For any* form submission, validation should occur before database writes or API calls.
**Validates: Requirements 2.5**

**Property 3: Model Selection Validation**
*For any* model selection, the value must be one of: Claude Opus 4.5, GPT 3.2, or Gemini 3 Flash.
**Validates: Requirements 2.2**

**Property 4: Channel Selection Validation**
*For any* channel selection, the value must be one of: Telegram, Discord, or WhatsApp.
**Validates: Requirements 2.3**

### Payment Properties

**Property 5: Stripe Session Creation**
*For any* valid deployment configuration, checkout session should be created with correct payment amount.
**Validates: Requirements 3.1**

**Property 6: Payment Webhook Verification**
*For any* Stripe webhook, signature verification must pass before processing payment.
**Validates: Requirements 3.5**

### Encryption Properties

**Property 7: Encryption Round-Trip Consistency**
*For any* credential (channel token or API key), encrypting then decrypting should return the original value.
**Validates: Requirements 4.1, 4.2**

### Deployment Properties

**Property 8: Deployment Status Updates**
*For any* successful deployment, status should transition: pending → deploying → active.
**Validates: Requirements 5.1, 5.6, 5.8**

**Property 9: Failed Deployment Error Storage**
*For any* deployment failure, status should be "failed" and error_message should be populated.
**Validates: Requirements 5.9**

**Property 10: SDL Generation**
*For any* valid deployment configuration, SDL should be generated with correct model and channel settings.
**Validates: Requirements 5.2**

### API Error Properties

**Property 11: API Error Responses**
*For any* API endpoint error, response should include appropriate HTTP status code and user-friendly message.
**Validates: Requirements 8.5, 10.1, 10.3**

## Error Handling

### Error Categories

1. **User Registration Errors**
   - Clerk webhook signature invalid → 401 Unauthorized
   - Clerk user ID already exists → 409 Conflict
   - Database error → 500 Internal Server Error

2. **Form Validation Errors**
   - Invalid model selection → 400 Bad Request
   - Invalid channel selection → 400 Bad Request
   - Invalid email format → 400 Bad Request
   - Missing required fields → 400 Bad Request

3. **Payment Errors**
   - Stripe API failure → 500 Internal Server Error
   - Invalid webhook signature → 401 Unauthorized
   - Payment declined → 402 Payment Required

4. **Deployment Errors**
   - User not found → 404 Not Found
   - Akash API failure → 500 Internal Server Error
   - No bids received → 503 Service Unavailable
   - Lease creation failure → 500 Internal Server Error

### Error Handling Strategy

**API Routes**:
- Wrap all handlers in try-catch
- Validate inputs before processing
- Return appropriate HTTP status codes
- Log errors with deployment/user ID
- Never expose stack traces to users

**Database Operations**:
- Use Drizzle ORM error handling
- Catch connection errors and retry once
- Log database errors with query context
- Return generic error messages to users

**External API Calls**:
- Implement timeout handling
- Retry failed requests with exponential backoff
- Log all API errors with context
- Provide user-friendly error messages

## Testing Strategy

### Dual Testing Approach

**Unit Tests**: Verify specific examples, edge cases, and error conditions
- User registration with valid/invalid inputs
- Form validation for all field types
- Payment processing flows
- Encryption/decryption operations
- Deployment status transitions

**Property Tests**: Verify universal properties across all inputs
- Run minimum 100 iterations per property test
- Use fast-check for random input generation
- Each property test references its design document property
- Tag format: `// Feature: simpleclaw, Property {number}: {property_text}`

### Property-Based Testing Library

**For TypeScript/JavaScript**: Use **fast-check** library

### Test Organization

```
__tests__/
├── unit/
│   ├── services/
│   │   ├── user.test.ts
│   │   ├── akash.test.ts
│   │   ├── stripe.test.ts
│   │   └── encryption.test.ts
│   └── api/
│       ├── clerk-webhook.test.ts
│       ├── checkout.test.ts
│       ├── stripe-webhook.test.ts
│       └── status.test.ts
├── properties/
│   ├── user-registration.property.test.ts
│   ├── form-validation.property.test.ts
│   ├── payment.property.test.ts
│   ├── encryption.property.test.ts
│   └── deployment.property.test.ts
└── integration/
    ├── registration-flow.test.ts
    └── deployment-flow.test.ts
```

## Security Considerations

### Credential Protection

1. **Encryption at Rest**:
   - All API keys encrypted using AES-256-GCM
   - Unique IV for each encryption operation
   - Encryption key stored in environment variable

2. **Encryption in Transit**:
   - HTTPS enforced for all API endpoints
   - Stripe webhook signature verification
   - Clerk webhook signature verification
   - No credentials in URL parameters

3. **Access Control**:
   - Deployment status accessible only via unique deployment ID
   - User operations require Clerk session verification
   - Rate limiting on API endpoints

### Input Validation

1. **Schema Validation**:
   - All user inputs validated with Valibot schemas
   - Reject invalid data before processing
   - Sanitize inputs to prevent injection attacks

2. **API Key Validation**:
   - Validate Telegram token format (regex)
   - Validate LLM API key format (provider-specific)
   - Validate Akash API key by attempting API call

### Webhook Security

1. **Signature Verification**:
   - Verify Stripe webhook signature on every request
   - Verify Clerk webhook signature on every request
   - Reject webhooks with invalid signatures
   - Use constant-time comparison

2. **Idempotency**:
   - Handle duplicate webhook deliveries gracefully
   - Check payment_intent_id before processing
   - Check Clerk user ID before creating user
   - Prevent double-charging or double-deployment

## Deployment and Operations

### Application Deployment

**Recommended Platform**: Vercel (optimized for Next.js)
- Automatic HTTPS
- Edge network for low latency
- Environment variable management
- Webhook endpoint support

### Monitoring

**Key Metrics**:
- User registration rate
- Deployment success rate
- Average deployment time
- Payment success rate
- Error rates by endpoint

**Logging**:
- Log all user registration events
- Log all payment events
- Log all deployment state transitions
- Log all API errors with context
- Use structured logging (JSON format)

## Future Enhancements (Out of Current Scope)

1. **User Dashboard**:
   - View all deployments
   - Manage multiple bots
   - Update bot configuration

2. **Bot Management**:
   - Stop/start deployments
   - View bot logs
   - Update model or channel

3. **Advanced Configuration**:
   - Custom SDL templates
   - Resource allocation options
   - Provider selection preferences

4. **Analytics**:
   - Bot usage statistics
   - Cost tracking
   - Performance metrics

5. **Subscription Model**:
   - Monthly billing for bot hosting
   - Multiple bot tiers
   - Premium features
