import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const result = await prisma.orders.updateMany({
      where: {
        status: { in: ['completed', 'served', 'cancelled'] },
        is_archived: false
      },
      data: { is_archived: true }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully archived completed orders.',
      archived_count: result.count
    });
  } catch (error) {
    console.error('Manual Archive Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
