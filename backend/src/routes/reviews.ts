import { Router } from 'express';
import * as reviewController from '../controllers/reviewController';
import { validateReview, validateId } from '../middleware/validation';
import { reviewLimiter } from '../middleware/rateLimiter';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', reviewController.getAllReviews);
router.get('/verified', reviewController.getVerifiedReviews);
router.post('/', reviewLimiter, validateReview, reviewController.createReview);
router.get('/:id', validateId, reviewController.getReviewById);

// Admin routes
router.get('/stats', authenticateToken, requireAdmin, reviewController.getReviewStats);
router.patch('/:id/verify', authenticateToken, requireAdmin, validateId, reviewController.updateReviewVerification);
router.delete('/:id', authenticateToken, requireAdmin, validateId, reviewController.deleteReview);

export default router;