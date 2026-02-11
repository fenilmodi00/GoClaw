import { Redis } from '@upstash/redis';

/**
 * CacheService
 * 
 * Provides a standardized interface for caching data using Upstash Redis.
 * Implements simple key-value caching with TTL.
 */
export class CacheService {
    private redis: Redis;
    private isEnabled: boolean = false;

    constructor() {
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            this.redis = Redis.fromEnv();
            this.isEnabled = true;
        } else {
            console.warn('CacheService: Upstash credentials missing, caching disabled.');
            // Fallback or just don't cache
            this.redis = new Redis({ url: 'http://localhost:8080', token: 'mock' }); // Placeholder to satisfy TS, usage guarded by isEnabled
        }
    }

    /**
     * Retrieves a value from the cache.
     * @param key Cache key
     * @returns The parsed value or null if not found/disabled
     */
    async get<T>(key: string): Promise<T | null> {
        if (!this.isEnabled) return null;
        try {
            return await this.redis.get<T>(key);
        } catch (error) {
            console.error(`CacheService get error for key ${key}:`, error);
            return null;
        }
    }

    /**
     * Sets a value in the cache with an expiration.
     * @param key Cache key
     * @param value Data to store
     * @param ttlSeconds Time to live in seconds
     */
    async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
        if (!this.isEnabled) return;
        try {
            await this.redis.set(key, value, { ex: ttlSeconds });
        } catch (error) {
            console.error(`CacheService set error for key ${key}:`, error);
        }
    }

    /**
     * Deletes a value from the cache.
     * @param key Cache key
     */
    async delete(key: string): Promise<void> {
        if (!this.isEnabled) return;
        try {
            await this.redis.del(key);
        } catch (error) {
            console.error(`CacheService delete error for key ${key}:`, error);
        }
    }

    /**
     * Deletes all keys matching a pattern.
     * Use carefully! Scanning keys can be expensive.
     * @param pattern Match pattern (e.g., "user:123:*")
     */
    async invalidatePattern(pattern: string): Promise<void> {
        if (!this.isEnabled) return;
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } catch (error) {
            console.error(`CacheService invalidatePattern error for ${pattern}:`, error);
        }
    }
}

// Singleton instance
export const cacheService = new CacheService();
