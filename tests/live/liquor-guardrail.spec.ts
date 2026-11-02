import 'dotenv/config';
import { test, expect } from '@playwright/test';
import jwt from 'jsonwebtoken';
import path from 'path';

const LIVE_URL = 'https://www.sangeet.hk';
const ARTIFACT_DIR =
  '/Users/amanrana/.gemini/antigravity/brain/751c82c2-540c-4678-8e7d-b6f84eddb98a';

test.describe('4-Layer Liquor Licensing Guardrail in Admin Menu Management', () => {
  test.setTimeout(90000);

  test('Blocks saving Alcoholic Drink or Alcohol Keyword under Soft Drinks', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    const adminToken = jwt.sign(
      { id: 1, username: 'admin', role: 'admin' },
      process.env.JWT_SECRET as string,
      { expiresIn: '30m' }
    );

    await page.context().addCookies([
      {
        name: 'auth_token',
        value: adminToken,
        url: LIVE_URL,
      },
    ]);

    await page.addInitScript(
      (user) => {
        window.localStorage.setItem('sangeet_user', JSON.stringify(user));
      },
      {
        id: 1,
        username: 'admin',
        email: 'admin@sangeet.com',
        role: 'admin',
        full_name: 'Administrator',
      }
    );

    // 1. Navigate to /admin/menu-management & switch to Beverages section
    await page.goto(`${LIVE_URL}/admin/menu-management`, { waitUntil: 'domcontentloaded' });
    const drinksSectionBtn = page.getByTestId('menu-section-drinks');
    await expect(drinksSectionBtn).toBeVisible({ timeout: 25000 });
    await expect(drinksSectionBtn).toContainText('Beverages');
    await drinksSectionBtn.click();

    // 2. Open Add Beverage Item Modal
    await page.getByRole('button', { name: /\+ Add Beverage Item/i }).click();
    await expect(page.getByTestId('drink-alcohol-selector')).toBeVisible({ timeout: 10000 });

    // 3. Select "Soft Drinks" category -> defaults to Non-Alcoholic
    const categoryTrigger = page
      .locator('form')
      .getByRole('button', { name: /Select an option/i })
      .first();
    await categoryTrigger.click();
    await page.getByRole('button', { name: /Soft Drinks/i }).click();

    // Verify Non-Alcoholic is auto-selected for Soft Drinks
    await expect(page.getByTestId('drink-type-non-alcoholic')).toContainText('Selected');

    // 4. Guardrail 1: Toggle "Alcoholic (Dine-In Only)" while category is "Soft Drinks"
    await page.getByTestId('drink-type-alcoholic').click();
    const guardrailBanner = page.getByTestId('drink-compliance-guardrail');
    await expect(guardrailBanner).toBeVisible({ timeout: 5000 });
    await expect(guardrailBanner).toContainText(/Liquor Licensing Guardrail/i);
    await expect(guardrailBanner).toContainText(/Soft Drinks/i);

    // 5. Guardrail 2 & 3: Switch back to Non-Alcoholic, then type "Old Monk Rum & Coke" -> Keyword Scanner triggers guardrail
    await page.getByTestId('drink-type-non-alcoholic').click();
    await expect(guardrailBanner).toHaveCount(0);

    const nameInput = page.locator('form input[type="text"]').first();
    await nameInput.fill('Old Monk Rum & Coke');
    await expect(guardrailBanner).toBeVisible({ timeout: 5000 });
    await expect(guardrailBanner).toContainText(/rum/i);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'liquor_guardrail_modal_proof.png'),
      fullPage: false,
    });
  });
});
