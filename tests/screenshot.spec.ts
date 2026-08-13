import { test, expect } from '@playwright/test';

test('Capture Homepage screenshot', async ({ page }) => {
  await page.goto('https://sangeet.hk/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'homepage_current.png' });
});
