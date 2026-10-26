export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError, NotFoundError } from '@/lib/errors';

export async function GET(req: NextRequest, props: { params: Promise<{ qrCode: string }> }) {
  const params = await props.params;
  try {
    const rawQr = decodeURIComponent(params.qrCode).trim();
    const strippedSlug = rawQr
      .replace(/^https?:\/\/[^\/]+\/qr\//i, '')
      .replace(/^\/qr\//i, '')
      .trim();
    const strippedNumber = strippedSlug
      .replace(/^table[-_\s]?/i, '')
      .replace(/^tb[-_\s]?/i, '')
      .trim();

    // 1. Try exact table_number match first (highest priority)
    let table = await prisma.tables.findFirst({
      where: {
        OR: [
          { table_number: { equals: strippedNumber, mode: 'insensitive' } },
          { table_number: { equals: strippedSlug, mode: 'insensitive' } },
          { table_number: { equals: rawQr, mode: 'insensitive' } }
        ],
        is_active: true
      }
    });

    // 2. Try exact or boundary-safe QR url match
    if (!table) {
      table = await prisma.tables.findFirst({
        where: {
          OR: [
            { qr_code_url: { equals: rawQr, mode: 'insensitive' } },
            { qr_code_url: { endsWith: `/qr/table-${strippedNumber}`, mode: 'insensitive' } },
            { qr_code_url: { endsWith: `/qr/${strippedSlug}`, mode: 'insensitive' } }
          ],
          is_active: true
        }
      });
    }

    // 3. Fallback to primary key id if query is pure number
    if (!table && !isNaN(Number(strippedNumber)) && Number(strippedNumber) > 0) {
      table = await prisma.tables.findFirst({
        where: { id: Number(strippedNumber), is_active: true }
      });
    }
    if (!table) throw new NotFoundError('Table');
    return NextResponse.json(table);
  } catch (error) {
    return handleApiError(error);
  }
}
