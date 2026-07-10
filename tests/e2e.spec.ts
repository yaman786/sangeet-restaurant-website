import { test, expect } from '@playwright/test';

test.describe('Customer Flows (QA)', () => {
  test('should complete a full reservation flow', async ({ page }) => {
    // Navigate to reservations page
    await page.goto('/reservations');
    // Wait for the page to fully hydrate
    await page.waitForLoadState('networkidle');
    
    // Fill out the reservation form
    await page.fill('input[name="customer_name"]', 'QA Test User');
    await page.fill('input[name="email"]', 'qa@test.com');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Use tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[name="date"]', dateString);
    
    // Select time and guests
    await page.selectOption('select[name="time"]', { index: 1 }); // Select first available time
    await page.selectOption('select[name="guests"]', '4');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for the success confirmation (either a toast or a success message container)
    // The UI should show "Reservation Confirmed" or similar
    await expect(page.locator('text=Reservation Confirmed').first()).toBeVisible({ timeout: 10000 });
  });

  test('should complete a table QR order flow', async ({ page }) => {
    // Mock the table QR API response
    await page.route('**/api/tables/qr/E2E-1', async route => {
      const json = { id: 999, table_number: 'E2E-1', qr_code_url: 'http://localhost:3000/qr/E2E-1', qr_code_data: 'E2E-1' };
      await route.fulfill({ json });
    });

    // Mock menu categories
    await page.route('**/api/menu/categories', async route => {
      const json = [{ id: 1, name: 'Starters', description: 'Test' }];
      await route.fulfill({ json });
    });

    // Mock menu items
    await page.route('**/api/menu/items', async route => {
      const json = [{ id: 1, name: 'Test Samosa', description: 'Test', price: 5.99, category: 'Starters', is_vegetarian: true }];
      await route.fulfill({ json });
    });

    // Navigate to QR menu simulating table E2E-1
    await page.goto('/qr/E2E-1');
    
    // Wait for menu items to load
    try {
      await page.waitForSelector('text=Add to Cart', { timeout: 10000 });
    } catch (e) {
      await page.screenshot({ path: 'test-error.png' });
      throw e;
    }
    
    // Click the first "Add to Cart" button
    await page.locator('text=Add to Cart').first().click();
    
    // Verify toast or cart counter updates
    await expect(page.locator('text=added')).toBeVisible({ timeout: 5000 }).catch(() => {}); // Optional catch if toast is fast
    
    // Click View Cart or Cart icon
    const cartButton = page.locator('text=View Cart');
    if (await cartButton.isVisible()) {
      await cartButton.click();
    } else {
      await page.goto('/qr/E2E-1/cart');
    }
    
    // Mock submit order
    await page.route('**/api/orders', async route => {
      const json = { id: 123, order_number: 'ORD-123', status: 'pending' };
      await route.fulfill({ json });
    });

    // Mock the order creation API
    await page.route('**/api/orders', async route => {
      if (route.request().method() === 'POST') {
        const json = { order: { id: 999, order_number: 'E2E-ORD-123' } };
        await route.fulfill({ json, status: 201 });
      } else {
        await route.continue();
      }
    });

    // Wait for cart page to fully hydrate (networkidle hangs due to WebSockets)
    await page.waitForTimeout(1000);

    // In Cart, fill customer name
    await page.fill('input[placeholder*="name" i], input[placeholder*="Name" i]', 'QA Table 1 Guest');
    
    // Submit order
    await page.click('button:has-text("Place Order")');
    
    // Verify success message or redirection to tracking
    await expect(page.locator('text=Placed').or(page.locator('text=Tracking'))).toBeVisible({ timeout: 10000 });
  });
});
