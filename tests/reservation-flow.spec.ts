import { test, expect } from '@playwright/test';

/**
 * Full Reservation E2E Flow Test
 * 
 * Phase 1: Customer creates a reservation on /reservations
 * Phase 2: Admin logs in, finds the reservation, confirms it with a table assignment
 * 
 * Validates: Form submission, API response, admin login, status change, table assignment
 */

const TEST_CUSTOMER = {
  name: 'Playwright Test Guest',
  email: 'ranayaman66@gmail.com',
  phone: '98765432',
  guests: '2',
  specialRequests: 'Playwright automated test - please ignore',
};

test.describe('Reservation Flow (End-to-End)', () => {

  test('Phase 1: Customer submits a reservation', async ({ page }) => {
    // 1. Navigate to reservations page
    await page.goto('/reservations');
    await page.waitForLoadState('networkidle');

    // 2. Fill out the booking form
    await page.fill('input[name="customer_name"]', TEST_CUSTOMER.name);
    await page.fill('input[name="email"]', TEST_CUSTOMER.email);
    await page.fill('input[name="phone"]', TEST_CUSTOMER.phone);

    // 3. Select number of guests
    await page.selectOption('select[name="guests"]', TEST_CUSTOMER.guests);

    // 4. Pick a future date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[name="date"]', dateString);

    // 5. Wait for time slots to load from the API, then select the first available
    await page.waitForTimeout(1500); // Allow API to return available slots
    const timeOptions = await page.locator('select[name="time"] option:not([value=""])').count();
    expect(timeOptions).toBeGreaterThan(0);
    await page.selectOption('select[name="time"]', { index: 1 });

    // 6. Fill special requests
    await page.fill('textarea[name="special_requests"]', TEST_CUSTOMER.specialRequests);

    // 7. Submit the reservation
    await page.click('button[type="submit"]');

    // 8. Verify success: either a toast message or a confirmation screen
    // Wait for API response and success feedback
    await expect(
      page.locator('text=Reservation Confirmed').or(page.locator('text=successfully'))
    ).toBeVisible({ timeout: 15000 });

    // Take a screenshot of success state
    await page.screenshot({ path: 'test-results/reservation-submitted.png' });
  });

  test('Phase 2: Admin confirms the reservation', async ({ page }) => {
    // 1. Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // 2. Fill admin credentials
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'SangeetAdmin!2026');

    // 3. Click Sign In
    await page.click('button[type="submit"]');

    // 4. Wait for redirect to admin dashboard
    await page.waitForURL('**/admin/**', { timeout: 10000 });
    await page.screenshot({ path: 'test-results/admin-dashboard.png' });

    // 5. Navigate to reservations management
    await page.goto('/admin/reservations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow reservation list to populate

    // 6. Find our test reservation's status dropdown and change it to "confirmed"
    //    Each reservation row has a <select> with status options
    const testRow = page.locator('tr', { hasText: TEST_CUSTOMER.name }).first();
    await expect(testRow).toBeVisible({ timeout: 10000 });

    const statusDropdown = testRow.locator('select');
    await statusDropdown.selectOption('confirmed');

    // 7. The "Assign Table" modal should appear
    await expect(page.locator('text=Select an Available Table')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'test-results/assign-table-modal.png' });

    // 8. Select the first available table from the dropdown
    const tableDropdown = page.locator('select').filter({ hasText: /Table/ }).last();
    const tableOptions = await tableDropdown.locator('option:not([value=""])').count();
    expect(tableOptions).toBeGreaterThan(0);
    await tableDropdown.selectOption({ index: 1 });

    // 9. Click "Assign & Confirm"
    await page.click('button:has-text("Assign & Confirm")');

    // 10. Verify the status changed (toast or row update)
    await expect(
      page.locator('text=confirmed').or(page.locator('text=Confirmed'))
    ).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'test-results/reservation-confirmed.png' });
  });
});
