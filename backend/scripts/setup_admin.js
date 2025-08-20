const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');

async function setupAdmin() {
  try {
    console.log('🔧 Setting up admin user...');
    
    // Check if admin user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      ['admin', 'admin@sangeet.com']
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️ Admin user already exists. Updating password...');
      
      // Update existing admin user with correct password
      const passwordHash = await bcrypt.hash('admin123', 10);
      await pool.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE username = $2',
        [passwordHash, 'admin']
      );
      
      console.log('✅ Admin password updated successfully!');
    } else {
      console.log('➕ Creating new admin user...');
      
      // Create new admin user
      const passwordHash = await bcrypt.hash('admin123', 10);
      await pool.query(
        `INSERT INTO users (username, email, password_hash, role, first_name, last_name) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['admin', 'admin@sangeet.com', passwordHash, 'admin', 'Admin', 'User']
      );
      
      console.log('✅ Admin user created successfully!');
    }

    console.log('📋 Admin Login Credentials:');
    console.log('   Username: admin');
    console.log('   Email: admin@sangeet.com');
    console.log('   Password: admin123');
    
    await pool.end();
    console.log('✅ Setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    process.exit(1);
  }
}

setupAdmin(); 