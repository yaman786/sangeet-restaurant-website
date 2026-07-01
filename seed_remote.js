const API_URL = 'https://sangeet-restaurant-api.onrender.com/api';

const dummyData = [
  { customer_name: 'Alice Smith', email: 'alice@example.com', phone: '1234567890', date: '2026-07-01', time: '18:00', guests: 2, special_requests: 'Window seat' },
  { customer_name: 'Bob Jones', email: 'bob@example.com', phone: '0987654321', date: '2026-07-01', time: '19:30', guests: 4, special_requests: 'Birthday' },
  { customer_name: 'Charlie Brown', email: 'charlie@example.com', phone: '1112223333', date: '2026-07-02', time: '20:00', guests: 6, special_requests: 'High chair needed' },
  { customer_name: 'Diana Prince', email: 'diana@example.com', phone: '4445556666', date: '2026-07-02', time: '17:45', guests: 2, special_requests: '' },
  { customer_name: 'Evan Wright', email: 'evan@example.com', phone: '7778889999', date: '2026-07-03', time: '18:15', guests: 8, special_requests: 'Allergic to nuts' },
  { customer_name: 'Fiona Gallagher', email: 'fiona@example.com', phone: '5551234567', date: '2026-07-03', time: '21:00', guests: 3, special_requests: 'Patio seating if possible' },
  { customer_name: 'George Miller', email: 'george@example.com', phone: '8887776666', date: '2026-07-04', time: '19:00', guests: 5, special_requests: '' },
  { customer_name: 'Hannah Abbott', email: 'hannah@example.com', phone: '2223334444', date: '2026-07-04', time: '18:30', guests: 2, special_requests: 'Anniversary' },
  { customer_name: 'Ian Malcolm', email: 'ian@example.com', phone: '9990001111', date: '2026-07-05', time: '20:30', guests: 4, special_requests: '' },
  { customer_name: 'Julia Roberts', email: 'julia@example.com', phone: '3334445555', date: '2026-07-05', time: '19:45', guests: 10, special_requests: 'Large group, prefix menu' },
];

async function seed() {
  console.log("Starting seeding process...");
  let successCount = 0;
  
  for (const data of dummyData) {
    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        successCount++;
        console.log(`✅ Inserted: ${data.customer_name}`);
      } else {
        const err = await res.text();
        console.error(`❌ Failed: ${data.customer_name} - ${err}`);
      }
    } catch (e) {
      console.error(`❌ Error on ${data.customer_name}:`, e.message);
    }
  }
  
  console.log(`Seeding complete. Successfully inserted ${successCount}/${dummyData.length} reservations.`);
}

seed();
