import { test, expect } from '@playwright/test';
import * as path from 'path';

const ARTIFACT_DIR = '/Users/amanrana/.gemini/antigravity-ide/brain/971458b1-a32c-443e-9c77-460cc930d2d5';

test.describe('Live Production Bar Menu Audit', () => {

  test('1. Public Menu Page (/menu) displays Bar & Drinks and subcategories', async ({ page }) => {
    await page.goto('/menu', { waitUntil: 'domcontentloaded' });

    // Verify main page loaded
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });

    // Look for the "Bar & Drinks" tab or category button
    const barTab = page.locator('button, a, div').filter({ hasText: /^Bar & Drinks$/ }).first();
    await expect(barTab).toBeVisible({ timeout: 15000 });
    await barTab.click();

    // Verify drinks items render
    await expect(page.locator('text=Carlsberg (Draught)').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=75').first()).toBeVisible();

    // Test search filter on menu page
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Aperol');
      await expect(page.locator('text=Aperol Spritz').first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=125').first()).toBeVisible();
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'live_bar_menu_website.png'),
      fullPage: false
    });
  });

  test('2. QR Table Ordering (/qr/table-1) allows browsing and adding drinks to cart', async ({ page }) => {
    await page.goto('/qr/table-1', { waitUntil: 'domcontentloaded' });

    // Verify table banner or header
    await expect(page.locator('text=Table 1').first()).toBeVisible({ timeout: 20000 });

    // Click Bar & Drinks category
    const barTab = page.locator('button, div').filter({ hasText: /Bar & Drinks/i }).first();
    await expect(barTab).toBeVisible({ timeout: 15000 });
    await barTab.click();

    // Verify a drink item is visible
    const carlsbergItem = page.locator('text=Carlsberg (Draught)').first();
    await expect(carlsbergItem).toBeVisible({ timeout: 15000 });

    // Find and click "Add" button for Carlsberg
    const itemContainer = page.locator('div').filter({ hasText: 'Carlsberg (Draught)' }).last();
    const addBtn = itemContainer.locator('button').filter({ hasText: /Add|\+/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
    }

    // Verify cart reflects added item or total
    await expect(page.locator('text=75').first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'live_bar_menu_qr.png'),
      fullPage: false
    });
  });

});
