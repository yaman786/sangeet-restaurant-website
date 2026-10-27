export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, ValidationError } from '@/lib/errors';
import { authorizeAdmin } from '@/lib/utils/adminGuard';
import authService from '@/lib/services/authService';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await authorizeAdmin(req);
    if (errorResponse || !user) return errorResponse!;

    const params = req.nextUrl.searchParams;
    const result = await authService.getAllUsers(user.role, {
      page: params.get('page') ?? undefined,
      limit: params.get('limit') ?? undefined,
      role: params.get('role') ?? undefined,
      status: params.get('status') ?? undefined,
      search: params.get('search')?.trim() || undefined
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await authorizeAdmin(req);
    if (errorResponse || !user) return errorResponse!;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Request body must be valid JSON');
    }

    const created = await authService.createUser(user.role, body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
