import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const result = await pool.query('SELECT * FROM tables WHERE is_active = true ORDER BY table_number');
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
    const { table_number, capacity, qr_code_url, location } = body;
    
    const result = await pool.query(
      'INSERT INTO tables (table_number, capacity, qr_code_url, location) VALUES ($1, $2, $3, $4) RETURNING *',
      [table_number, capacity, qr_code_url, location]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
