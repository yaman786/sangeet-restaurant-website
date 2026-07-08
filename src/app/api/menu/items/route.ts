import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { handleApiError, NotFoundError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const is_vegetarian = searchParams.get('is_vegetarian');
    const is_spicy = searchParams.get('is_spicy');
    const is_available = searchParams.get('is_available');

    let sql = `
      SELECT m.*, c.name as category_name 
      FROM menu_items m
      LEFT JOIN categories c ON m.category = c.name
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIdx = 1;

    if (category) {
      sql += ` AND m.category = $${paramIdx++}`;
      params.push(category);
    }
    if (is_vegetarian === 'true') {
      sql += ` AND m.is_vegetarian = true`;
    }
    if (is_spicy === 'true') {
      sql += ` AND m.is_spicy = true`;
    }
    if (is_available === 'true') {
      sql += ` AND m.is_active = true`;
    }

    sql += ` ORDER BY c.display_order ASC, m.name ASC`;
    const result = await pool.query(sql, params);
    
    return NextResponse.json(result.rows);
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
    const { name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular, allergens, preparation_time } = body;
    
    const result = await pool.query(
      `INSERT INTO menu_items (name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular, allergens, preparation_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, description, price, category, image_url || null, is_vegetarian || false, is_spicy || false, is_popular || false, allergens ? JSON.stringify(allergens) : null, preparation_time || 15]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
