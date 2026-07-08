import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import config from '../config/env';
import logger from '../utils/logger';
import type { JwtPayload, UserRole } from '../types';

// JWT Secret — sourced from centralised config
const JWT_SECRET = config.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in production.');
}

// Valid roles in the system
export const VALID_ROLES: UserRole[] = ['admin', 'kitchen', 'reception', 'waiter'];

// Middleware to verify JWT token
export const authenticateToken: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  jwt.verify(token, JWT_SECRET!, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = user as JwtPayload;
    next();
  });
};

// Middleware to check if user has a specific role
export const requireRole = (roles: UserRole[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    // Admin always has access to everything
    if (req.user.role === 'admin') {
      next();
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Requires one of roles: ${roles.join(', ')}`
      });
      return;
    }
    
    next();
  };
};

// Legacy middleware for backwards compatibility (Admin only)
export const requireAdmin: RequestHandler = requireRole(['admin']);

// Middleware to check if user is any valid staff member
export const requireAuth: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || !VALID_ROLES.includes(req.user.role)) {
    res.status(403).json({
      error: 'Access denied. Valid staff authentication required.'
    });
    return;
  }
  next();
};