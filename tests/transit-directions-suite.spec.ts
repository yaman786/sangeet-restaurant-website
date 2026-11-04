import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = '/Users/amanrana/.gemini/antigravity/brain/751c82c2-540c-4678-8e7d-b6f84eddb98a';

test.describe('Location Page Transit Directions Suite', () => {

  test('1. Desktop View: Getting Here renders accurate Lockhart Road MTR, Tram, and Taxi cards', async ({ page }) => {
    await page.goto('/location', { waitUntil: 'networkidle' });

    const gettingHereHeader = page.locator('text=Getting Here');
    await gettingHereHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600); // let entrance animation complete

    // 1. MTR Card Verification
    const mtrCard = page.locator('[data-testid="transit-mtr"]');
    await expect(mtrCard).toBeVisible();
    await expect(mtrCard).toContainText('Wan Chai Station');
    await expect(mtrCard).toContainText('Exit C or C1 · Lockhart Road');
    await expect(mtrCard).toContainText('Lockhart Road');
    await expect(mtrCard).toContainText('second traffic light at Fenwick Street');

    // 2. Tram Card Verification
    const tramCard = page.locator('[data-testid="transit-tram"]');
    await expect(tramCard).toBeVisible();
    await expect(tramCard).toContainText('Southorn Playground Stop');
    await expect(tramCard).toContainText('Via Luard Road & Lockhart Road');
    await expect(tramCard).toContainText('Luard Road');
    await expect(tramCard).toContainText('Lockhart Road');
    await expect(tramCard).toContainText('first traffic light at Fenwick Street');

    // 3. Taxi / Car Card Verification
    const taxiCard = page.locator('[data-testid="transit-taxicar"]');
    await expect(taxiCard).toBeVisible();
    await expect(taxiCard).toContainText('17 Fenwick Street');
    await expect(taxiCard).toContainText('Direct Drop-Off & Parking');
    await expect(taxiCard).toContainText('Doorstep Access');
    await expect(taxiCard).toContainText('Street-level metered parking');

    // 4. Assert English Only (no Chinese characters in transit cards)
    const allTransitText = await page.locator('[data-testid="transit-options-grid"]').innerText();
    const hasChinese = /[\u4e00-\u9fa5]/.test(allTransitText);
    expect(hasChinese, 'Transit cards must not contain Chinese characters').toBeFalsy();

    // 5. Capture visual snapshot of the grid
    const grid = page.locator('[data-testid="transit-options-grid"]');
    await grid.screenshot({
      path: path.join(ARTIFACT_DIR, 'verified_location_transit_desktop.png'),
    });
    console.log('✅ Desktop transit cards verified and screenshot captured.');
  });

  test('2. Mobile View: Transit cards stack responsively without overflow', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }, // iPhone 14
    });
    const page = await context.newPage();
    await page.goto('/location', { waitUntil: 'networkidle' });

    const gettingHereHeader = page.locator('text=Getting Here');
    await gettingHereHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const mtrCard = page.locator('[data-testid="transit-mtr"]');
    const tramCard = page.locator('[data-testid="transit-tram"]');
    const taxiCard = page.locator('[data-testid="transit-taxicar"]');

    await expect(mtrCard).toBeVisible();
    await expect(tramCard).toBeVisible();
    await expect(taxiCard).toBeVisible();

    // Verify no horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBeFalsy();

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verified_location_transit_mobile.png'),
      fullPage: false,
    });
    console.log('✅ Mobile transit cards verified and screenshot captured.');
    await context.close();
  });
});
