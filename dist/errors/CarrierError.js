"use strict";
/**
 * Structured error types for carrier integrations.
 * All errors extend CarrierError for consistent handling.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIError = exports.NetworkError = exports.RateLimitError = exports.ValidationError = exports.AuthenticationError = exports.CarrierError = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    // Authentication errors
    ErrorCode["AUTH_FAILED"] = "AUTH_FAILED";
    ErrorCode["AUTH_TOKEN_EXPIRED"] = "AUTH_TOKEN_EXPIRED";
    ErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    // Validation errors
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["INVALID_ADDRESS"] = "INVALID_ADDRESS";
    ErrorCode["INVALID_PACKAGE"] = "INVALID_PACKAGE";
    // API errors
    ErrorCode["API_ERROR"] = "API_ERROR";
    ErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ErrorCode["TIMEOUT"] = "TIMEOUT";
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    // Business logic errors
    ErrorCode["NO_RATES_FOUND"] = "NO_RATES_FOUND";
    ErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    ErrorCode["UNSUPPORTED_OPERATION"] = "UNSUPPORTED_OPERATION";
    // Response parsing errors
    ErrorCode["INVALID_RESPONSE"] = "INVALID_RESPONSE";
    ErrorCode["UNEXPECTED_ERROR"] = "UNEXPECTED_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
/**
 * Base error class for all carrier-related errors
 */
class CarrierError extends Error {
    code;
    statusCode;
    carrier;
    details;
    retryable;
    constructor(message, code, options) {
        super(message);
        this.name = 'CarrierError';
        this.code = code;
        this.statusCode = options?.statusCode;
        this.carrier = options?.carrier;
        this.details = options?.details;
        this.retryable = options?.retryable ?? false;
        if (options?.cause) {
            this.cause = options.cause;
        }
        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            carrier: this.carrier,
            retryable: this.retryable,
            details: this.details,
        };
    }
}
exports.CarrierError = CarrierError;
/**
 * Authentication-related errors
 */
class AuthenticationError extends CarrierError {
    constructor(message, options) {
        super(message, ErrorCode.AUTH_FAILED, {
            ...options,
            retryable: false,
        });
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Validation errors
 */
class ValidationError extends CarrierError {
    constructor(message, options) {
        super(message, ErrorCode.VALIDATION_ERROR, {
            ...options,
            retryable: false,
        });
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
/**
 * Rate limiting errors
 */
class RateLimitError extends CarrierError {
    retryAfter; // seconds
    constructor(message, retryAfter, options) {
        super(message, ErrorCode.RATE_LIMIT_EXCEEDED, {
            ...options,
            statusCode: 429,
            retryable: true,
        });
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}
exports.RateLimitError = RateLimitError;
/**
 * Network/timeout errors
 */
class NetworkError extends CarrierError {
    constructor(message, options) {
        super(message, ErrorCode.NETWORK_ERROR, {
            ...options,
            retryable: true,
        });
        this.name = 'NetworkError';
    }
}
exports.NetworkError = NetworkError;
/**
 * API response errors
 */
class APIError extends CarrierError {
    constructor(message, statusCode, options) {
        const retryable = statusCode >= 500 || statusCode === 429;
        super(message, ErrorCode.API_ERROR, {
            ...options,
            statusCode,
            retryable,
        });
        this.name = 'APIError';
    }
}
exports.APIError = APIError;
//# sourceMappingURL=CarrierError.js.map