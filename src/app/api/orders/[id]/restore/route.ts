import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError, NotFoundError } from '@/lib/errors';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const orderId = parseInt(params.id, 10);

  try {
    const order = await prisma.orders.update({
      where: { id: orderId },
      data: { is_archived: false }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Order successfully restored from archives.',
      order
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return handleApiError(new NotFoundError('Order'));
    }
    console.error('Restore Order Error:', error);
    return handleApiError(error);
  }
}
