import { test } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = '/Users/amanrana/.gemini/antigravity/brain/751c82c2-540c-4678-8e7d-b6f84eddb98a';

test('Capture Screenshots for Order Tracking Suite', async ({ page }) => {
  // 1. Search UI Desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/track-order', { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'track_order_search_desktop_1440px.png'), fullPage: false });

  // 2. Search UI Mobile (390px)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'track_order_search_mobile_390px.png'), fullPage: false });

  // 3. Live Active Order with WhatsApp Share & Station Split
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
            order_number: '20261104-001',
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
              { id: 1, name: 'Butter Chicken', quantity: 1, unit_price: 138, total_price: 138, section: 'food', category: 'Curries' },
              { id: 2, name: 'Mango Lassi', quantity: 2, unit_price: 45, total_price: 90, section: 'drinks', category: 'Beverages' }
            ],
            order_items: [
              { id: 1, quantity: 1, unit_price: 138, total_price: 138, menu_items: { name: 'Butter Chicken', section: 'food', category: 'Curries' } },
              { id: 2, quantity: 2, unit_price: 45, total_price: 90, menu_items: { name: 'Mango Lassi', section: 'drinks', category: 'Beverages' } }
            ]
          }
        ]
      })
    });
  });

  await page.goto('/track-order?orderNumber=20261104-001&phone=98765432', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'track_order_active_mobile_390px.png'), fullPage: false });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'track_order_active_desktop_1440px.png'), fullPage: false });

  // 4. Floating Tracker Pill on Homepage
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('orderId_PICKUP', '888888');
    localStorage.setItem('orderNumber_PICKUP', '20261104-001');
    localStorage.setItem('customer_PICKUP', 'Anita Sharma');
    sessionStorage.removeItem('dismissed_pickup_tracker_pill');
  });

  await page.route('**/api/orders/888888*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 888888,
        order_number: '20261104-001',
        order_type: 'takeaway',
        table_number: 'PICKUP',
        customer_name: 'Anita Sharma',
        status: 'preparing',
        created_at: new Date().toISOString(),
        total_amount: '228.00'
      })
    });
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'homepage_with_floating_tracker_pill_desktop.png'), fullPage: false });
});
