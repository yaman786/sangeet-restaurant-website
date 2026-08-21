export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import orderService from '@/lib/services/orderService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAuth } from '@/lib/auth';
import { createOrderSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/utils/rateLimit';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAuth(authResult.user!);
    if (roleError) return roleError;

    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());

    const orders = await orderService.getAllOrders(query);
    return NextResponse.json(orders);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const rateLimit = await checkRateLimit(req, 'order');
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    // Public route (no auth required for table orders)
    const rawBody = await req.json();
    const body = createOrderSchema.parse(rawBody);
    const result = await orderService.createOrder(body);
    
    return NextResponse.json(
      { message: 'Order placed successfully!', ...result },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
