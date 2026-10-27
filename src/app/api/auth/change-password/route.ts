export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ValidationError } from '@/lib/errors';
import { authorizeActiveUser } from '@/lib/utils/adminGuard';
import authService from '@/lib/services/authService';

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authorizeActiveUser(req);
    if (errorResponse || !user) return errorResponse!;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Request body must be valid JSON');
    }

    await authService.changePassword(user.id, {
      currentPassword: typeof body.currentPassword === 'string' ? body.currentPassword : undefined,
      newPassword: typeof body.newPassword === 'string' ? body.newPassword : undefined
    });
    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
