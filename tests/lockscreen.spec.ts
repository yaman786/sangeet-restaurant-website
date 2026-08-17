import { test, expect } from '@playwright/test';

test.describe('Grand Opening Full Lock Screen & Bypass Verification', () => {
  test('Localhost auto-bypasses lock screen for developers', async ({ page }) => {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Headline on the public page should be directly visible
    const headline = page.locator('h1', { hasText: 'A Symphony of South Asian Gastronomy' });
    await expect(headline).toBeVisible();

    // No full-screen lock overlay blocking interaction
    const lockScreen = page.locator('text=Grand Opening • Coming Soon');
    await expect(lockScreen).not.toBeVisible();
  });

  test('Admin routes are completely accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*admin\/login/);
  });

  test('Kitchen display routes are completely accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/kitchen/login', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*kitchen\/login/);
  });

  test('Simulated production domain displays full un-dismissible lock screen', async ({ page }) => {
    // Mock hostname to production sangeet.hk
    await page.addInitScript(() => {
      Object.defineProperty(window, 'location', {
        value: new URL('https://sangeet.hk/'),
        configurable: true,
      });
    });

    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Lock screen elements should be visible
    const lockBadge = page.locator('text=Grand Opening • Coming Soon');
    await expect(lockBadge).toBeVisible();

    const lockTitle = page.locator('text=A Symphony of South Asian Gastronomy');
    await expect(lockTitle).toBeVisible();

    // There should be NO close (X) button
    const closeBtn = page.locator('button[aria-label="Close preview"]');
    await expect(closeBtn).not.toBeVisible();
  });
});
