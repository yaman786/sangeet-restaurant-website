const pool = require('../config/database');
const { NotFoundError, ValidationError } = require('../utils/errors');

class MenuService {
  async getAllMenuItems(filters = {}) {
    const { category, search, sort = 'name', order = 'ASC' } = filters;

    let query = `
      SELECT 
        mi.*,
        c.name as category_name
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE mi.is_active = true
    `;

    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND c.name = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND (mi.name ILIKE $${paramCount} OR mi.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    const allowedSortFields = ['id', 'name', 'price', 'category_id', 'is_popular', 'is_vegetarian', 'is_spicy'];
    const allowedOrder = ['ASC', 'DESC'];
    
    const safeSort = allowedSortFields.includes(sort) ? sort : 'name';
    const safeOrder = allowedOrder.includes(order ? order.toUpperCase() : '') ? order.toUpperCase() : 'ASC';

    query += ` ORDER BY mi.${safeSort} ${safeOrder}`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getMenuItemById(id) {
    if (isNaN(id)) throw new ValidationError('Invalid menu item ID');

    const result = await pool.query(`
      SELECT 
        mi.*,
        c.name as category_name
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE mi.id = $1 AND mi.is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Menu item');
    }

    return result.rows[0];
  }

  async createMenuItem(data) {
    const {
      name, description, price, category_id, image_url,
      is_vegetarian = false, is_spicy = false, is_popular = false, preparation_time = 15
    } = data;

    if (!name || price === undefined || !category_id) {
      throw new ValidationError('Name, price, and category are required');
    }

    if (price < 0) {
      throw new ValidationError('Price cannot be negative');
    }

    const categoryResult = await pool.query('SELECT id, name FROM categories WHERE id = $1', [category_id]);
    if (categoryResult.rows.length === 0) {
      throw new ValidationError('Category not found');
    }
    const categoryName = categoryResult.rows[0].name;

    const result = await pool.query(`
      INSERT INTO menu_items (
        name, description, price, category_id, category, image_url, 
        is_vegetarian, is_spicy, is_popular, preparation_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      name, description, price, category_id, categoryName, image_url,
      is_vegetarian, is_spicy, is_popular, preparation_time
    ]);

    return result.rows[0];
  }

  async updateMenuItem(id, data) {
    if (isNaN(id)) throw new ValidationError('Invalid menu item ID');

    const {
      name, description, price, category_id, image_url,
      is_vegetarian, is_spicy, is_popular, preparation_time, is_active
    } = data;

    if (price !== undefined && price < 0) {
      throw new ValidationError('Price cannot be negative');
    }

    const existingItem = await pool.query('SELECT id FROM menu_items WHERE id = $1', [id]);
    if (existingItem.rows.length === 0) {
      throw new NotFoundError('Menu item');
    }

    if (category_id) {
      const categoryResult = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
      if (categoryResult.rows.length === 0) {
        throw new ValidationError('Category not found');
      }
    }

    const result = await pool.query(`
      UPDATE menu_items SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        category_id = COALESCE($4, category_id),
        image_url = COALESCE($5, image_url),
        is_vegetarian = COALESCE($6, is_vegetarian),
        is_spicy = COALESCE($7, is_spicy),
        is_popular = COALESCE($8, is_popular),
        preparation_time = COALESCE($9, preparation_time),
        is_active = COALESCE($10, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `, [
      name, description, price, category_id, image_url,
      is_vegetarian, is_spicy, is_popular, preparation_time, is_active, id
    ]);

    return result.rows[0];
  }

  async deleteMenuItem(id) {
    if (isNaN(id)) throw new ValidationError('Invalid menu item ID');

    const result = await pool.query(`
      UPDATE menu_items SET 
        is_active = false, 
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Menu item');
    }
    return { success: true };
  }

  async getAllCategories() {
    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(mi.id) as item_count
      FROM categories c
      LEFT JOIN menu_items mi ON c.id = mi.category_id AND mi.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.display_order, c.name
    `);
    return result.rows;
  }

  async createCategory(data) {
    const { name, description, display_order = 0 } = data;
    if (!name) throw new ValidationError('Category name is required');

    const result = await pool.query(`
      INSERT INTO categories (name, description, display_order)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, description, display_order]);
    return result.rows[0];
  }

  async updateCategory(id, data) {
    if (isNaN(id)) throw new ValidationError('Invalid category ID');
    
    const { name, description, display_order } = data;
    const result = await pool.query(`
      UPDATE categories SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        display_order = COALESCE($3, display_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [name, description, display_order, id]);

    if (result.rows.length === 0) throw new NotFoundError('Category');
    return result.rows[0];
  }

  async deleteCategory(id) {
    if (isNaN(id)) throw new ValidationError('Invalid category ID');

    const itemsResult = await pool.query(
      'SELECT COUNT(*) FROM menu_items WHERE category_id = $1 AND is_active = true',
      [id]
    );

    if (parseInt(itemsResult.rows[0].count) > 0) {
      throw new ValidationError('Cannot delete category with active menu items');
    }

    const result = await pool.query(`
      UPDATE categories SET 
        is_active = false, 
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) throw new NotFoundError('Category');
    return { success: true };
  }

  async getMenuStats() {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN is_vegetarian = true THEN 1 END) as vegetarian_items,
        COUNT(CASE WHEN is_spicy = true THEN 1 END) as spicy_items,
        COUNT(CASE WHEN is_popular = true THEN 1 END) as popular_items,
        AVG(price) as average_price,
        MIN(price) as min_price,
        MAX(price) as max_price
      FROM menu_items 
      WHERE is_active = true
    `);

    const categoryStats = await pool.query(`
      SELECT 
        c.name as category_name,
        COUNT(mi.id) as item_count,
        AVG(mi.price) as avg_price
      FROM categories c
      LEFT JOIN menu_items mi ON c.id = mi.category_id AND mi.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id, c.name
      ORDER BY item_count DESC
    `);

    return {
      overall: stats.rows[0],
      byCategory: categoryStats.rows
    };
  }
}

module.exports = new MenuService();
