import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    const itemsResult = await pool.query('SELECT COUNT(*) FROM menu_items');
    const categoriesResult = await pool.query('SELECT COUNT(*) FROM menu_categories WHERE is_active = true');
    const vegResult = await pool.query('SELECT COUNT(*) FROM menu_items WHERE is_vegetarian = true');
    const spicyResult = await pool.query('SELECT COUNT(*) FROM menu_items WHERE is_spicy = true');
    
    return NextResponse.json({
      total_items: parseInt(itemsResult.rows[0].count, 10),
      total_categories: parseInt(categoriesResult.rows[0].count, 10),
      vegetarian_items: parseInt(vegResult.rows[0].count, 10),
      spicy_items: parseInt(spicyResult.rows[0].count, 10)
    });
  } catch (error) {
    return handleApiError(error);
  }
}
