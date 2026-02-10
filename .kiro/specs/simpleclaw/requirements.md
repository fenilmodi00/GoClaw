# Requirements Document

## Introduction

SimpleClaw is a Next.js 15 SaaS platform that enables users to deploy OpenClaw AI bots to Akash Network with a streamlined payment and deployment flow. Users authenticate via Clerk, fill a simple deployment form, pay via Stripe, and the system deploys their bot directly to Akash using the Akash Console API. The platform focuses on simplicity: auth → form → payment → deploy.

## Glossary

- **SimpleClaw_System**: The complete Next.js application including frontend, API routes, and database
- **User**: A customer who registers with SimpleClaw and deploys OpenClaw bots
- **Clerk_User**: A user identity managed by Clerk.com authentication service
- **Deployment_Record**: A database entry tracking a single bot deployment
- **Akash_Network**: Decentralized cloud computing marketplace where containers are deployed
- **Akash_Console_API**: SimpleClaw's backend API that handles Akash deployments
- **OpenClaw_Bot**: The AI bot container (ghcr.io/openclaw/openclaw:latest) deployed to Akash
- **SDL**: Service Definition Language used by Akash to specify deployment requirements
- **Provider**: An Akash Network compute provider that hosts deployments
- **Lease**: An active agreement between deployment and provider on Akash Network
- **Stripe_Session**: A Stripe checkout session for payment processing
- **Model_Selection**: AI model choice (Claude Opus 4.5, GPT 3.2, Gemini 3 Flash)
- **Channel_Selection**: Communication platform (Telegram, Discord, WhatsApp)
- **Deployment_Status**: Current state of deployment (pending, deploying, active, failed)

## Requirements

### Requirement 1: User Authentication

**User Story:** As a new user, I want to register and sign in using Clerk authentication, so that I can access the deployment platform securely.

#### Acceptance Criteria

1. WHEN a user visits the platform, THE SimpleClaw_System SHALL display Clerk sign-up and sign-in options
2. WHEN a user completes registration through Clerk, THE SimpleClaw_System SHALL receive a webhook notification with the Clerk user ID
3. WHEN a Clerk user is created, THE SimpleClaw_System SHALL create a User record in the database with the Clerk user ID and email
4. WHEN a user signs in, THE SimpleClaw_System SHALL use Clerk for session management and authentication
5. THE SimpleClaw_System SHALL use Clerk for email validation and password strength enforcement

### Requirement 2: Deployment Form

**User Story:** As a user, I want to fill a simple deployment form with model, channel, and email selections, so that I can configure my bot deployment.

#### Acceptance Criteria

1. WHEN a user accesses the deployment form, THE SimpleClaw_System SHALL display fields for model selection, channel selection, and email input
2. WHEN a user selects a model, THE SimpleClaw_System SHALL present options: Claude Opus 4.5, GPT 3.2, Gemini 3 Flash
3. WHEN a user selects a channel, THE SimpleClaw_System SHALL present options: Telegram, Discord, WhatsApp
4. WHEN a user enters an email, THE SimpleClaw_System SHALL validate the email format
5. WHEN a user submits the form, THE SimpleClaw_System SHALL validate all inputs against defined schemas before processing
6. WHEN validation fails, THE SimpleClaw_System SHALL display user-friendly error messages indicating which fields are invalid
7. THE SimpleClaw_System SHALL render the form using shadcn/ui components with responsive design for mobile, tablet, and desktop viewports

### Requirement 3: Payment Processing

**User Story:** As a user, I want to pay for the deployment service securely via Stripe, so that I can proceed with deploying my bot.

#### Acceptance Criteria

1. WHEN a user submits valid deployment configuration, THE SimpleClaw_System SHALL create a Stripe checkout session with a one-time payment
2. WHEN a Stripe session is created, THE SimpleClaw_System SHALL create a Deployment_Record in the database with status "pending"
3. WHEN a Stripe session is created, THE SimpleClaw_System SHALL redirect the user to Stripe's hosted checkout page
4. WHEN a payment is completed, THE SimpleClaw_System SHALL receive a webhook notification from Stripe
5. WHEN a webhook is received, THE SimpleClaw_System SHALL verify the webhook signature before processing
6. WHEN a valid payment webhook is received, THE SimpleClaw_System SHALL update the corresponding Deployment_Record status to "deploying"

### Requirement 4: Sensitive Data Protection

**User Story:** As a user, I want my credentials and API keys to be stored securely, so that my sensitive information is protected.

#### Acceptance Criteria

1. WHEN storing credentials in the database, THE SimpleClaw_System SHALL encrypt channel tokens and API keys
2. WHEN retrieving credentials for deployment, THE SimpleClaw_System SHALL decrypt the stored credentials
3. THE SimpleClaw_System SHALL store encryption keys in environment variables separate from the database

### Requirement 5: Akash Deployment Orchestration

**User Story:** As a user, I want the system to deploy my OpenClaw bot to Akash automatically after payment, so that I don't have to handle complex deployment steps manually.

#### Acceptance Criteria

1. WHEN a payment webhook is confirmed, THE SimpleClaw_System SHALL trigger an asynchronous Akash deployment process
2. WHEN deploying to Akash, THE SimpleClaw_System SHALL generate an SDL configuration based on the selected model and channel
3. WHEN the SDL is generated, THE SimpleClaw_System SHALL create a deployment on Akash Network using the Akash Console API
4. WHEN a deployment is created, THE SimpleClaw_System SHALL poll the Akash Console API for provider bids
5. WHEN provider bids are received, THE SimpleClaw_System SHALL select the bid with the lowest price
6. WHEN a bid is selected, THE SimpleClaw_System SHALL create a lease with the selected provider
7. WHEN a lease is created successfully, THE SimpleClaw_System SHALL update the Deployment_Record with the Akash deployment ID, lease ID, and provider URL
8. WHEN a lease is created successfully, THE SimpleClaw_System SHALL update the Deployment_Record status to "active"
9. WHEN any deployment step fails, THE SimpleClaw_System SHALL update the Deployment_Record status to "failed" and store the error message
10. THE SimpleClaw_System SHALL deploy the container image ghcr.io/openclaw/openclaw:latest

### Requirement 6: Deployment Status Tracking

**User Story:** As a user, I want to see real-time updates on my deployment progress, so that I know when my bot is ready to use.

#### Acceptance Criteria

1. WHEN a user completes payment, THE SimpleClaw_System SHALL redirect them to a status page
2. WHEN a user views the status page, THE SimpleClaw_System SHALL display the current Deployment_Status
3. WHILE the deployment is in progress, THE SimpleClaw_System SHALL poll the status API endpoint at regular intervals
4. WHEN the deployment status changes, THE SimpleClaw_System SHALL update the displayed status without requiring a page refresh
5. WHEN the deployment status is "deploying" or "pending", THE SimpleClaw_System SHALL display loading indicators
6. WHEN the deployment status is "failed", THE SimpleClaw_System SHALL display the error message to the user
7. WHEN the deployment status is "active", THE SimpleClaw_System SHALL display the success state with deployment details

### Requirement 7: Success State Display

**User Story:** As a user, I want to see my bot's connection details when deployment succeeds, so that I can start using my OpenClaw bot.

#### Acceptance Criteria

1. WHEN a deployment reaches "active" status, THE SimpleClaw_System SHALL display the channel-specific connection instructions
2. WHEN a deployment reaches "active" status, THE SimpleClaw_System SHALL display the provider URL from Akash
3. WHEN a deployment reaches "active" status, THE SimpleClaw_System SHALL display the Akash deployment ID and lease ID

### Requirement 8: API Endpoint Implementation

**User Story:** As the system, I need API endpoints to handle checkout, webhooks, and status queries, so that the frontend can interact with backend services.

#### Acceptance Criteria

1. THE SimpleClaw_System SHALL provide a POST endpoint at /api/checkout that accepts deployment configuration and returns a Stripe session URL
2. THE SimpleClaw_System SHALL provide a POST endpoint at /api/webhooks/stripe that receives Stripe webhook events
3. THE SimpleClaw_System SHALL provide a POST endpoint at /api/webhooks/clerk that receives Clerk webhook events
4. THE SimpleClaw_System SHALL provide a GET endpoint at /api/status that accepts a deployment ID and returns the current Deployment_Status
5. WHEN any API endpoint encounters an error, THE SimpleClaw_System SHALL return appropriate HTTP status codes and user-friendly error messages
6. WHEN the /api/checkout endpoint is called, THE SimpleClaw_System SHALL validate the request body using Valibot schemas

### Requirement 9: Database Schema Implementation

**User Story:** As the system, I need a database schema to persist user and deployment records, so that I can track users and deployments throughout their lifecycle.

#### Acceptance Criteria

1. THE SimpleClaw_System SHALL define a "users" table with columns: id, clerk_user_id, email, created_at, updated_at
2. THE SimpleClaw_System SHALL define a "deployments" table with columns: id, user_id, email, model_selection, channel_selection, channel_token, channel_api_key, akash_deployment_id, akash_lease_id, provider_url, status, stripe_session_id, stripe_payment_intent_id, error_message, created_at, updated_at
3. WHEN a new user is registered, THE SimpleClaw_System SHALL create a record with a unique id
4. WHEN a new deployment is initiated, THE SimpleClaw_System SHALL create a record with a unique id
5. WHEN user or deployment data is updated, THE SimpleClaw_System SHALL update the updated_at timestamp
6. THE SimpleClaw_System SHALL use Turso as the database provider with Drizzle ORM for database operations

### Requirement 10: Error Handling and Resilience

**User Story:** As a user, I want the system to handle errors gracefully, so that I receive clear feedback when something goes wrong.

#### Acceptance Criteria

1. WHEN any API call to external services fails, THE SimpleClaw_System SHALL catch the error and prevent application crashes
2. WHEN an error occurs during deployment, THE SimpleClaw_System SHALL log the error details for debugging
3. WHEN displaying errors to users, THE SimpleClaw_System SHALL show user-friendly messages without exposing technical implementation details
4. WHEN network requests timeout, THE SimpleClaw_System SHALL handle the timeout gracefully and update the deployment status accordingly
5. WHEN the Akash API returns an error, THE SimpleClaw_System SHALL store the error message in the Deployment_Record

### Requirement 11: User Interface Styling

**User Story:** As a user, I want a visually appealing and accessible interface, so that I can easily navigate and use the platform.

#### Acceptance Criteria

1. THE SimpleClaw_System SHALL use a dark theme with gray-900 background color
2. THE SimpleClaw_System SHALL use shadcn/ui components for all UI elements
3. THE SimpleClaw_System SHALL implement responsive layouts that adapt to mobile, tablet, and desktop screen sizes
4. WHEN content is loading, THE SimpleClaw_System SHALL display smooth loading states and transitions
5. THE SimpleClaw_System SHALL follow WCAG accessibility guidelines where applicable

### Requirement 12: Environment Configuration

**User Story:** As a developer, I want to configure the application through environment variables, so that sensitive credentials are not hardcoded.

#### Acceptance Criteria

1. THE SimpleClaw_System SHALL read Stripe API keys from environment variables
2. THE SimpleClaw_System SHALL read database connection strings from environment variables
3. THE SimpleClaw_System SHALL read encryption keys from environment variables
4. THE SimpleClaw_System SHALL read the Stripe webhook secret from environment variables
5. THE SimpleClaw_System SHALL read Clerk API keys and webhook secrets from environment variables
6. THE SimpleClaw_System SHALL read Akash Console API credentials from environment variables
7. WHEN required environment variables are missing, THE SimpleClaw_System SHALL fail to start and log clear error messages

### Requirement 13: TypeScript Type Safety

**User Story:** As a developer, I want strict type checking throughout the codebase, so that type-related bugs are caught at compile time.

#### Acceptance Criteria

1. THE SimpleClaw_System SHALL enable TypeScript strict mode in the configuration
2. THE SimpleClaw_System SHALL define TypeScript interfaces for all data structures
3. THE SimpleClaw_System SHALL use Valibot schemas for runtime validation that align with TypeScript types
4. WHEN code violates type constraints, THE SimpleClaw_System SHALL produce compilation errors
