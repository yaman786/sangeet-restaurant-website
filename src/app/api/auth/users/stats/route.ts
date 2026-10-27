export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';
import { authorizeAdmin } from '@/lib/utils/adminGuard';
import authService from '@/lib/services/authService';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await authorizeAdmin(req);
    if (errorResponse || !user) return errorResponse!;

    const stats = await authService.getUserStats(user.role);
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
