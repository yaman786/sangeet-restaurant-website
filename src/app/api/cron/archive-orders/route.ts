import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  // 1. Authenticate the Cron request
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Rule 1: Archive "The Good" - completed, served, or cancelled orders that are finished.
    // They are moved to the archive if they were updated before the start of today.
    // (We'll use a simpler rule for the sweep: just archive all of them immediately, 
    // since this runs at 3 AM and the shift is over).
    const rule1Query = `
      UPDATE orders 
      SET is_archived = true 
      WHERE status IN ('completed', 'served', 'cancelled') 
      AND is_archived = false
      RETURNING id;
    `;
    const rule1Result = await client.query(rule1Query);

    // Rule 2: Sweep "The Bad" - Ghost/Abandoned orders (pending, preparing) 
    // that were created more than 12 hours ago.
    const rule2Query = `
      UPDATE orders 
      SET status = 'cancelled', 
          is_archived = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE status IN ('pending', 'confirmed', 'preparing', 'ready') 
      AND created_at < NOW() - INTERVAL '12 hours'
      AND is_archived = false
      RETURNING id;
    `;
    const rule2Result = await client.query(rule2Query);

    await client.query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      message: 'End of day sweep completed successfully.',
      archived_completed_orders: rule1Result.rowCount,
      swept_ghost_orders: rule2Result.rowCount
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cron Archive Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
