import rateLimit from 'express-rate-limit';

/**
 * Centralized Rate Limiters for Sangeet Restaurant API
 */

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' },
  skipSuccessfulRequests: false
});

export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many orders from this IP, please try again later' },
  skipSuccessfulRequests: false
});

export const reservationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many reservation requests from this IP, please try again later' },
  skipSuccessfulRequests: false
});

export const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many reviews from this IP, please try again later' },
  skipSuccessfulRequests: false
});

export const apiReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later' }
});
