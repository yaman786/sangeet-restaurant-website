import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { handleApiError } from '@/lib/errors';

export async function GET(req: NextRequest, { params }: { params: { tableNumber: string } }) {
  try {
    const result = await pool.query('SELECT * FROM tables WHERE table_number = $1 AND is_active = true', [params.tableNumber]);
    if (result.rows.length === 0) return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return handleApiError(error);
  }
}
