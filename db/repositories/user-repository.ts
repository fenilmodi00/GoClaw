import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { eq } from 'drizzle-orm';
import { users, type User, type NewUser } from '@/db/schema';

/**
 * UserRepository - Professional data access layer for users
 * 
 * Follows repository pattern for clean separation of concerns.
 * Provides type-safe, optimized queries.
 */

export interface CreateUserInput {
  clerkUserId: string;
  email: string;
}

export class UserRepository {
  private db;

  constructor() {
    const client = createClient({
      url: process.env.DATABASE_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN!,
    });

    this.db = drizzle(client);
  }

  /**
   * Creates a new user from Clerk authentication
   */
  async create(input: CreateUserInput): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date();

    const newUser: NewUser = {
      id,
      clerkUserId: input.clerkUserId,
      email: input.email,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(users).values(newUser);

    return newUser as User;
  }

  /**
   * Finds user by internal ID
   */
  async findById(userId: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Finds user by Clerk user ID
   */
  async findByClerkId(clerkUserId: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Finds user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }
}

// Singleton instance
let _userRepository: UserRepository | null = null;

export function getUserRepository(): UserRepository {
  if (!_userRepository) {
    _userRepository = new UserRepository();
  }
  return _userRepository;
}
