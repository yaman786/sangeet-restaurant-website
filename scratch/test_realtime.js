const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting Live End-to-End Real-Time Latency Test...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  
  const BASE_URL = 'https://frontend-six-xi-10.vercel.app';
  
  // 1. Open Customer Page
  const customerPage = await browser.newPage();
  await customerPage.goto(`${BASE_URL}/qr/1`, { waitUntil: 'networkidle2' });
  console.log('Customer page loaded. Placing order...');
  
  // Add item and place order
  await customerPage.waitForSelector('button');
  const addBtns = await customerPage.$$('button');
  for (let btn of addBtns) {
    const text = await customerPage.evaluate(el => el.textContent, btn);
    if (text && text.includes('Add to Order')) {
      await btn.click();
      break;
    }
  }
  
  await customerPage.waitForSelector('button[aria-label="View Cart"]');
  await customerPage.click('button[aria-label="View Cart"]');
  
  await customerPage.waitForSelector('input[placeholder*="Name"]');
  await customerPage.type('input[placeholder*="Name"]', 'Latency Tester');
  
  const placeBtns = await customerPage.$$('button');
  for (let btn of placeBtns) {
    const text = await customerPage.evaluate(el => el.textContent, btn);
    if (text && text.includes('Place Order')) {
      await btn.click();
      break;
    }
  }
  
  // Wait for Customer Tracking Dashboard
  await customerPage.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log('Order placed successfully.');
  
  // 2. Open Admin Page
  const adminPage = await browser.newPage();
  await adminPage.goto(`${BASE_URL}/admin/orders`, { waitUntil: 'networkidle2' });
  console.log('Admin page loaded.');
  
  // Helper to wait for element with text
  const clickButtonWithText = async (page, selector, textToMatch) => {
    const btns = await page.$$(selector);
    for (let btn of btns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes(textToMatch)) {
        await btn.click();
        return true;
      }
    }
    return false;
  };

  // Expand Table 1
  await adminPage.waitForSelector('tr.cursor-pointer');
  const tableRows = await adminPage.$$('tr.cursor-pointer');
  if (tableRows.length > 0) {
    await tableRows[0].click(); // Expand first group
    await new Promise(r => setTimeout(r, 1000));
  }

  // --- EVENT 1: ACCEPT (Move to Kitchen) ---
  console.log('\n--- Testing Event: Accept (Move to Kitchen) ---');
  let startTime = Date.now();
  await clickButtonWithText(adminPage, 'button', 'Accept');
  
  // Wait for Customer UI to update to 'Preparing'
  await customerPage.waitForFunction(
    () => document.body.innerText.includes('In Kitchen'),
    { timeout: 10000 }
  );
  console.log(`✅ Customer updated to 'In Kitchen' in ${Date.now() - startTime}ms`);

  // --- EVENT 2: MARK READY ---
  console.log('\n--- Testing Event: Mark Ready ---');
  await adminPage.click('button:has-text("In Kitchen")').catch(() => {}); // Switch to Kitchen tab
  await new Promise(r => setTimeout(r, 1000));
  
  // Expand again if needed
  const kitchenRows = await adminPage.$$('tr.cursor-pointer');
  if (kitchenRows.length > 0) {
    await kitchenRows[0].click();
    await new Promise(r => setTimeout(r, 1000));
  }
  
  startTime = Date.now();
  await clickButtonWithText(adminPage, 'button', 'Mark Ready');
  
  // Wait for Customer UI to update to 'Ready'
  await customerPage.waitForFunction(
    () => document.body.innerText.includes('Ready / Served'),
    { timeout: 10000 }
  );
  console.log(`✅ Customer updated to 'Ready / Served' in ${Date.now() - startTime}ms`);

  // --- EVENT 3: COLLECT PAYMENT ---
  console.log('\n--- Testing Event: Collect Payment (Session End) ---');
  await adminPage.click('button:has-text("Ready / Served")').catch(() => {});
  await new Promise(r => setTimeout(r, 2000));
  
  startTime = Date.now();
  await clickButtonWithText(adminPage, 'button', 'Collect Payment');
  await new Promise(r => setTimeout(r, 1000));
  await clickButtonWithText(adminPage, 'button', 'Confirm & Complete');
  
  // Wait for Customer UI redirect
  await customerPage.waitForFunction(
    () => window.location.pathname === '/',
    { timeout: 15000 }
  );
  console.log(`✅ Customer successfully redirected to Home Page (/) in ${Date.now() - startTime}ms`);

  await browser.close();
  console.log('\nAll Real-Time Tests Passed! 🚀');
})();
