const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');
const config = require('../config/env');

/**
 * Centralized error handling middleware.
 *
 * Recognises AppError subclasses (from utils/errors.js) and maps them
 * directly to the correct HTTP status and machine-readable code.
 * Unknown errors fall through to a generic 500.
 *
 * @param {Error} err - Error object
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log error details
  logger.error('Error occurred:', {
    message: err.message,
    code: err.code || null,
    url: req.url,
    method: req.method,
    ip: req.ip,
    ...(config.isDev && { stack: err.stack }),
  });

  // ── AppError subclasses (our own custom errors) ───────────
  if (err instanceof AppError) {
    const response = {
      error: {
        message: err.message,
        code: err.code,
        status: err.statusCode,
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method,
      },
    };

    if (err.details) {
      response.error.details = err.details;
    }

    if (config.isDev) {
      response.error.stack = err.stack;
    }

    return res.status(err.statusCode).json(response);
  }

  // ── Legacy / third-party errors ───────────────────────────
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = err.details || err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource Not Found';
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    message = 'Conflict';
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate Entry';
  } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referenced Resource Not Found';
  } else if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 400;
    message = 'Cannot Delete Referenced Resource';
  } else if (err.code === 'ER_DATA_TOO_LONG') {
    statusCode = 400;
    message = 'Data Too Long';
  } else if (err.code === 'ER_BAD_FIELD_ERROR') {
    statusCode = 400;
    message = 'Invalid Field';
  } else if (err.code === 'ER_PARSE_ERROR') {
    statusCode = 400;
    message = 'Invalid Request Format';
  }

  // Create error response
  const errorResponse = {
    error: {
      message,
      status: statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
    },
  };

  // Add details in development mode
  if (config.isDev) {
    errorResponse.error.details = details || err.message;
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = { errorHandler };
