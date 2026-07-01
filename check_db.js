require('dotenv').config({ path: 'backend/.env' });
const pool = require('./backend/src/config/database');

async function check() {
  const res = await pool.query("SELECT id, customer_name, status, guests, date, time FROM reservations");
  console.log(res.rows);
  pool.end();
}
check();
