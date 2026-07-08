export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import orderService from '@/lib/services/orderService';
import { handleApiError } from '@/lib/errors';

export async function GET(req: NextRequest, { params }: { params: { tableId: string } }) {
  try {
    const orders = await orderService.getOrdersByTable(params.tableId);
    return NextResponse.json(orders);
  } catch (error) {
    return handleApiError(error);
  }
}
