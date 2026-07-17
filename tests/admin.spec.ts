import { test, expect, Page } from '@playwright/test';

test.describe('Admin Dashboard Flows', () => {
  // Use a sequential execution for admin to avoid session collision if any
  test.describe.configure({ mode: 'serial' });

  let adminPage: Page;

  test.beforeAll(async ({ browser }) => {
    adminPage = await browser.newPage();
  });

  test.afterAll(async () => {
    await adminPage.close();
  });

  test('should login as admin', async () => {
    await adminPage.goto('/admin/login');
    
    await expect(adminPage).toHaveTitle(/Sangeet/);
    
    await adminPage.fill('input[name="username"]', 'admin');
    await adminPage.fill('input[name="password"]', 'admin123');
    await adminPage.click('button[type="submit"]');

    // Should redirect to dashboard
    await adminPage.waitForURL(/.*\/admin\/dashboard/);
    await expect(adminPage.locator('h1').filter({ hasText: 'Dashboard' })).toBeVisible();
  });

  test('should navigate to menu management', async () => {
    await adminPage.goto('/admin/dashboard');
    // Click on Menu link in the admin sidebar
    await adminPage.click('a[href="/admin/menu-management"]');
    await adminPage.waitForURL(/.*\/admin\/menu-management/);
    
    // Check for Add Item button
    await expect(adminPage.locator('button', { hasText: '+ Add Menu Item' })).toBeVisible();

    // Switch to Categories tab
    await adminPage.click('button:has-text("Categories")');
    await expect(adminPage.locator('button', { hasText: '+ Add Category' })).toBeVisible();
  });

  test('should navigate to reservations', async () => {
    await adminPage.goto('/admin/dashboard');
    await adminPage.click('a[href="/admin/reservations"]');
    await adminPage.waitForURL(/.*\/admin\/reservations/);
    
    await expect(adminPage.locator('h1').filter({ hasText: 'Reservations' })).toBeVisible({ timeout: 15000 });
    // Verify the page loaded by checking for table or empty state
    await expect(adminPage.locator('table').or(adminPage.locator('text="No Reservations Found"'))).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to orders', async () => {
    await adminPage.goto('/admin/dashboard');
    await adminPage.click('a[href="/admin/orders"]');
    await adminPage.waitForURL(/.*\/admin\/orders/);
    
    await expect(adminPage.locator('h1').filter({ hasText: 'Admin Orders' })).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to analytics', async () => {
    await adminPage.goto('/admin/dashboard');
    await adminPage.click('a[href="/admin/analytics"]');
    await adminPage.waitForURL(/.*\/admin\/analytics/);
    
    await expect(adminPage.locator('h1').filter({ hasText: 'Analytics Reports' })).toBeVisible({ timeout: 15000 });
  });
});
