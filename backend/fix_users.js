const pool = require('./src/config/database');

async function fixUsers() {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL');
    console.log("Added deleted_at to users table");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

fixUsers();
