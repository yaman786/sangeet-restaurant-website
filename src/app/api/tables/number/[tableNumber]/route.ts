export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/errors';

export async function GET(req: NextRequest, { params }: { params: { tableNumber: string } }) {
  try {
    const table = await prisma.tables.findFirst({
      where: { table_number: params.tableNumber, is_active: true }
    });
    if (!table) return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    return NextResponse.json(table);
  } catch (error) {
    return handleApiError(error);
  }
}
