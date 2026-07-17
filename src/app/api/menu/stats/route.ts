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

    const [total_items, total_categories, vegetarian_items, spicy_items] = await prisma.$transaction([
      prisma.menu_items.count(),
      prisma.categories.count({ where: { is_active: true } }),
      prisma.menu_items.count({ where: { is_vegetarian: true } }),
      prisma.menu_items.count({ where: { is_spicy: true } })
    ]);
    
    return NextResponse.json({
      total_items,
      total_categories,
      vegetarian_items,
      spicy_items
    });
  } catch (error) {
    return handleApiError(error);
  }
}
