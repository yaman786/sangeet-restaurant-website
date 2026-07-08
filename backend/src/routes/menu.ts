import { Router } from 'express';
import * as menuController from '../controllers/menuController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateMenuItem } from '../middleware/validation';

const router = Router();

// Public routes (for QR ordering and website)
router.get('/items', menuController.getAllMenuItems);
router.get('/items/:id', menuController.getMenuItemById);
router.get('/categories', menuController.getAllCategories);

// Admin routes (require authentication)
router.post('/items', authenticateToken, requireAdmin, validateMenuItem, menuController.createMenuItem);
router.put('/items/:id', authenticateToken, requireAdmin, validateMenuItem, menuController.updateMenuItem);
router.delete('/items/:id', authenticateToken, requireAdmin, menuController.deleteMenuItem);

router.post('/categories', authenticateToken, requireAdmin, menuController.createCategory);
router.put('/categories/:id', authenticateToken, requireAdmin, menuController.updateCategory);
router.delete('/categories/:id', authenticateToken, requireAdmin, menuController.deleteCategory);

router.get('/stats', authenticateToken, requireAdmin, menuController.getMenuStats);

export default router;