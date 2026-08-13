import { test, expect } from '@playwright/test';

/**
 * Website CMS & Dynamic Live UI Sync Test (Production Ready)
 * 
 * Verifies Admin CMS editing ➔ Saving ➔ Dynamic rendering on public website.
 */

test('Website CMS Hero Title Update & Live UI Sync', async ({ page }) => {
  const timestamp = Date.now();
  const TEST_HERO_TITLE = `Experience Sangeet Excellence ${timestamp}`;

  console.log('--- Phase 1: Logging in as Admin ---');
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  const usernameInput = page.locator('#username');
  await expect(usernameInput).toBeVisible({ timeout: 10000 });
  await usernameInput.fill('admin');

  const passwordInput = page.locator('#password');
  await expect(passwordInput).toBeVisible({ timeout: 10000 });
  await passwordInput.fill('SangeetAdmin!2026');

  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*admin.*/, { timeout: 15000 });
  console.log('✅ Admin login succeeded');

  console.log('--- Phase 2: Navigating to /admin/website-management ---');
  await page.goto('/admin/website-management');
  await page.waitForLoadState('domcontentloaded');

  // Verify Hero Title Input is visible
  const heroTitleInput = page.locator('#hero-title-input');
  await expect(heroTitleInput).toBeVisible({ timeout: 15000 });

  // Update Hero Title
  console.log(`Updating Hero Title to: "${TEST_HERO_TITLE}"...`);
  await heroTitleInput.fill(TEST_HERO_TITLE);

  // Click Save All Changes
  const saveBtn = page.locator('button', { hasText: 'Save All Changes' });
  await expect(saveBtn).toBeVisible({ timeout: 5000 });
  await saveBtn.click();

  // Wait for save operation
  await page.waitForTimeout(2000);
  console.log('✅ CMS settings saved in admin panel');

  console.log('--- Phase 3: Navigating to Public Website (/) ---');
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');

  // Assert updated Hero Title is rendered dynamically on public website
  const heroHeading = page.locator('h1', { hasText: TEST_HERO_TITLE });
  await expect(heroHeading).toBeVisible({ timeout: 15000 });

  console.log(`🎉 SUCCESS: Live public website dynamically rendered CMS Hero Title: "${TEST_HERO_TITLE}"`);
});
