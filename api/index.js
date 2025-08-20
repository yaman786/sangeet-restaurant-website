const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Import middleware and utilities
const { errorHandler } = require('../backend/src/middleware/errorHandler');
const { notFoundHandler } = require('../backend/src/middleware/notFoundHandler');
const { validateEnvironment } = require('../backend/src/utils/environmentValidator');

// Import routes
const authRoutes = require('../backend/src/routes/auth');
const menuRoutes = require('../backend/src/routes/menu');
const reservationRoutes = require('../backend/src/routes/reservations');
const reviewRoutes = require('../backend/src/routes/reviews');
const eventRoutes = require('../backend/src/routes/events');
const orderRoutes = require('../backend/src/routes/orders');
const qrRoutes = require('../backend/src/routes/qr');
const websiteRoutes = require('../backend/src/routes/website');
const analyticsRoutes = require('../backend/src/routes/analytics');

// Configuration constants
const CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  CLIENT_URL: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://sangeet-restaurant.vercel.app',
  BODY_LIMIT: '10mb'
};

/**
 * Create and configure Express application for Vercel
 * @returns {express.Application} Configured Express app
 */
function createApp() {
  const app = express();

  // Validate environment variables
  try {
    validateEnvironment();
  } catch (error) {
    console.warn('Environment validation warning:', error.message);
  }

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", CONFIG.CLIENT_URL]
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  // Compression middleware
  app.use(compression());

  // CORS configuration - Allow multiple origins for Vercel
  const allowedOrigins = [
    CONFIG.CLIENT_URL,
    'http://localhost:3000',
    'https://localhost:3000',
    /https:\/\/.*\.vercel\.app$/
  ];

  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
          return allowedOrigin === origin;
        } else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Body parsing middleware
  app.use(express.json({ 
    limit: CONFIG.BODY_LIMIT,
    verify: (req, res, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ 
    extended: true, 
    limit: CONFIG.BODY_LIMIT 
  }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: CONFIG.NODE_ENV,
      service: 'Sangeet Restaurant API',
      version: '1.0.0',
      platform: 'Vercel'
    });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/tables', require('../backend/src/routes/tables'));
  app.use('/api/qr-codes', qrRoutes);
  app.use('/api/website', websiteRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // Root endpoint for API
  app.get('/api', (req, res) => {
    res.json({
      message: 'Sangeet Restaurant API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        menu: '/api/menu',
        reservations: '/api/reservations',
        reviews: '/api/reviews',
        events: '/api/events',
        orders: '/api/orders',
        tables: '/api/tables',
        qrCodes: '/api/qr-codes',
        website: '/api/website',
        analytics: '/api/analytics'
      }
    });
  });

  // Error handling middleware
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

// Create and export the app
const app = createApp();

// Export for Vercel
module.exports = app;
