

async function verifyLiveFlow() {
  const baseUrl = 'https://frontend-hdq6bxb7h-yaman786s-projects.vercel.app';
  console.log(`Testing Live Vercel Site: ${baseUrl}`);

  try {
    // 1. Login
    console.log('\n--- 1. Testing Login ---');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@sangeet.com', password: 'admin' }) // Trying default seed password
    });

    if (loginRes.status !== 200) {
      console.log(`Login failed with status ${loginRes.status}`);
      const text = await loginRes.text();
      console.log('Response:', text);
      return;
    }

    const setCookieHeader = loginRes.headers.raw()['set-cookie'];
    const cookies = setCookieHeader ? setCookieHeader.map(c => c.split(';')[0]).join('; ') : '';
    console.log('Login successful! Auth Cookie obtained.');

    // 2. Fetch Business Analytics (Protected Route)
    console.log('\n--- 2. Testing Analytics API (Protected) ---');
    const analyticsRes = await fetch(`${baseUrl}/api/analytics/business?timeframe=30`, {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });

    if (analyticsRes.status === 200) {
      console.log('✅ Success! Analytics API returned 200 OK with valid cookie.');
    } else {
      console.log(`❌ Failed. Analytics API returned ${analyticsRes.status}`);
      const text = await analyticsRes.text();
      console.log('Response:', text);
    }
    
    // 3. Test without cookie to verify security
    console.log('\n--- 3. Testing Analytics API (Unauthenticated) ---');
    const noAuthRes = await fetch(`${baseUrl}/api/analytics/business?timeframe=30`, {
      method: 'GET'
    });

    if (noAuthRes.status === 401 || noAuthRes.status === 403) {
      console.log(`✅ Success! API blocked unauthenticated request (${noAuthRes.status}).`);
    } else {
      console.log(`❌ Security Warning. API allowed unauthenticated request! Status: ${noAuthRes.status}`);
    }

  } catch (err) {
    console.error('Error during verification:', err);
  }
}

verifyLiveFlow();
