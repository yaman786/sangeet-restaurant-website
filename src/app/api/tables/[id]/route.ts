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
    if (isNaN(tableId)) {
      return NextResponse.json({ error: 'Invalid table ID' }, { status: 400 });
    }

    const table = await prisma.tables.findUnique({
      where: { id: tableId }
    });

    if (!table) {
      throw new NotFoundError('Table');
    }

    const permanent = req.nextUrl.searchParams.get('permanent') === 'true';
    
    // Parse transfer destination if supplied via query or optional body
    let transferToTableIdStr = req.nextUrl.searchParams.get('transfer_to_table_id');
    if (!transferToTableIdStr) {
      try {
        const body = await req.json();
        if (body && body.transfer_to_table_id) {
          transferToTableIdStr = String(body.transfer_to_table_id);
        }
      } catch {
        // Body is optional on DELETE
      }
    }

    // Check for active (pending or confirmed) reservations assigned to this table
    const activeReservations = await prisma.reservations.findMany({
      where: {
        table_id: tableId,
        status: { in: ['confirmed', 'pending'] },
        is_archived: false
      },
      include: {
        tables: true
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    });

    // Guardrail: If active reservations exist and no replacement destination is chosen, block deletion
    if (activeReservations.length > 0 && !transferToTableIdStr) {
      return NextResponse.json({
        error: `Cannot ${permanent ? 'permanently delete' : 'archive'} Table ${table.table_number}: It has ${activeReservations.length} active reservation(s) assigned.`,
        code: 'TABLE_HAS_ACTIVE_RESERVATIONS',
        table,
        activeReservations,
        count: activeReservations.length
      }, { status: 409 });
    }

    // If destination table provided, validate and transfer atomically
    if (transferToTableIdStr) {
      const destTableId = parseInt(transferToTableIdStr, 10);
      if (isNaN(destTableId) || destTableId === tableId) {
        return NextResponse.json({ error: 'Invalid destination table selected for transfer' }, { status: 400 });
      }

      const destTable = await prisma.tables.findUnique({
        where: { id: destTableId, is_active: true }
      });

      if (!destTable) {
        return NextResponse.json({ error: 'Destination table not found or is currently inactive' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        // Shift active reservations to destination table
        if (activeReservations.length > 0) {
          await tx.reservations.updateMany({
            where: {
              table_id: tableId,
              status: { in: ['confirmed', 'pending'] },
              is_archived: false
            },
            data: { table_id: destTableId }
          });
        }

        // Shift active orders to destination table
        await tx.orders.updateMany({
          where: {
            table_id: tableId,
            status: { notIn: ['completed', 'cancelled'] }
          },
          data: { table_id: destTableId }
        });

        // If permanent delete, clean up historical references to prevent foreign key errors
        if (permanent) {
          await tx.reservations.updateMany({
            where: { table_id: tableId },
            data: { table_id: null }
          });
          await tx.orders.updateMany({
            where: { table_id: tableId },
            data: { table_id: null }
          });
          await tx.tables.delete({
            where: { id: tableId }
          });
        } else {
          await tx.tables.update({
            where: { id: tableId },
            data: { is_active: false }
          });
        }
      });

      return NextResponse.json({
        message: `Table ${table.table_number} ${permanent ? 'permanently deleted' : 'archived'}. ${activeReservations.length} active reservation(s) transferred to Table ${destTable.table_number}.`,
        transferredCount: activeReservations.length,
        destinationTable: destTable
      });
    }

    // No active reservations on table -> safe to delete or archive
    try {
      if (permanent) {
        await prisma.reservations.updateMany({
          where: { table_id: tableId },
          data: { table_id: null }
        });
        await prisma.orders.updateMany({
          where: { table_id: tableId },
          data: { table_id: null }
        });
        await prisma.tables.delete({
          where: { id: tableId }
        });
        return NextResponse.json({ message: `Table ${table.table_number} permanently deleted` });
      } else {
        await prisma.tables.update({
          where: { id: tableId },
          data: { is_active: false }
        });
        return NextResponse.json({ message: `Table ${table.table_number} archived successfully` });
      }
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('Table');
      throw e;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
