import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// All analytics routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Business analytics routes
router.get('/business', analyticsController.getBusinessAnalytics);
router.get('/reservations/trends', analyticsController.getReservationTrends);
router.get('/menu', analyticsController.getMenuAnalytics);
router.get('/customers', analyticsController.getCustomerInsights);
router.get('/performance', analyticsController.getPerformanceMetrics);

// Export routes
router.get('/export', analyticsController.exportAnalyticsData);

export default router;
