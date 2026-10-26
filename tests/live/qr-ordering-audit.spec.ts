import { test, expect } from '@playwright/test';

test.describe('Live Production QA Audit: QR Table Ordering Flow', () => {

  test('Audit 1: Table & Menu APIs return valid production data', async ({ request }) => {
    // 1. Table QR lookup
    const tableRes = await request.get('/api/tables/qr/1');
    expect(tableRes.status()).toBe(200);
    const tableData = await tableRes.json();
    expect(tableData.table_number).toBe('1');
    expect(tableData.id).toBeDefined();

    // 2. Menu items
    const menuRes = await request.get('/api/menu/items');
    expect(menuRes.status()).toBe(200);
    const menuItems = await menuRes.json();
    expect(Array.isArray(menuItems)).toBe(true);
    expect(menuItems.length).toBeGreaterThan(0);

    // 3. Categories
    const catRes = await request.get('/api/menu/categories');
    expect(catRes.status()).toBe(200);
    const categories = await catRes.json();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  test('Audit 2: Full Customer UI Flow (Scan -> Add to Cart -> Checkout -> Track Order)', async ({ page }) => {
    // 1. Customer scans QR code for Table 1
    const res = await page.goto('/qr/1', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBeLessThan(400);

    // Verify Table badge is visible
    const tableBadge = page.locator('text=Table 1');
    await expect(tableBadge).toBeVisible({ timeout: 15000 });

    // Verify menu items are rendered
    const firstAddButton = page.locator('button:has-text("Add to Order")').first();
    await expect(firstAddButton).toBeVisible({ timeout: 15000 });

    // 2. Add first item to cart
    await firstAddButton.click();

    // 3. Verify floating cart bar appears
    const cartBar = page.locator('button:has-text("View your order details")');
    await expect(cartBar).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=1 Item')).toBeVisible();

    // 4. Click cart bar to navigate to Cart page
    await cartBar.click();
    await expect(page).toHaveURL(/.*\/qr\/1\/cart/);

    // 5. Fill guest details
    const nameInput = page.locator('input[placeholder="E.g., Jane Doe"]');
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill('QA Audit Bot');

    const requestInput = page.locator('input[placeholder="Allergies, preferences..."]');
    await requestInput.fill('QA Test - Please do not prepare');

    // 6. Listen for the actual Order Creation API response
    const orderPromise = page.waitForResponse(
      response => response.url().includes('/api/orders') && response.request().method() === 'POST'
    );

    // 7. Place Order
    const placeOrderBtn = page.locator('button:has-text("Place Order")');
    await expect(placeOrderBtn).toBeEnabled();
    await placeOrderBtn.click();

    // 8. Verify API returned 201 Created with valid order
    const orderResponse = await orderPromise;
    expect(orderResponse.status()).toBe(201);
    const orderData = await orderResponse.json();
    expect(orderData.order).toBeDefined();
    expect(orderData.order.order_number).toMatch(/^ORD/);
    console.log(`✅ Audited live order created: ${orderData.order.order_number} (ID: ${orderData.order.id})`);

    // 9. Verify transition to Live Tracking Dashboard
    await page.waitForURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator('h2:has-text("Order Tracking")')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(orderData.order.order_number).first()).toBeVisible();
    await expect(page.locator('text=Order Received').first()).toBeVisible();
  });

  test('Audit 3: Call Waiter and Request Bill Service APIs', async ({ request }) => {
    // 1. Call waiter protocol
    const waiterRes = await request.post('/api/tables/call-waiter', {
      data: {
        table_number: '1',
        reason: 'Water refill (QA Test)'
      }
    });
    // Should be either 200 OK or rate-limited/accepted
    expect([200, 201, 429]).toContain(waiterRes.status());

    // 2. Request bill protocol
    const billRes = await request.post('/api/tables/request-bill', {
      data: {
        table_number: '1',
        payment_method: 'card'
      }
    });
    expect([200, 201, 429]).toContain(billRes.status());
  });

});
