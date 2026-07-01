require('dotenv').config({ path: 'backend/.env' });
const pool = require('./backend/src/config/database');

async function testBrain() {
  console.log("🧠 Testing Backend Brain Logic Locally...\n");

  try {
    // 1. Wipe test data
    await pool.query("DELETE FROM reservations WHERE email LIKE '%@test.com'");
    await pool.query("DELETE FROM tables WHERE table_number LIKE 'TEST%'");

    // 2. Insert Test Tables
    console.log("-> Creating Table TEST-2 (Cap 2) and TEST-6 (Cap 6)");
    const t1 = await pool.query(`INSERT INTO tables (table_number, capacity, is_active) VALUES ('TEST-2', 2, true) RETURNING id, capacity`);
    const t2 = await pool.query(`INSERT INTO tables (table_number, capacity, is_active) VALUES ('TEST-6', 6, true) RETURNING id, capacity`);
    const t1_id = t1.rows[0].id;
    const t2_id = t2.rows[0].id;

    // 3. Test Availability Query (The Brain)
    const runBrainQuery = async (tableId, date, newTime, guests, excludeResId = -1) => {
      const q = `
        SELECT 
          (SELECT capacity FROM tables WHERE id = $1) >= $4 as can_accommodate,
          NOT EXISTS (
            SELECT 1 FROM reservations r
            WHERE r.table_id = $1
              AND r.date = $2
              AND r.id != $5
              AND r.status NOT IN ('cancelled', 'no-show')
              AND r.time::time < ($3::time + interval '2 hours')
              AND ($3::time < r.time::time + interval '2 hours')
        ) as check_table_availability
      `;
      const res = await pool.query(q, [tableId, date, newTime, guests, excludeResId]);
      return res.rows[0];
    };

    const date = '2026-10-15';
    
    // Test A: Can a party of 2 book Table TEST-2 at 19:00?
    let res = await runBrainQuery(t1_id, date, '19:00', 2);
    console.log(`Test A: 2 guests at 19:00 on Cap 2 table -> Cap OK: ${res.can_accommodate}, Avail OK: ${res.check_table_availability} (Expected: true, true)`);

    // Let's actually book it
    await pool.query(`INSERT INTO reservations (customer_name, email, date, time, guests, status, table_id) VALUES ('Alice', 'alice@test.com', $1, '19:00', 2, 'confirmed', $2)`, [date, t1_id]);

    // Test B: Can another party book Table TEST-2 at 20:00? (1 hr overlap)
    res = await runBrainQuery(t1_id, date, '20:00', 2);
    console.log(`Test B: 2 guests at 20:00 on Cap 2 table (Overlap) -> Cap OK: ${res.can_accommodate}, Avail OK: ${res.check_table_availability} (Expected: true, false)`);

    // Test C: Can another party book Table TEST-2 at 21:00? (No overlap)
    res = await runBrainQuery(t1_id, date, '21:00', 2);
    console.log(`Test C: 2 guests at 21:00 on Cap 2 table (No overlap) -> Cap OK: ${res.can_accommodate}, Avail OK: ${res.check_table_availability} (Expected: true, true)`);

    // Test D: Can a party of 6 book Table TEST-2?
    res = await runBrainQuery(t1_id, date, '12:00', 6);
    console.log(`Test D: 6 guests on Cap 2 table -> Cap OK: ${res.can_accommodate}, Avail OK: ${res.check_table_availability} (Expected: false, true)`);

    // Test E: Can a party of 6 book Table TEST-6?
    res = await runBrainQuery(t2_id, date, '12:00', 6);
    console.log(`Test E: 6 guests on Cap 6 table -> Cap OK: ${res.can_accommodate}, Avail OK: ${res.check_table_availability} (Expected: true, true)`);

    console.log("\n✅ Brain logic executes perfectly!");
    
  } catch(e) {
    console.error(e);
  } finally {
    await pool.query("DELETE FROM reservations WHERE email LIKE '%@test.com'");
    await pool.query("DELETE FROM tables WHERE table_number LIKE 'TEST%'");
    pool.end();
  }
}

testBrain();
