import 'dotenv/config';
import { test, expect } from '@playwright/test';
import * as path from 'path';
import { prisma } from '../../src/lib/db';

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.join(process.cwd(), 'test-results');

test.use({
  baseURL: process.env.BASE_URL || 'https://www.sangeet.hk',
  viewport: { width: 390, height: 844 }, // Mobile device: iPhone 14
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
});

test.describe('Complete Live Guest QR Ordering Flow: Scan -> Food -> Drinks (Shot/Bottle) -> Grouped Cart -> Place Order -> Tracking Dashboard', () => {
  test.setTimeout(120000);

  const TEST_GUEST_NAME = 'E2E Guest Explorer';

  test.afterAll(async () => {
    // Clean up any orders created during this test
    await prisma.orders.deleteMany({
      where: { customer_name: TEST_GUEST_NAME }
    });
    await prisma.$disconnect();
  });

  test('Full Guest Journey from QR Scan to Live Tracking Dashboard', async ({ page }) => {
    // -------------------------------------------------------------
    // Step 1: Guest scans Table 1 QR Code (/qr/table-1)
    // -------------------------------------------------------------
    console.log('📱 Step 1: Navigating to Table 1 QR page (/qr/table-1)...');
    await page.goto('/qr/table-1', { waitUntil: 'domcontentloaded' });

    // Verify Table 1 header badge
    await expect(page.locator('text=Table 1').first()).toBeVisible({ timeout: 20000 });

    // Verify Food Menu is active by default
    const foodTab = page.getByTestId('qr-menu-food');
    const drinksTab = page.getByTestId('qr-menu-drinks');
    await expect(foodTab).toBeVisible();
    await expect(drinksTab).toBeVisible();
    await expect(foodTab).toHaveAttribute('aria-selected', 'true');

    // -------------------------------------------------------------
    // Step 2: Browse Food Menu & Add Dishes with Inline Stepper
    // -------------------------------------------------------------
    console.log('🍛 Step 2: Adding Food items (Butter Chicken) and adjusting quantities...');
    const butterChickenCard = page.locator('div.group').filter({ has: page.locator('h3', { hasText: 'Butter Chicken' }) }).first();
    await expect(butterChickenCard).toBeVisible({ timeout: 15000 });

    // Add Butter Chicken to order
    const addButterChickenBtn = butterChickenCard.getByRole('button', { name: /Add to Order/i });
    await addButterChickenBtn.click();

    // Verify inline stepper appears on the card
    const butterChickenStepper = butterChickenCard.locator('[data-testid^="qr-stepper-"]');
    await expect(butterChickenStepper).toBeVisible({ timeout: 5000 });
    await expect(butterChickenStepper).toContainText('1 in Order');

    // Increment quantity via inline stepper button
    const incrementBtn = butterChickenCard.locator('[data-testid^="qr-increment-"]');
    await incrementBtn.click();
    await expect(butterChickenStepper).toContainText('2 in Order');

    // Verify floating bottom cart bar is visible with 2 items
    const floatingCartBar = page.locator('button').filter({ hasText: 'View your order details' });
    await expect(floatingCartBar).toBeVisible({ timeout: 5000 });
    await expect(floatingCartBar).toContainText('2 Items');

    // -------------------------------------------------------------
    // Step 3: Switch to Bar & Drinks Menu
    // -------------------------------------------------------------
    console.log('🍷 Step 3: Switching to Bar & Drinks menu...');
    await drinksTab.click();

    // Verify subcategory pills appear
    await expect(page.getByRole('button', { name: 'All Bar & Drinks', exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Draught Beers', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Whisky & Bourbon', exact: true })).toBeVisible();

    // -------------------------------------------------------------
    // Step 4: Add Draught Beer (Single Serving)
    // -------------------------------------------------------------
    console.log('🍺 Step 4: Adding Carlsberg (Draught)...');
    await page.getByRole('button', { name: 'Draught Beers', exact: true }).click();
    const carlsbergCard = page.locator('div.group').filter({ has: page.locator('h3', { hasText: 'Carlsberg (Draught)' }) }).first();
    await expect(carlsbergCard).toBeVisible({ timeout: 10000 });
    await carlsbergCard.getByRole('button', { name: /Add to Order/i }).click();

    // Verify cart now shows 3 items
    await expect(floatingCartBar).toContainText('3 Items');

    // -------------------------------------------------------------
    // Step 5: Test Shot vs. Full Bottle Serving Mathematics
    // -------------------------------------------------------------
    console.log('🥃 Step 5: Adding Whisky with Shot and Full Bottle selection...');
    await page.getByRole('button', { name: 'Whisky & Bourbon', exact: true }).click();
    const chivasCard = page.locator('div.group').filter({ has: page.locator('h3', { hasText: 'Chivas Regal 12yrs' }) }).first();
    await expect(chivasCard).toBeVisible({ timeout: 10000 });

    const shotPill = chivasCard.locator('[data-testid^="qr-select-shot-"]');
    const bottlePill = chivasCard.locator('[data-testid^="qr-select-bottle-"]');
    await expect(shotPill).toContainText('Shot · $88');
    await expect(bottlePill).toContainText('Bottle · $1788');

    // 1. Select Shot and click "Add Shot to Order"
    await shotPill.click();
    await chivasCard.getByRole('button', { name: /Add Shot to Order/i }).click();

    // 2. Switch to Bottle and click "Add Bottle to Order"
    await bottlePill.click();
    await chivasCard.getByRole('button', { name: /Add Bottle to Order/i }).click();

    // Verify floating cart bar has 5 items now (2 Butter Chicken, 1 Carlsberg, 1 Chivas Shot, 1 Chivas Bottle)
    await expect(floatingCartBar).toContainText('5 Items');

    // Capture screenshot of the QR menu with active cart bar
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'guest_flow_1_menu_with_cart.png'),
      fullPage: false
    });

    // -------------------------------------------------------------
    // Step 6: Review Cart (/qr/table-1/cart) with Grouped Sections
    // -------------------------------------------------------------
    console.log('🛒 Step 6: Proceeding to Cart review page...');
    await floatingCartBar.click();
    await expect(page).toHaveURL(/\/qr\/table-1\/cart/, { timeout: 15000 });

    // Verify grouped sections
    const kitchenSection = page.getByTestId('qr-cart-food-section');
    const barSection = page.getByTestId('qr-cart-drinks-section');
    await expect(kitchenSection).toBeVisible({ timeout: 10000 });
    await expect(barSection).toBeVisible({ timeout: 10000 });

    // Verify items in their respective sections
    await expect(kitchenSection.locator('h3', { hasText: 'Butter Chicken' })).toBeVisible();
    await expect(barSection.locator('h3', { hasText: 'Carlsberg (Draught)' })).toBeVisible();
    await expect(barSection.locator('h3', { hasText: 'Chivas Regal 12yrs (Shot)' })).toBeVisible();
    await expect(barSection.locator('h3', { hasText: 'Chivas Regal 12yrs (Bottle)' })).toBeVisible();

    // Capture screenshot of the grouped cart
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'guest_flow_2_grouped_cart.png'),
      fullPage: true
    });

    // -------------------------------------------------------------
    // Step 7: Fill Guest Information & Place Order
    // -------------------------------------------------------------
    console.log('✍️ Step 7: Filling guest details and placing order...');
    const nameInput = page.locator('input[placeholder*="Jane Doe"], input[placeholder*="your name" i]').first();
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill(TEST_GUEST_NAME);

    const notesInput = page.locator('input[placeholder*="Allergies"], textarea[placeholder*="special" i], input[placeholder*="preferences" i]').first();
    if (await notesInput.isVisible()) {
      await notesInput.fill('No nuts, extra spicy curry, lime with drinks');
    }

    // Intercept order creation API response
    const orderResponsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/orders') && resp.request().method() === 'POST',
      { timeout: 30000 }
    );

    // Click Place Order
    const placeOrderBtn = page.getByRole('button', { name: /Place Order/i });
    await expect(placeOrderBtn).toBeEnabled();
    await placeOrderBtn.click();

    // Assert API returned 201 Created
    const orderResponse = await orderResponsePromise;
    expect([200, 201]).toContain(orderResponse.status());
    const responseJson = await orderResponse.json();
    const createdOrder = responseJson.order || responseJson;
    console.log(`✅ Live order created successfully: Order Number = ${createdOrder.order_number || createdOrder.id}`);

    // -------------------------------------------------------------
    // Step 8: Live Guest Tracking Dashboard (/dashboard?orderId=...)
    // -------------------------------------------------------------
    console.log('📊 Step 8: Verifying live guest order tracking dashboard...');
    await expect(page).toHaveURL(/\/dashboard\?.*orderId=/, { timeout: 30000 });

    // Verify guest dashboard shows the order details
    await expect(page.locator(`text=${TEST_GUEST_NAME}`).first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('text=Butter Chicken').first()).toBeVisible();
    await expect(page.locator('text=Carlsberg (Draught)').first()).toBeVisible();

    // Capture screenshot of the guest tracking dashboard
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'guest_flow_3_tracking_dashboard.png'),
      fullPage: true
    });

    console.log('🎉 Full guest journey verified 100% end-to-end on live production!');
  });
});
