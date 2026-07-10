const https = require('https');

async function testQRFlow() {
  const baseUrl = 'https://frontend-six-xi-10.vercel.app';
  console.log(`Testing Live QR Flow at: ${baseUrl}`);

  try {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }) 
    });

    if (!loginRes.ok) {
      console.log(`Login failed with status ${loginRes.status}`);
      return;
    }

    const cookies = loginRes.headers.get('set-cookie');
    
    // Check GET /api/qr-codes
    const qrRes = await fetch(`${baseUrl}/api/qr-codes`, {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });

    console.log(`GET /api/qr-codes returned ${qrRes.status}`);
    if (qrRes.status !== 200) {
      console.log('Response body preview:', (await qrRes.text()).substring(0, 200));
    }
  } catch (err) {
    console.error('Error during test:', err);
  }
}

testQRFlow();
