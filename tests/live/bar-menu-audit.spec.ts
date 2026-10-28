import 'dotenv/config';
import { test, expect } from '@playwright/test';
import * as path from 'path';
import jwt from 'jsonwebtoken';

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.join(process.cwd(), 'test-results');

test.use({ baseURL: process.env.BASE_URL || 'https://www.sangeet.hk' });

test.describe('Live Production Bar Menu Audit & End-to-End Guest QR Order Flow', () => {

  test('1. Public Menu Page (/menu) displays Bar & Drinks, subcategories, and matched drink stock images without Veg badges', async ({ page }) => {
    await page.goto('/menu', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });

    const barTab = page.getByRole('button', { name: 'Bar & Drinks', exact: true });
    await expect(barTab).toBeVisible({ timeout: 15000 });
    await barTab.click();

    // Verify subcategory filter tabs appear
    await expect(page.getByRole('button', { name: 'All Bar & Drinks', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Draught Beers', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bottled Beers & Cider', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Whisky & Bourbon', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Spirits (Rum, Vodka, Gin, Tequila)', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cocktails', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Champagne', exact: true })).toBeVisible();

    // Verify drinks items render
    await expect(page.locator('text=Carlsberg (Draught)').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Guinness (Draught)').first()).toBeVisible();

    // Verify no "Veg" badges appear on Bar & Drinks items
    await expect(page.locator('.badge-veg')).toHaveCount(0);

    // Wait for visible drink images to finish loading and verify naturalWidth > 0
    await page.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll('img')).slice(1, 7) as HTMLImageElement[];
      return imgs.length >= 4 && imgs.every((img) => img.complete && img.naturalWidth > 0);
    }, { timeout: 15000 });

    // Scroll so both the category filter bar and the first row of drink cards are clearly visible
    await page.evaluate(() => window.scrollTo({ top: 320, behavior: 'instant' }));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'live_bar_menu_website.png'),
      fullPage: false
    });
  });

  test('2. QR Table Ordering (/qr/table-1) displays two-tier Bar & Drinks filter, matched images, and completes full guest drink order flow', async ({ page }) => {
    await page.goto('/qr/table-1', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('text=Table 1').first()).toBeVisible({ timeout: 20000 });

    // Before clicking Bar & Drinks, subcategories like "Draught Beers" should NOT be in the top-level pill bar
    await expect(page.getByRole('button', { name: 'Draught Beers', exact: true })).toHaveCount(0);

    // Click Bar & Drinks category pill
    const barTab = page.getByRole('button', { name: 'Bar & Drinks', exact: true });
    await expect(barTab).toBeVisible({ timeout: 15000 });
    await barTab.click();

    // Now the secondary subcategory pill bar should be visible
    await expect(page.getByRole('button', { name: 'All Bar & Drinks', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Draught Beers', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cocktails', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Champagne', exact: true })).toBeVisible();

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
      const imgs = Array.from(document.querySelectorAll('img')).slice(0, 3) as HTMLImageElement[];
      return imgs.length >= 2 && imgs.every((img) => img.complete && img.naturalWidth > 0);
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
    await expect(page).toHaveURL(/\/dashboard\?.*orderId=/, { timeout: 20000 });
    const dashboardUrl = new URL(page.url());
    const orderId = dashboardUrl.searchParams.get('orderId');
    expect(orderId).toBeTruthy();

    // Verify order details are shown on the guest dashboard
    await expect(page.locator('text=Carlsberg (Draught)').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Aperol Spritz').first()).toBeVisible();

    // Clean up the test order so Table 1 stays clean
    if (orderId && process.env.JWT_SECRET) {
      const adminToken = jwt.sign(
        { id: 1, username: 'admin', role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );
      await page.context().addCookies([
        {
          name: 'auth_token',
          value: adminToken,
          url: dashboardUrl.origin
        }
      ]);
      const delRes = await page.request.delete(`${dashboardUrl.origin}/api/orders/${orderId}`);
      expect(delRes.ok()).toBeTruthy();
    }
  });

});
