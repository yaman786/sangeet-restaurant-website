export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';
import { menuItemSchema } from '@/lib/validations';
import { isBarMenuItem } from '@/lib/utils/menuSection';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const section = searchParams.get('section'); // optional: 'food' | 'drinks'
    const is_vegetarian = searchParams.get('is_vegetarian');
    const is_spicy = searchParams.get('is_spicy');
    const is_available = searchParams.get('is_available');

    const whereClause: any = {};
    if (category) whereClause.category = category;
    if (is_vegetarian === 'true') whereClause.is_vegetarian = true;
    if (is_spicy === 'true') whereClause.is_spicy = true;
    if (is_available === 'true') whereClause.is_active = true;

    const items = await prisma.menu_items.findMany({
      where: whereClause,
      include: {
        categories: {
          include: {
            parent: true,
          },
        },
      },
      orderBy: [
        {
          categories: {
            display_order: 'asc',
          },
        },
        { name: 'asc' },
      ],
    });

    const formattedItems = items.map(item => {
      const parentCategoryName = item.categories?.parent?.name || null;
      const enriched = {
        ...item,
        category_name: item.categories?.name || item.category,
        parent_category_name: parentCategoryName,
      };
      const itemSection = isBarMenuItem(enriched) ? 'drinks' : 'food';
      return {
        ...enriched,
        section: itemSection,
      };
    });

    if (section === 'food' || section === 'drinks') {
      return NextResponse.json(formattedItems.filter(item => item.section === section));
    }
    
    return NextResponse.json(formattedItems);
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

    const rawBody = await req.json();
    const body = menuItemSchema.parse(rawBody);
    const { name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular, preparation_time } = body;
    
    // Default allergens to empty array or null if not provided
    const allergens = rawBody.allergens || null;

    const matchedCategory = await prisma.categories.findFirst({
      where: { name: category }
    });

    const item = await prisma.menu_items.create({
      data: {
        name,
        description,
        price,
        category,
        category_id: matchedCategory?.id ?? null,
        image_url: image_url || null,
        is_vegetarian: is_vegetarian || false,
        is_spicy: is_spicy || false,
        is_popular: is_popular || false,
        allergens: allergens ? JSON.stringify(allergens) : null,
        preparation_time: preparation_time || 15
      }
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
