export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import orderService from '@/lib/services/orderService';
import { handleApiError } from '@/lib/errors';
import { checkRateLimit } from '@/lib/utils/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, 'order');
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const body = await req.json().catch(() => ({}));
    const phone = typeof body?.phone === 'string' ? body.phone : undefined;
    const orderNumber = typeof body?.orderNumber === 'string' ? body.orderNumber : undefined;

    const orders = await orderService.trackPublicOrder({ phone, orderNumber });
    return NextResponse.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, 'order');
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone') || undefined;
    const orderNumber = searchParams.get('orderNumber') || undefined;

    const orders = await orderService.trackPublicOrder({ phone, orderNumber });
    return NextResponse.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    return handleApiError(error);
  }
}
