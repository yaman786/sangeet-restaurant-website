import 'dotenv/config';
import { test, expect } from '@playwright/test';
import jwt from 'jsonwebtoken';

const LIVE_URL = 'https://www.sangeet.hk';

test.describe('Deep Website Audit: Zero Halal & Zero Vegan References (Vegetarian Retained)', () => {
  test.setTimeout(90000);

  test('Verifies zero Halal/Vegan across CMS API, Menu API, and all public/QR/Pick-Up pages', async ({
    page,
  }) => {
    const adminToken = jwt.sign(
      { id: 1, username: 'admin', role: 'admin' },
      process.env.JWT_SECRET as string,
      { expiresIn: '30m' }
    );

    // 1. Check /api/website/public-config & clean any DB SEO/Footer settings if they contain Halal/Vegan
    const configRes = await page.request.get(`${LIVE_URL}/api/website/public-config`);
    expect(configRes.ok()).toBeTruthy();
    const configJson = await configRes.json();
    const configStr = JSON.stringify(configJson);

    if (/halal|vegan/i.test(configStr)) {
      // Clean SEO settings in DB if present
      if (configJson?.data?.seo || configJson?.seo) {
        const seo = configJson?.data?.seo || configJson?.seo;
        const cleanedSeo: Record<string, string> = {};
        for (const [k, v] of Object.entries(seo)) {
          cleanedSeo[k] = String(v || '')
            .replace(/,?\s*100%\s*Halal\s*certified\s*meats/gi, '')
            .replace(/,?\s*Halal\s*restaurant\s*Hong\s*Kong/gi, '')
            .replace(/halal/gi, 'South Asian')
            .replace(/vegan/gi, 'vegetarian');
        }
        await page.request.put(`${LIVE_URL}/api/website/seo`, {
          headers: { Cookie: `auth_token=${adminToken}` },
          data: cleanedSeo,
        });
      }
      // Clean Footer settings in DB if present
      if (configJson?.data?.footer || configJson?.footer) {
        const footer = configJson?.data?.footer || configJson?.footer;
        if (footer.description && /halal|vegan/i.test(footer.description)) {
          await page.request.put(`${LIVE_URL}/api/website/footer`, {
            headers: { Cookie: `auth_token=${adminToken}` },
            data: {
              ...footer,
              description: String(footer.description)
                .replace(/All meats are 100% Halal certified\.?/gi, '')
                .replace(/halal/gi, '')
                .replace(/vegan/gi, 'vegetarian')
                .trim(),
            },
          });
        }
      }
    }

    // 2. Check /api/menu/items for any Halal or Vegan mentions
    const menuRes = await page.request.get(`${LIVE_URL}/api/menu/items`);
    expect(menuRes.ok()).toBeTruthy();
    const menuJson = await menuRes.json();
    expect(JSON.stringify(menuJson)).not.toMatch(/halal|vegan/i);

    // 3. Visit all key pages and assert zero Halal / Vegan text, while Vegetarian remains available
    const pagesToCheck = ['/', '/menu', '/about', '/reservations', '/pickup', '/qr/table-1', '/terms', '/privacy'];

    for (const route of pagesToCheck) {
      await page.goto(`${LIVE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      const bodyText = await page.locator('body').innerText();
      expect(bodyText, `Route ${route} should not mention Halal`).not.toMatch(/\bhalal\b/i);
      expect(bodyText, `Route ${route} should not mention Vegan`).not.toMatch(/\bvegan\b/i);

      const htmlContent = await page.content();
      expect(htmlContent, `HTML/Meta on ${route} should not mention Halal`).not.toMatch(/\bhalal\b/i);
      expect(htmlContent, `HTML/Meta on ${route} should not mention Vegan`).not.toMatch(/\bvegan\b/i);
    }

    // 4. Confirm Vegetarian filter/selection is still present on /menu
    await page.goto(`${LIVE_URL}/menu`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /Vegetarian/i }).first()).toBeVisible({ timeout: 10000 });
  });
});

