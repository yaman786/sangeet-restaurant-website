export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import orderService from '@/lib/services/orderService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAuth } from '@/lib/auth';
import { createOrderSchema } from '@/lib/validations';

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

import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = rateLimit(`order_${ip}`, 5, 60000); // 5 orders per minute per IP
    
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many orders. Please slow down.' }, { status: 429 });
    }

    // Public route (no auth required for table orders)
    const rawBody = await req.json();
    const body = createOrderSchema.parse(rawBody);
    const result = await orderService.createOrder(body);
    
    return NextResponse.json(
      { message: result.merged ? 'Items added to existing order successfully!' : 'Order placed successfully!', ...result },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
