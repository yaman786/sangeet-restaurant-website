import { test } from '@playwright/test';

test('capture live site', async ({ page }) => {
  console.log("Navigating to https://www.sangeet.hk...");
  const response = await page.goto('https://www.sangeet.hk');
  console.log("Status Code: ", response?.status());
  
  // Wait a bit for React to hydrate
  await page.waitForTimeout(3000);
  
  // Take a screenshot of exactly what the user sees
  await page.screenshot({ path: 'live-screenshot.png', fullPage: true });
  
  // Check console for any errors
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER CRASH:', err.message));
  
  console.log("Screenshot saved.");
});
