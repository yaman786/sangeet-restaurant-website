import { test, expect } from '@playwright/test';

test('Take success screenshot', async ({ page }) => {
  const BASE_URL = 'https://frontend-six-xi-10.vercel.app';
  
  // Navigate to QR code page for TABLE-1
  await page.goto(`${BASE_URL}/qr/TABLE-1`);
  
  // Wait for menu to load
  await page.waitForSelector('text=Chicken Kadai', { timeout: 15000 });
  
  // Add item to cart
  const addToCartBtn = await page.locator('button:has-text("Add to Cart")').first();
  await addToCartBtn.click();
  
  // Go to cart
  const viewCartBtn = await page.locator('button:has-text("View Cart")').first();
  if (await viewCartBtn.isVisible()) {
    await viewCartBtn.click();
  } else {
    // Navigate to cart manually if button is hidden
    await page.goto(`${BASE_URL}/qr/TABLE-1/cart`);
  }
  
  // Enter customer name
  await page.waitForSelector('input[placeholder*="name"]', { timeout: 5000 });
  await page.fill('input[placeholder*="name"]', 'QA Tester');
  
  // Place first order
  await page.click('button:has-text("Place Order")');
  
  // Wait for success toast and redirect to dashboard
  await page.waitForURL(/.*dashboard.*/, { timeout: 15000 });
  
  // On Dashboard, add more items for the 2nd order!
  await page.waitForSelector('button:has-text("Add More Items")', { timeout: 15000 });
  await page.click('button:has-text("Add More Items")');
  
  // We are back at menu view in dashboard
  await page.waitForSelector('text=Chicken Kadai', { timeout: 15000 });
  const dashboardAddToCart = await page.locator('button:has-text("Add to Cart")').first();
  await dashboardAddToCart.click();
  
  // Click View Cart or Cart Icon
  await page.click('button:has-text("View Cart")');
  
  // Click Place Order for 2nd order
  await page.waitForSelector('button:has-text("Place Order")', { timeout: 5000 });
  await page.click('button:has-text("Place Order")');
  
  // Wait for success toast "Order placed successfully!"
  await page.waitForSelector('text=Order placed successfully!', { timeout: 15000 });
  
  // Take screenshot
  await page.screenshot({ path: '/Users/amanrana/.gemini/antigravity-ide/brain/b38f20ba-7619-4ccf-a980-0a5be870a908/success_order.png', fullPage: true });
});
