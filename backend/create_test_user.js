require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function addTestUser() {
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('Test1234!', saltRounds);
    await pool.query(`
      INSERT INTO users (username, email, password_hash, role, first_name, last_name, is_active) 
      VALUES ('testadmin', 'testadmin@sangeet.com', $1, 'admin', 'Test', 'Admin', true)
      ON CONFLICT (username) DO UPDATE SET password_hash = $1
    `, [passwordHash]);
    console.log('Test admin user created: testadmin / Test1234!');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

addTestUser();
