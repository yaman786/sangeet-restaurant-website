import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticateToken, requireAuth, requireAdmin } from '../middleware/auth';
import { orderLimiter } from '../middleware/rateLimiter';
import { validateOrder } from '../middleware/validation';

const router = Router();

// Public routes (no authentication required)
router.post('/', orderLimiter, validateOrder, orderController.createOrder);
router.get('/table/:tableId', orderController.getOrdersByTable);
router.get('/table-number/:tableNumber', orderController.getOrdersByTableNumber);

// Protected routes (authentication required)
router.get('/stats', authenticateToken, requireAdmin, orderController.getOrderStats);
router.get('/search', authenticateToken, requireAuth, orderController.searchOrders);
router.get('/', authenticateToken, requireAuth, orderController.getAllOrders);
router.patch('/:id/status', authenticateToken, requireAuth, orderController.updateOrderStatus);
router.delete('/:id', authenticateToken, requireAdmin, orderController.deleteOrder);
router.get('/:id', orderController.getOrderById); // Public with validation

export default router;