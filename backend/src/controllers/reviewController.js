const reviewService = require('../services/reviewService');

const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getAllReviews();
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

const getVerifiedReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getVerifiedReviews();
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.body);
    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};

const getReviewById = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    res.json(review);
  } catch (error) {
    next(error);
  }
};

const updateReviewVerification = async (req, res, next) => {
  try {
    const review = await reviewService.updateReviewVerification(req.params.id, req.body.is_verified);
    res.json({
      message: 'Review verification status updated successfully',
      review
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getReviewStats = async (req, res, next) => {
  try {
    const stats = await reviewService.getReviewStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReviews,
  getVerifiedReviews,
  createReview,
  getReviewById,
  updateReviewVerification,
  deleteReview,
  getReviewStats
};