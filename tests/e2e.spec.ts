import { test, expect } from '@playwright/test';

test.describe('Customer Flows', () => {
  test('should navigate to menu and verify structure', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Expect the title to contain "Sangeet"
    await expect(page).toHaveTitle(/Sangeet/);
    
    // Click on the Menu link in the navigation
    await page.click('text=Menu');
    
    // Verify we are on the menu page
    await expect(page).toHaveURL(/.*\/menu/);
    
    // Verify that the menu categories are visible
    await page.waitForSelector('main', { state: 'visible' });
  });

  test('should navigate to reservation page and show form', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Click on Reservations link
    await page.click('text=Reservations');
    
    // Verify URL
    await expect(page).toHaveURL(/.*\/reservations/);
    
    // Verify the reservation form is rendered
    await expect(page.locator('form')).toBeVisible();
    
    // Verify key form inputs are present
    await expect(page.locator('input[name="customer_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="date"]')).toBeVisible();
    await expect(page.locator('select[name="time"]')).toBeVisible();
  });
});
