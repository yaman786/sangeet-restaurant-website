import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { handleApiError, NotFoundError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const result = await pool.query('SELECT * FROM menu_items WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Menu item');
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    const id = params.id;
    const body = await req.json();
    const { name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular, is_available, allergens, preparation_time } = body;
    
    const result = await pool.query(
      `UPDATE menu_items 
       SET name = $1, description = $2, price = $3, category = $4, image_url = $5, is_vegetarian = $6, is_spicy = $7, is_popular = $8, is_available = $9, allergens = $10, preparation_time = $11, updated_at = CURRENT_TIMESTAMP
       WHERE id = $12 RETURNING *`,
      [name, description, price, category, image_url || null, is_vegetarian || false, is_spicy || false, is_popular || false, is_available !== false, allergens ? JSON.stringify(allergens) : null, preparation_time || 15, id]
    );

    if (result.rows.length === 0) throw new NotFoundError('Menu item');

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
    const result = await pool.query('DELETE FROM menu_items WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) throw new NotFoundError('Menu item');
    
    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
