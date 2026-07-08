import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { handleApiError, NotFoundError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    const id = params.id;
    const body = await req.json();
    const { name, display_order, is_active } = body;
    
    const result = await pool.query(
      'UPDATE menu_categories SET name = $1, display_order = $2, is_active = $3 WHERE id = $4 RETURNING *',
      [name, display_order || 0, is_active !== false, id]
    );

    if (result.rows.length === 0) throw new NotFoundError('Category');

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

    const id = params.id;
    const result = await pool.query('UPDATE menu_categories SET is_active = false WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) throw new NotFoundError('Category');
    
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
