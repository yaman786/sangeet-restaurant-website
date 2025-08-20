const pool = require('../config/database');

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM customer_reviews ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get verified reviews
const getVerifiedReviews = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM customer_reviews WHERE is_verified = true ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching verified reviews:', error);
    res.status(500).json({ error: 'Failed to fetch verified reviews' });
  }
};

// Submit a new review
const createReview = async (req, res) => {
  try {
    const { customer_name, review_text, rating, image_url, order_id, table_number } = req.body;
    
    // Convert order_id to integer if it exists, otherwise null
    const parsedOrderId = order_id ? parseInt(order_id, 10) : null;
    
    // Validate order_id is a valid number
    if (order_id && (isNaN(parsedOrderId) || parsedOrderId <= 0)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    
    const result = await pool.query(
      `INSERT INTO customer_reviews 
       (customer_name, review_text, rating, image_url, order_id, table_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [customer_name, review_text, rating, image_url || null, parsedOrderId, table_number || null]
    );
    
    res.status(201).json({
      message: 'Review submitted successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

// Get single review
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM customer_reviews WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
};

// Update review verification status (Admin only)
const updateReviewVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const result = await pool.query(
      'UPDATE customer_reviews SET is_verified = $1 WHERE id = $2 RETURNING *',
      [is_verified, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({
      message: 'Review verification status updated successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating review verification:', error);
    res.status(500).json({ error: 'Failed to update review verification' });
  }
};

// Delete review (Admin only)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM customer_reviews WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// Get review statistics
const getReviewStats = async (req, res) => {
  try {
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_reviews,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_reviews,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_reviews,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_reviews,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_reviews
       FROM customer_reviews`
    );

    res.json(statsResult.rows[0]);
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    res.status(500).json({ error: 'Failed to fetch review statistics' });
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