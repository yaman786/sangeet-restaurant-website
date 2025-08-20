const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Run database migrations in order
 */
async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');
  
  // Scripts to run in order
  const scripts = [
    { name: 'Main Schema', file: 'schema.sql' },
    { name: 'Authentication', file: 'auth_schema.sql' },
    { name: 'Website Content', file: 'website_schema.sql' },
    { name: 'Menu System', file: 'comprehensive_menu.sql' },
    { name: 'Reservations', file: 'reservation_schema.sql' },
    { name: 'Orders', file: 'orders_schema.sql' },
    { name: 'QR Codes', file: 'qr_schema.sql' }
  ];

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Run each script
    for (const script of scripts) {
      console.log(`📄 Running ${script.name}...`);
      
      try {
        const scriptPath = path.join(__dirname, script.file);
        
        if (!fs.existsSync(scriptPath)) {
          console.log(`⚠️  Script ${script.file} not found, skipping...`);
          continue;
        }

        const sql = fs.readFileSync(scriptPath, 'utf8');
        
        // Skip empty files
        if (!sql.trim()) {
          console.log(`⚠️  Script ${script.file} is empty, skipping...`);
          continue;
        }

        await pool.query(sql);
        console.log(`✅ ${script.name} completed`);
      } catch (error) {
        console.error(`❌ Error in ${script.name}:`, error.message);
        // Continue with other scripts
      }
    }

    console.log('\n🎉 Database migrations completed!');
    
    // Optional: Add sample data
    console.log('\n📊 Adding sample data...');
    try {
      const samplePath = path.join(__dirname, 'sample_reservations.sql');
      if (fs.existsSync(samplePath)) {
        const sampleSql = fs.readFileSync(samplePath, 'utf8');
        if (sampleSql.trim()) {
          await pool.query(sampleSql);
          console.log('✅ Sample data added');
        }
      }
    } catch (error) {
      console.log('⚠️  Sample data skipped:', error.message);
    }

    // Create admin user
    console.log('\n👤 Creating admin user...');
    try {
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
    } catch (error) {
      console.log('⚠️  Admin user creation skipped:', error.message);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔚 Database connection closed');
    process.exit(0);
  }
}

// Handle script execution
if (require.main === module) {
  runMigrations().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runMigrations };
