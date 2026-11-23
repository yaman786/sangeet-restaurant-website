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

  test('loads Beverages images directly from CDN without Vercel /_next/image proxy', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/menu', { waitUntil: 'networkidle' });

    const drinksTab = page.getByTestId('public-menu-drinks');
    await expect(drinksTab).toBeVisible({ timeout: 15000 });
    await drinksTab.click();

    // Wait for Beverages tab content (e.g. Carlsberg / 1664 Blanc) to finish AnimatePresence transition
    const drinkHeading = page.locator('h3', { hasText: /Carlsberg|1664 Blanc|Guinness/i }).first();
    await expect(drinkHeading).toBeVisible({ timeout: 15000 });
    await drinkHeading.scrollIntoViewIfNeeded();

    const imgStats = await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('main img, .grid img')).slice(0, 6) as HTMLImageElement[];
      await Promise.all(
        imgs.map((img) => {
          img.scrollIntoView({ block: 'center' });
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          return new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
            setTimeout(resolve, 8000);
          });
        })
      );
      imgs[0]?.scrollIntoView({ block: 'center' });
      return imgs.map((img) => ({
        alt: img.alt,
        src: img.currentSrc || img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
      }));
    });

    expect(imgStats.length).toBeGreaterThanOrEqual(3);
    for (const img of imgStats) {
      expect(img.src).not.toContain('/_next/image');
      expect(img.complete).toBe(true);
      expect(img.naturalWidth).toBeGreaterThan(0);
    }

    await page.screenshot({
      path: '/Users/amanrana/.gemini/antigravity/brain/751c82c2-540c-4678-8e7d-b6f84eddb98a/beverages_images_verified.png',
      fullPage: false,
    });
  });
});
