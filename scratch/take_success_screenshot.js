const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const BASE_URL = 'https://frontend-six-xi-10.vercel.app';
  
  console.log('Navigating to menu...');
  await page.goto(`${BASE_URL}/qr/TABLE-1`);
  
  await page.waitForSelector('text=Chicken Kadai', { timeout: 15000 });
  
  console.log('Adding Chicken Kadai to cart...');
  const addToCartBtn = await page.locator('button:has-text("Add to Cart")').first();
  await addToCartBtn.click();
  
  const viewCartBtn = await page.locator('button:has-text("View Cart")').first();
  if (await viewCartBtn.isVisible()) {
    await viewCartBtn.click();
  } else {
    await page.goto(`${BASE_URL}/qr/TABLE-1/cart`);
  }
  
  console.log('Entering customer name...');
  await page.waitForSelector('input[placeholder*="name"]', { timeout: 5000 });
  await page.fill('input[placeholder*="name"]', 'QA Tester');
  
  console.log('Placing first order...');
  await page.click('button:has-text("Place Order")');
  
  await page.waitForURL(/.*dashboard.*/, { timeout: 15000 });
  
  console.log('Adding more items from dashboard...');
  await page.waitForSelector('button:has-text("Add More Items")', { timeout: 15000 });
  await page.click('button:has-text("Add More Items")');
  
  await page.waitForSelector('text=Chicken Kadai', { timeout: 15000 });
  const dashboardAddToCart = await page.locator('button:has-text("Add to Cart")').first();
  await dashboardAddToCart.click();
  
  await page.click('button:has-text("View Cart")');
  
  console.log('Placing SECOND order...');
  await page.waitForSelector('button:has-text("Place Order")', { timeout: 5000 });
  await page.click('button:has-text("Place Order")');
  
  console.log('Waiting for success toast...');
  await page.waitForSelector('text=Order placed successfully!', { timeout: 15000 });
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: '/Users/amanrana/.gemini/antigravity-ide/brain/b38f20ba-7619-4ccf-a980-0a5be870a908/success_order.png', fullPage: true });
  
  await browser.close();
  console.log('Done!');
})();
