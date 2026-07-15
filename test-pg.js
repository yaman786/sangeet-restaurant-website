const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://postgres:Amanrana%402053@db.frgaeohzohrejxvxpeov.supabase.co:5432/postgres"
});
pool.query('SELECT 1').then(res => console.log('success')).catch(err => console.error('error', err));
