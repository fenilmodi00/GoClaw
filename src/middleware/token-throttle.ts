/**
 * Token Bucket Rate Limiter for AI Token Usage
 *
 * Implements per-user token throttling based on subscription tier.
 * Uses Redis (Upstash) in production, in-memory fallback for dev.
 */

import { Redis } from '@upstash/redis';

export interface TokenThrottleResult {
    allowed: boolean;
    remaining: number;
    limit: number;
    resetMs: number;
    retryAfter?: number;
}

// Tier-based token limits (tokens per hour)
export const TIER_TOKEN_LIMITS = {
    STARTER: 100_000, // ~$1 worth of tokens per hour
    PRO: 500_000, // ~$5 worth of tokens per hour
    BUSINESS: 2_000_000, // ~$20 worth of tokens per hour
} as const;

// Redis client for production
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
}

// In-memory store for development
const memoryStore = new Map<string, { tokens: number; lastRefill: number }>();

/**
 * Check if a token request should be allowed
 *
 * @param userId - Unique user identifier
 * @param tier - User's subscription tier
 * @param requestedTokens - Number of tokens being requested
 * @returns TokenThrottleResult with allowance status
 */
export async function checkTokenThrottle(
    userId: string,
    tier: keyof typeof TIER_TOKEN_LIMITS | string,
    requestedTokens: number
): Promise<TokenThrottleResult> {
    const key = `tokens:${userId}`;
    const limit =
        TIER_TOKEN_LIMITS[tier as keyof typeof TIER_TOKEN_LIMITS] ||
        TIER_TOKEN_LIMITS.STARTER;
    const windowMs = 60 * 60 * 1000; // 1 hour window

    // Try Redis first
    if (redis) {
        try {
            const now = Date.now();
            const bucket = await redis.hmget<{ tokens: string; lastRefill: string }>(key, 'tokens', 'lastRefill');

            let currentTokens = bucket?.tokens ? parseInt(bucket.tokens) : limit;
            let lastRefill = bucket?.lastRefill ? parseInt(bucket.lastRefill) : now;

            // Calculate token refill
            const timePassed = now - lastRefill;
            const refillRate = limit / windowMs; // tokens per ms
            const tokensToAdd = Math.floor(timePassed * refillRate);

            currentTokens = Math.min(limit, currentTokens + tokensToAdd);
            lastRefill = now;

            // Check if request can be fulfilled
            if (currentTokens >= requestedTokens) {
                currentTokens -= requestedTokens;
                await redis.hmset(key, { tokens: currentTokens, lastRefill });
                await redis.expire(key, 7200); // 2 hour expiry

                return {
                    allowed: true,
                    remaining: currentTokens,
                    limit,
                    resetMs: windowMs,
                };
            } else {
                // Not enough tokens
                const retryAfter = Math.ceil((requestedTokens - currentTokens) / refillRate);
                return {
                    allowed: false,
                    remaining: currentTokens,
                    limit,
                    resetMs: windowMs,
                    retryAfter,
                };
            }
        } catch (error) {
            console.error('Token throttle Redis error:', error);
        }
    }

    // Fallback to in-memory
    const now = Date.now();
    const bucket = memoryStore.get(key) || { tokens: limit, lastRefill: now };

    // Refill tokens
    const timePassed = now - bucket.lastRefill;
    const refillRate = limit / windowMs;
    const tokensToAdd = Math.floor(timePassed * refillRate);

    bucket.tokens = Math.min(limit, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    if (bucket.tokens >= requestedTokens) {
        bucket.tokens -= requestedTokens;
        memoryStore.set(key, bucket);

        return {
            allowed: true,
            remaining: bucket.tokens,
            limit,
            resetMs: windowMs,
        };
    } else {
        const retryAfter = Math.ceil((requestedTokens - bucket.tokens) / refillRate);
        return {
            allowed: false,
            remaining: bucket.tokens,
            limit,
            resetMs: windowMs,
            retryAfter,
        };
    }
}

/**
 * Get current token bucket status for a user
 */
export async function getTokenStatus(
    userId: string,
    tier: keyof typeof TIER_TOKEN_LIMITS | string
): Promise<{ remaining: number; limit: number; resetMs: number }> {
    const key = `tokens:${userId}`;
    const limit =
        TIER_TOKEN_LIMITS[tier as keyof typeof TIER_TOKEN_LIMITS] ||
        TIER_TOKEN_LIMITS.STARTER;
    const windowMs = 60 * 60 * 1000;

    if (redis) {
        const bucket = await redis.hmget<{ tokens: string }>(key, 'tokens');
        return {
            remaining: bucket?.tokens ? parseInt(bucket.tokens) : limit,
            limit,
            resetMs: windowMs,
        };
    }

    const bucket = memoryStore.get(key);
    return {
        remaining: bucket?.tokens ?? limit,
        limit,
        resetMs: windowMs,
    };
}
