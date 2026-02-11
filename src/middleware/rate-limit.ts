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

const store = new Map<string, number[]>();

/**
 * Clean up expired entries periodically to prevent memory leaks.
 * Runs every 60 seconds.
 */
const CLEANUP_INTERVAL_MS = 60_000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
    if (cleanupTimer) return;
    cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [key, timestamps] of store.entries()) {
            const filtered = timestamps.filter((t) => now - t < 120_000); // Keep 2 min max
            if (filtered.length === 0) {
                store.delete(key);
            } else {
                store.set(key, filtered);
            }
        }
    }, CLEANUP_INTERVAL_MS);

    // Allow the process to exit even if the timer is running
    if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
        cleanupTimer.unref();
    }
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    limit: number;
    resetMs: number;
}

/**
 * Check if a request should be allowed under the rate limit.
 *
 * @param key - Unique identifier for the rate limit bucket (e.g. `checkout:user_123`)
 * @param limit - Maximum number of requests allowed within the window
 * @param windowMs - Time window in milliseconds
 * @returns Object with `success` (whether request is allowed), `remaining` count, and `resetMs`
 */
export function rateLimit(
    key: string,
    limit: number,
    windowMs: number
): RateLimitResult {
    startCleanup();

    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing timestamps and filter to current window
    const timestamps = (store.get(key) || []).filter((t) => t > windowStart);

    if (timestamps.length >= limit) {
        // Rate limited — calculate when the oldest request in the window expires
        const oldestInWindow = timestamps[0];
        const resetMs = oldestInWindow + windowMs - now;

        store.set(key, timestamps);

        return {
            success: false,
            remaining: 0,
            limit,
            resetMs,
        };
    }

    // Allow the request
    timestamps.push(now);
    store.set(key, timestamps);

    return {
        success: true,
        remaining: limit - timestamps.length,
        limit,
        resetMs: windowMs,
    };
}
