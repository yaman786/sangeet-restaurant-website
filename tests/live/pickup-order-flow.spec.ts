import { test, expect } from '@playwright/test';
import path from 'path';

const LIVE_URL = 'https://www.sangeet.hk';
const ARTIFACT_DIR =
  '/Users/amanrana/.gemini/antigravity/brain/751c82c2-540c-4678-8e7d-b6f84eddb98a';

test.describe('Live Online Pick-Up Ordering E2E Flow', () => {
  test.setTimeout(90000);

  test('Full Pick-Up Journey: CTA -> /pickup Menu (Food + Bar) -> /pickup/cart -> Live Tracking', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // 1. Verify Homepage Hero Pick-Up CTA & Public Menu Pick-Up CTA
    await page.goto(LIVE_URL, { waitUntil: 'networkidle' });
    const heroPickupBtn = page.getByTestId('hero-pickup-cta');
    await expect(heroPickupBtn).toBeVisible({ timeout: 15000 });

    await page.goto(`${LIVE_URL}/menu`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('menu-pickup-cta')).toBeVisible({ timeout: 15000 });

    // 2. Navigate to /pickup via Public Menu Link CTA
    await page.getByTestId('menu-pickup-cta').click();
    await page.waitForURL(/\/pickup/, { timeout: 15000 });

    await expect(page.locator('h1')).toContainText('Pick-Up');
    await expect(page.getByText('17 Fenwick Street, Wan Chai, HK')).toBeVisible();

    // Check zero horizontal overflow on mobile 390px
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);

    // 3. Add a Food item (Butter Chicken) on /pickup and test inline stepper
    const butterChickenCard = page
      .locator('div.group')
      .filter({ has: page.locator('h3', { hasText: 'Butter Chicken' }) })
      .first();
    await expect(butterChickenCard).toBeVisible({ timeout: 15000 });
    await butterChickenCard.getByRole('button', { name: /Add to Order/i }).click();

    const butterChickenStepper = butterChickenCard.locator('[data-testid^="qr-stepper-"]');
    await expect(butterChickenStepper).toBeVisible({ timeout: 5000 });
    await expect(butterChickenStepper).toContainText('1 in Order');

    // 4. Switch to Bar & Drinks and add Whisky (Shot + Bottle)
    const drinksTab = page.getByTestId('qr-menu-drinks');
    await expect(drinksTab).toBeVisible();
    await drinksTab.click();

    await page.getByRole('button', { name: /Whisk/i }).first().click();
    const chivasCard = page
      .locator('div.group')
      .filter({ has: page.locator('h3', { hasText: 'Chivas Regal 12yrs' }) })
      .first();
    await expect(chivasCard).toBeVisible({ timeout: 10000 });

    const shotPill = chivasCard.locator('[data-testid^="qr-select-shot-"]');
    const bottlePill = chivasCard.locator('[data-testid^="qr-select-bottle-"]');
    await shotPill.click();
    await chivasCard.getByRole('button', { name: /Add Shot to Order/i }).click();

    await bottlePill.click();
    await chivasCard.getByRole('button', { name: /Add Bottle to Order/i }).click();

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pickup_flow_1_menu.png'),
      fullPage: false,
    });

    // 5. Open Pick-Up Cart via floating bar
    const floatingCartBtn = page.getByTestId('pickup-floating-cart-btn');
    await expect(floatingCartBtn).toBeVisible({ timeout: 10000 });
    await floatingCartBtn.click();

    await page.waitForURL(/\/pickup\/cart/, { timeout: 15000 });

    // 6. Verify Grouped Food & Drinks sections on /pickup/cart
    await expect(page.getByTestId('pickup-cart-food-section')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('pickup-cart-drinks-section')).toBeVisible({ timeout: 10000 });

    // 7. Fill Pick-Up Guest Details
    await page.getByTestId('pickup-name-input').fill('Playwright PickUp Guest');
    await page.getByTestId('pickup-phone-input').fill('+852 9876 5432');
    await page.getByTestId('pickup-time-asap').click();
    await page.getByTestId('pickup-no-cutlery-toggle').click();
    await page.getByTestId('pickup-instructions-input').fill('Extra mint sauce please');

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pickup_flow_2_checkout.png'),
      fullPage: true,
    });

    // 8. Submit Pick-Up Order & verify 201 Created response
    const orderResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/api/orders') && res.request().method() === 'POST',
      { timeout: 25000 }
    );

    await page.getByTestId('pickup-submit-order-btn').click();
    const orderResponse = await orderResponsePromise;
    expect(orderResponse.status()).toBe(201);

    const responseBody = await orderResponse.json();
    expect(responseBody?.order?.id).toBeTruthy();
    expect(responseBody?.order?.order_type).toBe('takeaway');
    expect(responseBody?.order?.table_number).toBe('PICKUP');

    // 9. Verify Live Order Tracking on /dashboard?table=PICKUP
    await page.waitForURL(/\/dashboard\?.*table=PICKUP/, { timeout: 20000 });
    await expect(page.getByText(/Self Pick-Up/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Playwright PickUp Guest/i).first()).toBeVisible();
    await expect(page.getByText(/\+852 9876 5432/i).first()).toBeVisible();

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pickup_flow_3_tracking.png'),
      fullPage: true,
    });
  });
});

