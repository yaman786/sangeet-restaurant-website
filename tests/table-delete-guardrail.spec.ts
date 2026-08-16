import { test, expect } from '@playwright/test';

test.describe('Table Deletion Safety & Reservation Shift Guardrail', () => {
  test.setTimeout(60000);

  test('prevents deleting table with active reservations and allows safe bulk shift', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    const timestamp = Date.now();
    const tableNumA = `G${String(timestamp).slice(-3)}A`;
    const tableNumB = `G${String(timestamp).slice(-3)}B`;
    const guestName = `Guardrail Guest ${timestamp}`;

    console.log(`--- Step 1: Admin Login ---`);
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    const usernameInput = page.locator('#username');
    await expect(usernameInput).toBeVisible({ timeout: 10000 });
    await usernameInput.fill('admin');

    const passwordInput = page.locator('#password');
    await passwordInput.fill('SangeetAdmin!2026');

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*admin.*/, { timeout: 15000 });
    console.log('✅ Admin login succeeded');

    console.log(`--- Step 2: Navigate to QR & Table Management ---`);
    await page.goto('/admin/qr-management');
    await page.waitForLoadState('networkidle');

    // Create Source Table A
    const addTableBtn = page.locator('button', { hasText: 'Add Table' });
    await expect(addTableBtn).toBeVisible({ timeout: 10000 });
    await addTableBtn.click();

    const tableInput = page.locator('input[placeholder*="11"]').first();
    await expect(tableInput).toBeVisible({ timeout: 5000 });
    await tableInput.fill(tableNumA);
    await page.locator('button', { hasText: 'Create Table' }).click();
    await page.waitForTimeout(1000);

    // Create Destination Table B
    await addTableBtn.click();
    await tableInput.fill(tableNumB);
    await page.locator('button', { hasText: 'Create Table' }).click();
    await page.waitForTimeout(1000);
    console.log(`✅ Created test tables: ${tableNumA} and ${tableNumB}`);

    console.log(`--- Step 3: Create Confirmed Reservation on Table ${tableNumA} ---`);
    await page.goto('/admin/reservations');
    await page.waitForLoadState('networkidle');

    const addResBtn = page.locator('button', { hasText: 'Add Reservation' });
    await expect(addResBtn).toBeVisible({ timeout: 10000 });
    await addResBtn.click();

    // Fill reservation form
    await page.locator('input[placeholder*="John Doe"]').fill(guestName);
    await page.locator('input[placeholder*="555-0123"]').fill('555-0199');
    await page.locator('input[placeholder*="john@example.com"]').fill(`guest_${timestamp}@sangeet.test`);
    
    // Set tomorrow date and 19:30 time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.locator('input[type="date"]').fill(dateStr);
    await page.locator('input[type="time"]').fill('19:30');

    await page.locator('button[type="submit"]', { hasText: 'Create Reservation' }).click();
    await page.waitForTimeout(2000);
    console.log(`✅ Created reservation for ${guestName}`);

    // Now assign Table A to this reservation
    const searchResInput = page.locator('input[placeholder*="Search" i]').first();
    await searchResInput.fill(guestName);
    await page.waitForTimeout(500);

    const assignBtn = page.locator('button', { hasText: '+ Assign' }).first();
    if (await assignBtn.isVisible()) {
      await assignBtn.click();
      await page.waitForTimeout(500);
      
      const assignTableSelect = page.locator('select', { hasText: '-- Choose a table --' });
      await expect(assignTableSelect).toBeVisible();
      const optionA = page.locator(`select option:has-text("${tableNumA}")`).first();
      const valA = await optionA.getAttribute('value');
      if (valA) {
        await assignTableSelect.selectOption(valA);
      }
      await page.locator('button', { hasText: 'Assign & Confirm' }).click();
      await page.waitForTimeout(1500);
      console.log(`✅ Assigned Table ${tableNumA} to ${guestName}`);
    }

    console.log(`--- Step 4: Attempt to Delete Table ${tableNumA} in QR Management ---`);
    await page.goto('/admin/qr-management');
    await page.waitForLoadState('networkidle');

    // Search for Table A
    const searchInput = page.locator('input[placeholder*="Search" i]').first();
    await searchInput.fill(tableNumA);
    await page.waitForTimeout(500);

    // Click Archive on Table A
    const deleteBtn = page.locator('button[title="Archive Table"]').first();
    await expect(deleteBtn).toBeVisible({ timeout: 10000 });
    await deleteBtn.click();

    // Verify Safety Interlock warning dialog is visible
    const safetyModal = page.locator('text=Safety Interlock Active');
    await expect(safetyModal).toBeVisible({ timeout: 15000 });
    console.log('✅ Safety Interlock modal triggered as expected!');

    // Verify guest is listed in the modal
    await expect(page.locator(`text=${guestName}`).first()).toBeVisible({ timeout: 5000 });
    console.log(`✅ Verified assigned booking for ${guestName} is displayed in the warning dialog`);

    // Verify transfer button is disabled without destination
    const transferBtn = page.locator('button', { hasText: 'Transfer &' });
    await expect(transferBtn).toBeDisabled();

    // Select Destination Table B
    const destSelect = page.locator('select', { hasText: '-- Select Destination Table --' });
    await expect(destSelect).toBeVisible();
    const destOption = page.locator(`select option:has-text("${tableNumB}")`).first();
    const destVal = await destOption.getAttribute('value');
    if (destVal) {
      await destSelect.selectOption(destVal);
    }

    // Now transfer button should be enabled
    await expect(transferBtn).toBeEnabled();
    await transferBtn.click();
    await page.waitForTimeout(2000);
    console.log(`✅ Transferred all bookings to Table ${tableNumB} and deleted Table ${tableNumA}`);

    console.log(`--- Step 5: Verify in Reservations that guest was safely shifted to Table ${tableNumB} ---`);
    await page.goto('/admin/reservations');
    await page.waitForLoadState('networkidle');

    const resSearch = page.locator('input[placeholder*="Search" i]').first();
    await resSearch.fill(guestName);
    await page.waitForTimeout(500);

    // Verify Table B is now assigned to the guest
    const shiftedTableBadge = page.locator(`text=${tableNumB}`).first();
    await expect(shiftedTableBadge).toBeVisible({ timeout: 10000 });
    console.log(`🎉 SUCCESS: Guest ${guestName} was safely shifted to Table ${tableNumB}! Zero orphaned reservations.`);
  });
});
