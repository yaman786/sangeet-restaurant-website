const puppeteer = require('puppeteer');

async function testAutoLogout() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log('API Response:', response.url(), response.status());
    }
  });

  try {
    await page.goto('https://sangeetrestauranthk.netlify.app', { waitUntil: 'networkidle2' });
    await page.evaluate(() => {
      localStorage.setItem('adminToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token');
      localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token');
    });

    console.log("Navigating to protected Admin Reservations page...");
    await page.goto('https://sangeetrestauranthk.netlify.app/admin/reservations', { waitUntil: 'networkidle2' });
    
    await new Promise(r => setTimeout(r, 4000));
    console.log("Current URL: ", page.url());
  } catch (e) {
    console.error("Test execution failed:", e);
  } finally {
    await browser.close();
  }
}

testAutoLogout();
