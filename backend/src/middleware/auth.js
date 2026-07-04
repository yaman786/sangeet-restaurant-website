const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('../utils/logger');

// JWT Secret — sourced from centralised config
const JWT_SECRET = config.JWT_SECRET;
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

// Valid roles in the system
const VALID_ROLES = ['admin', 'kitchen', 'reception', 'waiter'];

// Middleware to check if user has a specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Admin always has access to everything
    if (req.user.role === 'admin') {
      return next();
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of roles: ${roles.join(', ')}`
      });
    }
    
    next();
  };
};

// Legacy middleware for backwards compatibility (Admin only)
const requireAdmin = requireRole(['admin']);

// Middleware to check if user is any valid staff member
const requireAuth = (req, res, next) => {
  if (!req.user || !VALID_ROLES.includes(req.user.role)) {
    return res.status(403).json({
      error: 'Access denied. Valid staff authentication required.'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireRole,
  requireAuth,
  VALID_ROLES
};