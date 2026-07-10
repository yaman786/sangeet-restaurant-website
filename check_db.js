const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    const res = await pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'table_qr_codes');");
    console.log("table_qr_codes exists:", res.rows[0].exists);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
