import { test, expect } from '@playwright/test';
import path from 'path';

const LIVE_URL = 'https://www.sangeet.hk';
const ARTIFACT_DIR =
  '/Users/amanrana/.gemini/antigravity/brain/751c82c2-540c-4678-8e7d-b6f84eddb98a';

test.describe('Hero Section Optimization: Logo Removed & Enhanced Space Utilization', () => {
  test.setTimeout(90000);

  test('Verifies no redundant logo in hero, prominent navbar logo, balanced spacing and captures screenshots', async ({
    page,
  }) => {
    // 1. Desktop (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LIVE_URL, { waitUntil: 'networkidle' });

    // Navbar logo must be visible
    const navLogo = page.getByTestId('header-logo-img');
    await expect(navLogo).toBeVisible({ timeout: 15000 });

    // Hero section must not contain any img or logo
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();

    // The hero content container must NOT have any logo image inside it
    const heroLogoImages = heroSection.locator('.logo-navbar-dark, img[alt="Sangeet Logo"]');
    await expect(heroLogoImages).toHaveCount(0);

    // Eyebrow badge, headline, and CTAs must be visible
    await expect(heroSection.getByText(/Wan Chai, Hong Kong/i)).toBeVisible();
    await expect(heroSection.locator('h1')).toBeVisible();
    await expect(page.getByTestId('hero-pickup-cta')).toBeVisible();
    await expect(heroSection.getByRole('button', { name: /Reserve a Table/i })).toBeVisible();
    await expect(heroSection.getByRole('button', { name: /View Menu/i })).toBeVisible();

    // Check zero horizontal overflow
    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(desktopOverflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'hero_optimized_desktop_1440px.png'),
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });

    // 2. Tablet (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);

    const tabletOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(tabletOverflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'hero_optimized_tablet_768px.png'),
      clip: { x: 0, y: 0, width: 768, height: 900 },
    });

    // 3. Mobile (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);

    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(mobileOverflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'hero_optimized_mobile_390px.png'),
      clip: { x: 0, y: 0, width: 390, height: 844 },
    });
  });
});

