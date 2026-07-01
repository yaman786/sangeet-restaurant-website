const puppeteer = require('puppeteer');

async function testAutoLogout() {
  console.log("Starting Auto-Logout QA Test...");
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  try {
    console.log("1. Injecting an EXPIRED token into localStorage...");
    // Go to the origin first so we can set localStorage
    await page.goto('https://sangeetrestauranthk.netlify.app', { waitUntil: 'networkidle2' });
    
    await page.evaluate(() => {
      // Fake expired/corrupted token
      localStorage.setItem('adminToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token');
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token');
    });

    console.log("2. Navigating to the protected Admin Reservations page...");
    // When we go here, loadData() runs, uses the bad token, gets 403, and should trigger handleAuthFailure -> redirect to /admin/login
    await page.goto('https://sangeetrestauranthk.netlify.app/admin/reservations', { waitUntil: 'networkidle2' });
    
    // Wait a couple seconds for the API call to fail and redirect to happen
    await new Promise(r => setTimeout(r, 3000));
    
    const currentUrl = page.url();
    console.log("3. Current URL after attempting to load data: ", currentUrl);
    
    if (currentUrl.includes('/admin/login')) {
      console.log("✅ Auto-Logout Test PASSED! Successfully redirected to the secure admin login.");
    } else if (currentUrl.includes('/login')) {
      console.log("❌ Test FAILED: Redirected to generic /login instead of /admin/login.");
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
