export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    const totalTables = await prisma.tables.count({ where: { is_active: true } });
    
    const capacityStats = await prisma.tables.aggregate({
      where: { is_active: true },
      _min: { capacity: true },
      _max: { capacity: true },
      _avg: { capacity: true }
    });

    const locationStatsRaw = await prisma.tables.groupBy({
      by: ['table_name'],
      where: { is_active: true },
      _count: { _all: true }
    });
    
    const locationStats = locationStatsRaw.map(r => ({
      location: r.table_name,
      count: r._count._all
    }));
    
    return NextResponse.json({ 
      total_tables: totalTables, 
      capacity_stats: {
        min_capacity: capacityStats._min.capacity,
        max_capacity: capacityStats._max.capacity,
        avg_capacity: capacityStats._avg.capacity
      }, 
      location_stats: locationStats 
    });
  } catch (error) {
    return handleApiError(error);
  }
}
