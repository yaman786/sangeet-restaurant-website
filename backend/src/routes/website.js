const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All website management routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Restaurant Settings Routes
router.get('/settings', websiteController.getRestaurantSettings);
router.put('/settings', websiteController.updateRestaurantSettings);

// Website Content Routes
router.get('/content', websiteController.getWebsiteContent);
router.put('/content', websiteController.updateWebsiteContent);

// Website Media Routes
router.get('/media', websiteController.getWebsiteMedia);
router.post('/media/upload', ...websiteController.uploadWebsiteMedia);
router.delete('/media/:id', websiteController.deleteWebsiteMedia);

// Website Stats Route
router.get('/stats', websiteController.getWebsiteStats);

module.exports = router;
