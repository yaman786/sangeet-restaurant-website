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
    const { table_number, capacity, qr_code_url, location } = body;
    
    const table = await prisma.tables.create({
      data: {
        table_number,
        capacity: capacity ? parseInt(capacity, 10) : 4,
        qr_code_url: qr_code_url || '',
        table_name: location || null,
        qr_code_data: ''
      }
    });
    
    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
