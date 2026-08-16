import { test, expect } from '@playwright/test';

test.describe('Reservation Table Confirmation & Shift Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Admin login
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    const usernameInput = page.locator('#username');
    await expect(usernameInput).toBeVisible({ timeout: 10000 });
    await usernameInput.fill('admin');

    const passwordInput = page.locator('#password');
    await passwordInput.fill('SangeetAdmin!2026');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*admin.*/, { timeout: 15000 });

    // Navigate to admin reservations page
    await page.goto('/admin/reservations');
    await page.waitForLoadState('networkidle');
  });

  test('should create a pending reservation and confirm with table assignment', async ({ page }) => {
    const timestamp = Date.now();
    const guestName = `Test Pending Guest ${timestamp}`;

    // Step 1: Ensure test tables exist by creating a test table via QR management if needed
    console.log(`--- Step 1: Creating Test Table ---`);
    await page.goto('/admin/qr-management');
    await page.waitForLoadState('networkidle');

    const addTableBtn = page.locator('button', { hasText: 'Add Table' });
    if (await addTableBtn.isVisible()) {
      await addTableBtn.click();
      const tableInput = page.locator('input[placeholder*="11"]').first();
      await tableInput.fill(`T${String(timestamp).slice(-3)}`);
      await page.locator('button', { hasText: 'Create Table' }).click();
      await page.waitForTimeout(1000);
    }

    // Step 2: Navigate to Reservations
    console.log(`--- Step 2: Navigate to Reservations & Create Pending Reservation ---`);
    await page.goto('/admin/reservations');
    await page.waitForLoadState('networkidle');

    // 1. Click Add Reservation
    const addBtn = page.locator('button', { hasText: 'Add Reservation' });
    await expect(addBtn).toBeVisible({ timeout: 15000 });
    await addBtn.click();

    // 2. Fill out manual entry form (without selecting a table)
    await page.locator('input[placeholder="e.g. John Doe"]').fill(guestName);
    await page.locator('input[placeholder="e.g. 555-0123"]').fill('98765432');
    await page.locator('input[placeholder="e.g. john@example.com"]').fill(`guest_${timestamp}@test.hk`);
    
    // Submit creation
    await page.locator('button:has-text("Create Reservation")').click();
    await page.waitForTimeout(1000);

    // Verify row appears in pending state
    const row = page.locator(`tr:has-text("${guestName}")`).first();
    await expect(row).toBeVisible({ timeout: 15000 });
    await expect(row.locator('select').first()).toHaveValue('pending');

    // 3. Click the prompt "+ Assign Table" button
    console.log(`--- Step 3: Click Confirm / Assign Table on Pending Booking ---`);
    const assignBtnPrompt = row.locator('button', { hasText: 'Assign' }).first();
    await expect(assignBtnPrompt).toBeVisible({ timeout: 5000 });
    await assignBtnPrompt.click();

    // 4. Modal appears: Assign Table & Confirm
    const modal = page.locator('h3:has-text("Assign Table & Confirm")');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Select an active table from dropdown
    const tableSelect = page.locator('select:has-text("-- Choose an available table --")');
    await expect(tableSelect).toBeVisible();
    await tableSelect.selectOption({ index: 1 }); // Select first available table

    // Submit assignment
    const assignBtn = page.locator('button', { hasText: 'Assign & Confirm' });
    await assignBtn.click();
    await page.waitForTimeout(1000);

    // 5. Verify status is now confirmed and table chip is visible with Shift action
    console.log(`--- Step 4: Verify Table Assigned & Shift Badge Visible ---`);
    await expect(row.locator('select').first()).toHaveValue('confirmed', { timeout: 15000 });
    const tableChip = row.locator('button', { hasText: '🪑' });
    await expect(tableChip).toBeVisible();
    await expect(tableChip.locator('text=Shift')).toBeVisible();

    // 6. Test Shifting the table
    console.log(`--- Step 5: Test Table Shift Flow ---`);
    await tableChip.click();

    const shiftModal = page.locator('h3:has-text("Shift / Reassign Seating")');
    await expect(shiftModal).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input#notifyGuestOnShift')).toBeChecked();

    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    console.log(`✅ All table assignment and shift checks passed successfully!`);
  });
});
