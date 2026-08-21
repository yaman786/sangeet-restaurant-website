import { test, expect } from '@playwright/test';

test('Hide Announcement Banner Test', async ({ page }) => {
  // 1. Login
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  await page.fill('#username', 'admin');
  await page.fill('#password', 'SangeetAdmin!2026');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*admin.*/, { timeout: 15000 });

  // 2. Go to CMS Admin
  await page.goto('/admin/website-management');
  await page.waitForLoadState('networkidle');

  // 3. Toggle off announcement banner
  const checkbox = page.locator('input[type="checkbox"]').first();
  await checkbox.uncheck({ force: true });
  
  // 4. Save
  const saveResponsePromise = page.waitForResponse(resp => resp.url().includes('/api/website/settings') && resp.request().method() === 'PUT');
  await page.click('button:has-text("Save All Changes")');
  const resp = await saveResponsePromise;
  console.log('Saved! API Status:', resp.status());

  // 5. Verify API output
  await page.waitForTimeout(1000);
  const apiResponse = await page.request.get('/api/website/public-config');
  const apiData = await apiResponse.json();
  console.log('API announcement.is_active is:', apiData.announcement.is_active);
  console.log('API announcement is typeof:', typeof apiData.announcement.is_active);

  // 6. Go to homepage and check if it's there
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Check if announcement text is visible
  const bannerText = page.locator('text=Welcome to Sangeet');
  const isVisible = await bannerText.isVisible();
  console.log('Is banner visible on homepage? ', isVisible);
});
