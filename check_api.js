const API_URL = 'https://sangeet-restaurant-api.onrender.com/api';
const headers = { 'Content-Type': 'application/json' };

async function check() {
  console.log("Checking API endpoints...");
  
  try {
    const r1 = await fetch(`${API_URL}/reservations`);
    console.log("fetchAllReservations status:", r1.status);
    if (!r1.ok) console.log(await r1.text());

    const r2 = await fetch(`${API_URL}/reservations/stats`);
    console.log("fetchReservationStats status:", r2.status);
    if (!r2.ok) console.log(await r2.text());

    const r3 = await fetch(`${API_URL}/tables`);
    console.log("fetchTables status:", r3.status);
    if (!r3.ok) console.log(await r3.text());

  } catch(e) {
    console.error("Network error:", e);
  }
}
check();
