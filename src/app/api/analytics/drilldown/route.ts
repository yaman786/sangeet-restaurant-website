export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import analyticsService from '@/lib/services/analyticsService';
import { handleApiError, ValidationError } from '@/lib/errors';
import { authenticateToken, requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateToken(req);
    if (errorResponse) return errorResponse;
    const roleError = requireAdmin(user!);
    if (roleError) return roleError;

    const { searchParams } = req.nextUrl;
    const date = searchParams.get("date");
    const type = (searchParams.get("type") as 'orders' | 'reservations') || 'orders';

    if (!date) {
      throw new ValidationError('Date parameter is required');
    }

    const result = await analyticsService.getDrillDownData(date, type);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
