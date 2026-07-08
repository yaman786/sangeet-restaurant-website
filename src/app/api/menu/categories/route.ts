import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE is_active = true ORDER BY display_order ASC, name ASC');
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
    const { name, display_order } = body;
    
    const result = await pool.query(
      'INSERT INTO categories (name, display_order) VALUES ($1, $2) RETURNING *',
      [name, display_order || 0]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
