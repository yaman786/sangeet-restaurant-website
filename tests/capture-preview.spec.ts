import { test } from '@playwright/test';

test('capture digital preview modal screenshot', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('text=EXCLUSIVE DIGITAL PREVIEW', { timeout: 5000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/Users/amanrana/.gemini/antigravity-ide/brain/f1fd5693-11f8-4c31-8049-9485c8bbadf6/digital_preview_modal.png' });
});
