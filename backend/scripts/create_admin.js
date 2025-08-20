const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');

async function createAdminUser() {
  try {
    const username = 'admin';
    const email = 'admin@sangeet.com';
    const password = 'admin123';
    const firstName = 'Admin';
    const lastName = 'User';

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Check if admin user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      // Update existing admin user
      await pool.query(
        'UPDATE users SET password_hash = $1, email = $2, first_name = $3, last_name = $4, role = $5 WHERE username = $6',
        [passwordHash, email, firstName, lastName, 'admin', username]
      );
      console.log('✅ Admin user updated successfully');
    } else {
      // Create new admin user
      await pool.query(
        'INSERT INTO users (username, email, password_hash, role, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6)',
        [username, email, passwordHash, 'admin', firstName, lastName]
      );
      console.log('✅ Admin user created successfully');
    }

    console.log('📋 Admin Login Credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@sangeet.com');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser(); 