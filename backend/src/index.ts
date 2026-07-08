import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import http from 'http';
import path from 'path';
import config from './config/env';
import logger from './utils/logger';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestLogger } from './middleware/requestLogger';
import { apiReadLimiter } from './middleware/rateLimiter';
import { initSocket } from './socket';
import { ensureDirectoryExists, serveOptimizedImage } from './middleware/imageMiddleware';
import './utils/cronJobs';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Required for images
}));

// CORS Configuration
app.use(cors({
  origin: config.ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing and optimization
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Ensure upload directories exist
ensureDirectoryExists(path.join(__dirname, '../uploads/website'));
ensureDirectoryExists(path.join(__dirname, '../uploads/temp'));
ensureDirectoryExists(path.join(__dirname, '../uploads/qrcodes'));

// Static files
app.use('/uploads/website/optimized/:size/:filename', serveOptimizedImage);
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d'
}));

// Logging
if (config.isDev) {
  app.use(requestLogger);
} else {
  app.use(morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) }
  }));
}

// Global Rate Limiting for API routes
app.use('/api', apiReadLimiter);

// API Routes
app.use('/api', apiRoutes);

// Error Handling (Must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.PORT || 5000;

if (require.main === module) {
  server.listen(PORT, () => {
    logger.info(`🚀 Server running in ${config.NODE_ENV} mode on port ${PORT}`);
    logger.info(`🔗 API URL: http://localhost:${PORT}/api`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  server.close(() => {
    process.exit(1);
  });
});

export default app;