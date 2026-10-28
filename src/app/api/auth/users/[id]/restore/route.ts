export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';
import { authorizeAdmin } from '@/lib/utils/adminGuard';
import authService from '@/lib/services/authService';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { user, errorResponse } = await authorizeAdmin(req);
    if (errorResponse || !user) return errorResponse!;

    const restored = await authService.restoreUser(user.role, params.id);
    return NextResponse.json({
      message: 'User restored successfully',
      user: restored
    });
  } catch (error) {
    return handleApiError(error);
  }
}

