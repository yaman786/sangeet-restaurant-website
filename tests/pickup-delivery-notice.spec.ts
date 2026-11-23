import { test, expect } from '@playwright/test';

test.describe('Pick-Up Page Free Delivery Notice', () => {
  test('replaces No Delivery with Free Delivery notice on /pickup across desktop and mobile', async ({ page }) => {
    // Desktop check
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/pickup', { waitUntil: 'networkidle' });

    await expect(page.getByText(/no delivery/i)).toHaveCount(0);
    await expect(page.getByText(/online self pick-up/i)).toHaveCount(0);
    const notice = page.getByTestId('pickup-free-delivery-notice');
    await expect(notice).toBeVisible({ timeout: 15000 });
    await expect(notice).toContainText('Free Delivery:');
    await expect(notice).toContainText('Minimum order of HK$1,000');
    await expect(notice).toContainText('(HK Island only)');

    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(desktopOverflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: '/Users/amanrana/.gemini/antigravity/brain/751c82c2-540c-4678-8e7d-b6f84eddb98a/pickup_free_delivery_desktop.png',
      fullPage: false,
    });

    // Mobile check
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(notice).toBeVisible();
    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(mobileOverflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: '/Users/amanrana/.gemini/antigravity/brain/751c82c2-540c-4678-8e7d-b6f84eddb98a/pickup_free_delivery_mobile.png',
      fullPage: false,
    });
  });
});
