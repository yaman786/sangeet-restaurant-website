export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import analyticsService from '@/lib/services/analyticsService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateToken(req);
    if (errorResponse) return errorResponse;
    const roleError = requireAdmin(user!);
    if (roleError) return roleError;

    const result = await analyticsService.getBusinessAnalytics(req.nextUrl.searchParams.get("timeframe") ?? undefined);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

