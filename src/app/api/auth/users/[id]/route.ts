export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ValidationError } from '@/lib/errors';
import { authorizeAdmin } from '@/lib/utils/adminGuard';
import authService from '@/lib/services/authService';
import type { UpdateUserDTO } from '@/lib/types';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { user, errorResponse } = await authorizeAdmin(req);
    if (errorResponse || !user) return errorResponse!;

    let body: UpdateUserDTO;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Request body must be valid JSON');
    }

    const updated = await authService.updateUser(user.id, user.role, params.id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { user, errorResponse } = await authorizeAdmin(req);
    if (errorResponse || !user) return errorResponse!;

    const permanent = req.nextUrl.searchParams.get('permanent') === 'true';
    await authService.deleteUser(user.id, user.role, params.id, permanent);
    return NextResponse.json({
      message: permanent ? 'User permanently deleted' : 'User moved to archive'
    });
  } catch (error) {
    return handleApiError(error);
  }
}
