const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Navigating to production site...');
  await page.goto('https://sangeet-restaurant-website.vercel.app/qr/TB-2', { waitUntil: 'networkidle' });

  try {
    // 1. Initial Prompt - Enter name if required
    console.log('Checking for name prompt...');
    const nameInput = await page.locator('input[placeholder*="Enter your name"]');
    if (await nameInput.count() > 0) {
      await nameInput.fill('Playwright Tester');
      await page.locator('button', { hasText: 'View Menu' }).click();
    }

    // 2. Add first item to cart
    console.log('Waiting for menu items...');
    await page.waitForSelector('text=Add to Order', { timeout: 10000 });
    const addButtons = await page.locator('text=Add to Order');
    console.log('Adding first item...');
    await addButtons.first().click();

    // 3. Go to Cart
    console.log('Going to cart...');
    await page.waitForTimeout(1000); 
    const viewCartBtn = page.locator('button', { hasText: /Item/i }).or(page.locator('button', { hasText: /View cart/i }));
    await viewCartBtn.first().click();

    // 4. Place Order
    console.log('Placing first order...');
    await page.waitForSelector('text=Place Order');
    await page.locator('button', { hasText: 'Place Order' }).click();

    // 5. Wait for tracking view
    console.log('Waiting for tracking view...');
    await page.waitForSelector('text=Order Tracking', { timeout: 15000 });
    console.log('First order placed successfully!');

    // 6. Click Continue Ordering
    console.log('Clicking Continue Ordering...');
    await page.locator('button', { hasText: 'Continue Ordering' }).click();

    // 7. RELOAD the page (to simulate the issue state)
    console.log('Reloading the page to simulate leaving and coming back...');
    await page.reload({ waitUntil: 'networkidle' });

    // Wait for Menu again
    await page.waitForSelector('text=Add to Order', { timeout: 10000 });

    // 8. Add second item
    console.log('Adding second item...');
    await addButtons.nth(1).click();

    // 9. Go to Cart
    console.log('Going to cart again...');
    await page.waitForTimeout(1000);
    await viewCartBtn.first().click();

    // 10. Place second order
    console.log('Placing second (merged) order...');
    await page.waitForSelector('text=Place Order');
    await page.locator('button', { hasText: 'Place Order' }).click();

    // 11. Wait for tracking view
    console.log('Waiting for tracking view after merge...');
    await page.waitForSelector('text=Order Tracking', { timeout: 15000 });

    console.log('Success! The UI rendered the tracking view instead of failing/blank screen.');
    const html = await page.content();
    if (html.includes('Order Items')) {
      console.log('Order Items are visible on screen!');
    } else {
      console.log('Could not find Order Items on screen. It might be empty.');
    }
    
  } catch (err) {
    console.error('Test Failed:', err);
    await page.screenshot({ path: 'test-failure.png' });
  } finally {
    await browser.close();
  }
})();
