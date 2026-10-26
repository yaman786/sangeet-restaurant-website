export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError, NotFoundError } from '@/lib/errors';

export async function GET(req: NextRequest, props: { params: Promise<{ tableNumber: string }> }) {
  const params = await props.params;
  try {
    const rawNumber = decodeURIComponent(params.tableNumber).trim();
    const strippedSlug = rawNumber
      .replace(/^https?:\/\/[^\/]+\/qr\//i, '')
      .replace(/^\/qr\//i, '')
      .trim();
    const strippedNumber = strippedSlug
      .replace(/^table[-_\s]?/i, '')
      .replace(/^tb[-_\s]?/i, '')
      .trim();

    let table = await prisma.tables.findFirst({
      where: {
        OR: [
          { table_number: { equals: strippedNumber, mode: 'insensitive' } },
          { table_number: { equals: strippedSlug, mode: 'insensitive' } },
          { table_number: { equals: rawNumber, mode: 'insensitive' } }
        ],
        is_active: true
      }
    });

    if (!table) {
      table = await prisma.tables.findFirst({
        where: {
          OR: [
            { qr_code_url: { equals: rawNumber, mode: 'insensitive' } },
            { qr_code_url: { endsWith: `/qr/table-${strippedNumber}`, mode: 'insensitive' } },
            { qr_code_url: { endsWith: `/qr/${strippedSlug}`, mode: 'insensitive' } }
          ],
          is_active: true
        }
      });
    }

    if (!table) throw new NotFoundError('Table');
    return NextResponse.json(table);
  } catch (error) {
    return handleApiError(error);
  }
}
