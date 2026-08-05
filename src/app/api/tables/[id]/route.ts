export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError, NotFoundError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    const body = await req.json();
    const { table_number, capacity, qr_code_url, location, table_type } = body;
    
    try {
      const table = await prisma.tables.update({
        where: { id: parseInt(params.id, 10) },
        data: {
          table_number,
          capacity: capacity ? parseInt(capacity, 10) : undefined,
          qr_code_url,
          table_name: location,
          table_type: table_type || undefined
        }
      });
      return NextResponse.json(table);
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('Table');
      throw e;
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    const tableId = parseInt(params.id, 10);
    const permanent = req.nextUrl.searchParams.get('permanent') === 'true';

    try {
      if (permanent) {
        // Disassociate related reservations & orders to prevent foreign key errors and preserve history
        await prisma.reservations.updateMany({
          where: { table_id: tableId },
          data: { table_id: null }
        });
        await prisma.orders.updateMany({
          where: { table_id: tableId },
          data: { table_id: null }
        });

        // Permanently remove from database
        await prisma.tables.delete({
          where: { id: tableId }
        });
        return NextResponse.json({ message: 'Table permanently deleted' });
      } else {
        // Soft delete (archive)
        await prisma.tables.update({
          where: { id: tableId },
          data: { is_active: false }
        });
        return NextResponse.json({ message: 'Table archived successfully' });
      }
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('Table');
      throw e;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
