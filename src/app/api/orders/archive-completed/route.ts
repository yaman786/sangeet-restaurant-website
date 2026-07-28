import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/errors';

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
    return handleApiError(error);
  }
}
