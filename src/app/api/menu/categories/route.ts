export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.categories.findMany({
      where: { is_active: true },
      include: {
        children: {
          include: {
            _count: { select: { menu_items: true } }
          }
        },
        parent: true,
        _count: {
          select: { menu_items: true }
        }
      },
      orderBy: [
        { display_order: 'asc' },
        { name: 'asc' }
      ]
    });

    // Also get counts by string name fallback to be 100% accurate
    const allItems = await prisma.menu_items.findMany({
      where: { is_active: true },
      select: { category: true, category_id: true }
    });

    const categoryItemCounts: Record<string, number> = {};
    const categoryIdCounts: Record<number, number> = {};

    allItems.forEach(item => {
      if (item.category) {
        categoryItemCounts[item.category] = (categoryItemCounts[item.category] || 0) + 1;
      }
      if (item.category_id) {
        categoryIdCounts[item.category_id] = (categoryIdCounts[item.category_id] || 0) + 1;
      }
    });

    const enrichedCategories = categories.map(cat => {
      let directCount = categoryIdCounts[cat.id] || categoryItemCounts[cat.name] || cat._count?.menu_items || 0;
      // If parent category has children (e.g. Non-Veg Mains), sum up children items
      if (cat.children && cat.children.length > 0) {
        const childrenCount = cat.children.reduce((acc, child) => {
          const childCount = categoryIdCounts[child.id] || categoryItemCounts[child.name] || (child as any)._count?.menu_items || 0;
          return acc + childCount;
        }, 0);
        directCount = Math.max(directCount, childrenCount);
      }

      return {
        ...cat,
        item_count: directCount
      };
    });

    return NextResponse.json(enrichedCategories);
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
    const { name, display_order, description, parent_id } = body;
    
    const category = await prisma.categories.create({
      data: {
        name,
        description,
        parent_id: parent_id || null,
        display_order: display_order || 0
      }
    });
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
