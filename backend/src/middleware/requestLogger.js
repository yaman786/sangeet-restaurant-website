/**
 * Request logging middleware for development
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next function
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request details
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  console.log(`   IP: ${req.ip}`);
  console.log(`   User-Agent: ${req.get('User-Agent')}`);
  
  if (Object.keys(req.body).length > 0) {
    console.log(`   Body:`, JSON.stringify(req.body, null, 2));
  }
  
  if (Object.keys(req.query).length > 0) {
    console.log(`   Query:`, JSON.stringify(req.query, null, 2));
  }

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusColor = statusCode >= 400 ? '🔴' : statusCode >= 300 ? '🟡' : '🟢';
    
    console.log(`${statusColor} ${req.method} ${req.url} - ${statusCode} (${duration}ms)`);
    
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = { requestLogger };
