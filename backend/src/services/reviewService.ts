import pool from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import type { ReviewRow } from '../types';

class ReviewService {
  async getAllReviews(): Promise<ReviewRow[]> {
    const result = await pool.query('SELECT * FROM customer_reviews ORDER BY created_at DESC');
    return result.rows;
  }

  async getVerifiedReviews(): Promise<ReviewRow[]> {
    const result = await pool.query('SELECT * FROM customer_reviews WHERE is_verified = true ORDER BY created_at DESC');
    return result.rows;
  }

  async createReview(data: Record<string, any>): Promise<ReviewRow> {
    const { customer_name, review_text, rating, image_url, order_id, table_number } = data;
    const parsedOrderId = order_id ? parseInt(order_id, 10) : null;
    
    if (order_id && (isNaN(parsedOrderId as number) || (parsedOrderId as number) <= 0)) {
      throw new ValidationError('Invalid order ID');
    }
    
    const result = await pool.query(
      `INSERT INTO customer_reviews (customer_name, review_text, rating, image_url, order_id, table_number)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [customer_name, review_text, rating, image_url || null, parsedOrderId, table_number || null]
    );
    return result.rows[0];
  }

  async getReviewById(id: string): Promise<ReviewRow> {
    const result = await pool.query('SELECT * FROM customer_reviews WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Review');
    return result.rows[0];
  }

  async updateReviewVerification(id: string, is_verified: boolean): Promise<ReviewRow> {
    const result = await pool.query(
      'UPDATE customer_reviews SET is_verified = $1 WHERE id = $2 RETURNING *',
      [is_verified, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Review');
    return result.rows[0];
  }

  async deleteReview(id: string): Promise<ReviewRow> {
    const result = await pool.query('DELETE FROM customer_reviews WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Review');
    return result.rows[0];
  }

  async getReviewStats(): Promise<Record<string, number | string>> {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM customer_reviews
    `);
    
    const r = result.rows[0];
    return {
      total_reviews: parseInt(r.total_reviews, 10),
      verified_reviews: parseInt(r.verified_reviews, 10),
      average_rating: parseFloat(r.average_rating || 0).toFixed(1),
      five_star: parseInt(r.five_star, 10),
      four_star: parseInt(r.four_star, 10),
      three_star: parseInt(r.three_star, 10),
      two_star: parseInt(r.two_star, 10),
      one_star: parseInt(r.one_star, 10)
    };
  }
}

export default new ReviewService();
