import { Router } from 'express';
import * as websiteController from '../controllers/websiteController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { processImage } from '../middleware/imageMiddleware';

const router = Router();

// Restaurant Settings Routes (Public GET, Protected PUT)
router.get('/settings', websiteController.getRestaurantSettings);
router.put('/settings', authenticateToken, requireAdmin, websiteController.updateRestaurantSettings);

// Website Content Routes (Public GET, Protected PUT)
router.get('/content', websiteController.getWebsiteContent);
router.put('/content', authenticateToken, requireAdmin, websiteController.updateWebsiteContent);

// Website Media Routes (Public GET, Protected POST/DELETE)
router.get('/media', websiteController.getWebsiteMedia);
// Spread the array returned by uploadWebsiteMediaMiddleware
router.post('/media/upload', authenticateToken, requireAdmin, ...websiteController.uploadWebsiteMediaMiddleware, processImage);
router.delete('/media/:id', authenticateToken, requireAdmin, websiteController.deleteWebsiteMedia);

// Website Stats Route (Protected GET)
router.get('/stats', authenticateToken, requireAdmin, websiteController.getWebsiteStats);

export default router;
