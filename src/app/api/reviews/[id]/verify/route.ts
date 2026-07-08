export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import reviewService from '@/lib/services/reviewService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAdmin } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAdmin(authResult.user!);
    if (roleError) return roleError;

    const body = await req.json();
    const review = await reviewService.updateReviewVerification(params.id, body.is_verified);
    
    return NextResponse.json({ message: 'Review verification status updated successfully', review });
  } catch (error) {
    return handleApiError(error);
  }
}
