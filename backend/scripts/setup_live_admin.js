const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Pool } = require('pg');

// Use the live database URL from Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupLiveAdmin() {
  try {
    console.log('🔧 Setting up admin user on live backend...');
    
    const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('hex');
    const kitchenPassword = process.env.KITCHEN_PASSWORD || crypto.randomBytes(12).toString('hex');

    
    // Check if admin user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      ['admin', 'admin@sangeet.com']
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️ Admin user already exists. Updating password...');
      
      // Update existing admin user with correct password
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE username = $2',
        [passwordHash, 'admin']
      );
      
      console.log('✅ Admin password updated successfully!');
    } else {
      console.log('➕ Creating new admin user...');
      
      // Create new admin user
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        `INSERT INTO users (username, email, password_hash, role, first_name, last_name) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['admin', 'admin@sangeet.com', passwordHash, 'admin', 'Admin', 'User']
      );
      
      console.log('✅ Admin user created successfully!');
    }

    // Also create kitchen staff user
    const kitchenUser = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      ['kitchen']
    );

    if (kitchenUser.rows.length === 0) {
      console.log('➕ Creating kitchen staff user...');
      const kitchenPasswordHash = await bcrypt.hash(kitchenPassword, 10);
      await pool.query(
        `INSERT INTO users (username, email, password_hash, role, first_name, last_name) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['kitchen', 'kitchen@sangeet.com', kitchenPasswordHash, 'staff', 'Kitchen', 'Staff']
      );
      console.log('✅ Kitchen staff user created successfully!');
    }

    console.log('📋 Live Login Credentials:');
    console.log(`   Admin - Username: admin, Password: ${adminPassword}`);
    console.log(`   Staff - Username: kitchen, Password: ${kitchenPassword}`);
    
    await pool.end();
    console.log('✅ Live setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up live admin user:', error);
    process.exit(1);
  }
}

setupLiveAdmin();
