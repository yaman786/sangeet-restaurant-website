import { NextRequest, NextResponse } from 'next/server';
import websiteService from '@/lib/services/websiteService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const result = await websiteService.getActiveBanners();
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAdmin(authResult.user!);
    if (roleError) return roleError;

    const result = await websiteService.createBanner(await req.json());
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

