export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError, NotFoundError } from '@/lib/errors';

export async function GET(req: NextRequest, props: { params: Promise<{ tableNumber: string }> }) {
  const params = await props.params;
  try {
    const table = await prisma.tables.findFirst({
      where: { table_number: params.tableNumber, is_active: true }
    });
    if (!table) throw new NotFoundError('Table');
    return NextResponse.json(table);
  } catch (error) {
    return handleApiError(error);
  }
}
