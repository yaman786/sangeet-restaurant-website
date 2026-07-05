const { test, expect } = require('@playwright/test');

test.describe('Admin Authentication & Dashboard', () => {
  test('should login as admin and view dashboard', async ({ page }) => {
    // Navigate to login
    await page.goto('/admin/login');
    
    // Check if login form is visible
    await expect(page.getByText('Staff Portal Login')).toBeVisible();
    
    // Fill credentials (assuming test DB has these or we can mock it, 
    // but the user gave us admin/SangeetAdmin2026 earlier so we use that for the E2E test)
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'SangeetAdmin2026');
    
    // Click submit
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/admin/dashboard');
    
    // Verify dashboard elements
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
    
    // Verify sidebar navigation exists
    await expect(page.getByText('Orders')).toBeVisible();
    await expect(page.getByText('Menu Management')).toBeVisible();
  });
});
