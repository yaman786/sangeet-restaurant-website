const logger = require('../utils/logger');

/**
 * Request logging middleware for development.
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next function
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request details
  logger.debug(`📥 ${req.method} ${req.url}`);
  logger.debug(`   IP: ${req.ip}`);
  logger.debug(`   User-Agent: ${req.get('User-Agent')}`);

  if (Object.keys(req.body).length > 0) {
    logger.debug('   Body:', JSON.stringify(req.body, null, 2));
  }

  if (Object.keys(req.query).length > 0) {
    logger.debug('   Query:', JSON.stringify(req.query, null, 2));
  }

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusIcon = statusCode >= 400 ? '🔴' : statusCode >= 300 ? '🟡' : '🟢';

    logger.debug(`${statusIcon} ${req.method} ${req.url} - ${statusCode} (${duration}ms)`);

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = { requestLogger };
