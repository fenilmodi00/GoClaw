import crypto from 'crypto';

export interface IdempotencyOptions {
  ttlSeconds?: number;
  cache?: Map<string, { result: unknown; timestamp: number }>;
}

const defaultCache = new Map<string, { result: unknown; timestamp: number }>();

export async function withIdempotency<T>(
  key: string,
  fn: () => Promise<T>,
  options: IdempotencyOptions = {}
): Promise<T> {
  const { ttlSeconds = 3600, cache = defaultCache } = options;
  
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  const cached = cache.get(hash);
  
  if (cached && Date.now() - cached.timestamp < ttlSeconds * 1000) {
    return cached.result as T;
  }
  
  const result = await fn();
  cache.set(hash, { result, timestamp: Date.now() });
  
  if (cache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp > ttlSeconds * 1000) {
        cache.delete(k);
      }
    }
  }
  
  return result;
}

export function getIdempotencyKeyFromHeaders(headers: Headers): string | null {
  return headers.get('Idempotency-Key') || headers.get('x-idempotency-key');
}
