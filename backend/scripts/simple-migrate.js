const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function simpleMigrate() {
  console.log('🚀 Starting simple migration...');
  
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Create basic tables
    console.log('📄 Creating basic tables...');
    
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Menu categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true
      )
    `);
    console.log('✅ Menu categories table created');

    // Menu items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES menu_categories(id),
        image_url VARCHAR(500),
        is_vegetarian BOOLEAN DEFAULT false,
        is_spicy BOOLEAN DEFAULT false,
        is_available BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0
      )
    `);
    console.log('✅ Menu items table created');

    // Orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        table_number VARCHAR(20),
        customer_name VARCHAR(100),
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Orders table created');

    // Create admin user
    console.log('👤 Creating admin user...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (username, email, password_hash, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['admin', 'admin@sangeetrestaurant.com', hashedPassword, 'admin', true]);
    
    console.log('✅ Admin user created');
    console.log('📧 Email: admin@sangeetrestaurant.com');
    console.log('🔑 Password: admin123');

    // Add sample categories
    console.log('📊 Adding sample categories...');
    await pool.query(`
      INSERT INTO menu_categories (name, description, sort_order) VALUES
      ('Appetizers', 'Start your meal with our delicious appetizers', 1),
      ('Main Course', 'Our signature main dishes', 2),
      ('Desserts', 'Sweet endings to your meal', 3)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Sample categories added');

    // Add sample menu items
    console.log('🍽️ Adding sample menu items...');
    await pool.query(`
      INSERT INTO menu_items (name, description, price, category_id, is_vegetarian) VALUES
      ('Aloo Paratha', 'Stuffed potato flatbread', 5.00, 1, true),
      ('Butter Chicken', 'Creamy tomato-based curry', 12.00, 2, false),
      ('Gulab Jamun', 'Sweet milk dumplings', 4.00, 3, true)
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Sample menu items added');

    console.log('\n🎉 Simple migration completed successfully!');
    console.log('\n📋 What was created:');
    console.log('- Users table with admin user');
    console.log('- Menu categories and items');
    console.log('- Orders table');
    console.log('\n🔑 Admin login: admin@sangeetrestaurant.com / admin123');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔚 Database connection closed');
    process.exit(0);
  }
}

simpleMigrate();
