export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/errors';

export async function GET(req: NextRequest, { params }: { params: { qrCode: string } }) {
  try {
    const table = await prisma.tables.findFirst({
      where: { qr_code_url: { contains: params.qrCode }, is_active: true }
    });
    if (!table) return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    return NextResponse.json(table);
  } catch (error) {
    return handleApiError(error);
  }
}
