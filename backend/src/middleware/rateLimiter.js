const rateLimit = require('express-rate-limit');

/**
 * Centralized Rate Limiters for Sangeet Restaurant API
 * Industry-standard rate limiting configurations for different endpoint types.
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

// Form submission rate limiter - Protection against spam bots on public forms
// (reservations, orders, reviews, contact forms)
const formSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 submissions per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions from this IP, please try again later' },
  skipSuccessfulRequests: false
});

// Strict form limiter - For extremely sensitive public endpoints
const strictFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 submissions per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
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
  formSubmitLimiter,
  strictFormLimiter,
  apiReadLimiter
};
