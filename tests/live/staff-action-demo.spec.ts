import { test, expect, type APIRequestContext } from '@playwright/test';
import * as path from 'path';

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.join(process.cwd(), 'test-results');

async function cleanupUserByUsername(request: APIRequestContext, username: string) {
  const res = await request.get(`/api/auth/users?search=${encodeURIComponent(username)}`);
  if (!res.ok()) return;
  const payload = await res.json();
  for (const u of payload?.data || []) {
    if (u.username === username) {
      await request.delete(`/api/auth/users/${u.id}`);
    }
  }
}

test.describe('Live Staff Management Interactive Action Walkthrough', () => {

  test('Full Action Walkthrough: Admin creates Waiter Vikram, verifies table, and tests Waiter Login', async ({ page }) => {
    // ----------------------------------------------------
    // STEP 1: Admin Log In
    // ----------------------------------------------------
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('#username', 'admin');
    await page.fill('#password', 'SangeetAdmin!2026');
    await page.click('button[type="submit"]');

    // Wait for Admin Dashboard
    await page.waitForURL(/.*admin\/dashboard/, { timeout: 20000 });

    // Pre-clean any leftover vikram_waiter from prior runs
    await cleanupUserByUsername(page.request, 'vikram_waiter');

    // ----------------------------------------------------
    // STEP 2: Navigate to Staff Management
    // ----------------------------------------------------
    await page.goto('/admin/staff-management', { waitUntil: 'networkidle' });
    await expect(page.getByRole('main').getByRole('heading', { name: 'Staff Management' })).toBeVisible({ timeout: 15000 });

    // ----------------------------------------------------
    // STEP 3: Open "+ Add New User" modal
    // ----------------------------------------------------
    const addBtn = page.locator('#staff-add-user');
    await expect(addBtn).toBeVisible({ timeout: 15000 });
    await addBtn.click();

    // Verify modal is open
    const modalForm = page.locator('[data-testid="staff-form"]');
    await expect(modalForm).toBeVisible({ timeout: 5000 });

    // ----------------------------------------------------
    // STEP 4: Fill in new employee details (Vikram Singh - Waiter)
    // ----------------------------------------------------
    await page.fill('#staff-full-name', 'Vikram Singh');
    await page.fill('#staff-phone', '+852 9876 5432');
    await page.fill('#staff-username', 'vikram_waiter');
    await page.fill('#staff-email', 'vikram@sangeet.hk');
    await page.selectOption('#staff-role', 'waiter');
    await page.fill('#staff-password', 'SangeetWaiter!2026');

    // ----------------------------------------------------
    // STEP 5: Submit form and verify in table
    // ----------------------------------------------------
    await page.click('#staff-form-submit');
    await expect(modalForm).toBeHidden({ timeout: 10000 });

    // Verify Vikram is rendered with role badge
    await expect(page.locator('text=Vikram Singh').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=@vikram_waiter').first()).toBeVisible();

    // Capture screenshot of the Staff Management table with Vikram Singh
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'staff_management_created_user.png'),
      fullPage: false,
    });
    console.log('✅ Created user Vikram Singh in Staff Management & captured screenshot');

    // ----------------------------------------------------
    // STEP 6: Log out and test Waiter Role-Based Access
    // ----------------------------------------------------
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('#username', 'vikram_waiter');
    await page.fill('#password', 'SangeetWaiter!2026');
    await page.click('button[type="submit"]');

    // Wait for automatic redirect to /admin/orders
    await page.waitForURL(/.*admin\/orders/, { timeout: 20000 });
    await expect(page).toHaveURL(/.*admin\/orders/);

    // Verify orders portal loaded
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });

    // Capture screenshot of the Waiter orders terminal
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'waiter_orders_landing.png'),
      fullPage: false,
    });
    console.log('✅ Verified Waiter Vikram automatically routed to /admin/orders & captured screenshot');
  });

});
