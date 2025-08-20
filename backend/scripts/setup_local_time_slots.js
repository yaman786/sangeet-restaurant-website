const { Pool } = require('pg');

// Use local database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/sangeet_restaurant',
  ssl: false
});

async function setupLocalTimeSlots() {
  try {
    console.log('🔧 Setting up time slots in local database...');
    
    // Check if time slots table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reservation_time_slots'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Time slots table does not exist. Creating it...');
      
      // Create the time slots table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS reservation_time_slots (
          id SERIAL PRIMARY KEY,
          time_slot TIME NOT NULL,
          is_active BOOLEAN DEFAULT true,
          max_reservations INTEGER DEFAULT 10,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('✅ Time slots table created');
    } else {
      console.log('✅ Time slots table exists');
    }
    
    // Check if time slots have data
    const slotsCheck = await pool.query('SELECT COUNT(*) FROM reservation_time_slots');
    console.log(`Current time slots: ${slotsCheck.rows[0].count}`);
    
    if (parseInt(slotsCheck.rows[0].count) === 0) {
      console.log('➕ Inserting default time slots...');
      
      // Insert default time slots
      const timeSlots = [
        '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
        '20:00', '20:30', '21:00', '21:30', '22:00'
      ];
      
      for (const timeSlot of timeSlots) {
        await pool.query(`
          INSERT INTO reservation_time_slots (time_slot, max_reservations) 
          VALUES ($1, 10)
          ON CONFLICT (time_slot) DO NOTHING
        `, [timeSlot]);
      }
      
      console.log('✅ Default time slots inserted');
    } else {
      console.log('✅ Time slots already exist');
    }
    
    // Show current time slots
    const slots = await pool.query('SELECT * FROM reservation_time_slots WHERE is_active = true ORDER BY time_slot');
    console.log('\n📋 Current Time Slots:');
    slots.rows.forEach(slot => {
      console.log(`   ${slot.time_slot} - Max: ${slot.max_reservations} reservations`);
    });
    
    // Test the API
    console.log('\n🧪 Testing time slots API...');
    const testDate = new Date().toISOString().split('T')[0];
    console.log(`   Test date: ${testDate}`);
    
    await pool.end();
    console.log('\n✅ Local time slots setup completed!');
    console.log('\n📱 Now test the reservation form locally:');
    console.log('   1. Go to: http://localhost:3000/reservations');
    console.log('   2. Select a date');
    console.log('   3. Time slots should now be available');
    
  } catch (error) {
    console.error('❌ Error setting up time slots:', error);
    process.exit(1);
  }
}

setupLocalTimeSlots();
