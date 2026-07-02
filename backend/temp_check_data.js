require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkData() {
  try {
    const orders = await pool.query('SELECT id, created_at, status FROM orders');
    const invalidOrders = orders.rows.filter(o => !o.created_at || isNaN(new Date(o.created_at)));
    console.log('Invalid Orders:', invalidOrders);

    const reservations = await pool.query('SELECT id, date, time, status FROM reservations');
    const invalidReservations = reservations.rows.filter(r => !r.date || isNaN(new Date(r.date)));
    console.log('Invalid Reservations:', invalidReservations);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkData();
