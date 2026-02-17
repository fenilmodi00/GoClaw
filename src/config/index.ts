const DEFAULT_AKASH_API_BASE_URL = 'https://console-api.akash.network';

function normalizeAkashApiBaseUrl(value?: string): string {
  const trimmed = value?.trim().replace(/^['"]|['"]$/g, '');
  if (!trimmed) {
    return DEFAULT_AKASH_API_BASE_URL;
  }

  try {
    const url = new URL(trimmed);
    let corrected = false;

    if (url.hostname === 'console.akash.network') {
      url.hostname = 'console-api.akash.network';
      corrected = true;
    }

    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
      url.pathname = '/';
      corrected = true;
    }

    const normalizedPath = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '');
    const normalized = `${url.protocol}//${url.host}${normalizedPath}`;

    if (corrected) {
      console.warn(`AKASH_CONSOLE_API_URL was normalized from "${trimmed}" to "${normalized}"`);
    }

    return normalized;
  } catch {
    console.warn(`AKASH_CONSOLE_API_URL is invalid ("${trimmed}"). Falling back to "${DEFAULT_AKASH_API_BASE_URL}"`);
    return DEFAULT_AKASH_API_BASE_URL;
  }
}

export const config = {
  akash: {
    apiBaseUrl: normalizeAkashApiBaseUrl(process.env.AKASH_CONSOLE_API_URL),
    apiKey: process.env.AKASH_API_KEY || '',
    maxBidPollAttempts: parseInt(process.env.AKASH_MAX_BID_POLL_ATTEMPTS || '20', 10),
    bidPollIntervalMs: parseInt(process.env.AKASH_BID_POLL_INTERVAL_MS || '3000', 10),
    bidPollTimeoutMs: parseInt(process.env.AKASH_BID_POLL_TIMEOUT_MS || '60000', 10),
    minDepositUsd: parseInt(process.env.AKASH_MIN_DEPOSIT_USD || '5', 10),
    leaseMaxRetries: parseInt(process.env.AKASH_LEASE_MAX_RETRIES || '3', 10),
    leaseRetryBaseDelayMs: parseInt(process.env.AKASH_LEASE_RETRY_BASE_DELAY_MS || '2000', 10),
    providerHealthCheckTimeout: parseInt(process.env.AKASH_PROVIDER_HEALTH_CHECK_TIMEOUT || '10000', 10),
  },
  inngest: {
    signingKey: process.env.INNGEST_SIGNING_KEY || '',
    eventKey: process.env.INNGEST_EVENT_KEY || '',
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    env: process.env.NODE_ENV || 'development',
  },
  cache: {
    deploymentTtlSeconds: parseInt(process.env.CACHE_DEPLOYMENT_TTL_SECONDS || '30', 10),
  },
  rateLimit: {
    requests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100', 10),
    windowSeconds: parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '60', 10),
  },
} as const;

export type Config = typeof config;
