const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data.substring(0, 500) });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('Testing Production API Endpoints...');
  const baseUrl = 'https://frontend-six-xi-10.vercel.app/api';
  
  try {
    console.log('\n1. Testing GET /menu/categories');
    const categories = await fetchUrl(`${baseUrl}/menu/categories`);
    console.log(`Status: ${categories.status}`);
    if (categories.status === 200 && Array.isArray(categories.data)) {
      console.log(`✅ Success! Fetched ${categories.data.length} categories.`);
      if (categories.data.length > 0) console.log(`Sample: ${categories.data[0].name}`);
    } else {
      console.log('❌ Failed. Returned:', categories.data.substring(0, 100));
    }

    console.log('\n2. Testing GET /menu/items');
    const items = await fetchUrl(`${baseUrl}/menu/items`);
    console.log(`Status: ${items.status}`);
    if (items.status === 200 && Array.isArray(items.data)) {
      console.log(`✅ Success! Fetched ${items.data.length} menu items.`);
      if (items.data.length > 0) console.log(`Sample: ${items.data[0].name}`);
    } else {
      console.log('❌ Failed. Returned:', items.data.substring(0, 100));
    }
    
  } catch (err) {
    console.error('Test script error:', err);
  }
}

runTests();
