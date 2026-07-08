import { test, expect } from '@playwright/test';

test.describe('Visual Regression Baseline', () => {
  test('Homepage visually matches baseline', async ({ page }) => {
    // Wait for the hydration and initial animations
    await page.goto('/');
    
    // Specifically wait for the hero section image to load
    await expect(page.locator('img[alt="Sangeet Restaurant dining ambiance"]')).toBeVisible({ timeout: 15000 });
    
    // Give framer motion a second to finish entry animations
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('homepage-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Menu Page visually matches baseline', async ({ page }) => {
    await page.goto('/menu');
    await expect(page.locator('h3:has-text("Butter Chicken")').first()).toBeVisible({ timeout: 15000 });
    
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('menu-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('Admin Login visually matches baseline', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByText('Staff Portal Login')).toBeVisible({ timeout: 15000 });
    
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('admin-login-baseline.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
});
