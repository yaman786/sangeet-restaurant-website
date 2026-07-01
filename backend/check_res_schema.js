require('dotenv').config();
const pool = require('./src/config/database');

async function check() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'reservations';
    `);
    console.log('Reservations schema:', res.rows);
  } catch(e) { console.error(e); } finally { pool.end(); }
}
check();
