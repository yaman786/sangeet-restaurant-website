const pool = require('./src/config/database');
async function check() {
  const res = await pool.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'status';");
  console.log(res.rows);
  process.exit(0);
}
check();
