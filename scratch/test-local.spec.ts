import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://localhost:3000' });

test('Reproduce Hero Save Error Local', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'SangeetAdmin!2026');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*admin.*/, { timeout: 15000 });

  // Go to Admin
  await page.goto('/admin/website-management');
  await page.waitForLoadState('networkidle');

  // Modify Hero Title
  await page.fill('#hero-title-input', 'Experience Sangeet Excellence Test');

  // Capture both PUT requests
  const settingsPromise = page.waitForResponse(resp => resp.url().includes('/api/website/settings') && resp.request().method() === 'PUT');
  const contentPromise = page.waitForResponse(resp => resp.url().includes('/api/website/content') && resp.request().method() === 'PUT');

  // Save
  await page.click('button:has-text("Save All Changes")');

  const settingsResp = await settingsPromise;
  const contentResp = await contentPromise;

  console.log('Settings PUT Status:', settingsResp.status());
  console.log('Content PUT Status:', contentResp.status());
});
