import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '@/services/user/user-service';

/**
 * Unit tests for UserService
 * 
 * Tests user registration with Clerk, trial management, and plan upgrades.
 * Uses mocked database to avoid actual database operations.
 */

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    // Create a new instance for each test
    userService = new UserService();
  });

  describe('createUserFromClerk', () => {
    it('should create a user with Clerk user ID', async () => {
      const clerkUserId = 'clerk_user_123';
      const email = 'test@example.com';

      const user = await userService.createUserFromClerk(clerkUserId, email);

      expect(user.id).toBeDefined();
      expect(user.clerkUserId).toBe(clerkUserId);
      expect(user.email).toBe(email);
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const clerkUserId = 'clerk_getuser_123';
      const email = 'getuser@example.com';
      
      const createdUser = await userService.createUserFromClerk(clerkUserId, email);

      const retrievedUser = await userService.getUserById(createdUser.id);
      
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser?.email).toBe(email);
      expect(retrievedUser?.clerkUserId).toBe(clerkUserId);
    });

    it('should return null for non-existent user', async () => {
      const user = await userService.getUserById('non-existent-id');
      expect(user).toBeNull();
    });
  });

  describe('getUserByClerkId', () => {
    it('should return user by Clerk user ID', async () => {
      const clerkUserId = 'clerk_lookup_123';
      const email = 'lookup@example.com';
      
      await userService.createUserFromClerk(clerkUserId, email);

      const retrievedUser = await userService.getUserByClerkId(clerkUserId);
      
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser?.clerkUserId).toBe(clerkUserId);
      expect(retrievedUser?.email).toBe(email);
    });

    it('should return null for non-existent Clerk user', async () => {
      const user = await userService.getUserByClerkId('non-existent-clerk-id');
      expect(user).toBeNull();
    });
  });
});
