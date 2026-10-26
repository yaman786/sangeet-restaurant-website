import { test, expect } from '@playwright/test';

const LOCK_TEXT = 'Grand Opening • Coming Soon';

test.describe('Live production — public access (lock screen removed)', () => {
  test('Homepage loads with hero headline and no lock screen', async ({ page }) => {
    const res = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBeLessThan(400);

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(LOCK_TEXT)).toHaveCount(0);
  });

  test('Lock stays gone without any unlock param or localStorage flag', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.removeItem('sangeet_dev_unlock'));
    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(LOCK_TEXT)).toHaveCount(0);
  });

  for (const path of ['/menu', '/reservations', '/about', '/contact']) {
    test(`Public page ${path} loads without lock screen`, async ({ page }) => {
      const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(res?.status()).toBeLessThan(400);
      await expect(page.locator('header').first()).toBeVisible({ timeout: 20_000 });
      await expect(page.getByText(LOCK_TEXT)).toHaveCount(0);
    });
  }

  test('Staff login page is reachable', async ({ page }) => {
    const res = await page.goto('/login', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/login/);
  });
});
