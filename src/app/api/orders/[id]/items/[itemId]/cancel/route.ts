import { NextRequest, NextResponse } from 'next/server';
import orderService from '@/lib/services/orderService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const orderId = params.id;
    const itemId = params.itemId;
    
    if (!orderId || !itemId) {
      return NextResponse.json({ error: 'Order ID and Item ID are required' }, { status: 400 });
    }

    const order = await orderService.cancelOrderItem(orderId, itemId);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Failed to cancel order item:', error);
    const message = error.message || 'Internal server error';
    const status = error.statusCode || 500;
    return NextResponse.json({ error: message }, { status });
  }
}
