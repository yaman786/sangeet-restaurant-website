import { Request, Response, NextFunction, RequestHandler } from 'express';
import logger from '../utils/logger';

/**
 * Request logging middleware for development.
 */
export const requestLogger: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Log request details
  logger.debug(`📥 ${req.method} ${req.url}`);
  logger.debug(`   IP: ${req.ip}`);
  logger.debug(`   User-Agent: ${req.get('User-Agent')}`);

  if (Object.keys(req.body as Record<string, unknown>).length > 0) {
    logger.debug('   Body:', JSON.stringify(req.body, null, 2));
  }

  if (Object.keys(req.query).length > 0) {
    logger.debug('   Query:', JSON.stringify(req.query, null, 2));
  }

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(this: Response, ...args: any[]): any {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusIcon = statusCode >= 400 ? '🔴' : statusCode >= 300 ? '🟡' : '🟢';

    logger.debug(`${statusIcon} ${req.method} ${req.url} - ${statusCode} (${duration}ms)`);

    return originalEnd.apply(this, args as any);
  };

  next();
};
