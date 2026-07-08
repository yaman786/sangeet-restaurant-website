export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import orderService from '@/lib/services/orderService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAuth(authResult.user!);
    if (roleError) return roleError;

    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());

    const orders = await orderService.searchOrders(query);
    return NextResponse.json(orders);
  } catch (error) {
    return handleApiError(error);
  }
}
