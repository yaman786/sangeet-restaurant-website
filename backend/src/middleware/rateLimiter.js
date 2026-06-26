const rateLimit = require('express-rate-limit');

/**
 * Centralized Rate Limiters for Sangeet Restaurant API
 * Industry-standard rate limiting configurations tuned for real restaurant traffic.
 * 
 * KEY INSIGHT: In a restaurant, ALL customers on the same WiFi share ONE public IP.
 * A busy night with 50 tables means 50+ orders from the same IP is completely normal.
 * Limits must be generous enough for legitimate traffic but strict enough to block bots.
 */

// Login rate limiter - Strict protection against brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' },
  skipSuccessfulRequests: false
});

// Order rate limiter - High limit for shared restaurant WiFi
// Scenario: 50 tables × 2 orders each = 100 orders from same IP in 15 min
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 orders per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many orders from this IP, please try again later' },
  skipSuccessfulRequests: false
});

// Reservation rate limiter - Medium limit for group/corporate bookings
// Scenario: Office party booking 15 tables from same network
const reservationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 reservations per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many reservation requests from this IP, please try again later' },
  skipSuccessfulRequests: false
});

// Review rate limiter - Strict limit, reviews aren't time-critical
const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 reviews per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many reviews from this IP, please try again later' },
  skipSuccessfulRequests: false
});

// API read limiter - Lighter protection for public GET endpoints
const apiReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 reads per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later' }
});

module.exports = {
  loginLimiter,
  orderLimiter,
  reservationLimiter,
  reviewLimiter,
  apiReadLimiter
};
