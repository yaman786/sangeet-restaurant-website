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

    // Add Carlsberg (Draught) ($75) to order
    const carlsbergCard = page.locator('div.group').filter({ has: page.locator('h3', { hasText: 'Carlsberg (Draught)' }) }).first();
    await carlsbergCard.getByRole('button', { name: /Add to Order/i }).click();

    // Filter to Cocktails subcategory and add Aperol Spritz ($125)
    await page.getByRole('button', { name: 'Cocktails', exact: true }).click();
    await expect(page.locator('h3', { hasText: 'Aperol Spritz' }).first()).toBeVisible({ timeout: 10000 });
    const aperolCard = page.locator('div.group').filter({ has: page.locator('h3', { hasText: 'Aperol Spritz' }) }).first();
    await aperolCard.getByRole('button', { name: /Add to Order/i }).click();

    // Switch back to All Bar & Drinks for the overview screenshot with 2 items ($200.00) in cart bar
    await page.getByRole('button', { name: 'All Bar & Drinks', exact: true }).click();
    await expect(page.locator('text=2 Items').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=$200.00').first()).toBeVisible();

    // Scroll so the sticky category bar, drink cards with images, and floating cart bar are all visible
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

    // Click floating cart bar to proceed to checkout (/qr/table-1/cart)
    await page.locator('button').filter({ hasText: 'View your order details' }).click();
    await expect(page).toHaveURL(/\/qr\/table-1\/cart/, { timeout: 15000 });

    // Verify both drinks are listed in cart
    await expect(page.locator('h3', { hasText: 'Carlsberg (Draught)' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Aperol Spritz' })).toBeVisible();

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

    // Wait for visible drink images in Admin Menu Management to finish loading
    await page.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll('img')).slice(0, 3) as HTMLImageElement[];
      return imgs.length >= 3 && imgs.every((img) => img.complete && img.naturalWidth > 0);
    }, { timeout: 15000 });

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'live_admin_menu_management_drinks.png'),
      fullPage: false
    });
  });

});
