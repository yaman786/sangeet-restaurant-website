import { test, expect } from '@playwright/test';

test.describe('Unified Pick-Up Order Tracking Suite', () => {
  test.setTimeout(60000);

  test('1. Public Track-Order Search UI and Links Verification', async ({ page }) => {
    // Check navigation to /track-order
    await page.goto('/track-order', { waitUntil: 'domcontentloaded' });

    // Header and search card must be visible
    await expect(page.getByRole('heading', { name: /Track Your Order/i })).toBeVisible({ timeout: 10000 });
    const searchInput = page.getByTestId('track-order-search-input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /91234567 or 20261104-001/i);

    const searchBtn = page.getByTestId('track-order-search-btn');
    await expect(searchBtn).toBeVisible();

    // Verify search with invalid / non-existent order number gives friendly assistance
    await searchInput.fill('00000000');
    await searchBtn.click();
    await expect(page.getByText(/No active orders found/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Need assistance\? Call reception/i)).toBeVisible();
  });

  test('2. Header and Footer Integration for Order Tracking', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Navbar should have Track Order in navigation
    const headerTrackLink = page.locator('nav a[href="/track-order"]');
    await expect(headerTrackLink).toBeVisible({ timeout: 10000 });
    await expect(headerTrackLink).toHaveText(/Track Order/i);

    // Footer should have both Order Pick-Up and Track Order quick links
    const footerPickupLink = page.locator('footer a[href="/pickup"]');
    const footerTrackLink = page.locator('footer a[href="/track-order"]');
    await expect(footerPickupLink).toBeVisible();
    await expect(footerTrackLink).toBeVisible();
  });

  test('3. Global Floating Tracker Pill on Homepage when active order exists', async ({ page }) => {
    // Simulate an active order in localStorage
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await page.evaluate(() => {
      localStorage.setItem('orderId_PICKUP', '999999');
      localStorage.setItem('orderNumber_PICKUP', 'TEST-TRACK-001');
      localStorage.setItem('customer_PICKUP', 'David Wong');
      sessionStorage.removeItem('dismissed_pickup_tracker_pill');
    });

    // Mock getOrderById for ID 999999
    await page.route('**/api/orders/999999*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 999999,
          order_number: 'TEST-TRACK-001',
          order_type: 'takeaway',
          table_number: 'PICKUP',
          customer_name: 'David Wong',
          status: 'preparing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          total_amount: '168.00',
          order_items: [
            {
              id: 1,
              quantity: 2,
              unit_price: '84.00',
              total_price: '168.00',
              menu_items: { id: 10, name: 'Chicken Momo (Steam)', category_id: 1 }
            }
          ]
        })
      });
    });

    // Reload page to trigger background active order check
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Floating tracker pill should appear
    const pill = page.getByTestId('floating-order-tracker-pill');
    await expect(pill).toBeVisible({ timeout: 10000 });
    await expect(pill.getByText(/Pick-Up #TEST-TRACK-001/i)).toBeVisible();
    await expect(pill.getByText(/In the Kitchen/i)).toBeVisible();

    // Verify dismiss button hides the pill
    const dismissBtn = page.getByTestId('floating-order-tracker-dismiss');
    await dismissBtn.click();
    await expect(pill).not.toBeVisible();
  });

  test('4. Full Tracking View: Station Split & WhatsApp Share Link', async ({ page }) => {
    // Mock tracking order response for search / direct view
    await page.route('**/api/orders/track*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          count: 1,
          orders: [
            {
              id: 888888,
              order_number: '20261104-999',
              order_type: 'takeaway',
              table_number: 'PICKUP',
              customer_name: 'Anita Sharma',
              status: 'preparing',
              kot_status: 'preparing',
              bot_status: 'ready',
              created_at: new Date().toISOString(),
              total_amount: '228.00',
              special_instructions: '[Pick-Up: ASAP (~20-25 mins) | Tel: 98765432]',
              items: [
                { id: 1, name: 'Butter Chicken', quantity: 1, unit_price: 138, total_price: 138 },
                { id: 2, name: 'Mango Lassi', quantity: 2, unit_price: 45, total_price: 90 }
              ],
              order_items: [
                { id: 1, quantity: 1, unit_price: 138, total_price: 138, menu_items: { name: 'Butter Chicken' } },
                { id: 2, quantity: 2, unit_price: 45, total_price: 90, menu_items: { name: 'Mango Lassi' } }
              ]
            }
          ]
        })
      });
    });

    await page.goto('/track-order?orderNumber=20261104-999&phone=98765432', { waitUntil: 'domcontentloaded' });

    // Live order tracking card must render
    await expect(page.getByRole('heading', { name: /In the Kitchen/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Anita Sharma/i)).toBeVisible();
    await expect(page.getByText(/Butter Chicken/i)).toBeVisible();
    await expect(page.getByText(/Mango Lassi/i)).toBeVisible();

    // Verify WhatsApp 1-click share button
    const whatsappBtn = page.getByTestId('track-whatsapp-share-btn');
    await expect(whatsappBtn).toBeVisible();
    const href = await whatsappBtn.getAttribute('href');
    expect(href).toContain('https://wa.me/?text=');
    expect(href).toContain('20261104-999');

    // Verify Wan Chai direction link
    await expect(page.getByText(/17 Fenwick Street, Wan Chai/i).first()).toBeVisible();
  });
});

