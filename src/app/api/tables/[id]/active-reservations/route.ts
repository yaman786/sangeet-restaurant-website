export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError, NotFoundError } from '@/lib/errors';
import { authenticateToken, requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAuth(authResult.user!);
    if (roleError) return roleError;

    const tableId = parseInt(params.id, 10);
    if (isNaN(tableId)) {
      return NextResponse.json({ error: 'Invalid table ID' }, { status: 400 });
    }

    const table = await prisma.tables.findUnique({
      where: { id: tableId }
    });

    if (!table) {
      throw new NotFoundError('Table');
    }

    // Find all active/upcoming confirmed or pending reservations on this table
    const activeReservations = await prisma.reservations.findMany({
      where: {
        table_id: tableId,
        status: { in: ['confirmed', 'pending'] },
        is_archived: false
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });

    return NextResponse.json({
      table,
      activeReservations,
      count: activeReservations.length
    });
  } catch (error) {
    return handleApiError(error);
  }
}
