import { Router } from 'express';
import authRoutes from './auth';
import menuRoutes from './menu';
import orderRoutes from './orders';
import reservationRoutes from './reservations';
import reviewRoutes from './reviews';
import eventRoutes from './events';
import tableRoutes from './tables';
import qrRoutes from './qr';
import websiteRoutes from './website';
import analyticsRoutes from './analytics';

const router = Router();

router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/reservations', reservationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/events', eventRoutes);
router.use('/tables', tableRoutes);
router.use('/qr-codes', qrRoutes);
router.use('/website', websiteRoutes);
router.use('/analytics', analyticsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    service: 'sangeet-api',
    version: '1.0.0',
    uptime: process.uptime(),
    database: 'connected'
  });
});

// Keep-alive endpoint
router.get('/keep-alive', (req, res) => {
  res.json({ status: 'alive', time: new Date().toISOString() });
});

export default router;
