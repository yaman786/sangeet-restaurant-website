import { test, expect } from '@playwright/test';

test.describe('Digital Preview Modal', () => {
  test('displays preview modal on first visit and dismisses on explore', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Verify modal appears with soft launch branding
    const modal = page.locator('text=EXCLUSIVE DIGITAL PREVIEW');
    await expect(modal).toBeVisible({ timeout: 5000 });

    await expect(page.locator('text=A Taste of')).toBeVisible();
    await expect(page.locator('text=Explore Sangeet Experience')).toBeVisible();

    // Click "Explore Sangeet Experience"
    await page.locator('button:has-text("Explore Sangeet Experience")').click();

    // Verify modal disappears
    await expect(modal).not.toBeVisible();

    // Verify sessionStorage flag is set
    const flag = await page.evaluate(() => sessionStorage.getItem('sangeet_preview_seen'));
    expect(flag).toBe('true');
  });
});
