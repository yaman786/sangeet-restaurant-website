const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, getOrdersByTable, getOrdersByTableNumber, updateOrderStatus, getAllOrders, getOrderStats, searchOrders, deleteOrder } = require('../controllers/orderController');
const { authenticateToken, requireAuth, requireAdmin } = require('../middleware/auth');
const { orderLimiter } = require('../middleware/rateLimiter');
const { validateOrder } = require('../middleware/validation');

// Public routes (no authentication required)
router.post('/', orderLimiter, validateOrder, createOrder);
router.get('/table/:tableId', getOrdersByTable); // Public - customers can view their table orders by ID
router.get('/table-number/:tableNumber', getOrdersByTableNumber); // Public - customers can view their table orders by number

// Protected routes (authentication required)
router.get('/stats', authenticateToken, requireAdmin, getOrderStats);
router.get('/search', authenticateToken, requireAuth, searchOrders);
router.get('/', authenticateToken, requireAuth, getAllOrders);
router.patch('/:id/status', authenticateToken, requireAuth, updateOrderStatus);
router.delete('/:id', authenticateToken, requireAdmin, deleteOrder);
router.get('/:id', getOrderById); // Public - customers can view their specific orders (with table validation)

module.exports = router; 