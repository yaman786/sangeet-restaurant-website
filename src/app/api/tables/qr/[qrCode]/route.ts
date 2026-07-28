export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError, NotFoundError } from '@/lib/errors';

export async function GET(req: NextRequest, props: { params: Promise<{ qrCode: string }> }) {
  const params = await props.params;
  try {
    const table = await prisma.tables.findFirst({
      where: { qr_code_url: { contains: params.qrCode }, is_active: true }
    });
    if (!table) throw new NotFoundError('Table');
    return NextResponse.json(table);
  } catch (error) {
    return handleApiError(error);
  }
}
