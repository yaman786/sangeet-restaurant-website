import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const orderId = params.id;
  const client = await pool.connect();

  try {
    const result = await client.query(
      'UPDATE orders SET is_archived = false WHERE id = $1 RETURNING *',
      [orderId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Order successfully restored from archives.',
      order: result.rows[0]
    });

  } catch (error) {
    console.error('Restore Order Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
