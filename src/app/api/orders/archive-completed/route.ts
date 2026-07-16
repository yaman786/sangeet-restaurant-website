import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Manually archive all completed, served, or cancelled orders that are not yet archived
    const archiveQuery = `
      UPDATE orders 
      SET is_archived = true 
      WHERE status IN ('completed', 'served', 'cancelled') 
      AND is_archived = false
      RETURNING id;
    `;
    const result = await client.query(archiveQuery);

    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully archived completed orders.',
      archived_count: result.rowCount
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Manual Archive Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
