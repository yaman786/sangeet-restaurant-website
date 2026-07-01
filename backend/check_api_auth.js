require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: 1, username: 'admin', role: 'admin' },
  process.env.JWT_SECRET || 'sangeet_secret_key_2026',
  { expiresIn: '24h' }
);

const API_URL = 'https://sangeet-restaurant-api.onrender.com/api';
const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

async function check() {
  console.log("Checking API endpoints with Token...");
  try {
    const r1 = await fetch(`${API_URL}/reservations`, { headers });
    console.log("fetchAllReservations status:", r1.status);
    if (!r1.ok) console.log(await r1.text());

    const r2 = await fetch(`${API_URL}/reservations/stats`, { headers });
    console.log("fetchReservationStats status:", r2.status);
    if (!r2.ok) console.log(await r2.text());
  } catch(e) { console.error("Error:", e); }
}
check();
