export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';
import { authorizeActiveUser } from '@/lib/utils/adminGuard';
import authService from '@/lib/services/authService';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await authorizeActiveUser(req);
    if (errorResponse || !user) return errorResponse!;

    const profile = await authService.getProfile(user.id);
    return NextResponse.json(profile);
  } catch (error) {
    return handleApiError(error);
  }
}
