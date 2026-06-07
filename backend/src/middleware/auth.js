const jwt = require('jsonwebtoken');

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'development' ? 'sangeet-restaurant-secret-key' : null);
if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in production.');
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied. Admin role required.'
    });
  }
  next();
};

// Middleware to check if user is admin or staff
const requireAuth = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
    return res.status(403).json({
      error: 'Access denied. Authentication required.'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAuth
}; 