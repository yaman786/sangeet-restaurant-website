import pool from '@/lib/db';
import { NotFoundError } from '@/lib/errors';
import type { MenuItemRow, CategoryRow } from '@/lib/types';

class MenuService {
  async getAllMenuItems(query: Record<string, any> = {}): Promise<MenuItemRow[]> {
    let sql = `
      SELECT m.*, c.name as category_name 
      FROM menu_items m
      LEFT JOIN menu_categories c ON m.category = c.name
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIdx = 1;

    if (query.category) {
      sql += ` AND m.category = $${paramIdx++}`;
      params.push(query.category);
    }
    if (query.is_vegetarian === 'true') {
      sql += ` AND m.is_vegetarian = true`;
    }
    if (query.is_spicy === 'true') {
      sql += ` AND m.is_spicy = true`;
    }
    if (query.is_available === 'true') {
      sql += ` AND m.is_available = true`;
    }

    sql += ` ORDER BY c.display_order ASC, m.name ASC`;
    const result = await pool.query(sql, params);
    return result.rows;
  }

  async getMenuItemById(id: string): Promise<MenuItemRow> {
    const result = await pool.query('SELECT * FROM menu_items WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Menu item');
    return result.rows[0];
  }

  async createMenuItem(data: Record<string, any>): Promise<MenuItemRow> {
    const { name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular, allergens, preparation_time } = data;
    const result = await pool.query(
      `INSERT INTO menu_items (name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular, allergens, preparation_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, description, price, category, image_url || null, is_vegetarian || false, is_spicy || false, is_popular || false, allergens ? JSON.stringify(allergens) : null, preparation_time || 15]
    );
    return result.rows[0];
  }

  async updateMenuItem(id: string, data: Record<string, any>): Promise<MenuItemRow> {
    const { name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular, is_available, allergens, preparation_time } = data;
    const result = await pool.query(
      `UPDATE menu_items 
       SET name = $1, description = $2, price = $3, category = $4, image_url = $5, is_vegetarian = $6, is_spicy = $7, is_popular = $8, is_available = $9, allergens = $10, preparation_time = $11, updated_at = CURRENT_TIMESTAMP
       WHERE id = $12 RETURNING *`,
      [name, description, price, category, image_url || null, is_vegetarian || false, is_spicy || false, is_popular || false, is_available !== false, allergens ? JSON.stringify(allergens) : null, preparation_time || 15, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Menu item');
    return result.rows[0];
  }

  async deleteMenuItem(id: string): Promise<void> {
    const result = await pool.query('DELETE FROM menu_items WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Menu item');
  }

  async getAllCategories(): Promise<CategoryRow[]> {
    const result = await pool.query('SELECT * FROM menu_categories WHERE is_active = true ORDER BY display_order ASC, name ASC');
    return result.rows;
  }

  async createCategory(data: Record<string, any>): Promise<CategoryRow> {
    const { name, display_order } = data;
    const result = await pool.query(
      'INSERT INTO menu_categories (name, display_order) VALUES ($1, $2) RETURNING *',
      [name, display_order || 0]
    );
    return result.rows[0];
  }

  async updateCategory(id: string, data: Record<string, any>): Promise<CategoryRow> {
    const { name, display_order, is_active } = data;
    const result = await pool.query(
      'UPDATE menu_categories SET name = $1, display_order = $2, is_active = $3 WHERE id = $4 RETURNING *',
      [name, display_order || 0, is_active !== false, id]
    );
    if (result.rows.length === 0) throw new NotFoundError('Category');
    return result.rows[0];
  }

  async deleteCategory(id: string): Promise<void> {
    const result = await pool.query('UPDATE menu_categories SET is_active = false WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) throw new NotFoundError('Category');
  }

  async getMenuStats(): Promise<Record<string, number>> {
    const itemsResult = await pool.query('SELECT COUNT(*) FROM menu_items');
    const categoriesResult = await pool.query('SELECT COUNT(*) FROM menu_categories WHERE is_active = true');
    const vegResult = await pool.query('SELECT COUNT(*) FROM menu_items WHERE is_vegetarian = true');
    const spicyResult = await pool.query('SELECT COUNT(*) FROM menu_items WHERE is_spicy = true');
    
    return {
      total_items: parseInt(itemsResult.rows[0].count, 10),
      total_categories: parseInt(categoriesResult.rows[0].count, 10),
      vegetarian_items: parseInt(vegResult.rows[0].count, 10),
      spicy_items: parseInt(spicyResult.rows[0].count, 10)
    };
  }
}

export default new MenuService();
