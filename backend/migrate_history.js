const pool = require('./src/config/database');

async function runMigration() {
  try {
    console.log("Adding is_archived to orders...");
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;');
    
    console.log("Adding is_archived to reservations...");
    await pool.query('ALTER TABLE reservations ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;');
    
    console.log("Migration completed successfully!");
  } catch (e) {
    console.error("Migration failed:", e);
  } finally {
    process.exit(0);
  }
}

runMigration();
