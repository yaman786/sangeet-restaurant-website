const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticateToken, requireAuth } = require('../middleware/auth');

// Public routes (for QR ordering and website)
router.get('/items', menuController.getAllMenuItems);
router.get('/items/:id', menuController.getMenuItemById);
router.get('/categories', menuController.getAllCategories);

// Admin routes (require authentication)
router.post('/items', authenticateToken, requireAuth, menuController.createMenuItem);
router.put('/items/:id', authenticateToken, requireAuth, menuController.updateMenuItem);
router.delete('/items/:id', authenticateToken, requireAuth, menuController.deleteMenuItem);

router.post('/categories', authenticateToken, requireAuth, menuController.createCategory);
router.put('/categories/:id', authenticateToken, requireAuth, menuController.updateCategory);
router.delete('/categories/:id', authenticateToken, requireAuth, menuController.deleteCategory);

router.get('/stats', authenticateToken, requireAuth, menuController.getMenuStats);

module.exports = router; 