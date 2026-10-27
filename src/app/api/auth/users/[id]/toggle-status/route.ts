export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';
import { authorizeAdmin } from '@/lib/utils/adminGuard';
import authService from '@/lib/services/authService';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { user, errorResponse } = await authorizeAdmin(req);
    if (errorResponse || !user) return errorResponse!;

    const result = await authService.toggleUserStatus(user.id, user.role, params.id);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
