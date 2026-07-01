const puppeteer = require('puppeteer');
const fs = require('fs');

async function testCapacity() {
  console.log("Starting test...");
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log("Navigating to login...");
    await page.goto('https://sangeetrestauranthk.netlify.app/admin/login', { waitUntil: 'networkidle2' });
    
    // Login
    console.log("Logging in...");
    await page.type('input[type="text"]', 'admin');
    await page.type('input[type="password"]', 'SangeetAdmin2026');
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(e => console.log("Navigation timeout ok"));

    // Go to QR Management
    console.log("Navigating to QR Management...");
    await page.goto('https://sangeetrestauranthk.netlify.app/admin/qrs', { waitUntil: 'networkidle2' });
    
    // Wait a bit for React to render
    await new Promise(r => setTimeout(r, 3000));
    
    // Click Generate QR button (usually has text "Generate Table QR" or "Generate")
    console.log("Clicking Generate button...");
    const buttons = await page.$$('button');
    let clicked = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Generate') && !text.includes('Bulk')) {
        await btn.click();
        clicked = true;
        break;
      }
    }
    
    if (!clicked) console.log("Warning: Could not find Generate button.");
    
    await new Promise(r => setTimeout(r, 2000));

    // Take screenshot of the modal
    await page.screenshot({ path: 'capacity_modal_test.png' });
    console.log("Screenshot saved as capacity_modal_test.png");
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await browser.close();
  }
}

testCapacity();
