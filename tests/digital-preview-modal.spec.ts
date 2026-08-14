import { test, expect } from '@playwright/test';

test.describe('Digital Preview Modal', () => {
  test('displays preview modal on first visit and dismisses on explore', async ({ page }) => {
    await page.goto('/');

    const modal = page.locator('text=EXCLUSIVE DIGITAL PREVIEW');
    await expect(modal).toBeVisible({ timeout: 10000 });

    await expect(page.locator('text=A Taste of')).toBeVisible();
    await expect(page.locator('text=Explore Sangeet Experience')).toBeVisible();

    await page.locator('button:has-text("Explore Sangeet Experience")').click();
    await expect(modal).not.toBeVisible();

    const flag = await page.evaluate(() => sessionStorage.getItem('sangeet_preview_seen'));
    expect(flag).toBe('true');
  });
});
