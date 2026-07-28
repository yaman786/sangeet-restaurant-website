export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import websiteService from '@/lib/services/websiteService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAdmin(authResult.user!);
    if (roleError) return roleError;

    const result = await websiteService.updateBanner(params.id, await req.json());
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAdmin(authResult.user!);
    if (roleError) return roleError;

    const result = await websiteService.deleteBanner(params.id);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

