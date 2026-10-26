import { test, expect } from '@playwright/test';

test.describe('Production Public Direct Access Verification (Lock Removed)', () => {
  test('Localhost loads live website without lock screen', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    await page.waitForTimeout(1000);

    // Headline on the public page should be directly visible
    const headline = page.locator('h1', { hasText: 'South Asian Fine Dining in Wan Chai' });
    await expect(headline).toBeVisible({ timeout: 15000 });

    // Lock overlay should NOT be present
    const lockScreen = page.locator('text=Grand Opening • Coming Soon');
    await expect(lockScreen).not.toBeVisible();
  });

  test('Simulated production domain (sangeet.hk) loads live website directly without lock screen', async ({ page }) => {
    // Mock hostname to production sangeet.hk
    await page.addInitScript(() => {
      Object.defineProperty(window, 'location', {
        value: new URL('https://sangeet.hk/'),
        configurable: true,
      });
    });

    await page.goto('/', { waitUntil: 'commit' });

    // Live site headline must be directly visible to customers
    const headline = page.locator('h1', { hasText: 'South Asian Fine Dining in Wan Chai' });
    await expect(headline).toBeVisible({ timeout: 15000 });

    // Lock screen elements should NOT be visible
    const lockBadge = page.locator('text=Grand Opening • Coming Soon');
    await expect(lockBadge).not.toBeVisible();
  });

  test('Admin routes are completely accessible', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*admin\/login/);
  });

  test('Kitchen display routes are completely accessible', async ({ page }) => {
    await page.goto('/kitchen/login', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*kitchen\/login/);
  });
});
