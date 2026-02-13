import { eq } from 'drizzle-orm';
import { db } from '../index';
import { users, type User, type NewUser } from '../schema';
import { v4 as uuidv4 } from 'uuid';

export class UserRepository {
    /**
     * Creates a new user record
     */
    async create(input: { clerkUserId: string; email: string; polarCustomerId?: string }): Promise<User> {
        const id = uuidv4();
        const now = new Date();

        const newUser: NewUser = {
            id,
            clerkUserId: input.clerkUserId,
            email: input.email,
            polarCustomerId: input.polarCustomerId,
            createdAt: now,
            updatedAt: now,
        };

        const results = await db.insert(users).values(newUser).returning();
        return results[0];
    }

    /**
     * Finds a user by their internal ID
     */
    async findById(id: string): Promise<User | null> {
        const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return results[0] || null;
    }

    /**
     * Finds a user by their Clerk user ID
     */
    async findByClerkId(clerkUserId: string): Promise<User | null> {
        const results = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1);
        return results[0] || null;
    }

    /**
     * Finds a user by their email address
     */
    async findByEmail(email: string): Promise<User | null> {
        const results = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return results[0] || null;
    }

    /**
     * Finds a user by their Polar customer ID
     */
    async findByPolarId(polarCustomerId: string): Promise<User | null> {
        const results = await db.select().from(users).where(eq(users.polarCustomerId, polarCustomerId)).limit(1);
        return results[0] || null;
    }

    /**
     * Updates a user record
     */
    async update(id: string, data: Partial<NewUser>): Promise<User | null> {
        const results = await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id)).returning();
        return results[0] || null;
    }
}

/**
 * Singleton instance of the UserRepository
 */
let _repository: UserRepository | null = null;

export function getUserRepository(): UserRepository {
    if (!_repository) {
        _repository = new UserRepository();
    }
    return _repository;
}
