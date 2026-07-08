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

    const totalTables = await pool.query('SELECT COUNT(*) as total FROM tables WHERE is_active = true');
    const capacityStats = await pool.query('SELECT MIN(capacity) as min_capacity, MAX(capacity) as max_capacity, AVG(capacity) as avg_capacity FROM tables WHERE is_active = true');
    const locationStats = await pool.query('SELECT location, COUNT(*) as count FROM tables WHERE is_active = true GROUP BY location');
    
    return NextResponse.json({ 
      total_tables: totalTables.rows[0].total, 
      capacity_stats: capacityStats.rows[0], 
      location_stats: locationStats.rows 
    });
  } catch (error) {
    return handleApiError(error);
  }
}
