require('dotenv').config();
const pool = require('./src/config/database');

async function fix() {
  try {
    console.log("Adding table_id to reservations...");
    await pool.query(`
      ALTER TABLE reservations 
      ADD COLUMN table_id integer REFERENCES tables(id) ON DELETE SET NULL;
    `);
    console.log("✅ Column table_id added successfully!");
  } catch(e) { console.error(e); } finally { pool.end(); }
}
fix();
