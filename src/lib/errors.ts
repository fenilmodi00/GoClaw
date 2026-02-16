/**
 * Standardized Error Codes for API Responses
 */

export const ErrorCodes = {
    // Authentication
    UNAUTHORIZED: 'AUTH_001',
    INVALID_TOKEN: 'AUTH_002',

    // Billing
    INSUFFICIENT_CREDITS: 'BILL_001',
    BILLING_NOT_SETUP: 'BILL_002',
    INVALID_BILLING_ID: 'BILL_003',

    // Rate Limiting
    RATE_LIMIT_REQUESTS: 'RATE_001',
    RATE_LIMIT_TOKENS: 'RATE_002',

    // Validation
    INVALID_REQUEST: 'VAL_001',
    PAYLOAD_TOO_LARGE: 'VAL_002',

    // Provider
    PROVIDER_ERROR: 'PROV_001',
    CONFIGURATION_ERROR: 'PROV_002',

    // Server
    INTERNAL_ERROR: 'SRV_001',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export interface ApiError {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
}

/**
 * Akash-specific error codes
 */
export const AkashErrorCodes = {
    PROVIDER_UNAVAILABLE: 'AKASH_001',
    NO_BIDS_RECEIVED: 'AKASH_002',
    ALL_PROVIDERS_FAILED: 'AKASH_003',
    LEASE_TIMEOUT: 'AKASH_004',
    CERTIFICATE_ERROR: 'AKASH_005',
    DEPLOYMENT_FAILED: 'AKASH_006',
    MANIFEST_ERROR: 'AKASH_007',
} as const;

export type AkashErrorCode = typeof AkashErrorCodes[keyof typeof AkashErrorCodes];

/**
 * Custom error class for Akash-related errors
 */
export class AkashError extends Error {
    code: AkashErrorCode;
    provider?: string;
    dseq?: string;

    constructor(message: string, code: AkashErrorCode, details?: { provider?: string; dseq?: string }) {
        super(message);
        this.name = 'AkashError';
        this.code = code;
        this.provider = details?.provider;
        this.dseq = details?.dseq;
    }
}

export class AkashProviderUnavailableError extends AkashError {
    constructor(provider: string, dseq?: string) {
        super(`Provider ${provider} is unavailable`, AkashErrorCodes.PROVIDER_UNAVAILABLE, { provider, dseq });
        this.name = 'AkashProviderUnavailableError';
    }
}

export class AkashNoBidsError extends AkashError {
    constructor(dseq: string) {
        super(`No bids received for deployment ${dseq}`, AkashErrorCodes.NO_BIDS_RECEIVED, { dseq });
        this.name = 'AkashNoBidsError';
    }
}

export class AkashAllProvidersFailedError extends AkashError {
    failedProviders: string[];
    lastError: string;

    constructor(failedProviders: string[], lastError: string, dseq?: string) {
        super(`All ${failedProviders.length} providers failed. Last error: ${lastError}`, AkashErrorCodes.ALL_PROVIDERS_FAILED, { dseq });
        this.name = 'AkashAllProvidersFailedError';
        this.failedProviders = failedProviders;
        this.lastError = lastError;
    }
}

export class AkashLeaseTimeoutError extends AkashError {
    constructor(dseq: string) {
        super(`Lease creation timed out for deployment ${dseq}`, AkashErrorCodes.LEASE_TIMEOUT, { dseq });
        this.name = 'AkashLeaseTimeoutError';
    }
}

export class AkashCertificateError extends AkashError {
    constructor(message: string) {
        super(message, AkashErrorCodes.CERTIFICATE_ERROR);
        this.name = 'AkashCertificateError';
    }
}
