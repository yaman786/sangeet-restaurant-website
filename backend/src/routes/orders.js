const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, getOrdersByTable, updateOrderStatus, getAllOrders, getOrderStats } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/', createOrder);

// Protected routes (authentication required)
router.get('/stats', authenticateToken, getOrderStats);
router.get('/', authenticateToken, getAllOrders);
router.get('/:id', authenticateToken, getOrderById);
router.get('/table/:tableId', authenticateToken, getOrdersByTable);
router.patch('/:id/status', authenticateToken, updateOrderStatus);

module.exports = router; 