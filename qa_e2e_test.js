const puppeteer = require('puppeteer');
const API_URL = 'https://sangeet-restaurant-api.onrender.com/api';
const headers = { 'Content-Type': 'application/json' };

async function runQA() {
  console.log("Starting QA E2E Test...");
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    // 1. Pre-requisites: Create API Data
    console.log("Setting up QA Data...");
    // Create Table Cap 2
    await fetch(`${API_URL}/qr/generate`, { method: 'POST', headers, body: JSON.stringify({ tableNumber: '991', capacity: 2 }) });
    // Create Table Cap 6
    await fetch(`${API_URL}/qr/generate`, { method: 'POST', headers, body: JSON.stringify({ tableNumber: '992', capacity: 6 }) });
    
    // Create a 6-person reservation for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    await fetch(`${API_URL}/reservations`, {
      method: 'POST', headers,
      body: JSON.stringify({ 
        customer_name: 'QA Test Party', email: 'qa@test.com', 
        phone: '12345', date: dateStr, time: '19:00', guests: 6 
      })
    });
    console.log("QA Data inserted.");

    // 2. UI Test
    console.log("Navigating to Admin Panel...");
    await page.goto('https://sangeetrestauranthk.netlify.app/admin/login', { waitUntil: 'networkidle2' });
    
    await page.type('input[type="text"]', 'admin');
    await page.type('input[type="password"]', 'SangeetAdmin2026');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(e => console.log("Navigation timeout ok"));

    console.log("Going to Reservations Page...");
    await page.goto('https://sangeetrestauranthk.netlify.app/admin/reservations', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000));

    // Filter by Tomorrow
    console.log("Setting date filter to tomorrow...");
    await page.evaluate((dStr) => {
      const inputs = document.querySelectorAll('input[type="date"]');
      if(inputs.length > 0) {
        inputs[0].value = dStr;
        inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, dateStr);
    await new Promise(r => setTimeout(r, 2000));

    // Find the QA Test Party reservation and click its status dropdown
    console.log("Looking for QA Test Party and opening table dropdown...");
    await page.evaluate(() => {
      // Find the row containing "QA Test Party"
      const tds = Array.from(document.querySelectorAll('td'));
      const targetTd = tds.find(td => td.textContent.includes('QA Test Party'));
      if(targetTd) {
        const row = targetTd.closest('tr');
        // Find select dropdown for Table Assignment
        const selects = row.querySelectorAll('select');
        for(let select of selects) {
          if(select.innerHTML.includes('Assign Table') || select.innerHTML.includes('Select Table') || select.options.length > 0) {
            // We focus it so screenshot shows it
            select.focus();
            // Just simulate a click
            select.click();
          }
        }
      }
    });

    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({ path: 'qa_capacity_dropdown.png' });
    console.log("Screenshot saved as qa_capacity_dropdown.png");
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await browser.close();
  }
}

runQA();
