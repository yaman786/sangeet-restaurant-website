const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, getOrdersByTable, updateOrderStatus, getAllOrders, getOrderStats, searchOrders, deleteOrder } = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/', createOrder);

// Protected routes (authentication required)
router.get('/stats', authenticateToken, getOrderStats);
router.get('/search', authenticateToken, searchOrders);
router.get('/table/:tableId', authenticateToken, getOrdersByTable);
router.get('/', authenticateToken, getAllOrders);
router.patch('/:id/status', authenticateToken, updateOrderStatus);
router.delete('/:id', authenticateToken, deleteOrder);
router.get('/:id', authenticateToken, getOrderById);

module.exports = router; 