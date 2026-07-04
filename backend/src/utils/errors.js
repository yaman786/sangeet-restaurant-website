/**
 * Custom application error classes for Sangeet Restaurant API.
 *
 * Controllers and services should throw these instead of generic Errors.
 * The centralised errorHandler middleware recognises them and maps them to
 * the correct HTTP status codes automatically.
 *
 * Usage:
 *   const { NotFoundError, ValidationError } = require('../utils/errors');
 *   throw new NotFoundError('Order');   // → 404  "Order not found"
 *   throw new ValidationError('Email is required'); // → 400
 */

class AppError extends Error {
  /**
   * @param {string} message  Human-readable error message
   * @param {number} statusCode  HTTP status code (default 500)
   * @param {string} code  Machine-readable error code
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // distinguishes expected errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT');
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
};
