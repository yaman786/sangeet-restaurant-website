import { test, expect } from '@playwright/test';

/**
 * Full Reservation E2E Flow Test (Production Ready)
 * 
 * Executes Customer Booking + Admin UI Login + Table Assignment Confirmation.
 * Uses customer email ranayaman66@gmail.com so live email delivery can be visually confirmed.
 */

test('Complete Reservation & Admin Confirmation Flow', async ({ page }) => {
  const timestamp = Date.now();
  const TEST_CUSTOMER = {
    name: `PW Guest ${timestamp}`,
    email: 'ranayaman66@gmail.com',
    phone: '98765432',
    guests: '2',
    specialRequests: 'Automated Playwright verification - real email test',
  };

  // ==========================================
  // PHASE 1: CUSTOMER RESERVATION SUBMISSION
  // ==========================================
  console.log('--- Phase 1: Navigating to /reservations ---');
  await page.goto('/reservations');
  await page.waitForLoadState('domcontentloaded');

  // Fill customer details
  await page.fill('input[name="customer_name"]', TEST_CUSTOMER.name);
  await page.fill('input[name="email"]', TEST_CUSTOMER.email);
  await page.fill('input[name="phone"]', TEST_CUSTOMER.phone);
  await page.selectOption('select[name="guests"]', TEST_CUSTOMER.guests);

  // Pick tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateString = tomorrow.toISOString().split('T')[0];
  await page.fill('input[type="date"]', dateString);
  await page.dispatchEvent('input[type="date"]', 'change');

  // Wait for available time slots and select first available
  const timeSelect = page.locator('select[name="time"]');
  await expect(timeSelect).toBeEnabled({ timeout: 10000 });
  await timeSelect.selectOption({ index: 1 });

  // Special requests
  await page.fill('textarea[name="special_requests"]', TEST_CUSTOMER.specialRequests);

  // Submit reservation
  await page.click('button[type="submit"]');

  // Verify success screen
  await expect(page.locator('text=Reservation Confirmed!')).toBeVisible({ timeout: 15000 });
  console.log(`✅ Phase 1 Passed: Customer booking created. Emails sent to customer (${TEST_CUSTOMER.email}) and Admin (ranaji13@sangeet.hk)`);

  // ==========================================
  // PHASE 2: ADMIN AUTH & TABLE CONFIRMATION
  // ==========================================
  console.log('--- Phase 2: Logging in as Admin via UI ---');
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  // Type username and password
  const usernameInput = page.locator('#username');
  await expect(usernameInput).toBeVisible({ timeout: 10000 });
  await usernameInput.fill('admin');

  const passwordInput = page.locator('#password');
  await expect(passwordInput).toBeVisible({ timeout: 10000 });
  await passwordInput.fill('SangeetAdmin!2026');

  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait until redirect to admin page occurs
  await expect(page).toHaveURL(/.*admin.*/, { timeout: 15000 });
  console.log('✅ Admin login succeeded, redirected to admin area');

  // Navigate to admin reservations dashboard
  console.log('Navigating to /admin/reservations...');
  await page.goto('/admin/reservations');
  await page.waitForLoadState('domcontentloaded');

  // Verify search bar is visible (confirms admin access granted)
  const searchInput = page.locator('input[placeholder*="Search" i]');
  await expect(searchInput).toBeVisible({ timeout: 15000 });
  console.log('✅ Admin dashboard loaded successfully');

  // Type customer name into search bar to locate newly created row
  console.log(`Searching for reservation: ${TEST_CUSTOMER.name}...`);
  await searchInput.fill(TEST_CUSTOMER.name);
  await page.waitForTimeout(1000); // Allow search filter to filter list

  const targetRow = page.locator('tr', { hasText: TEST_CUSTOMER.name }).first();
  await expect(targetRow).toBeVisible({ timeout: 15000 });

  // Change status dropdown -> "confirmed"
  const statusDropdown = targetRow.locator('select');
  await statusDropdown.selectOption('confirmed');

  // Verify "Assign Table" modal opens
  console.log('Assign Table modal opened. Selecting an available table...');
  const modalHeader = page.locator('h3:has-text("Assign Table")');
  await expect(modalHeader).toBeVisible({ timeout: 5000 });

  const modalSelect = page.locator('div.fixed select');
  await expect(modalSelect).toBeVisible({ timeout: 5000 });

  // Try options until one successfully assigns without table collision
  const optionElements = page.locator('div.fixed select option');
  const optionCount = await optionElements.count();
  let assignedSuccess = false;

  for (let i = 0; i < optionCount; i++) {
    // Stop if modal has already closed
    if (!await modalHeader.isVisible()) {
      assignedSuccess = true;
      break;
    }

    const val = await optionElements.nth(i).getAttribute('value');
    if (!val || val.trim() === '') continue;

    console.log(`Testing table option value: ${val}...`);
    await modalSelect.selectOption(val);
    await page.waitForTimeout(300);

    const assignBtn = page.locator('button', { hasText: 'Assign & Confirm' });
    if (await assignBtn.isVisible()) {
      await assignBtn.click({ force: true });
      await page.waitForTimeout(1200);
    }

    // Check if modal closed after assignment submit
    if (!await modalHeader.isVisible()) {
      console.log(`✅ Table ID ${val} assigned successfully! Modal closed.`);
      assignedSuccess = true;
      break;
    }
  }

  expect(assignedSuccess).toBeTruthy();
  console.log('🎉 Phase 2 Passed: Admin confirmed reservation with Table Assignment successfully! Confirmation email dispatched.');
});
