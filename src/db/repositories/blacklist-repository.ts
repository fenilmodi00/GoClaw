import { eq, gt, lt, or, isNull } from 'drizzle-orm';
import { db } from '../index';
import { providerBlacklist, type ProviderBlacklist, type NewProviderBlacklist } from '../schema';

export class ProviderBlacklistRepository {
    /**
     * Gets all currently blacklisted providers
     * Only returns providers whose expiration is in the future or null (permanent)
     */
    async getAllBlacklistedProviders(): Promise<Set<string>> {
        const now = new Date();
        
        const results = await db
            .select({ providerAddress: providerBlacklist.providerAddress })
            .from(providerBlacklist)
            .where(
                or(
                    isNull(providerBlacklist.expiresAt),
                    gt(providerBlacklist.expiresAt, now)
                )
            );

        return new Set(results.map(r => r.providerAddress));
    }

    /**
     * Checks if a specific provider is currently blacklisted
     */
    async isBlacklisted(providerAddress: string): Promise<boolean> {
        const now = new Date();
        
        const results = await db
            .select()
            .from(providerBlacklist)
            .where(eq(providerBlacklist.providerAddress, providerAddress))
            .limit(1);

        if (results.length === 0) return false;

        // Check if blacklist entry has expired
        const entry = results[0];
        if (entry.expiresAt) {
            return entry.expiresAt > now;
        }

        return true; // Permanent blacklist
    }

    /**
     * Adds a provider to the blacklist
     * @param providerAddress - The Akash provider address to blacklist
     * @param reason - Why the provider is being blacklisted
     * @param expiresAt - Optional expiration date (undefined = permanent)
     */
    async add(
        providerAddress: string,
        reason: string = 'Provider blacklisted',
        expiresAt?: Date
    ): Promise<ProviderBlacklist> {
        const newEntry: NewProviderBlacklist = {
            providerAddress,
            reason,
            createdAt: new Date(),
            expiresAt: expiresAt || null,
        };

        try {
            const results = await db
                .insert(providerBlacklist)
                .values(newEntry)
                .returning();
            return results[0];
        } catch (error) {
            // If provider already exists in blacklist, update it
            if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
                const results = await db
                    .update(providerBlacklist)
                    .set({
                        reason,
                        createdAt: new Date(),
                        expiresAt: expiresAt || null,
                    })
                    .where(eq(providerBlacklist.providerAddress, providerAddress))
                    .returning();
                return results[0];
            }
            throw error;
        }
    }

    /**
     * Removes a provider from the blacklist
     */
    async remove(providerAddress: string): Promise<void> {
        await db
            .delete(providerBlacklist)
            .where(eq(providerBlacklist.providerAddress, providerAddress));
    }

    /**
     * Gets blacklist entry details for a specific provider
     */
    async getByProviderAddress(providerAddress: string): Promise<ProviderBlacklist | null> {
        const results = await db
            .select()
            .from(providerBlacklist)
            .where(eq(providerBlacklist.providerAddress, providerAddress))
            .limit(1);
        return results[0] || null;
    }

    /**
     * Cleans up expired blacklist entries
     * Returns count of deleted entries
     */
    async cleanupExpired(): Promise<number> {
        const now = new Date();
        
        const expired = await db
            .select({ providerAddress: providerBlacklist.providerAddress })
            .from(providerBlacklist)
            .where(
                lt(providerBlacklist.expiresAt, now)
            );

        if (expired.length > 0) {
            for (const entry of expired) {
                await this.remove(entry.providerAddress);
            }
        }

        return expired.length;
    }
}

/**
 * Singleton instance of the ProviderBlacklistRepository
 */
let _repository: ProviderBlacklistRepository | null = null;

export function getProviderBlacklistRepository(): ProviderBlacklistRepository {
    if (!_repository) {
        _repository = new ProviderBlacklistRepository();
    }
    return _repository;
}
