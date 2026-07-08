export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import reviewService from '@/lib/services/reviewService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAdmin(authResult.user!);
    if (roleError) return roleError;

    const review = await reviewService.getReviewById(params.id);
    return NextResponse.json(review);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAdmin(authResult.user!);
    if (roleError) return roleError;

    await reviewService.deleteReview(params.id);
    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
