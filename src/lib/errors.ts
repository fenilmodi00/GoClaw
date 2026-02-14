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
