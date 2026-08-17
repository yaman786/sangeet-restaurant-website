import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'Desktop 1080p', width: 1920, height: 1080 },
  { name: 'MacBook 14-inch', width: 1440, height: 900 },
  { name: 'iPad Mini Tablet', width: 768, height: 1024 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'iPhone SE Small Mobile', width: 375, height: 667 },
];

test.describe('Hero Section Multi-Device Visual & Functional Verification', () => {
  for (const vp of VIEWPORTS) {
    test(`renders hero perfectly on ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      // Bypass preview modal
      await page.addInitScript(() => {
        sessionStorage.setItem('sangeet_preview_seen', 'true');
      });

      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

      // Scope to the hero section
      const heroSection = page.locator('section').first();
      await expect(heroSection).toBeVisible();

      // Wait for headline
      const headline = heroSection.locator('h1');
      await headline.waitFor({ state: 'visible', timeout: 10000 });
      await expect(headline).toContainText('A Symphony of South Asian Gastronomy');

      // Wait for animations and images to settle
      await page.waitForTimeout(1500);

      // Verify primary and secondary CTA buttons
      const reserveBtn = heroSection.getByRole('button', { name: /Reserve Your Table/i });
      await expect(reserveBtn).toBeVisible();

      const menuBtn = heroSection.getByRole('button', { name: /Explore the Menu/i });
      await expect(menuBtn).toBeVisible();

      // Take clean screenshot
      await page.screenshot({
        path: `public/screenshots/hero-${vp.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`,
        fullPage: false,
      });
    });
  }
});
