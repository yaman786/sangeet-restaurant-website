const http = require('http');

const PROTECTED_ROUTES = [
  '/api/menu/items',           // POST (create) should be protected
  '/api/reservations',         // GET (list) should be protected
  '/api/orders',               // GET (list) should be protected
  '/api/analytics/business'    // GET should be protected
];

async function checkRoute(route, method = 'GET') {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: route,
      method: method,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    
    req.on('error', (e) => {
      resolve({ error: e.message });
    });
    
    if (method === 'POST') {
      req.write(JSON.stringify({ name: 'Test' }));
    }
    
    req.end();
  });
}

async function run() {
  console.log('Testing Admin API Routes Security...\n');
  let passed = true;

  for (const route of PROTECTED_ROUTES) {
    const method = route === '/api/menu/items' ? 'POST' : 'GET';
    console.log(`Checking ${method} ${route} without auth token...`);
    
    const res = await checkRoute(route, method);
    
    if (res.status === 401 || res.status === 403) {
      console.log(`✅ Passed. Route is protected (Status: ${res.status})`);
    } else {
      console.log(`❌ Failed. Route is NOT protected properly. Expected 401/403, got: ${res.status || res.error}`);
      console.log(`Data: ${res.data?.slice(0, 100)}`);
      passed = false;
    }
    console.log('--------------------------------------------------');
  }

  if (passed) {
    console.log('All API security tests passed successfully!');
    process.exit(0);
  } else {
    console.log('Some API security tests failed.');
    process.exit(1);
  }
}

run();
