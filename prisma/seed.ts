import 'dotenv/config';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log('Seeding database with initial data via pg...');

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  await pool.query(`
    INSERT INTO users (username, email, password_hash, role, first_name, last_name)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (email) DO NOTHING
  `, ['admin', 'admin@sangeet.com', adminPassword, 'admin', 'Admin', 'User']);
  console.log('Created admin user: admin@sangeet.com');

  // 2. Create Categories
  const cat1Res = await pool.query(`
    INSERT INTO categories (name, description, display_order)
    VALUES ($1, $2, $3)
    ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
    RETURNING id
  `, ['Starters', 'Delicious Indian appetizers', 1]);
  
  const cat2Res = await pool.query(`
    INSERT INTO categories (name, description, display_order)
    VALUES ($1, $2, $3)
    ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
    RETURNING id
  `, ['Main Course', 'Authentic Indian curries and specialities', 2]);
  console.log('Created categories');

  // 3. Create Menu Items
  if (cat1Res.rows.length > 0 && cat2Res.rows.length > 0) {
    const cat1Id = cat1Res.rows[0].id;
    const cat2Id = cat2Res.rows[0].id;

    await pool.query(`
      INSERT INTO menu_items (name, description, price, category, category_id, is_vegetarian, is_popular)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT DO NOTHING
    `, ['Vegetable Samosa', 'Crispy pastry filled with spiced potatoes and peas', 5.99, 'Starters', cat1Id, true, true]);

    await pool.query(`
      INSERT INTO menu_items (name, description, price, category, category_id, is_spicy, is_popular)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT DO NOTHING
    `, ['Chicken Tikka Masala', 'Roasted marinated chicken chunks in a spiced sauce', 14.99, 'Main Course', cat2Id, true, true]);
    console.log('Created menu items');
  }

  // 4. Create Tables
  await pool.query(`
    INSERT INTO restaurant_tables (table_number, capacity, table_type)
    VALUES ($1, $2, $3)
    ON CONFLICT (table_number) DO NOTHING
  `, ['T1', 4, 'standard']);
  console.log('Created restaurant tables');

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
