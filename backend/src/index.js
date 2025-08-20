const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const http = require('http');
const path = require('path');
require('dotenv').config();

// Import middleware and utilities
const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFoundHandler');
const { requestLogger } = require('./middleware/requestLogger');
const { validateEnvironment } = require('./utils/environmentValidator');

// Import routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const reservationRoutes = require('./routes/reservations');
const reviewRoutes = require('./routes/reviews');
const eventRoutes = require('./routes/events');
const orderRoutes = require('./routes/orders');
const qrRoutes = require('./routes/qr');
const websiteRoutes = require('./routes/website');
const analyticsRoutes = require('./routes/analytics');

// Import socket initialization
const { initializeSocket } = require('./socket');

// Configuration constants
const CONFIG = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100, // requests per window
  BODY_LIMIT: '10mb'
};

/**
 * Create and configure Express application
 * @returns {express.Application} Configured Express app
 */
function createApp() {
  const app = express();
  const server = http.createServer(app);

  // Validate environment variables
  validateEnvironment();

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

  // CORS configuration - Allow multiple origins for production
  const allowedOrigins = [
    CONFIG.CLIENT_URL,
    'http://localhost:3000',
    'https://localhost:3000',
    'https://sangeet-restaurant-testing-frontend.vercel.app',
    /https:\/\/.*\.onrender\.com$/,
    /https:\/\/.*\.vercel\.app$/,
    /https:\/\/.*\.netlify\.app$/
  ];

  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
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

  // Rate limiting - Disabled for development
  if (CONFIG.NODE_ENV === 'production') {
    const limiter = rateLimit({
      windowMs: CONFIG.RATE_LIMIT_WINDOW,
      max: CONFIG.RATE_LIMIT_MAX,
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(CONFIG.RATE_LIMIT_WINDOW / 1000)
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    app.use('/api/', limiter);
  }

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

  // Request logging middleware
  if (CONFIG.NODE_ENV === 'development') {
    app.use(requestLogger);
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: CONFIG.NODE_ENV,
      service: 'Sangeet Restaurant API',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime()
    });
  });

  // Temporary migration endpoint (remove after use)
  app.post('/api/migrate', async (req, res) => {
    try {
      console.log('🚀 Starting migration via API endpoint...');
      const { runMigrations } = require('../scripts/migrate-render');
      await runMigrations();
      res.json({ success: true, message: 'Migration completed successfully' });
    } catch (error) {
      console.error('Migration failed:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });



  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/reservations', reservationRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/tables', require('./routes/tables'));
  app.use('/api/qr-codes', qrRoutes);
  app.use('/api/website', websiteRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // Error handling middleware
  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, server };
}

/**
 * Start the server
 * @param {express.Application} app - Express app
 * @param {http.Server} server - HTTP server
 */
function startServer(app, server) {
  const PORT = CONFIG.PORT;

  server.listen(PORT, () => {
    console.log(`🚀 Sangeet Restaurant API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔌 WebSocket server initialized`);
    console.log(`🌍 Environment: ${CONFIG.NODE_ENV}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

// Initialize application
const { app, server } = createApp();

// Initialize Socket.IO
const io = initializeSocket(server);

// Start server
startServer(app, server);



module.exports = { app, server }; 