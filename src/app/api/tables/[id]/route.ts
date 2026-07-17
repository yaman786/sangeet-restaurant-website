export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    const body = await req.json();
    const { table_number, capacity, qr_code_url, location } = body;
    
    try {
      const table = await prisma.tables.update({
        where: { id: parseInt(params.id, 10) },
        data: {
          table_number,
          capacity: capacity ? parseInt(capacity, 10) : undefined,
          qr_code_url,
          table_name: location
        }
      });
      return NextResponse.json(table);
    } catch (e: any) {
      if (e.code === 'P2025') return NextResponse.json({ error: 'Table not found' }, { status: 404 });
      throw e;
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    try {
      await prisma.tables.update({
        where: { id: parseInt(params.id, 10) },
        data: { is_active: false }
      });
      return NextResponse.json({ message: 'Table deleted successfully' });
    } catch (e: any) {
      if (e.code === 'P2025') return NextResponse.json({ error: 'Table not found' }, { status: 404 });
      throw e;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
