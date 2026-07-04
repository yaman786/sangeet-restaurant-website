const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const http = require('http');
const path = require('path');

// Import configuration and logger (Phase 0)
const config = require('./config/env');
const logger = require('./utils/logger');

// Import middleware and utilities
const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFoundHandler');
const { requestLogger } = require('./middleware/requestLogger');

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

// Import database pool (for health check pings)
const pool = require('./config/database');

/**
 * Create and configure Express application
 * @returns {express.Application} Configured Express app
 */
function createApp() {
  const app = express();
  const server = http.createServer(app);

  // Validate environment variables
  config.validateConfig();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "https://images.unsplash.com"],
        connectSrc: ["'self'", config.CLIENT_URL]
      }
    },
    crossOriginEmbedderPolicy: false
  }));

  // Compression middleware
  app.use(compression());

  // CORS configuration - Allow specific origins for production
  const allowedOrigins = [
    config.CLIENT_URL,
    'http://localhost:3000',
    'https://localhost:3000',
    'https://sangeet-restaurant-testing-frontend.vercel.app',
    'https://frontend-six-xi-10.vercel.app',
    'https://sangeetrestauranthk.netlify.app'
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

  // Body parsing middleware
  app.use(express.json({ limit: config.BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: config.BODY_LIMIT }));

  // Request logging middleware
  if (config.isDev) {
    app.use(requestLogger);
  }

  // Health check endpoint (also pings database to prevent Supabase free-tier pause)
  app.get('/api/health', async (req, res) => {
    let dbStatus = 'unknown';
    try {
      const result = await pool.query('SELECT 1 AS alive');
      dbStatus = result.rows[0]?.alive === 1 ? 'connected' : 'error';
    } catch (error) {
      dbStatus = 'disconnected';
      logger.error('🔴 Health check DB ping failed:', error.message);
    }

    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      service: 'Sangeet Restaurant API',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      database: dbStatus
    });
  });

  // Lightweight keep-alive endpoint for external cron services (cron-job.org)
  // This endpoint is NOT behind the global rate limiter so external pingers never get blocked.
  // It also pings the database in the background to prevent Supabase free-tier pause.
  app.get('/api/keep-alive', (req, res) => {
    // Background DB ping (fire-and-forget) to keep Supabase alive
    pool.query('SELECT 1').catch(() => {});
    
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime())
    });
  });

  // Global rate limiter for all API routes
  const globalLimiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again later' }
  });
  app.use('/api', globalLimiter);

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
  const PORT = config.PORT;

  server.listen(PORT, () => {
    logger.info(`🚀 Sangeet Restaurant API running on port ${PORT}`);
    logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
    logger.info(`🔌 WebSocket server initialized`);
    logger.info(`🌍 Environment: ${config.NODE_ENV}`);
    logger.info(`⏰ Started at: ${new Date().toISOString()}`);

    // Self-ping to prevent Render free tier from sleeping (every 4 minutes)
    if (config.isProd) {
      const SELF_PING_INTERVAL = config.SELF_PING_INTERVAL_MS;
      const RENDER_URL = config.RENDER_EXTERNAL_URL;
      
      setInterval(async () => {
        try {
          const response = await fetch(`${RENDER_URL}/api/health`);
          if (response.ok) {
            logger.debug(`🏓 Self-ping successful at ${new Date().toISOString()}`);
          }
        } catch (error) {
          logger.warn(`🏓 Self-ping failed: ${error.message}`);
        }
      }, SELF_PING_INTERVAL);
      
      logger.info(`🏓 Self-ping enabled: pinging every 4 minutes to prevent sleep`);
    }
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
}

// Initialize application
const { app, server } = createApp();

// Initialize Socket.IO
const io = initializeSocket(server);

// Initialize Cron Jobs
const { initCronJobs } = require('./utils/cronJobs');

if (require.main === module) {
  initCronJobs();

  // Ensure database schema has necessary updated_at column
  pool.query('ALTER TABLE reservations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP')
    .then(() => logger.info('✅ Database schema verified: reservations table'))
    .catch(err => logger.error('❌ Database schema verification failed', err.message));

  // Start server
  startServer(app, server);
}

module.exports = { app, server };