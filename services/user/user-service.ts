import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { eq } from 'drizzle-orm';
import { users, type User, type NewUser } from '@/db/schema';

/**
 * UserService handles user registration and management.
 * 
 * Key features:
 * - User registration from Clerk authentication
 * - User retrieval by ID or Clerk ID
 * 
 * Requirements: 1.2, 1.3
 */

export class UserService {
  private db;

  constructor() {
    // Initialize database client
    const client = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN!,
    });

    this.db = drizzle(client);
  }

  /**
   * Creates a new user from Clerk authentication.
   * 
   * This method is called after a user registers via Clerk.
   * It creates a SimpleClaw user record linked to the Clerk user ID.
   * 
   * @param clerkUserId - Clerk user ID from Clerk webhook
   * @param email - User's email address from Clerk
   * @returns The created user record
   * 
   * Requirements: 1.2, 1.3
   */
  async createUserFromClerk(
    clerkUserId: string,
    email: string
  ): Promise<User> {
    // Generate unique UUID for user
    const id = crypto.randomUUID();
    const now = new Date();

    // Create user record
    const newUser: NewUser = {
      id,
      clerkUserId,
      email,
      createdAt: now,
      updatedAt: now,
    };

    // Insert into database
    await this.db.insert(users).values(newUser);

    // Return the created user
    return newUser as User;
  }



  /**
   * Retrieves a user by their ID.
   * 
   * @param userId - User ID
   * @returns The user record, or null if not found
   */
  async getUserById(userId: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return result[0];
  }

  /**
   * Retrieves a user by their Clerk user ID.
   * 
   * @param clerkUserId - Clerk user ID
   * @returns The user record, or null if not found
   */
  async getUserByClerkId(clerkUserId: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return result[0];
  }
}

// Lazy-loaded singleton instance
let _userService: UserService | null = null;

export function getUserService(): UserService {
  if (!_userService) {
    _userService = new UserService();
  }
  return _userService;
}

// Export a singleton instance for use throughout the application
export const userService = new Proxy({} as UserService, {
  get(_target, prop) {
    const service = getUserService();
    return service[prop as keyof UserService];
  }
});
