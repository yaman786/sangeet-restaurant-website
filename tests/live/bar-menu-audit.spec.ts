
import 'dotenv/config';
import { test, expect } from '@playwright/test';
import * as path from 'path';
import jwt from 'jsonwebtoken';
import { prisma } from '../../src/lib/db';

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.join(process.cwd(), 'test-results');

test.use({ baseURL: process.env.BASE_URL || 'https://www.sangeet.hk' });

test.describe('Live Production Bar Menu Audit & End-to-End Guest QR Order Flow', () => {
  test.setTimeout(90000);

  test.afterAll(async () => {
    await prisma.orders.deleteMany({
      where: { customer_name: 'Bar Audit Guest' }
    });
    await prisma.$disconnect();
  });

  test('1. Public Menu Page (/menu) strictly separates Food Menu and Bar & Drinks via two-way toggle', async ({ page }) => {
    await page.goto('/menu', { waitUntil: 'networkidle' });

    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });

    // Default state: Food Menu is active, drinks are NOT mixed into Food Menu
    await expect(page.getByTestId('public-menu-food')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('h3', { hasText: 'Butter Chicken' }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h3', { hasText: 'Carlsberg (Draught)' })).toHaveCount(0);

    // Switch to Bar & Drinks via the two-way toggle
    const barTab = page.getByTestId('public-menu-drinks');
    await expect(barTab).toBeVisible({ timeout: 15000 });
    await barTab.click();

    // Ensure React hydration processed the click
    const allBarSubTab = page.getByRole('button', { name: 'All Bar & Drinks', exact: true });
    if (!(await allBarSubTab.isVisible())) {
      await barTab.click();
    }

    // Verify subcategory filter tabs appear and Food items are hidden
    await expect(allBarSubTab).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Draught Beers', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bottled Beers & Cider', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Whisky & Bourbon', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Spirits (Rum, Vodka, Gin, Tequila)', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cocktails', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Champagne', exact: true })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Butter Chicken' })).toHaveCount(0);

    // Verify drinks items render
    await expect(page.locator('text=Carlsberg (Draught)').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Guinness (Draught)').first()).toBeVisible();

    // Verify no "Veg" badges appear on Bar & Drinks items
    await expect(page.locator('.badge-veg')).toHaveCount(0);

    // Filter to Whisky & Bourbon and verify Shot + Bottle are unified into 1 card with switcher
    await page.getByRole('button', { name: 'Whisky & Bourbon', exact: true }).click();
    const chivasCard = page.locator('div.group').filter({ has: page.locator('h3', { hasText: 'Chivas Regal 12yrs' }) });
    await expect(chivasCard).toHaveCount(1);
    await expect(chivasCard.locator('[data-testid^="public-serving-switcher-"]')).toBeVisible();
    await expect(chivasCard.getByRole('button', { name: /Shot.*\$88/i })).toBeVisible();
    await expect(chivasCard.getByRole('button', { name: /Bottle.*\$1788/i })).toBeVisible();

    // Switch back to All Bar & Drinks for the overview screenshot
    await page.getByRole('button', { name: 'All Bar & Drinks', exact: true }).click();

    // Scroll so both the category filter bar and the first row of drink cards are clearly visible
    await page.evaluate(() => window.scrollTo({ top: 320, behavior: 'instant' }));

    // Wait for visible drink images to finish loading and verify naturalWidth > 0
    await page.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll('img')).slice(1, 7) as HTMLImageElement[];
      return imgs.length >= 4 && imgs.every((img) => img.complete && img.naturalWidth > 0);
    }, { timeout: 15000 });

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'live_bar_menu_website.png'),
      fullPage: false
    });
  });

  test('2. QR Table Ordering (/qr/table-1) separates Food Menu vs Bar & Drinks and completes full guest drink order flow', async ({ page }) => {
    // Clean up any leftover test orders from prior runs
    await prisma.orders.deleteMany({
      where: { customer_name: 'Bar Audit Guest' }
    });

    await page.goto('/qr/table-1', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('text=Table 1').first()).toBeVisible({ timeout: 20000 });

    // Default state: Food Menu is active, drinks are NOT mixed into All Offerings
    await expect(page.getByTestId('qr-menu-food')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('h3', { hasText: 'Butter Chicken' }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h3', { hasText: 'Carlsberg (Draught)' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Draught Beers', exact: true })).toHaveCount(0);

    // Click Bar & Drinks two-way toggle
    const barTab = page.getByTestId('qr-menu-drinks');
    await expect(barTab).toBeVisible({ timeout: 15000 });
    await barTab.click();

    // Now the Bar subcategory pill bar should be visible and Food items hidden
    await expect(page.getByRole('button', { name: 'All Bar & Drinks', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Draught Beers', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cocktails', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Champagne', exact: true })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Butter Chicken' })).toHaveCount(0);

    // Verify Carlsberg (Draught) is visible and wait for drink images to load
    await expect(page.locator('h3', { hasText: 'Carlsberg (Draught)' }).first()).toBeVisible({ timeout: 15000 });
    await page.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll('img')).slice(0, 5) as HTMLImageElement[];
      return imgs.length >= 3 && imgs.every((img) => img.complete && img.naturalWidth > 0);
    }, { timeout: 15000 });

    // Add Carlsberg (Draught) ($75) to order and verify inline quantity stepper appears
    const carlsbergCard = page.locator('div.group').filter({ has: page.locator('h3', { hasText: 'Carlsberg (Draught)' }) }).first();
    await carlsbergCard.getByRole('button', { name: /Add to Order/i }).click();
    await expect(carlsbergCard.locator('[data-testid^="qr-stepper-"]')).toBeVisible({ timeout: 5000 });
    await expect(carlsbergCard.locator('[data-testid^="qr-card-qty-badge-"]')).toBeVisible({ timeout: 5000 });

    // Filter to Whisky & Bourbon, verify unified Shot | Bottle card
    await page.getByRole('button', { name: 'Whisky & Bourbon', exact: true }).click();
    const qrChivasCard = page.locator('div.group').filter({ has: page.locator('h3', { hasText: 'Chivas Regal 12yrs' }) });
    await expect(qrChivasCard).toHaveCount(1);
    await expect(qrChivasCard.locator('[data-testid^="qr-select-shot-"]')).toContainText('Shot · $88');
    await expect(qrChivasCard.locator('[data-testid^="qr-select-bottle-"]')).toContainText('Bottle · $1788');
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
    await page.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll('img')).slice(0, 3) as HTMLImageElement[];
      return imgs.length >= 3 && imgs.every((img) => img.complete && img.naturalWidth > 0);
    }, { timeout: 15000 });
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'live_qr_whisky_shot_bottle.png'),
      fullPage: false
    });

    // Filter to Cocktails subcategory and add Aperol Spritz ($125)
    await page.getByRole('button', { name: 'Cocktails', exact: true }).click();
    await expect(page.locator('h3', { hasText: 'Aperol Spritz' }).first()).toBeVisible({ timeout: 10000 });
    const aperolCard = page.locator('div.group').filter({ has: page.locator('h3', { hasText: 'Aperol Spritz' }) }).first();
    await aperolCard.getByRole('button', { name: /Add to Order/i }).click();

    // Switch back to All Bar & Drinks for the overview screenshot with 2 items ($200.00) in cart bar
    await page.getByRole('button', { name: 'All Bar & Drinks', exact: true }).click();
    await expect(page.locator('text=2 Items').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=$200.00').first()).toBeVisible();

    // Scroll so the sticky category bar, drink cards with images & inline stepper, and floating cart bar are all visible
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
    await page.waitForFunction(() => {
      const cards = Array.from(document.querySelectorAll('div.group')).slice(0, 3) as HTMLElement[];
      const imgs = Array.from(document.querySelectorAll('img')).slice(0, 3) as HTMLImageElement[];
      return (
        cards.length >= 3 &&
        cards.every((c) => parseFloat(window.getComputedStyle(c).opacity) >= 0.99) &&
        imgs.length >= 3 &&
        imgs.every((img) => img.complete && img.naturalWidth > 0)
      );
    }, { timeout: 15000 });

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'live_bar_menu_qr.png'),
      fullPage: false
    });

    // Switch back to Food Menu and add Butter Chicken so the cart has both Food (Kitchen) and Bar & Drinks items
    await page.getByTestId('qr-menu-food').click();
    const butterChickenCard = page.locator('div.group').filter({ has: page.locator('h3', { hasText: 'Butter Chicken' }) }).first();
    await expect(butterChickenCard).toBeVisible({ timeout: 10000 });
    await butterChickenCard.getByRole('button', { name: /Add to Order/i }).click();
    await expect(page.locator('text=3 Items').first()).toBeVisible({ timeout: 10000 });

    // Click floating cart bar to proceed to checkout (/qr/table-1/cart)
    await page.locator('button').filter({ hasText: 'View your order details' }).click();
    await expect(page).toHaveURL(/\/qr\/table-1\/cart/, { timeout: 15000 });

    // Verify grouped sections: Food Menu (Kitchen) and Bar & Drinks
    await expect(page.getByTestId('qr-cart-food-section')).toBeVisible();
    await expect(page.getByTestId('qr-cart-drinks-section')).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Butter Chicken' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Carlsberg (Draught)' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Aperol Spritz' })).toBeVisible();

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'live_qr_cart_grouped.png'),
      fullPage: true
    });

    // Fill guest name and submit order
    await page.locator('input[placeholder*="Jane Doe"]').fill('Bar Audit Guest');
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Verify redirect to unified guest order tracking dashboard
    await expect(page).toHaveURL(/\/dashboard\?.*orderId=/, { timeout: 25000 });
    const dashboardUrl = new URL(page.url());
    const orderId = dashboardUrl.searchParams.get('orderId');
    expect(orderId).toBeTruthy();

    // Verify order details are shown on the guest dashboard
    await expect(page.locator('text=Bar Audit Guest').first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('text=Carlsberg (Draught)').first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('text=Aperol Spritz').first()).toBeVisible({ timeout: 20000 });
  });

  test('3. Admin Menu Management (/admin/menu-management) separates Food Menu and Bar & Drinks via two-way toggle', async ({ page, baseURL }) => {
    const targetOrigin = baseURL || 'https://www.sangeet.hk';
    const adminUser = await prisma.users.findFirst({
      where: { username: 'admin', role: 'admin' }
    });
    expect(adminUser).toBeTruthy();

    const adminToken = jwt.sign(
      { id: adminUser!.id, username: adminUser!.username, role: 'admin' },
      process.env.JWT_SECRET as string,
      { expiresIn: '30m' }
    );

    await page.context().addCookies([
      {
        name: 'auth_token',
        value: adminToken,
        url: targetOrigin
      }
    ]);

    await page.addInitScript((user) => {
      window.localStorage.setItem('sangeet_user', JSON.stringify(user));
    }, {
      id: adminUser!.id,
      username: adminUser!.username,
      email: adminUser!.email,
      role: 'admin',
      full_name: adminUser!.full_name || 'Administrator'
    });

    await page.goto('/admin/menu-management', { waitUntil: 'domcontentloaded' });

    // Default state: Food Menu tab is active, shows Food Menu Items and hides drinks
    const foodToggle = page.getByTestId('menu-section-food');
    const drinksToggle = page.getByTestId('menu-section-drinks');
    await expect(foodToggle).toBeVisible({ timeout: 20000 });
    await expect(drinksToggle).toBeVisible();
    await expect(foodToggle).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('heading', { name: /Food Menu Items/i })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h3', { hasText: 'Aloo Gobi' }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h3', { hasText: '1664 Blanc (Draught)' })).toHaveCount(0);

    // Switch to Bar & Drinks
    await drinksToggle.click();
    await expect(drinksToggle).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('heading', { name: /Bar & Drinks Items/i })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h3', { hasText: '1664 Blanc (Draught)' }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('h3', { hasText: 'Aloo Gobi' })).toHaveCount(0);

    // Search for Chivas Regal in Admin to verify unified card with Shot & Bottle badges
    const adminSearchInput = page.locator('input[placeholder="Search drinks..."]');
    await adminSearchInput.fill('Chivas Regal');
    const adminChivasCard = page.locator('div.bg-sangeet-neutral-900').filter({ has: page.locator('h3', { hasText: 'Chivas Regal 12yrs' }) }).first();
    await expect(adminChivasCard).toBeVisible({ timeout: 10000 });
    await expect(adminChivasCard.locator('text=Shot: $88')).toBeVisible();
    await expect(adminChivasCard.locator('text=Bottle: $1788')).toBeVisible();

    // Scroll so the unified drink cards and Shot/Bottle badges are clearly visible in the screenshot
    await page.evaluate(() => window.scrollTo({ top: 280, behavior: 'instant' }));

    // Wait for visible drink images in Admin Menu Management to finish loading
    await page.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll('img')).slice(0, 1) as HTMLImageElement[];
      return imgs.length >= 1 && imgs.every((img) => img.complete && img.naturalWidth > 0);
    }, { timeout: 15000 });

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'live_admin_menu_management_drinks.png'),
      fullPage: false
    });

    await adminSearchInput.fill('');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

    // Click "+ Add Drink Item" and verify streamlined drink modal (Shot & Full Bottle pricing by default, no Prep Time / Veg / Spicy)
    await page.getByRole('button', { name: /Add Drink Item/i }).click();
    await expect(page.getByRole('heading', { name: /Add Drink Item/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('serving-mode-shot-bottle')).toBeVisible();
    await expect(page.getByTestId('serving-mode-bottle-only')).toBeVisible();
    await expect(page.getByTestId('serving-mode-single')).toBeVisible();
    await expect(page.getByTestId('serving-mode-shot-bottle')).toHaveClass(/bg-sangeet-400/);
    await expect(page.getByTestId('input-shot-price')).toBeVisible();
    await expect(page.getByTestId('input-bottle-price')).toBeVisible();

    // Verify Preparation Time, Vegetarian, and Spicy are NOT rendered in the Add Drink Item modal
    const modalForm = page.locator('form');
    await expect(modalForm.locator('text=Preparation Time (minutes)')).toHaveCount(0);
    await expect(modalForm.locator('span', { hasText: 'Vegetarian' })).toHaveCount(0);
    await expect(modalForm.locator('span', { hasText: 'Spicy' })).toHaveCount(0);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'live_admin_add_drink_modal.png'),
      fullPage: false
    });
  });

});
