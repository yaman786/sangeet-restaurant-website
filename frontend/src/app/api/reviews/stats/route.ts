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

    const stats = await reviewService.getReviewStats();
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
