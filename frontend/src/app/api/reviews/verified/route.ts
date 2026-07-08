import { NextRequest, NextResponse } from 'next/server';
import reviewService from '@/lib/services/reviewService';
import { handleApiError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const reviews = await reviewService.getVerifiedReviews();
    return NextResponse.json(reviews);
  } catch (error) {
    return handleApiError(error);
  }
}
