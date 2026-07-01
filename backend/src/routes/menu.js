const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes (for QR ordering and website)
router.get('/items', menuController.getAllMenuItems);
router.get('/items/:id', menuController.getMenuItemById);
router.get('/categories', menuController.getAllCategories);

// Admin routes (require authentication)
router.post('/items', authenticateToken, requireAdmin, menuController.createMenuItem);
router.put('/items/:id', authenticateToken, requireAdmin, menuController.updateMenuItem);
router.delete('/items/:id', authenticateToken, requireAdmin, menuController.deleteMenuItem);

router.post('/categories', authenticateToken, requireAdmin, menuController.createCategory);
router.put('/categories/:id', authenticateToken, requireAdmin, menuController.updateCategory);
router.delete('/categories/:id', authenticateToken, requireAdmin, menuController.deleteCategory);

router.get('/stats', authenticateToken, requireAdmin, menuController.getMenuStats);

module.exports = router;