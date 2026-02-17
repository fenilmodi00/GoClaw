/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Tracks request timestamps per key and enforces a maximum number
 * of requests within a rolling time window. Suitable for single-instance
 * deployments. For serverless/multi-instance, use @upstash/ratelimit instead.
 *
 * @example
 * ```typescript
 * const result = rateLimit(`checkout:${userId}`, 5, 60_000);
 * if (!result.success) {
 *   return new Response('Too many requests', { status: 429 });
 * }
 * ```
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    limit: number;
    resetMs: number;
}

// Create a new ratelimiter, that loosely slides the window
// from the current time to the last window size.
// 
// Use a fallback if Redis is not configured (for dev/build)
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(10, "10 s"), // Default, overridden per call
        analytics: true,
        prefix: "@upstash/ratelimit",
    });
} else {
    console.warn("UPSTASH_REDIS_REST_URL or TOKEN missing, falling back to in-memory rate limiting (not recommended for production)");
}

// In-memory fallback
const memoryStore = new Map<string, number[]>();
const storeLock = new Map<string, boolean>();

/**
 * Check if a request should be allowed under the rate limit.
 * 
 * @param key - Unique identifier for the rate limit bucket
 * @param limit - Maximum number of requests allowed within the window
 * @param windowMs - Time window in milliseconds
 */
export async function rateLimit(
    key: string,
    limit: number,
    windowMs: number
): Promise<RateLimitResult> {
    // 1. Try Upstash Redis
    if (ratelimit) {
        try {
            // Convert windowMs to seconds or duration string for Upstash
            // Upstash accepts "10 s", "1 m" etc. or seconds.
            // But the instance is created with a default. 
            // We can create specific limiters on the fly or just use a shared instance if we accept the default algorithm.
            // To support dynamic limits/windows effectively with this library, we might need to instantiate per call or cache instances.
            // For simplicity and performance, we'll use a new instance if the window differs significantly, or just use the slidingWindow logic.

            // Actually, Ratelimit instance is tied to an algorithm.
            // Let's create a new limiter for this specific call's requirements if acceptable, 
            // IS EXPENSIVE to create new Redis connections? No, Redis.fromEnv() is cheap (HTTP client).
            // But Ratelimit object might have overhead.

            const dynamicLimiter = new Ratelimit({
                redis: Redis.fromEnv(),
                limiter: Ratelimit.slidingWindow(limit, `${Math.ceil(windowMs / 1000)} s`),
                analytics: true,
                prefix: "@upstash/ratelimit",
            });

            const { success, limit: l, remaining, reset } = await dynamicLimiter.limit(key);

            return {
                success,
                limit: l,
                remaining,
                resetMs: reset - Date.now(),
            };
        } catch (error) {
            console.error("Rate limit error (Redis), falling back to memory:", error);
        }
    }

    // 2. Fallback to In-Memory (with simple locking for thread safety)
    while (storeLock.get(key)) {
        await new Promise(resolve => setTimeout(resolve, 1));
    }
    storeLock.set(key, true);

    try {
        const now = Date.now();
        const windowStart = now - windowMs;

        const timestamps = (memoryStore.get(key) || []).filter((t) => t > windowStart);

        if (timestamps.length >= limit) {
            const oldestInWindow = timestamps[0];
            const resetMs = oldestInWindow + windowMs - now;
            return {
                success: false,
                remaining: 0,
                limit,
                resetMs,
            };
        }

        timestamps.push(now);
        memoryStore.set(key, timestamps);

        return {
            success: true,
            remaining: limit - timestamps.length,
            limit,
            resetMs: windowMs,
        };
    } finally {
        storeLock.delete(key);
    }
}
