# Implementation Plan: SimpleClaw

## Overview

This implementation plan converts the SimpleClaw design into actionable coding tasks. The system follows a streamlined flow: Clerk authentication → deployment form → Stripe payment → direct Akash deployment via Console API.

The implementation removes all trial-related code, background agents, and Akash user registration, focusing on a simple one-time payment model with direct deployment.

## Tasks

- [x] 1. Update database schema and remove trial-related code
  - [x] 1.1 Update Drizzle schema to remove trial fields and add new deployment fields
    - Remove `trialEndsAt`, `trialUsed` from users table
    - Add `model`, `channel`, `channelToken`, `channelApiKey` to deployments table
    - Remove `subscriptionId`, `subscriptionStatus` from deployments table
    - Update TypeScript types to match new schema
    - _Requirements: 9.1, 9.2_
  
  - [x] 1.2 Create and run database migration
    - Generate migration file using Drizzle Kit
    - Test migration on local database
    - _Requirements: 9.1, 9.2_
  
  - [x] 1.3 Remove trial-related database queries
    - Delete functions checking `trialUsed` or `trialEndsAt`
    - Remove subscription-related queries
    - _Requirements: 9.1, 9.2_

- [x] 2. Remove unnecessary service modules
  - [x] 2.1 Delete trial agent background service
    - Remove trial agent cron job or background worker
    - Remove trial expiration checking logic
    - _Requirements: 5.1_
  
  - [x] 2.2 Delete cost guard service
    - Remove cost calculation and monitoring logic
    - Remove cost-related database queries
    - _Requirements: 5.1_
  
  - [x] 2.3 Delete Akash user registration service
    - Remove Akash user account creation logic
    - Remove Akash user credential management
    - _Requirements: 5.1_
  
  - [x] 2.4 Clean up unused imports and dependencies
    - Remove imports for deleted services
    - Update package.json if any dependencies are no longer needed
    - _Requirements: 5.1_

- [x] 3. Update AkashService for direct deployment via Console API
  - [x] 3.1 Implement SDL generation function
    - Create function to generate SDL based on model and channel
    - Include environment variables for channel tokens and API keys
    - Use ghcr.io/openclaw/openclaw:latest as container image
    - _Requirements: 5.2, 5.10_
  
  - [ ]* 3.2 Write property test for SDL generation
    - **Property 10: SDL Generation**
    - **Validates: Requirements 5.2**
  
  - [x] 3.3 Implement createDeployment method using Console API
    - Call Akash Console API to create deployment
    - Return deployment ID and initial status
    - Handle API errors and timeouts
    - _Requirements: 5.3_
  
  - [x] 3.4 Implement pollBids method
    - Poll Console API for provider bids
    - Return list of bids with provider and price
    - _Requirements: 5.4_
  
  - [x] 3.5 Implement bid selection logic
    - Select bid with lowest price
    - _Requirements: 5.5_
  
  - [x] 3.6 Implement createLease method
    - Call Console API to create lease with selected bid
    - Return lease ID and provider URL
    - _Requirements: 5.6_
  
  - [x] 3.7 Implement getDeploymentStatus method
    - Query Console API for deployment status
    - Return current status
    - _Requirements: 5.1_
  
  - [ ]* 3.8 Write unit tests for AkashService methods
    - Test SDL generation with different models and channels
    - Test error handling for API failures
    - Test bid selection logic
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 4. Checkpoint - Ensure Akash service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement encryption service for sensitive data
  - [x] 5.1 Create encryption utility functions
    - Implement encrypt function using AES-256-GCM
    - Implement decrypt function
    - Use environment variable for encryption key
    - Generate unique IV for each encryption
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 5.2 Write property test for encryption round-trip
    - **Property 7: Encryption Round-Trip Consistency**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ]* 5.3 Write unit tests for encryption edge cases
    - Test empty string encryption
    - Test special characters
    - Test very long strings
    - _Requirements: 4.1, 4.2_

- [x] 6. Update deployment form component
  - [x] 6.1 Create or update deployment form UI component
    - Add model selection dropdown (Claude Opus 4.5, GPT 3.2, Gemini 3 Flash)
    - Add channel selection dropdown (Telegram, Discord, WhatsApp)
    - Add email input field
    - Add channel token input field
    - Add optional channel API key input field
    - Use shadcn/ui components
    - Implement responsive design for mobile, tablet, desktop
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7, 11.2, 11.3_
  
  - [x] 6.2 Implement form validation using TanStack Form and Valibot
    - Validate model selection against allowed values
    - Validate channel selection against allowed values
    - Validate email format
    - Validate required fields (model, channel, email, channelToken)
    - Display user-friendly error messages
    - _Requirements: 2.4, 2.5, 2.6_
  
  - [ ]* 6.3 Write property tests for form validation
    - **Property 2: Form Validation Before Processing**
    - **Property 3: Model Selection Validation**
    - **Property 4: Channel Selection Validation**
    - **Validates: Requirements 2.2, 2.3, 2.5**
  
  - [ ]* 6.4 Write unit tests for form component
    - Test form submission with valid data
    - Test form submission with invalid data
    - Test error message display
    - _Requirements: 2.1, 2.4, 2.5, 2.6_

- [x] 7. Update API route: POST /api/checkout
  - [x] 7.1 Implement checkout endpoint handler
    - Validate request body using Valibot CheckoutSchema
    - Verify user exists in database
    - Encrypt channel token and API key before storing
    - Create deployment record with status "pending"
    - Create Stripe checkout session with deployment ID in metadata
    - Return session URL and deployment ID
    - _Requirements: 3.1, 3.2, 8.1, 8.6_
  
  - [x] 7.2 Implement error handling for checkout endpoint
    - Handle user not found (404)
    - Handle validation errors (400)
    - Handle Stripe API errors (500)
    - Handle database errors (500)
    - Return user-friendly error messages
    - _Requirements: 8.5, 10.1, 10.2, 10.3_
  
  - [ ]* 7.3 Write property test for checkout session creation
    - **Property 5: Stripe Session Creation**
    - **Validates: Requirements 3.1**
  
  - [ ]* 7.4 Write unit tests for checkout endpoint
    - Test successful checkout flow
    - Test validation errors
    - Test user not found error
    - Test Stripe API failure
    - _Requirements: 3.1, 3.2, 8.1, 8.5_

- [x] 8. Remove upgrade endpoint and related code
  - [x] 8.1 Delete POST /api/upgrade endpoint
    - Remove upgrade API route file
    - Remove upgrade-related service functions
    - _Requirements: 3.1_
  
  - [x] 8.2 Remove upgrade UI components
    - Delete upgrade button or modal components
    - Remove upgrade-related state management
    - _Requirements: 3.1_

- [x] 9. Update API route: POST /api/webhooks/stripe
  - [x] 9.1 Update Stripe webhook handler for simplified flow
    - Verify webhook signature
    - Handle checkout.session.completed event
    - Extract deployment ID from session metadata
    - Update deployment status to "deploying"
    - Trigger asynchronous Akash deployment process
    - Remove subscription-related webhook handling
    - _Requirements: 3.4, 3.5, 3.6, 5.1_
  
  - [x] 9.2 Implement async deployment orchestration
    - Retrieve deployment record from database
    - Decrypt channel token and API key
    - Call AkashService.createDeployment()
    - Poll for bids using AkashService.pollBids()
    - Select lowest price bid
    - Create lease using AkashService.createLease()
    - Update deployment record with Akash IDs and provider URL
    - Update status to "active" on success
    - Update status to "failed" and store error message on failure
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_
  
  - [ ]* 9.3 Write property test for payment webhook verification
    - **Property 6: Payment Webhook Verification**
    - **Validates: Requirements 3.5**
  
  - [ ]* 9.4 Write property test for deployment status transitions
    - **Property 8: Deployment Status Updates**
    - **Validates: Requirements 5.1, 5.6, 5.8**
  
  - [ ]* 9.5 Write property test for failed deployment error storage
    - **Property 9: Failed Deployment Error Storage**
    - **Validates: Requirements 5.9**
  
  - [ ]* 9.6 Write unit tests for webhook handler
    - Test successful payment and deployment flow
    - Test invalid webhook signature
    - Test deployment not found
    - Test Akash API failures
    - _Requirements: 3.4, 3.5, 3.6, 5.1, 5.9_

- [ ] 10. Checkpoint - Ensure webhook and deployment tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Update API route: GET /api/status
  - [x] 11.1 Implement status endpoint handler
    - Validate deployment ID from query parameters
    - Retrieve deployment record from database
    - Return deployment status, Akash IDs, provider URL, and error message
    - Generate channel-specific connection link based on channel type
    - _Requirements: 6.2, 7.1, 7.2, 7.3, 8.4_
  
  - [x] 11.2 Implement error handling for status endpoint
    - Handle deployment not found (404)
    - Handle database errors (500)
    - Return user-friendly error messages
    - _Requirements: 8.5, 10.1, 10.3_
  
  - [ ]* 11.3 Write property test for API error responses
    - **Property 11: API Error Responses**
    - **Validates: Requirements 8.5, 10.1, 10.3**
  
  - [ ]* 11.4 Write unit tests for status endpoint
    - Test successful status retrieval
    - Test deployment not found
    - Test different deployment statuses (pending, deploying, active, failed)
    - _Requirements: 6.2, 8.4_

- [x] 12. Update status page component
  - [x] 12.1 Create or update status page UI component
    - Display current deployment status
    - Show loading indicators for "pending" and "deploying" states
    - Show error message for "failed" state
    - Show success state with deployment details for "active" state
    - Implement polling to fetch status updates every 5 seconds
    - Update UI without page refresh when status changes
    - Use shadcn/ui components
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 11.2, 11.4_
  
  - [x] 12.2 Display deployment details on success
    - Show channel-specific connection instructions
    - Show provider URL
    - Show Akash deployment ID and lease ID
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ]* 12.3 Write unit tests for status page component
    - Test rendering for each status state
    - Test polling behavior
    - Test error display
    - Test success state display
    - _Requirements: 6.1, 6.2, 6.4, 6.5, 6.6, 6.7_

- [x] 13. Update UserService for simplified user creation
  - [x] 13.1 Update createUserFromClerk method
    - Remove trial-related fields (trialEndsAt, trialUsed)
    - Create user with only clerkUserId and email
    - _Requirements: 1.3_
  
  - [ ]* 13.2 Write property test for user registration
    - **Property 1: User Registration Creates Database Record**
    - **Validates: Requirements 1.2, 1.3**
  
  - [ ]* 13.3 Write unit tests for UserService
    - Test user creation with valid data
    - Test duplicate user handling
    - Test database errors
    - _Requirements: 1.2, 1.3_

- [x] 14. Update API route: POST /api/webhooks/clerk
  - [x] 14.1 Update Clerk webhook handler
    - Verify webhook signature
    - Handle user.created event
    - Extract Clerk user ID and email
    - Call UserService.createUserFromClerk()
    - Return success response
    - _Requirements: 1.2, 1.3_
  
  - [ ]* 14.2 Write unit tests for Clerk webhook handler
    - Test successful user creation
    - Test invalid webhook signature
    - Test duplicate user
    - _Requirements: 1.2, 1.3_

- [x] 15. Update environment configuration
  - [x] 15.1 Update .env.example file
    - Add ENCRYPTION_KEY variable
    - Add AKASH_CONSOLE_API_URL variable
    - Add AKASH_CONSOLE_API_KEY variable
    - Remove trial-related environment variables
    - Ensure all required variables are documented
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  
  - [x] 15.2 Add environment variable validation on startup
    - Check for required variables
    - Log clear error messages if variables are missing
    - Fail to start if critical variables are missing
    - _Requirements: 12.7_

- [x] 16. Update TypeScript types and interfaces
  - [x] 16.1 Update type definitions to match new schema
    - Update User interface (remove trial fields)
    - Update Deployment interface (add model, channel, remove subscription fields)
    - Update API request/response types
    - Ensure strict type checking is enabled
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [x] 16.2 Update Valibot schemas
    - Update CheckoutSchema with new fields
    - Remove upgrade-related schemas
    - Ensure schemas align with TypeScript types
    - _Requirements: 13.3_

- [x] 17. Update UI styling and components
  - [x] 17.1 Ensure dark theme consistency
    - Apply gray-900 background color across all pages
    - Use shadcn/ui components consistently
    - _Requirements: 11.1, 11.2_
  
  - [x] 17.2 Implement responsive layouts
    - Test layouts on mobile, tablet, and desktop viewports
    - Ensure forms and status pages are responsive
    - _Requirements: 11.3_
  
  - [x] 17.3 Add loading states and transitions
    - Implement smooth loading indicators
    - Add transitions for status changes
    - _Requirements: 11.4_

- [ ] 18. Integration testing
  - [ ]* 18.1 Write integration test for complete registration flow
    - Test Clerk webhook → user creation → database record
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ]* 18.2 Write integration test for complete deployment flow
    - Test form submission → checkout → payment webhook → deployment → status update
    - _Requirements: 2.1, 3.1, 3.4, 5.1, 6.1_
  
  - [ ]* 18.3 Write integration test for error scenarios
    - Test payment failure handling
    - Test Akash deployment failure handling
    - Test network timeout handling
    - _Requirements: 10.1, 10.2, 10.4, 10.5_

- [ ] 19. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. Code cleanup and documentation
  - [x] 20.1 Remove dead code and unused imports
    - Search for unused functions and variables
    - Remove commented-out code
    - Clean up imports
    - _Requirements: 5.1_
  
  - [x] 20.2 Add code comments for complex logic
    - Document encryption/decryption flow
    - Document Akash deployment orchestration
    - Document webhook handling
    - _Requirements: 10.2_
  
  - [x] 20.3 Update README with new architecture
    - Document simplified flow
    - Update environment variable documentation
    - Update deployment instructions
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check library
- Unit tests validate specific examples and edge cases
- All property tests should run minimum 100 iterations
- The implementation uses TypeScript with strict mode enabled
- Database operations use Drizzle ORM with Turso
- All sensitive data (channel tokens, API keys) must be encrypted before storage
