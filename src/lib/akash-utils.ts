export function isRetryableAkashError(error: Error): boolean {
  const retryableMessages = [
    '503',
    'Service Unavailable',
    'provider is temporarily unavailable',
    'ETIMEDOUT',
    'ECONNRESET',
    'ENOTFOUND',
    'ECONNREFUSED',
    'NetworkError',
    'timeout',
  ];

  return retryableMessages.some(msg => 
    error.message.toLowerCase().includes(msg.toLowerCase())
  );
}

export function isProviderUnavailableError(error: Error): boolean {
  return error.message.includes('503') || 
         error.message.toLowerCase().includes('unavailable');
}

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  retryableStatuses: number[];
  retryableErrors: string[];
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 2000,
  retryableStatuses: [429, 500, 502, 503, 504],
  retryableErrors: ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'NetworkError'],
  onRetry: undefined,
};

export async function fetchWithRetry<T = unknown>(
  url: string,
  options: RequestInit,
  customOptions?: Partial<RetryOptions>
): Promise<T> {
  const opts: RetryOptions = { ...DEFAULT_RETRY_OPTIONS, ...customOptions };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000),
      });

      if (response.ok) {
        return await response.json() as T;
      }

      const errorText = await response.text();
      const status = response.status;

      if (opts.retryableStatuses.includes(status)) {
        lastError = new Error(`HTTP ${status}: ${errorText}`);
        
        if (attempt < opts.maxRetries) {
          const delay = opts.baseDelayMs * Math.pow(2, attempt - 1);
          console.warn(`Retryable error ${status} on attempt ${attempt}/${opts.maxRetries}. Retrying in ${delay}ms...`);
          
          if (opts.onRetry) {
            opts.onRetry(attempt, lastError, delay);
          }
          
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      throw new Error(`HTTP ${status}: ${errorText}`);
    } catch (error) {
      lastError = error as Error;
      
      const isNetworkError = opts.retryableErrors.some(err => 
        lastError.message.includes(err) || lastError.name === err
      );

      if (isNetworkError && attempt < opts.maxRetries) {
        const delay = opts.baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(`Network error on attempt ${attempt}/${opts.maxRetries}. Retrying in ${delay}ms...`, lastError.message);
        
        if (opts.onRetry) {
          opts.onRetry(attempt, lastError, delay);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError!;
}

export interface ProviderInfo {
  owner: string;
  uri: string;
  attributes: Record<string, string>[];
  email: string;
  website: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface ProvidersResponse {
  data: ProviderInfo[];
  pagination?: {
    total: string;
    limit: number;
    offset: number;
  };
}

export interface ProviderRegion {
  name: string;
  location?: {
    city: string;
    country: string;
  };
}

export interface CertificateResponse {
  data: {
    id: string;
    owner: string;
    cert: string;
    pubkey: string;
    createdAt: string;
    expiresAt: string;
  };
}

export interface DeploymentDetails {
  data: {
    deployment: {
      id: {
        owner: string;
        dseq: string;
      };
      state: string;
      version: string;
      createdHeight: string;
      createdAt: string;
    };
    groups: Array<{
      id: {
        owner: string;
        dseq: string;
        gseq: number;
      };
      state: string;
      spec: unknown;
    }>;
    escrow_account: unknown;
  };
}
