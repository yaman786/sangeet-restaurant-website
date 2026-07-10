import { test, expect } from '@playwright/test';

test.describe('Kitchen Display Flows (QA)', () => {
  test('should login and navigate to kitchen display', async ({ page }) => {
    // Navigate to kitchen login page
    await page.goto('/kitchen/login');
    
    // Fill out the login form
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard for admin
    await page.waitForURL(/.*\/admin\/dashboard/);
    
    // Navigate to kitchen display manually (as staff might bookmark it or click from dashboard)
    await page.goto('/kitchen/display');
    
    // Verify the page loads successfully by checking the header
    await expect(page.locator('text=Kitchen Display (Admin View)')).toBeVisible({ timeout: 10000 });
    
    // Verify the "All Orders" filter card is visible
    await expect(page.locator('h3:has-text("All Orders")')).toBeVisible({ timeout: 5000 });
  });
});
