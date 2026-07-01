require('dotenv').config({ path: 'backend/.env' });
const pool = require('./backend/src/config/database');

async function testQuery() {
  try {
    console.log("Testing getAllReservations query...");
    const res = await pool.query(`
      SELECT r.*, t.table_number 
      FROM reservations r 
      LEFT JOIN tables t ON r.table_id = t.id
      WHERE 1=1
      ORDER BY r.date ASC, r.time ASC
    `);
    console.log("Success! Found rows:", res.rows.length);
  } catch(e) {
    console.error("Query failed:", e);
  } finally {
    pool.end();
  }
}
testQuery();
