import { NextRequest, NextResponse } from 'next/server';
import reviewService from '@/lib/services/reviewService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAdmin(authResult.user!);
    if (roleError) return roleError;

    const reviews = await reviewService.getAllReviews();
    return NextResponse.json(reviews);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const review = await reviewService.createReview(body);
    return NextResponse.json({ message: 'Review submitted successfully', review }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
