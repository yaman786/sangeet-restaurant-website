const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

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

module.exports = router;
