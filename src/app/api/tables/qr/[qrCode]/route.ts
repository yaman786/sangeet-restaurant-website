export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError, NotFoundError } from '@/lib/errors';

export async function GET(req: NextRequest, props: { params: Promise<{ qrCode: string }> }) {
  const params = await props.params;
  try {
    const rawQr = decodeURIComponent(params.qrCode);
    const cleanedQr = rawQr.replace(/^table-/i, '').replace(/^tb-/i, '').trim();
    const numericId = !isNaN(Number(cleanedQr)) && Number(cleanedQr) > 0 ? Number(cleanedQr) : undefined;

    const whereConditions: any[] = [
      { qr_code_url: { contains: rawQr, mode: 'insensitive' } },
      { table_number: { equals: rawQr, mode: 'insensitive' } },
      { table_number: { equals: cleanedQr, mode: 'insensitive' } }
    ];

    if (numericId !== undefined) {
      whereConditions.push({ id: numericId });
    }

    const table = await prisma.tables.findFirst({
      where: {
        OR: whereConditions,
        is_active: true
      }
    });
    if (!table) throw new NotFoundError('Table');
    return NextResponse.json(table);
  } catch (error) {
    return handleApiError(error);
  }
}
