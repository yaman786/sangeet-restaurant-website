const puppeteer = require('puppeteer');

async function testAutoLogout() {
  console.log("Starting Auto-Logout QA Test ONLINE...");
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  try {
    // 1. Go to frontend, inject bad token
    await page.goto('https://sangeetrestauranthk.netlify.app', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('adminToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token');
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token');
    });

    console.log("Navigating to protected Admin Reservations page...");
    await page.goto('https://sangeetrestauranthk.netlify.app/admin/reservations', { waitUntil: 'networkidle2' });
    
    // Wait for the backend API call to reject the bad token and the frontend to redirect
    await new Promise(r => setTimeout(r, 4000));
    
    const currentUrl = page.url();
    console.log("Current URL after attempting to load data: ", currentUrl);
    
    if (currentUrl.includes('/admin/login')) {
      console.log("✅ Auto-Logout Test PASSED! Successfully redirected to the secure admin login.");
    } else {
      console.log("❌ Test FAILED: Did not redirect. Still on", currentUrl);
    }
    
  } catch (e) {
    console.error("Test execution failed:", e);
  } finally {
    await browser.close();
  }
}

testAutoLogout();
