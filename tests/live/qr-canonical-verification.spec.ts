import { test, expect } from '@playwright/test';
import * as path from 'path';

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.join(process.cwd(), 'test-results');

test.describe('QR Canonical Domain & UI Verification', () => {

  test('1. Verify /api/tables returns canonical https://www.sangeet.hk URLs for all 10 tables', async ({ request }) => {
    const res = await request.get('/api/tables');
    expect(res.status()).toBe(200);
    const tables = await res.json();
    expect(Array.isArray(tables)).toBe(true);
    expect(tables.length).toBeGreaterThanOrEqual(10);

    for (const table of tables) {
      expect(table.qr_code_url).toMatch(/^https:\/\/(www\.)?sangeet\.hk\/qr\//);
      expect(table.qr_code_url).not.toContain('vercel.app');
    }
  });

  test('2. Admin QR Management: login, verify domain, capture screenshots', async ({ page }) => {
    // 1. Login via /login
    await page.goto('/login', { waitUntil: 'networkidle' });
    const usernameInput = page.locator('#username');
    await expect(usernameInput).toBeVisible({ timeout: 10000 });
    await usernameInput.fill('admin');

    const passwordInput = page.locator('#password');
    await passwordInput.fill('SangeetAdmin!2026');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*admin\/dashboard.*/, { timeout: 20000 });

    // 2. Navigate to QR Management
    await page.goto('/admin/qr-management');
    
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

  test('4. Table 1 vs Table 10 exact disambiguation test', async ({ request, page }) => {
    // API verification
    const res1 = await request.get('/api/tables/qr/table-1');
    expect(res1.status()).toBe(200);
    const data1 = await res1.json();
    expect(data1.table_number).toBe('1');
    expect(data1.qr_code_url).toBe('https://www.sangeet.hk/qr/table-1');

    const res10 = await request.get('/api/tables/qr/table-10');
    expect(res10.status()).toBe(200);
    const data10 = await res10.json();
    expect(data10.table_number).toBe('10');
    expect(data10.qr_code_url).toBe('https://www.sangeet.hk/qr/table-10');

    const resNum1 = await request.get('/api/tables/number/1');
    expect((await resNum1.json()).table_number).toBe('1');

    const resNum10 = await request.get('/api/tables/number/10');
    expect((await resNum10.json()).table_number).toBe('10');

    // UI verification for Table 1
    await page.goto('/qr/table-1', { waitUntil: 'networkidle' });
    const badge1 = page.locator('text=Table 1').first();
    await expect(badge1).toBeVisible({ timeout: 15000 });
    // Verify it doesn't show Table 10
    const badge10OnPage1 = page.locator('text=Table 10');
    await expect(badge10OnPage1).toHaveCount(0);

    // UI verification for Table 10
    await page.goto('/qr/table-10', { waitUntil: 'networkidle' });
    const badge10 = page.locator('text=Table 10').first();
    await expect(badge10).toBeVisible({ timeout: 15000 });
  });
});
