/**
 * Structured error types for carrier integrations.
 * All errors extend CarrierError for consistent handling.
 */
export declare enum ErrorCode {
    AUTH_FAILED = "AUTH_FAILED",
    AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    INVALID_ADDRESS = "INVALID_ADDRESS",
    INVALID_PACKAGE = "INVALID_PACKAGE",
    API_ERROR = "API_ERROR",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    TIMEOUT = "TIMEOUT",
    NETWORK_ERROR = "NETWORK_ERROR",
    NO_RATES_FOUND = "NO_RATES_FOUND",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION",
    INVALID_RESPONSE = "INVALID_RESPONSE",
    UNEXPECTED_ERROR = "UNEXPECTED_ERROR"
}
/**
 * Base error class for all carrier-related errors
 */
export declare class CarrierError extends Error {
    readonly code: ErrorCode;
    readonly statusCode?: number;
    readonly carrier?: string;
    readonly details?: unknown;
    readonly retryable: boolean;
    constructor(message: string, code: ErrorCode, options?: {
        statusCode?: number;
        carrier?: string;
        details?: unknown;
        retryable?: boolean;
        cause?: Error;
    });
    toJSON(): {
        name: string;
        message: string;
        code: ErrorCode;
        statusCode: number | undefined;
        carrier: string | undefined;
        retryable: boolean;
        details: unknown;
    };
}
/**
 * Authentication-related errors
 */
export declare class AuthenticationError extends CarrierError {
    constructor(message: string, options?: {
        statusCode?: number;
        carrier?: string;
        details?: unknown;
        cause?: Error;
    });
}
/**
 * Validation errors
 */
export declare class ValidationError extends CarrierError {
    constructor(message: string, options?: {
        details?: unknown;
        cause?: Error;
    });
}
/**
 * Rate limiting errors
 */
export declare class RateLimitError extends CarrierError {
    readonly retryAfter?: number;
    constructor(message: string, retryAfter?: number, options?: {
        carrier?: string;
        details?: unknown;
    });
}
/**
 * Network/timeout errors
 */
export declare class NetworkError extends CarrierError {
    constructor(message: string, options?: {
        carrier?: string;
        cause?: Error;
    });
}
/**
 * API response errors
 */
export declare class APIError extends CarrierError {
    constructor(message: string, statusCode: number, options?: {
        carrier?: string;
        details?: unknown;
        cause?: Error;
    });
}
//# sourceMappingURL=CarrierError.d.ts.map