export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
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
    
    const result = await pool.query(
      'UPDATE tables SET table_number = $1, capacity = $2, qr_code_url = $3, location = $4 WHERE id = $5 RETURNING *',
      [table_number, capacity, qr_code_url, location, params.id]
    );
    
    if (result.rows.length === 0) return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    return NextResponse.json(result.rows[0]);
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

    const result = await pool.query('UPDATE tables SET is_active = false WHERE id = $1 RETURNING *', [params.id]);
    
    if (result.rows.length === 0) return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    return NextResponse.json({ message: 'Table deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
