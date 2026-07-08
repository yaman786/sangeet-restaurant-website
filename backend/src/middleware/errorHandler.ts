import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';
import config from '../config/env';

interface ErrorWithCode extends Error {
  code?: string;
  details?: unknown;
  statusCode?: number;
}

/**
 * Centralized error handling middleware.
 */
export const errorHandler: ErrorRequestHandler = (err: ErrorWithCode, req: Request, res: Response, _next: NextFunction): void => {
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
    const response: Record<string, unknown> = {
      error: {
        message: err.message,
        code: err.code,
        status: err.statusCode,
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method,
      },
    };

    if ((err as AppError & { details?: unknown }).details) {
      (response.error as Record<string, unknown>).details = (err as AppError & { details?: unknown }).details;
    }

    if (config.isDev) {
      (response.error as Record<string, unknown>).stack = err.stack;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // ── Legacy / third-party errors ───────────────────────────
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: unknown = null;

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

  const errorResponse: Record<string, unknown> = {
    error: {
      message,
      status: statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
    },
  };

  if (config.isDev) {
    (errorResponse.error as Record<string, unknown>).details = details || err.message;
    (errorResponse.error as Record<string, unknown>).stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};
