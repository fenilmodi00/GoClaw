import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { NextRequest } from 'next/server';
import { GET as statusGET } from '@/app/api/status/route';
import { POST as checkoutPOST } from '@/app/api/checkout/route';
import { getDatabaseService } from '@/lib/database';

/**
 * Property-Based Tests for API Error Responses
 * 
 * Feature: simpleclaw
 * Property 14: API Error Responses
 * 
 * **Validates: Requirements 6.4, 7.3**
 * 
 * For any API endpoint error, response should include appropriate HTTP status code 
 * and user-friendly message.
 * 
 * This test verifies that:
 * 1. All API errors return appropriate HTTP status codes (400, 401, 404, 500)
 * 2. Error responses contain user-friendly messages
 * 3. Error messages don't expose technical implementation details
 * 4. Validation errors provide clear field-specific feedback
 */

// Mock dependencies
vi.mock('@/lib/database', () => ({
  getDatabaseService: vi.fn(),
  databaseService: {
    createDeployment: vi.fn(),
    getDeploymentById: vi.fn(),
    getDeploymentByStripeSession: vi.fn(),
    updateDeploymentStatus: vi.fn(),
  },
}));

vi.mock('@/lib/stripe', () => ({
  stripeService: {
    createCheckoutSession: vi.fn(),
    verifyWebhookSignature: vi.fn(),
  },
}));

vi.mock('@/services/user/user-service', () => ({
  userService: {
    getUserByClerkId: vi.fn(),
    createUserFromClerk: vi.fn(),
    getUserById: vi.fn(),
  },
}));

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

describe('Property 14: API Error Responses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property: Invalid deployment IDs always return 400 with user-friendly message
   */
  it('should return 400 with user-friendly message for invalid deployment IDs', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate various invalid ID formats
        fc.oneof(
          fc.constant(''), // Empty string
          fc.constant('invalid-id'), // Non-UUID
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)), // Random non-UUID strings
          fc.integer({ min: 1, max: 999999 }).map(n => n.toString()), // Numbers
          fc.constant('not-a-uuid-at-all'), // Clearly invalid
        ),
        async (invalidId) => {
          const request = new NextRequest(`http://localhost:3000/api/status?id=${invalidId}`);
          const response = await statusGET(request);
          const data = await response.json();

          // Should return 400 status
          expect(response.status).toBe(400);
          
          // Should have error message
          expect(data.error).toBeDefined();
          expect(typeof data.error).toBe('string');
          
          // Error message should be user-friendly (not expose technical details)
          expect(data.error.toLowerCase()).not.toContain('stack');
          expect(data.error.toLowerCase()).not.toContain('exception');
          expect(data.error.toLowerCase()).not.toContain('undefined');
          expect(data.error.toLowerCase()).not.toContain('null');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Missing required fields return 400 with validation details
   */
  it('should return 400 with validation details for missing required fields', async () => {
    const { auth } = await import('@clerk/nextjs/server');
    (auth as any).mockResolvedValue({ userId: 'clerk_test_123' });

    await fc.assert(
      fc.asyncProperty(
        // Generate incomplete deployment data
        fc.record({
          email: fc.option(fc.emailAddress(), { nil: undefined }),
          telegramToken: fc.option(fc.string({ minLength: 10 }), { nil: undefined }),
          llmProvider: fc.option(fc.constantFrom('openai', 'google', 'claude', 'akashml'), { nil: undefined }),
          llmApiKey: fc.option(fc.string({ minLength: 10 }), { nil: undefined }),
        }).filter(data => {
          // Ensure at least one required field is missing
          return !data.email || !data.telegramToken || !data.llmProvider || !data.llmApiKey;
        }),
        async (incompleteData) => {
          const request = new NextRequest('http://localhost:3000/api/checkout', {
            method: 'POST',
            body: JSON.stringify(incompleteData),
          });

          const response = await checkoutPOST(request);
          const data = await response.json();

          // Should return 400 for validation errors
          expect(response.status).toBe(400);
          
          // Should have error message
          expect(data.error).toBeDefined();
          
          // Should not expose technical details
          expect(JSON.stringify(data).toLowerCase()).not.toContain('stack');
          expect(JSON.stringify(data).toLowerCase()).not.toContain('exception');
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Database errors return 500 with generic user-friendly message
   */
  it('should return 500 with generic message for database errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // Valid UUID
        fc.constantFrom(
          'Database connection failed',
          'Query timeout',
          'Connection pool exhausted',
          'Database unavailable'
        ),
        async (validId, dbError) => {
          // Mock database to throw error
          const mockGetDeploymentById = vi.fn().mockRejectedValue(new Error(dbError));
          (getDatabaseService as any).mockReturnValue({
            getDeploymentById: mockGetDeploymentById,
          });

          const request = new NextRequest(`http://localhost:3000/api/status?id=${validId}`);
          const response = await statusGET(request);
          const data = await response.json();

          // Should return 500 for server errors
          expect(response.status).toBe(500);
          
          // Should have error message
          expect(data.error).toBeDefined();
          expect(typeof data.error).toBe('string');
          
          // Error message should be user-friendly and NOT expose database details
          expect(data.error.toLowerCase()).not.toContain('database');
          expect(data.error.toLowerCase()).not.toContain('connection');
          expect(data.error.toLowerCase()).not.toContain('query');
          expect(data.error.toLowerCase()).not.toContain('pool');
          expect(data.error.toLowerCase()).not.toContain('timeout');
          
          // Should be a generic message
          expect(data.error).toContain('error occurred');
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Non-existent resources return 404 with clear message
   */
  it('should return 404 with clear message for non-existent deployments', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // Valid UUID format but non-existent
        async (nonExistentId) => {
          // Mock database to return null (not found)
          const mockGetDeploymentById = vi.fn().mockResolvedValue(null);
          (getDatabaseService as any).mockReturnValue({
            getDeploymentById: mockGetDeploymentById,
          });

          const request = new NextRequest(`http://localhost:3000/api/status?id=${nonExistentId}`);
          const response = await statusGET(request);
          const data = await response.json();

          // Should return 404 for not found
          expect(response.status).toBe(404);
          
          // Should have clear error message
          expect(data.error).toBeDefined();
          expect(data.error.toLowerCase()).toContain('not found');
          
          // Should not expose technical details
          expect(data.error.toLowerCase()).not.toContain('null');
          expect(data.error.toLowerCase()).not.toContain('undefined');
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: All error responses have consistent structure
   */
  it('should return consistent error response structure across all error types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Invalid ID
          fc.constant({ type: 'invalid_id', id: 'invalid' }),
          // Missing ID
          fc.constant({ type: 'missing_id', id: null }),
          // Database error
          fc.uuid().map(id => ({ type: 'db_error', id })),
          // Not found
          fc.uuid().map(id => ({ type: 'not_found', id })),
        ),
        async (testCase) => {
          // Setup mocks based on test case type
          if (testCase.type === 'db_error') {
            const mockGetDeploymentById = vi.fn().mockRejectedValue(new Error('DB Error'));
            (getDatabaseService as any).mockReturnValue({
              getDeploymentById: mockGetDeploymentById,
            });
          } else if (testCase.type === 'not_found') {
            const mockGetDeploymentById = vi.fn().mockResolvedValue(null);
            (getDatabaseService as any).mockReturnValue({
              getDeploymentById: mockGetDeploymentById,
            });
          }

          const url = testCase.id 
            ? `http://localhost:3000/api/status?id=${testCase.id}`
            : 'http://localhost:3000/api/status';
          
          const request = new NextRequest(url);
          const response = await statusGET(request);
          const data = await response.json();

          // All error responses should have an 'error' field
          expect(data).toHaveProperty('error');
          expect(typeof data.error).toBe('string');
          expect(data.error.length).toBeGreaterThan(0);
          
          // Should not have success fields in error responses
          if (response.status >= 400) {
            expect(data.status).toBeUndefined();
            expect(data.deploymentId).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Error messages are always strings and non-empty
   */
  it('should always return non-empty string error messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(''),
          fc.constant('invalid'),
          fc.uuid(),
        ),
        async (id) => {
          // Setup various error scenarios
          if (id && id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            // Valid UUID - mock not found
            const mockGetDeploymentById = vi.fn().mockResolvedValue(null);
            (getDatabaseService as any).mockReturnValue({
              getDeploymentById: mockGetDeploymentById,
            });
          }

          const url = id 
            ? `http://localhost:3000/api/status?id=${id}`
            : 'http://localhost:3000/api/status';
          
          const request = new NextRequest(url);
          const response = await statusGET(request);

          // Only check error responses
          if (response.status >= 400) {
            const data = await response.json();
            
            // Error message must be a non-empty string
            expect(data.error).toBeDefined();
            expect(typeof data.error).toBe('string');
            expect(data.error.trim().length).toBeGreaterThan(0);
            
            // Should not be just whitespace
            expect(data.error.trim()).toBe(data.error);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
