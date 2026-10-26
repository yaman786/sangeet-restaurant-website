import { test, expect } from '@playwright/test';
import * as path from 'path';

const ARTIFACT_DIR = '/Users/amanrana/.gemini/antigravity-ide/brain/971458b1-a32c-443e-9c77-460cc930d2d5';

test.describe('QR Canonical Domain & UI Verification', () => {

  test('1. Verify /api/tables returns canonical https://www.sangeet.hk URLs for all 10 tables', async ({ request }) => {
    const res = await request.get('/api/tables');
    expect(res.status()).toBe(200);
    const tables = await res.json();
    expect(Array.isArray(tables)).toBe(true);
    expect(tables.length).toBe(10);

    for (const table of tables) {
      expect(table.qr_code_url).toBe(`https://www.sangeet.hk/qr/table-${table.table_number}`);
      expect(table.qr_code_url).not.toContain('vercel.app');
    }
  });

  test('2. Admin QR Management: login, verify domain, capture screenshots', async ({ page }) => {
    // 1. Login via /login
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const usernameInput = page.locator('#username');
    await expect(usernameInput).toBeVisible({ timeout: 10000 });
    await usernameInput.fill('admin');

    const passwordInput = page.locator('#password');
    await passwordInput.fill('SangeetAdmin!2026');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*admin.*/, { timeout: 15000 });

    // 2. Navigate to QR Management
    await page.goto('/admin/qr-management', { waitUntil: 'networkidle' });
    
    // Wait for the table cards or headers
    const addTableBtn = page.locator('button', { hasText: 'Add Table' });
    await expect(addTableBtn).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Table 1').first()).toBeVisible({ timeout: 15000 });

    // Verify no vercel.app URLs are in DOM
    const content = await page.content();
    expect(content).not.toContain('frontend-six-xi-10.vercel.app');

    // Screenshot of QR Management dashboard
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'qr_admin_dashboard.png'),
      fullPage: true,
    });

    // Screenshot of Table 1 QR preview
    const tableOneCard = page.locator('.grid > div').first();
    await expect(tableOneCard).toBeVisible();
    await tableOneCard.screenshot({
      path: path.join(ARTIFACT_DIR, 'qr_code_table_preview.png'),
    });
  });

  test('3. Verify direct Table 1 QR customer ordering landing & capture screenshot', async ({ page }) => {
    await page.goto('/qr/1', { waitUntil: 'networkidle' });
    
    // Verify customer ordering interface displays Table 1
    const tableBadge = page.locator('text=Table 1').first();
    await expect(tableBadge).toBeVisible({ timeout: 15000 });

    // Verify menu items render
    const firstAddButton = page.locator('button:has-text("Add to Order")').first();
    await expect(firstAddButton).toBeVisible({ timeout: 15000 });

    // Capture customer menu screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'table_1_ordering_menu.png'),
      fullPage: false,
    });
  });
});
