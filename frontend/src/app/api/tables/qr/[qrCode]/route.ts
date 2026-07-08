import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { handleApiError } from '@/lib/errors';

export async function GET(req: NextRequest, { params }: { params: { qrCode: string } }) {
  try {
    const result = await pool.query('SELECT * FROM tables WHERE qr_code_url LIKE $1 AND is_active = true', [`%${params.qrCode}%`]);
    if (result.rows.length === 0) return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return handleApiError(error);
  }
}
