const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Restaurant Settings Routes (Public GET, Protected PUT)
router.get('/settings', websiteController.getRestaurantSettings);
router.put('/settings', authenticateToken, requireAdmin, websiteController.updateRestaurantSettings);

// Website Content Routes (Public GET, Protected PUT)
router.get('/content', websiteController.getWebsiteContent);
router.put('/content', authenticateToken, requireAdmin, websiteController.updateWebsiteContent);

// Website Media Routes (Public GET, Protected POST/DELETE)
router.get('/media', websiteController.getWebsiteMedia);
router.post('/media/upload', authenticateToken, requireAdmin, ...websiteController.uploadWebsiteMedia);
router.delete('/media/:id', authenticateToken, requireAdmin, websiteController.deleteWebsiteMedia);

// Website Stats Route (Protected GET)
router.get('/stats', authenticateToken, requireAdmin, websiteController.getWebsiteStats);

module.exports = router;
