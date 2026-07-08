import { Request, Response, RequestHandler } from 'express';

/**
 * 404 Not Found handler middleware
 */
export const notFoundHandler: RequestHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
      availableEndpoints: [
        '/api/health',
        '/api/auth',
        '/api/menu',
        '/api/reservations',
        '/api/reviews',
        '/api/events',
        '/api/orders',
        '/api/tables',
        '/api/qr-codes',
        '/api/website',
        '/api/analytics'
      ]
    }
  });
};
