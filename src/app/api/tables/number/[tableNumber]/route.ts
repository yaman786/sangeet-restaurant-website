export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError, NotFoundError } from '@/lib/errors';

export async function GET(req: NextRequest, props: { params: Promise<{ tableNumber: string }> }) {
  const params = await props.params;
  try {
    const rawNumber = params.tableNumber;
    let table = await prisma.tables.findFirst({
      where: { table_number: rawNumber, is_active: true }
    });

    if (!table) {
      const strippedNumber = rawNumber.replace(/^table-?/i, '');
      table = await prisma.tables.findFirst({
        where: {
          is_active: true,
          OR: [
            { table_number: { equals: rawNumber, mode: 'insensitive' } },
            { table_number: { equals: strippedNumber, mode: 'insensitive' } },
            { qr_code_url: { contains: rawNumber } }
          ]
        }
      });
    }

    if (!table) throw new NotFoundError('Table');
    return NextResponse.json(table);
  } catch (error) {
    return handleApiError(error);
  }
}
