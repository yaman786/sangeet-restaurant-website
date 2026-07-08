import { z } from 'zod';

export const reviewSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  rating: z.preprocess((val) => Number(val), z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5')),
  review_text: z.string().min(10, 'Review must be at least 10 characters'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
});
