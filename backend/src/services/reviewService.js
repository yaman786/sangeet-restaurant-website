const pool = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors');

class ReviewService {
  async getAllReviews() {
    const result = await pool.query('SELECT * FROM customer_reviews ORDER BY created_at DESC');
    return result.rows;
  }

  async getVerifiedReviews() {
    const result = await pool.query('SELECT * FROM customer_reviews WHERE is_verified = true ORDER BY created_at DESC');
    return result.rows;
  }

  async createReview(data) {
    const { customer_name, review_text, rating, image_url, order_id, table_number } = data;
    
    const parsedOrderId = order_id ? parseInt(order_id, 10) : null;
    
    if (order_id && (isNaN(parsedOrderId) || parsedOrderId <= 0)) {
      throw new ValidationError('Invalid order ID');
    }
    
    const result = await pool.query(
      `INSERT INTO customer_reviews 
       (customer_name, review_text, rating, image_url, order_id, table_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [customer_name, review_text, rating, image_url || null, parsedOrderId, table_number || null]
    );
    
    return result.rows[0];
  }

  async getReviewById(id) {
    const result = await pool.query('SELECT * FROM customer_reviews WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      throw new NotFoundError('Review');
    }
    
    return result.rows[0];
  }

  async updateReviewVerification(id, is_verified) {
    const result = await pool.query(
      'UPDATE customer_reviews SET is_verified = $1 WHERE id = $2 RETURNING *',
      [is_verified, id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Review');
    }

    return result.rows[0];
  }

  async deleteReview(id) {
    const result = await pool.query(
      'DELETE FROM customer_reviews WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Review');
    }

    return result.rows[0];
  }

  async getReviewStats() {
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

    return statsResult.rows[0];
  }
}

module.exports = new ReviewService();
