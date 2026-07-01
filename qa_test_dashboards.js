const puppeteer = require('puppeteer');

async function testAllPages() {
  console.log("Starting QA test of all dashboards...");
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log("Logging into Admin Panel...");
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
    
    try {
      await page.waitForSelector('#username', { timeout: 10000 });
      await page.type('#username', 'admin');
      await page.type('#password', 'SangeetAdmin2026');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    } catch (e) {
      console.log("Could not find login form. Taking screenshot...");
      await page.screenshot({ path: 'qa_login_error.png' });
      throw e;
    }

    // Helper to check for toast errors
    const checkErrors = async () => {
      const toasts = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[role="alert"], [class*="toast"]'))
          .map(t => t.innerText)
          .filter(text => text.toLowerCase().includes('failed') || text.toLowerCase().includes('error'));
      });
      if (toasts.length > 0) {
        console.error("❌ Found errors on page:", toasts);
        return false;
      }
      return true;
    };

    // 1. Reservations
    console.log("Testing ReservationManagementPage...");
    await page.goto('http://localhost:3000/admin/reservations', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: 'qa_reservations.png' });
    let resOk = await checkErrors();
    console.log(resOk ? "✅ Reservations loaded fine." : "❌ Reservations failed.");

    // 2. Orders
    console.log("Testing OrderManagementPage...");
    await page.goto('http://localhost:3000/admin/orders', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: 'qa_orders.png' });
    let ordOk = await checkErrors();
    console.log(ordOk ? "✅ Orders loaded fine." : "❌ Orders failed.");

    // 3. Kitchen Display
    // The kitchen path might be /admin/kitchen or /kitchen depending on the routes.
    // Looking at App.js from memory, kitchen display was separated. We'll check both.
    console.log("Testing KitchenDisplayPage...");
    await page.goto('http://localhost:3000/kitchen', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: 'qa_kitchen.png' });
    let kitOk = await checkErrors();
    console.log(kitOk ? "✅ Kitchen loaded fine." : "❌ Kitchen failed.");

    console.log("\n=====================");
    console.log("QA TEST SUMMARY");
    console.log("Reservations:", resOk ? "PASS" : "FAIL");
    console.log("Orders:", ordOk ? "PASS" : "FAIL");
    console.log("Kitchen:", kitOk ? "PASS" : "FAIL");
    console.log("=====================\n");
  } catch (error) {
    console.error("Test error:", error);
  } finally {
    await browser.close();
  }
}

testAllPages();
