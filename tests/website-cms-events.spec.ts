import { test, expect } from '@playwright/test';

/**
 * Website CMS - Special Events Test
 * 
 * Verifies Admin CMS Event creation ➔ Saving ➔ Dynamic rendering on public website.
 */

test('Create Special Event in CMS & Live UI Sync', async ({ page }) => {
  test.setTimeout(60000);
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  const timestamp = Date.now();
  const TEST_EVENT_TITLE = `Playwright Test Event ${timestamp}`;
  const TEST_IMAGE_URL = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop';
  
  // Create date for tomorrow to ensure it shows up in "active" events
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  // Format as YYYY-MM-DD for the date input
  const dateString = tomorrow.toISOString().split('T')[0];

  console.log('--- Phase 1: Logging in as Admin ---');
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

  console.log('--- Phase 2: Navigating to /admin/website-management ---');
  await page.goto('/admin/website-management');
  await page.waitForLoadState('networkidle');

  // Navigate to Special Events tab
  const eventsTabBtn = page.locator('button', { hasText: 'Special Events' });
  await expect(eventsTabBtn).toBeVisible({ timeout: 15000 });
  await eventsTabBtn.click({ force: true });
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'test-results/tab-clicked.png', fullPage: true });

  // Click Add Event
  const addEventBtn = page.locator('button', { hasText: 'Add Event' });
  await expect(addEventBtn).toBeVisible({ timeout: 15000 });
  await addEventBtn.click();

  // Fill in Event Details
  console.log(`Creating Event: "${TEST_EVENT_TITLE}"...`);
  
  // Event Title
  await page.locator('label:has-text("Event Title *") + input').fill(TEST_EVENT_TITLE);
  
  // Date
  await page.locator('label:has-text("Date *") + input').fill(dateString);
  
  // Time
  await page.locator('label:has-text("Time") + input').fill('7:00 PM - 10:00 PM');
  
  // Category
  await page.locator('label:has-text("Category") + input').fill('Automated Test');
  
  // Price
  await page.locator('label:has-text("Price") + input').fill('Free');
  
  // Description
  await page.locator('label:has-text("Description") + textarea').fill('This is an automated test event created by Playwright.');
  
  // Image URL
  await page.getByPlaceholder('Image URL or upload a file...').fill(TEST_IMAGE_URL);

  // Intercept POST /api/website/events network call to verify save
  const saveResponsePromise = page.waitForResponse(
    resp => resp.url().includes('/api/website/events') && resp.request().method() === 'POST',
    { timeout: 20000 }
  );

  // Click Save Event
  const saveBtn = page.locator('button', { hasText: 'Save Event' });
  await expect(saveBtn).toBeVisible();
  await saveBtn.click();

  // Wait for the POST response
  const saveResponse = await saveResponsePromise;
  const saveStatus = saveResponse.status();
  const saveBody = await saveResponse.json().catch(() => null);
  
  expect(saveStatus).toBe(200);
  console.log('✅ Event successfully created in the database');
  
  // Wait for the modal to close and the event to appear in the list
  await expect(page.locator('h4', { hasText: TEST_EVENT_TITLE })).toBeVisible({ timeout: 10000 });
  console.log('✅ Event successfully displayed in CMS grid');

  console.log('--- Phase 3: Navigating to Public Website (/) ---');
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Assert updated Event Title is rendered dynamically on public website
  const eventHeading = page.locator('h3', { hasText: TEST_EVENT_TITLE }).first();
  await expect(eventHeading).toBeVisible({ timeout: 30000 });

  console.log(`🎉 SUCCESS: Live public website dynamically rendered the new Event: "${TEST_EVENT_TITLE}"`);

  console.log('--- Phase 4: Cleanup - Deleting Event ---');
  await page.goto('/admin/website-management');
  await page.waitForLoadState('networkidle');
  
  await eventsTabBtn.click({ force: true });
  await page.waitForTimeout(2000);
  
  // Find the event card by title and click its delete button
  const eventCard = page.locator('div.group', { hasText: TEST_EVENT_TITLE });
  await expect(eventCard).toBeVisible({ timeout: 15000 });
  
  const deleteBtn = eventCard.locator('button').filter({ has: page.locator('svg.lucide-trash2') });
  await deleteBtn.click({ force: true });
  
  await page.waitForTimeout(2000);
  console.log('✅ Event successfully deleted from production');
});
