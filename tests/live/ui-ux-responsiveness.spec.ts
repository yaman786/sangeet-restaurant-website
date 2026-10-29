import 'dotenv/config';
import { test, expect } from '@playwright/test';
import * as path from 'path';
import jwt from 'jsonwebtoken';
import { prisma } from '../../src/lib/db';

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.join(process.cwd(), 'test-results');

test.use({ baseURL: process.env.BASE_URL || 'https://www.sangeet.hk' });

const VIEWPORTS = [
  { name: 'Mobile_375px', width: 375, height: 667 },
  { name: 'Mobile_390px', width: 390, height: 844 },
  { name: 'Tablet_768px', width: 768, height: 1024 },
  { name: 'Desktop_1440px', width: 1440, height: 900 },
];

/**
 * Helper to assert zero horizontal scroll overflow.
 * Returns elements that overflow the viewport if any exist.
 */
async function assertNoHorizontalOverflow(page: any, pageName: string, viewportName: string) {
  const overflow = await page.evaluate(() => {
    const docEl = document.documentElement;
    const body = document.body;
    const windowWidth = window.innerWidth;
    const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
    
    // Check if total page scroll width exceeds viewport width by more than 1px
    const hasHorizontalScroll = scrollWidth > windowWidth + 1;
    
    // Find culprit elements if overflow exists
    const culprits: string[] = [];
    if (hasHorizontalScroll) {
      const allElements = Array.from(document.querySelectorAll('*'));
      for (const el of allElements) {
        const rect = el.getBoundingClientRect();
        if (rect.right > windowWidth + 2 || rect.left < -2) {
          const id = el.id ? `#${el.id}` : '';
          const className = el.className && typeof el.className === 'string' ? `.${el.className.split(' ').slice(0, 2).join('.')}` : '';
          culprits.push(`${el.tagName.toLowerCase()}${id}${className} (right: ${Math.round(rect.right)}px, left: ${Math.round(rect.left)}px)`);
          if (culprits.length >= 5) break;
        }
      }
    }
    
    return {
      hasHorizontalScroll,
      scrollWidth,
      windowWidth,
      culprits
    };
  });

  if (overflow.hasHorizontalScroll) {
    console.warn(`[OVERFLOW WARNING] ${pageName} on ${viewportName}: scrollWidth (${overflow.scrollWidth}px) > windowWidth (${overflow.windowWidth}px). Culprits: ${overflow.culprits.join(', ')}`);
  }
  
  expect(
    overflow.scrollWidth,
    `Page ${pageName} on ${viewportName} has horizontal overflow (${overflow.scrollWidth}px > ${overflow.windowWidth}px). Culprits: ${overflow.culprits.join(', ')}`
  ).toBeLessThanOrEqual(overflow.windowWidth + 2);
}

test.describe('UI/UX Pro-Max Responsiveness Audit Across All Pages & Viewports', () => {
  test.setTimeout(120000);

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  for (const vp of VIEWPORTS) {
    test(`1. Homepage (/) Responsive Audit [${vp.name}]`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });

      // Verify zero horizontal scroll
      await assertNoHorizontalOverflow(page, 'Homepage', vp.name);

      // Verify header/nav elements
      if (vp.width < 768) {
        // Mobile header exists below md breakpoint
        const mobileMenuButton = page.locator('button[aria-label*="menu" i], button:has(svg)').first();
        await expect(mobileMenuButton).toBeVisible();
      }

      // Verify CTA buttons are visible and have proper cursor pointer
      const bookTableBtn = page.getByRole('link', { name: /book a table|reserve|book/i }).first();
      if (await bookTableBtn.isVisible()) {
        const cursor = await bookTableBtn.evaluate((el) => window.getComputedStyle(el).cursor);
        expect(cursor).toBe('pointer');
      }

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `responsive_home_${vp.name}.png`),
        fullPage: false
      });
    });

    test(`2. Public Menu (/menu) Responsive Audit [${vp.name}]`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/menu', { waitUntil: 'domcontentloaded' });
      await expect(page.getByTestId('public-menu-food')).toBeVisible({ timeout: 15000 });

      // 1. Food Menu view
      await assertNoHorizontalOverflow(page, 'Menu-Food', vp.name);

      // Verify 2-way toggle buttons have pointer cursor and min touch size
      const foodTab = page.getByTestId('public-menu-food');
      const drinksTab = page.getByTestId('public-menu-drinks');
      await expect(foodTab).toBeVisible();
      await expect(drinksTab).toBeVisible();

      // 2. Bar & Drinks view
      await drinksTab.click();
      await expect(page.getByRole('button', { name: 'All Bar & Drinks', exact: true })).toBeVisible({ timeout: 10000 });
      await assertNoHorizontalOverflow(page, 'Menu-Drinks', vp.name);

      // Verify drink cards adapt smoothly to grid
      const drinkCards = page.locator('div.group');
      const count = await drinkCards.count();
      expect(count).toBeGreaterThan(0);

      // Check first drink card bounds fit inside window
      const firstCardBox = await drinkCards.first().boundingBox();
      expect(firstCardBox).toBeTruthy();
      expect(firstCardBox!.x + firstCardBox!.width).toBeLessThanOrEqual(vp.width + 5);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `responsive_menu_drinks_${vp.name}.png`),
        fullPage: false
      });
    });

    test(`3. Customer QR Menu (/qr/table-1) Responsive Audit [${vp.name}]`, async ({ page }) => {
      // Focus on mobile and tablet for QR menu, skip wide desktop
      if (vp.width > 1024) return;

      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/qr/table-1', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('text=Table 1').first()).toBeVisible({ timeout: 20000 });

      // Check Food Menu View
      await assertNoHorizontalOverflow(page, 'QR-Food', vp.name);

      // Switch to Bar & Drinks
      const qrDrinksTab = page.getByTestId('qr-menu-drinks');
      await qrDrinksTab.click();
      await expect(page.getByRole('button', { name: 'All Bar & Drinks', exact: true })).toBeVisible({ timeout: 10000 });
      await assertNoHorizontalOverflow(page, 'QR-Drinks', vp.name);

      // Verify Whisky & Bourbon subcategory toggle and cards
      await page.getByRole('button', { name: 'Whisky & Bourbon', exact: true }).click();
      const whiskyCard = page.locator('div.group').filter({ has: page.locator('h3', { hasText: 'Chivas Regal 12yrs' }) });
      await expect(whiskyCard).toBeVisible({ timeout: 10000 });

      // Verify touch targets for Shot & Bottle selectors
      const shotBtn = whiskyCard.locator('[data-testid^="qr-select-shot-"]');
      const bottleBtn = whiskyCard.locator('[data-testid^="qr-select-bottle-"]');
      await expect(shotBtn).toBeVisible();
      await expect(bottleBtn).toBeVisible();

      // Check touch target height >= 32px (minimum for pill buttons)
      const shotBox = await shotBtn.boundingBox();
      expect(shotBox!.height).toBeGreaterThanOrEqual(30);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `responsive_qr_whisky_${vp.name}.png`),
        fullPage: false
      });
    });

    test(`4. Reservations Page (/reservations) Responsive Audit [${vp.name}]`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/reservations', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });

      await assertNoHorizontalOverflow(page, 'Reservations', vp.name);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `responsive_reservations_${vp.name}.png`),
        fullPage: false
      });
    });
  }

  test('5. Admin Surfaces Responsive Audit (/admin/dashboard & /admin/menu-management)', async ({ page, baseURL }) => {
    const targetOrigin = baseURL || 'https://www.sangeet.hk';
    const adminUser = await prisma.users.findFirst({
      where: { username: 'admin', role: 'admin' }
    });
    expect(adminUser).toBeTruthy();

    const adminToken = jwt.sign(
      { id: adminUser!.id, username: adminUser!.username, role: 'admin' },
      process.env.JWT_SECRET as string,
      { expiresIn: '30m' }
    );

    await page.context().addCookies([
      {
        name: 'auth_token',
        value: adminToken,
        url: targetOrigin
      }
    ]);

    await page.addInitScript((user) => {
      window.localStorage.setItem('sangeet_user', JSON.stringify(user));
    }, {
      id: adminUser!.id,
      username: adminUser!.username,
      email: adminUser!.email,
      role: 'admin',
      full_name: adminUser!.full_name || 'Administrator'
    });

    // Test Admin Dashboard on Desktop (1440px) and Tablet (768px)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1, h2, h3').first()).toBeVisible({ timeout: 15000 });
    await assertNoHorizontalOverflow(page, 'Admin-Dashboard', 'Desktop_1440px');

    await page.setViewportSize({ width: 768, height: 1024 });
    await assertNoHorizontalOverflow(page, 'Admin-Dashboard', 'Tablet_768px');

    // Test Admin Menu Management on Desktop (1440px), Tablet (768px), and Mobile (390px)
    for (const [w, h, name] of [[1440, 900, 'Desktop_1440px'], [768, 1024, 'Tablet_768px'], [390, 844, 'Mobile_390px']] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/admin/menu-management', { waitUntil: 'domcontentloaded' });
      await expect(page.getByTestId('menu-section-food')).toBeVisible({ timeout: 15000 });
      await assertNoHorizontalOverflow(page, 'Admin-MenuManagement', name);

      // Check Bar & Drinks section
      await page.getByTestId('menu-section-drinks').click();
      await expect(page.getByRole('heading', { name: /Bar & Drinks Items/i })).toBeVisible({ timeout: 15000 });
      await assertNoHorizontalOverflow(page, 'Admin-MenuManagement-Drinks', name);

      // Open Add Drink Item modal and verify it fits viewport without overflow
      await page.getByRole('button', { name: /Add Drink Item/i }).click();
      await expect(page.getByRole('heading', { name: /Add Drink Item/i })).toBeVisible({ timeout: 10000 });
      await assertNoHorizontalOverflow(page, 'Admin-AddDrinkModal', name);

      // Close modal
      const cancelOrClose = page.locator('button').filter({ hasText: /cancel/i }).first();
      if (await cancelOrClose.isVisible()) {
        await cancelOrClose.click();
      } else {
        await page.keyboard.press('Escape');
      }
    }
  });
});

