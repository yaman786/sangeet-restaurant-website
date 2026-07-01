const puppeteer = require('puppeteer');
const API_URL = 'https://sangeet-restaurant-api.onrender.com/api';
const headers = { 'Content-Type': 'application/json' };

async function runSortingTest() {
  console.log("Starting QA Sorting Test...");
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1. Create Data
    console.log("Injecting 3 test reservations for sorting test...");
    const dateStr = new Date().toISOString().split('T')[0];
    
    await fetch(`${API_URL}/reservations`, {
      method: 'POST', headers, body: JSON.stringify({ customer_name: 'Alpha (2 Guests)', email: 'sort1@test.com', phone: '111', date: dateStr, time: '18:00', guests: 2 })
    });
    await fetch(`${API_URL}/reservations`, {
      method: 'POST', headers, body: JSON.stringify({ customer_name: 'Zeta (8 Guests)', email: 'sort2@test.com', phone: '222', date: dateStr, time: '19:00', guests: 8 })
    });
    await fetch(`${API_URL}/reservations`, {
      method: 'POST', headers, body: JSON.stringify({ customer_name: 'Charlie (4 Guests)', email: 'sort3@test.com', phone: '333', date: dateStr, time: '20:00', guests: 4 })
    });

    console.log("Data inserted.");

    // 2. UI Test
    console.log("Navigating to Admin Panel...");
    await page.goto('https://sangeetrestauranthk.netlify.app/admin/login', { waitUntil: 'networkidle2' });
    
    await page.type('input[type="text"]', 'admin');
    await page.type('input[type="password"]', 'SangeetAdmin2026');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(e => console.log("Navigation timeout ok"));

    console.log("Going to Reservations Page...");
    await page.goto('https://sangeetrestauranthk.netlify.app/admin/reservations', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000)); // wait for data load

    // Click "Guests" header to sort Ascending
    console.log("Clicking 'Guests' header...");
    await page.evaluate(() => {
      const ths = Array.from(document.querySelectorAll('th'));
      const guestTh = ths.find(th => th.textContent.includes('Guests'));
      if(guestTh) guestTh.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'sorting_asc.png' });
    console.log("Screenshot saved as sorting_asc.png");

    // Click "Guests" header again to sort Descending
    console.log("Clicking 'Guests' header again...");
    await page.evaluate(() => {
      const ths = Array.from(document.querySelectorAll('th'));
      const guestTh = ths.find(th => th.textContent.includes('Guests'));
      if(guestTh) guestTh.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'sorting_desc.png' });
    console.log("Screenshot saved as sorting_desc.png");

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await browser.close();
  }
}

runSortingTest();
