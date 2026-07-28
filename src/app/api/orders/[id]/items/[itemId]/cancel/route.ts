import { NextRequest, NextResponse } from 'next/server';
import orderService from '@/lib/services/orderService';
import { handleApiError, ValidationError } from '@/lib/errors';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string; itemId: string }> }
) {
  const params = await props.params;
  try {
    const orderId = params.id;
    const itemId = params.itemId;
    
    if (!orderId || !itemId) {
      throw new ValidationError('Order ID and Item ID are required');
    }

    const order = await orderService.cancelOrderItem(orderId, itemId);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Failed to cancel order item:', error);
    return handleApiError(error);
  }
}
