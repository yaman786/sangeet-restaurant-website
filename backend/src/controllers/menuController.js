const pool = require('../config/database');

// Get all menu items with optional filters
const getAllMenuItems = async (req, res) => {
  try {
    const { category, search, sort = 'name', order = 'ASC' } = req.query;
    
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

    // Add category filter
    if (category) {
      paramCount++;
      query += ` AND c.name = $${paramCount}`;
      params.push(category);
    }

    // Add search filter
    if (search) {
      paramCount++;
      query += ` AND (mi.name ILIKE $${paramCount} OR mi.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Add sorting
    query += ` ORDER BY mi.${sort} ${order}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

// Get menu item by ID
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        mi.*,
        c.name as category_name
      FROM menu_items mi
      LEFT JOIN categories c ON mi.category_id = c.id
      WHERE mi.id = $1 AND mi.is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
};

// Create new menu item
const createMenuItem = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category_id, 
      image_url, 
      is_vegetarian = false,
      is_spicy = false,
      is_popular = false,
      preparation_time = 15
    } = req.body;

    // Validate required fields
    if (!name || !price || !category_id) {
      return res.status(400).json({ 
        error: 'Name, price, and category are required' 
      });
    }

    // Validate category exists
    const categoryResult = await pool.query(
      'SELECT id FROM categories WHERE id = $1',
      [category_id]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ error: 'Category not found' });
    }

    const result = await pool.query(`
      INSERT INTO menu_items (
        name, description, price, category_id, image_url, 
        is_vegetarian, is_spicy, is_popular, preparation_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      name, description, price, category_id, image_url,
      is_vegetarian, is_spicy, is_popular, preparation_time
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      category_id, 
      image_url, 
      is_vegetarian,
      is_spicy,
      is_popular,
      preparation_time,
      is_active
    } = req.body;

    // Check if menu item exists
    const existingItem = await pool.query(
      'SELECT id FROM menu_items WHERE id = $1',
      [id]
    );

    if (existingItem.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    // Validate category if provided
    if (category_id) {
      const categoryResult = await pool.query(
        'SELECT id FROM categories WHERE id = $1',
        [category_id]
      );

      if (categoryResult.rows.length === 0) {
        return res.status(400).json({ error: 'Category not found' });
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

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

// Delete menu item (soft delete)
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE menu_items SET 
        is_active = false, 
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
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

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    const { name, description, display_order = 0 } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const result = await pool.query(`
      INSERT INTO categories (name, description, display_order)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, description, display_order]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, display_order } = req.body;

    const result = await pool.query(`
      UPDATE categories SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        display_order = COALESCE($3, display_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [name, description, display_order, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has active menu items
    const itemsResult = await pool.query(
      'SELECT COUNT(*) FROM menu_items WHERE category_id = $1 AND is_active = true',
      [id]
    );

    if (parseInt(itemsResult.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category with active menu items' 
      });
    }

    const result = await pool.query(`
      UPDATE categories SET 
        is_active = false, 
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};

// Get menu statistics
const getMenuStats = async (req, res) => {
  try {
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

    res.json({
      overall: stats.rows[0],
      byCategory: categoryStats.rows
    });
  } catch (error) {
    console.error('Error fetching menu stats:', error);
    res.status(500).json({ error: 'Failed to fetch menu statistics' });
  }
};

module.exports = {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMenuStats
}; 