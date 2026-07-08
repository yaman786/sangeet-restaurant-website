'use server';

import reviewService from '@/lib/services/reviewService';
import { reviewSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function submitReviewAction(data: z.infer<typeof reviewSchema>) {
  try {
    // Validate with Zod
    const parsedData = reviewSchema.parse(data);
    
    // Pass to service layer
    const review = await reviewService.createReview({
      ...parsedData,
      order_id: data.order_id || null, // Optional fields not in the base schema for UI convenience
      table_number: data.table_number || null,
    });
    
    // Revalidate relevant paths
    revalidatePath('/');
    revalidatePath('/admin/reviews');
    revalidatePath('/admin/dashboard');
    
    return { success: true, review };
  } catch (error: any) {
    console.error('Error in submitReviewAction:', error);
    // If it's a ZodError, we can extract details, but for now generic message
    return { success: false, error: error.message || 'Failed to submit review' };
  }
}
