const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Use the same database configuration as the API
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function fixRenderDatabase() {
  console.log('🔧 Fixing Render database...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  try {
    // Test connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Database connection test:', testResult.rows[0]);

    // Check current admin user
    const adminResult = await pool.query('SELECT username, email, role FROM users WHERE username = $1', ['admin']);
    console.log('Current admin user:', adminResult.rows[0] || 'Not found');

    // Generate new password hash
    const newPasswordHash = await bcrypt.hash('admin123', 10);
    console.log('✅ Generated new password hash');

    // Update admin user
    const updateResult = await pool.query(`
      UPDATE users 
      SET password_hash = $1, 
          email = 'admin@sangeet.com',
          role = 'admin',
          first_name = 'Admin',
          last_name = 'User',
          is_active = true,
          updated_at = NOW()
      WHERE username = $2
    `, [newPasswordHash, 'admin']);

    if (updateResult.rowCount === 0) {
      // Create admin user if it doesn't exist
      await pool.query(`
        INSERT INTO users (username, email, password_hash, role, first_name, last_name, is_active)
        VALUES ('admin', 'admin@sangeet.com', $1, 'admin', 'Admin', 'User', true)
      `, [newPasswordHash]);
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user updated');
    }

    // Verify the update
    const verifyResult = await pool.query('SELECT password_hash FROM users WHERE username = $1', ['admin']);
    if (verifyResult.rows.length > 0) {
      const isValid = await bcrypt.compare('admin123', verifyResult.rows[0].password_hash);
      console.log('✅ Password verification test:', isValid ? 'PASSED' : 'FAILED');
    }

    console.log('\n🎉 Render database fixed!');
    console.log('📋 Login Credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error fixing database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Export the function for use in API endpoint
module.exports = { fixRenderDatabase };

// Run if called directly
if (require.main === module) {
  fixRenderDatabase();
}
