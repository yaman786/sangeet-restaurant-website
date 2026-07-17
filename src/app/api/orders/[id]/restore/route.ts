import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request, { params }: { params: { id: string } }) {
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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    console.error('Restore Order Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
