import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors';
import type { MenuItemRow, CategoryRow, MenuQueryDTO } from '@/lib/types';
import type { MenuItemInput, CategoryInput } from '@/lib/validations/menu';

class MenuService {
  async getAllMenuItems(query: MenuQueryDTO = {}): Promise<MenuItemRow[]> {
    const where: any = {};
    if (query.category) where.category = query.category;
    if (query.is_vegetarian === 'true') where.is_vegetarian = true;
    if (query.is_spicy === 'true') where.is_spicy = true;
    if (query.is_available === 'true') where.is_active = true;

    const items = await prisma.menu_items.findMany({
      where,
      include: {
        categories: true
      },
      orderBy: [
        { categories: { display_order: 'asc' } },
        { name: 'asc' }
      ]
    });

    return items.map(item => ({
      ...item,
      category_name: item.categories?.name,
      is_available: item.is_active,
      price: item.price ? Number(item.price) : 0
    })) as any;
  }

  async getMenuItemById(id: string): Promise<MenuItemRow> {
    const item = await prisma.menu_items.findUnique({ where: { id: parseInt(id, 10) } });
    if (!item) throw new NotFoundError('Menu item');
    return { ...item, price: item.price ? Number(item.price) : 0 } as any;
  }

  async createMenuItem(data: MenuItemInput): Promise<MenuItemRow> {
    const { name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular, allergens, preparation_time } = data;
    
    // Find category ID based on name if possible
    const cat = await prisma.categories.findFirst({ where: { name: category } });
    
    const item = await prisma.menu_items.create({
      data: {
        name, description, price, category, image_url: image_url || null,
        is_vegetarian: is_vegetarian || false, is_spicy: is_spicy || false,
        is_popular: is_popular || false,
        allergens: allergens ? JSON.stringify(allergens) : null,
        preparation_time: preparation_time || 15,
        category_id: cat?.id
      }
    });
    return { ...item, price: item.price ? Number(item.price) : 0 } as any;
  }

  async updateMenuItem(id: string, data: Partial<MenuItemInput> & { is_available?: boolean }): Promise<MenuItemRow> {
    const { name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular, is_available, allergens, preparation_time } = data;
    
    const cat = category ? await prisma.categories.findFirst({ where: { name: category } }) : null;

    try {
      const item = await prisma.menu_items.update({
        where: { id: parseInt(id, 10) },
        data: {
          name, description, price, category, image_url: image_url || null,
          is_vegetarian: is_vegetarian || false, is_spicy: is_spicy || false,
          is_popular: is_popular || false, is_active: is_available !== false,
          allergens: allergens ? JSON.stringify(allergens) : null,
          preparation_time: preparation_time || 15,
          updated_at: new Date(),
          ...(cat ? { category_id: cat.id } : {})
        }
      });
      return { ...item, price: item.price ? Number(item.price) : 0 } as any;
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('Menu item');
      throw e;
    }
  }

  async deleteMenuItem(id: string): Promise<void> {
    try {
      await prisma.menu_items.delete({ where: { id: parseInt(id, 10) } });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('Menu item');
      throw e;
    }
  }

  async getAllCategories(): Promise<CategoryRow[]> {
    const categories = await prisma.categories.findMany({
      where: { is_active: true },
      orderBy: [{ display_order: 'asc' }, { name: 'asc' }]
    });
    return categories as any;
  }

  async createCategory(data: CategoryInput & { display_order?: number }): Promise<CategoryRow> {
    const { name, display_order } = data;
    const category = await prisma.categories.create({
      data: { name, display_order: display_order || 0 }
    });
    return category as any;
  }

  async updateCategory(id: string, data: Partial<CategoryInput> & { display_order?: number; is_active?: boolean }): Promise<CategoryRow> {
    const { name, display_order, is_active } = data;
    try {
      const category = await prisma.categories.update({
        where: { id: parseInt(id, 10) },
        data: { name, display_order: display_order || 0, is_active: is_active !== false }
      });
      return category as any;
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('Category');
      throw e;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await prisma.categories.update({
        where: { id: parseInt(id, 10) },
        data: { is_active: false }
      });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('Category');
      throw e;
    }
  }

  async getMenuStats(): Promise<Record<string, number>> {
    const [total_items, total_categories, vegetarian_items, spicy_items] = await prisma.$transaction([
      prisma.menu_items.count(),
      prisma.categories.count({ where: { is_active: true } }),
      prisma.menu_items.count({ where: { is_vegetarian: true } }),
      prisma.menu_items.count({ where: { is_spicy: true } })
    ]);
    
    return {
      total_items,
      total_categories,
      vegetarian_items,
      spicy_items
    };
  }
}

export default new MenuService();
