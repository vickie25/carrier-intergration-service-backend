/**
 * Structured error types for carrier integrations.
 * All errors extend CarrierError for consistent handling.
 */

export enum ErrorCode {
  // Authentication errors
  AUTH_FAILED = 'AUTH_FAILED',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_PACKAGE = 'INVALID_PACKAGE',

  // API errors
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',

  // Business logic errors
  NO_RATES_FOUND = 'NO_RATES_FOUND',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',

  // Response parsing errors
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
}

/**
 * Base error class for all carrier-related errors
 */
export class CarrierError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode?: number;
  public readonly carrier?: string;
  public readonly details?: unknown;
  public readonly retryable: boolean;

  constructor(
    message: string,
    code: ErrorCode,
    options?: {
      statusCode?: number;
      carrier?: string;
      details?: unknown;
      retryable?: boolean;
      cause?: Error;
    }
  ) {
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

/**
 * Authentication-related errors
 */
export class AuthenticationError extends CarrierError {
  constructor(
    message: string,
    options?: {
      statusCode?: number;
      carrier?: string;
      details?: unknown;
      cause?: Error;
    }
  ) {
    super(message, ErrorCode.AUTH_FAILED, {
      ...options,
      retryable: false,
    });
    this.name = 'AuthenticationError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends CarrierError {
  constructor(
    message: string,
    options?: {
      details?: unknown;
      cause?: Error;
    }
  ) {
    super(message, ErrorCode.VALIDATION_ERROR, {
      ...options,
      retryable: false,
    });
    this.name = 'ValidationError';
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends CarrierError {
  public readonly retryAfter?: number; // seconds

  constructor(
    message: string,
    retryAfter?: number,
    options?: {
      carrier?: string;
      details?: unknown;
    }
  ) {
    super(message, ErrorCode.RATE_LIMIT_EXCEEDED, {
      ...options,
      statusCode: 429,
      retryable: true,
    });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Network/timeout errors
 */
export class NetworkError extends CarrierError {
  constructor(
    message: string,
    options?: {
      carrier?: string;
      cause?: Error;
    }
  ) {
    super(message, ErrorCode.NETWORK_ERROR, {
      ...options,
      retryable: true,
    });
    this.name = 'NetworkError';
  }
}

/**
 * API response errors
 */
export class APIError extends CarrierError {
  constructor(
    message: string,
    statusCode: number,
    options?: {
      carrier?: string;
      details?: unknown;
      cause?: Error;
    }
  ) {
    const retryable = statusCode >= 500 || statusCode === 429;
    super(message, ErrorCode.API_ERROR, {
      ...options,
      statusCode,
      retryable,
    });
    this.name = 'APIError';
  }
}