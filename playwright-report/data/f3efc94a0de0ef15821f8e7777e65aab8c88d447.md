# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Dashboard Flows >> should navigate to analytics
- Location: tests/admin.spec.ts:63:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1').filter({ hasText: 'Analytics Reports' })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('h1').filter({ hasText: 'Analytics Reports' })

```

```yaml
- paragraph: Loading analytics...
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- status: Failed to load analytics data
- alert: Analytics | Admin - Sangeet
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Admin Dashboard Flows', () => {
  4  |   // Use a sequential execution for admin to avoid session collision if any
  5  |   test.describe.configure({ mode: 'serial' });
  6  | 
  7  |   let adminPage;
  8  | 
  9  |   test.beforeAll(async ({ browser }) => {
  10 |     adminPage = await browser.newPage();
  11 |   });
  12 | 
  13 |   test.afterAll(async () => {
  14 |     await adminPage.close();
  15 |   });
  16 | 
  17 |   test('should login as admin', async () => {
  18 |     await adminPage.goto('/admin/login');
  19 |     
  20 |     await expect(adminPage).toHaveTitle(/Sangeet/);
  21 |     
  22 |     await adminPage.fill('input[name="username"]', 'admin');
  23 |     await adminPage.fill('input[name="password"]', 'admin123');
  24 |     await adminPage.click('button[type="submit"]');
  25 | 
  26 |     // Should redirect to dashboard
  27 |     await adminPage.waitForURL(/.*\/admin\/dashboard/);
  28 |     await expect(adminPage.locator('h1').filter({ hasText: 'Dashboard' })).toBeVisible();
  29 |   });
  30 | 
  31 |   test('should navigate to menu management', async () => {
  32 |     await adminPage.goto('/admin/dashboard');
  33 |     // Click on Menu link in the admin sidebar
  34 |     await adminPage.click('a[href="/admin/menu-management"]');
  35 |     await adminPage.waitForURL(/.*\/admin\/menu-management/);
  36 |     
  37 |     // Check for Add Item button
  38 |     await expect(adminPage.locator('button', { hasText: '+ Add Menu Item' })).toBeVisible();
  39 | 
  40 |     // Switch to Categories tab
  41 |     await adminPage.click('button:has-text("Categories")');
  42 |     await expect(adminPage.locator('button', { hasText: '+ Add Category' })).toBeVisible();
  43 |   });
  44 | 
  45 |   test('should navigate to reservations', async () => {
  46 |     await adminPage.goto('/admin/dashboard');
  47 |     await adminPage.click('a[href="/admin/reservations"]');
  48 |     await adminPage.waitForURL(/.*\/admin\/reservations/);
  49 |     
  50 |     await expect(adminPage.locator('h1').filter({ hasText: 'Reservations' })).toBeVisible({ timeout: 15000 });
  51 |     // Verify the page loaded by checking for table or empty state
  52 |     await expect(adminPage.locator('table').or(adminPage.locator('text="No Reservations Found"'))).toBeVisible({ timeout: 15000 });
  53 |   });
  54 | 
  55 |   test('should navigate to orders', async () => {
  56 |     await adminPage.goto('/admin/dashboard');
  57 |     await adminPage.click('a[href="/admin/orders"]');
  58 |     await adminPage.waitForURL(/.*\/admin\/orders/);
  59 |     
  60 |     await expect(adminPage.locator('h1').filter({ hasText: 'Admin Orders' })).toBeVisible({ timeout: 15000 });
  61 |   });
  62 | 
  63 |   test('should navigate to analytics', async () => {
  64 |     await adminPage.goto('/admin/dashboard');
  65 |     await adminPage.click('a[href="/admin/analytics"]');
  66 |     await adminPage.waitForURL(/.*\/admin\/analytics/);
  67 |     
> 68 |     await expect(adminPage.locator('h1').filter({ hasText: 'Analytics Reports' })).toBeVisible({ timeout: 15000 });
     |                                                                                    ^ Error: expect(locator).toBeVisible() failed
  69 |   });
  70 | });
  71 | 
```