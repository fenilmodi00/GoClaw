import { getUserRepository } from '@/db/repositories/user-repository';
import type { User } from '@/db/schema';
import { polarService } from '../polar/polar.service';

/**
 * UserService - Business logic layer for user management
 * 
 * Handles user registration and retrieval.
 * Uses UserRepository for data access.
 */

export class UserService {
  private userRepository;

  constructor() {
    this.userRepository = getUserRepository();
  }

  /**
   * Creates a new user from Clerk authentication
   */
  async createUserFromClerk(clerkUserId: string, email: string): Promise<User> {
    // 1. Check if user already exists by email
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      console.log(`User with email ${email} already exists. Linking new Clerk ID.`);
      // Update the existing user with the new Clerk ID
      const updatedUser = await this.userRepository.update(existingUser.id, {
        clerkUserId,
        // Ensure polarCustomerId is set if we have it (though we might not want to overwrite if null, logic below handles creation)
      });

      if (!updatedUser) {
        throw new Error(`Failed to update user ${existingUser.id}`);
      }

      // Ensure Polar Customer is linked if missing
      if (!updatedUser.polarCustomerId) {
        try {
          const polarCustomer = await polarService.createCustomer(email, undefined, clerkUserId);
          return (await this.userRepository.update(updatedUser.id, { polarCustomerId: polarCustomer.id })) || updatedUser;
        } catch (err) {
          console.error('Failed to link Polar customer during account linking:', err);
        }
      }

      return updatedUser;
    }

    // 2. Create new user if not exists
    let polarCustomerId: string | undefined;
    try {
      const polarCustomer = await polarService.createCustomer(email, undefined, clerkUserId);
      polarCustomerId = polarCustomer.id;

      // Subscribe to Free Tier if configured
      const freeTierProductId = process.env.POLAR_FREE_TIER_PRODUCT_ID;
      if (freeTierProductId && polarCustomerId) {
        await polarService.subscribeCustomer(polarCustomerId, freeTierProductId);
      }
    } catch (error) {
      console.error('Failed to create Polar customer:', error);
    }
    return this.userRepository.create({ clerkUserId, email, polarCustomerId });
  }

  /**
   * Retrieves a user by their internal ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  /**
   * Retrieves a user by their Clerk user ID
   */
  async getUserByClerkId(clerkUserId: string): Promise<User | null> {
    return this.userRepository.findByClerkId(clerkUserId);
  }

  /**
   * Retrieves a user by their email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
  /**
   * Updates the Polar Customer ID for a user
   */
  async updatePolarCustomerId(userId: string, polarCustomerId: string): Promise<User | undefined> {
    return this.userRepository.update(userId, { polarCustomerId });
  }

  /**
   * Updates the Clerk User ID for a user (Account Linking)
   */
  async updateClerkId(userId: string, clerkUserId: string): Promise<User | undefined> {
    return this.userRepository.update(userId, { clerkUserId });
  }
}

// Singleton instance
export const userService = new UserService();
