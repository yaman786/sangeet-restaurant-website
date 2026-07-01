const API_URL = 'https://sangeet-restaurant-api.onrender.com/api';
const headers = { 'Content-Type': 'application/json' };

async function run() {
  const dateStr = new Date().toISOString().split('T')[0];
  const res = await fetch(`${API_URL}/reservations`, {
    method: 'POST', headers, body: JSON.stringify({ customer_name: 'Test', email: 't@t.com', phone: '111', date: dateStr, time: '18:00', guests: 2 })
  });
  console.log(res.status, await res.text());
}
run();
