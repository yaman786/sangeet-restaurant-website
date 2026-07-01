const pool = require('./src/config/database');
async function check() {
  const res = await pool.query("SELECT DISTINCT role FROM users;");
  console.log(res.rows);
  process.exit(0);
}
check();
