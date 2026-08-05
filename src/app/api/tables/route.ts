export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const tables = await prisma.tables.findMany({
      where: { is_active: true },
      orderBy: { table_number: 'asc' }
    });
    return NextResponse.json(tables);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    const body = await req.json();
    const { table_number, capacity, table_type } = body;

    if (!table_number) {
      return NextResponse.json({ error: 'Table number is required' }, { status: 400 });
    }

    const tableNumStr = String(table_number).trim();

    // Check if table already exists in the database
    const existingTable = await prisma.tables.findFirst({
      where: { table_number: tableNumStr }
    });

    if (existingTable) {
      // If table is currently active, return conflict error
      if (existingTable.is_active) {
        return NextResponse.json({ error: `Table ${tableNumStr} is already active` }, { status: 409 });
      }

      // Smart Re-activation: reactivate archived table and update capacity & table_type to new inputs
      const reactivatedTable = await prisma.tables.update({
        where: { id: existingTable.id },
        data: {
          is_active: true,
          capacity: capacity ? parseInt(capacity, 10) : existingTable.capacity,
          table_type: table_type || existingTable.table_type
        }
      });

      return NextResponse.json({
        ...reactivatedTable,
        _reactivated: true,
        message: `Table ${tableNumStr} restored from archives with updated details!`
      }, { status: 200 });
    }
    
    try {
      const table = await prisma.tables.create({
        data: {
          table_number: tableNumStr,
          capacity: capacity ? parseInt(capacity, 10) : 4,
          table_type: table_type || 'standard',
          is_active: true
        }
      });
      return NextResponse.json(table, { status: 201 });
    } catch (e: any) {
      if (e.code === 'P2002') {
        return NextResponse.json({ error: `Table ${tableNumStr} already exists` }, { status: 409 });
      }
      throw e;
    }
  } catch (error) {
    return handleApiError(error);
  }
}

