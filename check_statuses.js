require('dotenv').config({ path: 'backend/.env' });
const pool = require('./backend/src/config/database');

async function testQuery() {
  try {
    const res = await pool.query("SELECT id, status, customer_name FROM reservations LIMIT 10");
    console.log("Reservations:", res.rows);
  } catch(e) { console.error(e); } finally { pool.end(); }
}
testQuery();
