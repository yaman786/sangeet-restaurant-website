const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, getOrdersByTable, updateOrderStatus, getAllOrders, getOrderStats, searchOrders, deleteOrder } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/', createOrder);
router.get('/table/:tableId', getOrdersByTable); // Public - customers can view their table orders
router.get('/:id', getOrderById); // Public - customers can view their specific orders (with table validation)

// Protected routes (authentication required)
router.get('/stats', authenticateToken, getOrderStats);
router.get('/search', authenticateToken, searchOrders);
router.get('/', authenticateToken, getAllOrders);
router.patch('/:id/status', authenticateToken, updateOrderStatus);
router.delete('/:id', authenticateToken, deleteOrder);

module.exports = router; 