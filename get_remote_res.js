const API_URL = 'https://sangeet-restaurant-api.onrender.com/api';
const headers = { 'Content-Type': 'application/json' };

async function run() {
  try {
    // 1. Login
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST', headers,
      body: JSON.stringify({ username: 'admin', password: 'SangeetAdmin2026' })
    });
    
    if (!loginRes.ok) {
      console.log("Login failed:", await loginRes.text());
      return;
    }
    
    const { token } = await loginRes.json();
    console.log("Logged in!");
    
    const authHeaders = { ...headers, Authorization: `Bearer ${token}` };
    
    // 2. Fetch reservations
    const res = await fetch(`${API_URL}/reservations`, { headers: authHeaders });
    if (!res.ok) {
      console.log("Failed to fetch reservations:", await res.text());
      return;
    }
    
    const data = await res.json();
    console.log("Reservations found:", data.length);
    console.log(data);
    
  } catch(e) {
    console.error(e);
  }
}
run();
