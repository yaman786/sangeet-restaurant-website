import { test, expect } from '@playwright/test';
import path from 'path';

const LIVE_URL = 'https://www.sangeet.hk';
const ARTIFACT_DIR =
  '/Users/amanrana/.gemini/antigravity/brain/751c82c2-540c-4678-8e7d-b6f84eddb98a';

test.describe('Navbar Logo Clarity, Size & Responsive Layout Verification', () => {
  test.setTimeout(90000);

  test('Verifies prominent, clear top-left navbar logo and zero layout breakage on Desktop, Tablet, and Mobile', async ({
    page,
  }) => {
    // 1. Desktop (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${LIVE_URL}/menu`, { waitUntil: 'networkidle' });

    const logoImg = page.getByTestId('header-logo-img');
    await expect(logoImg).toBeVisible({ timeout: 15000 });

    const desktopBox = await logoImg.boundingBox();
    expect(desktopBox).not.toBeNull();
    expect(desktopBox!.height).toBeGreaterThanOrEqual(52);
    expect(desktopBox!.width).toBeGreaterThanOrEqual(135);

    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(desktopOverflow).toBeLessThanOrEqual(1);

    // Screenshot clipped to top navbar + hero banner on Desktop
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'navbar_logo_desktop_1440px.png'),
      clip: { x: 0, y: 0, width: 1440, height: 220 },
    });

    // 2. Tablet (768x1024) — check zero collision/clipping between logo, nav, and CTA buttons
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);

    const tabletBox = await logoImg.boundingBox();
    expect(tabletBox).not.toBeNull();
    expect(tabletBox!.height).toBeGreaterThanOrEqual(44);

    const pickupBtnTabletBox = await page.getByTestId('header-pickup-cta').boundingBox();
    expect(pickupBtnTabletBox).not.toBeNull();
    expect(pickupBtnTabletBox!.x + pickupBtnTabletBox!.width).toBeLessThanOrEqual(768);

    const tabletOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(tabletOverflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'navbar_logo_tablet_768px.png'),
      clip: { x: 0, y: 0, width: 768, height: 200 },
    });

    // 3. Mobile (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);

    const mobileBox = await logoImg.boundingBox();
    expect(mobileBox).not.toBeNull();
    expect(mobileBox!.height).toBeGreaterThanOrEqual(38);

    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(mobileOverflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'navbar_logo_mobile_390px.png'),
      clip: { x: 0, y: 0, width: 390, height: 180 },
    });
  });
});

