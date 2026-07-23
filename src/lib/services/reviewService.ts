import { prisma } from '@/lib/db';
import { NotFoundError, ValidationError } from '@/lib/errors';
import type { ReviewRow, CreateReviewDTO } from '@/lib/types';

class ReviewService {
  async getAllReviews(): Promise<any[]> {
    return prisma.customer_reviews.findMany({
      orderBy: { created_at: 'desc' }
    });
  }

  async getVerifiedReviews(): Promise<any[]> {
    return prisma.customer_reviews.findMany({
      where: { is_verified: true },
      orderBy: { created_at: 'desc' }
    });
  }

  async createReview(data: CreateReviewDTO): Promise<any> {
    const { customer_name, review_text, rating, image_url, order_id, table_number } = data;
    const parsedOrderId = order_id ? Number(order_id) : null;
    
    if (order_id && (isNaN(parsedOrderId as number) || (parsedOrderId as number) <= 0)) {
      throw new ValidationError('Invalid order ID');
    }
    
    return prisma.customer_reviews.create({
      data: {
        customer_name,
        review_text: review_text || '',
        rating: Number(rating),
        image_url: image_url || null,
        order_id: parsedOrderId,
        table_number: table_number ? String(table_number) : null,
        is_verified: false
      }
    });
  }

  async getReviewById(id: string): Promise<any> {
    const review = await prisma.customer_reviews.findUnique({
      where: { id: parseInt(id, 10) }
    });
    if (!review) throw new NotFoundError('Review');
    return review;
  }

  async updateReviewVerification(id: string, is_verified: boolean): Promise<any> {
    const review = await prisma.customer_reviews.update({
      where: { id: parseInt(id, 10) },
      data: { is_verified }
    }).catch(() => null);
    
    if (!review) throw new NotFoundError('Review');
    return review;
  }

  async deleteReview(id: string): Promise<any> {
    const review = await prisma.customer_reviews.delete({
      where: { id: parseInt(id, 10) }
    }).catch(() => null);
    
    if (!review) throw new NotFoundError('Review');
    return review;
  }

  async getReviewStats(): Promise<Record<string, number | string>> {
    const [
      total_reviews,
      verified_reviews,
      average_rating,
      five_star,
      four_star,
      three_star,
      two_star,
      one_star
    ] = await Promise.all([
      prisma.customer_reviews.count(),
      prisma.customer_reviews.count({ where: { is_verified: true } }),
      prisma.customer_reviews.aggregate({ _avg: { rating: true } }),
      prisma.customer_reviews.count({ where: { rating: 5 } }),
      prisma.customer_reviews.count({ where: { rating: 4 } }),
      prisma.customer_reviews.count({ where: { rating: 3 } }),
      prisma.customer_reviews.count({ where: { rating: 2 } }),
      prisma.customer_reviews.count({ where: { rating: 1 } })
    ]);
    
    return {
      total_reviews,
      verified_reviews,
      average_rating: average_rating._avg.rating ? average_rating._avg.rating.toFixed(1) : "0.0",
      five_star,
      four_star,
      three_star,
      two_star,
      one_star
    };
  }
}

export default new ReviewService();
