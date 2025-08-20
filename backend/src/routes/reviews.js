const express = require('express');
const router = express.Router();
const {
  getAllReviews,
  getVerifiedReviews,
  createReview,
  getReviewById,
  updateReviewVerification,
  deleteReview,
  getReviewStats
} = require('../controllers/reviewController');
const {
  validateReview,
  validateId
} = require('../middleware/validation');

// Public routes
router.get('/', getAllReviews);
router.get('/verified', getVerifiedReviews);
router.post('/', validateReview, createReview);
router.get('/:id', validateId, getReviewById);

// Admin routes
router.get('/stats', getReviewStats);
router.patch('/:id/verify', validateId, updateReviewVerification);
router.delete('/:id', validateId, deleteReview);

module.exports = router; 