import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = '/Users/amanrana/.gemini/antigravity/brain/751c82c2-540c-4678-8e7d-b6f84eddb98a';

const DEVICES = [
  { name: 'iPhone-SE_375x667', width: 375, height: 667 },
  { name: 'iPhone-14_390x844', width: 390, height: 844 },
  { name: 'iPhone-Pro-Max_430x932', width: 430, height: 932 },
  { name: 'Mobile-Landscape_844x390', width: 844, height: 390 },
  { name: 'iPad_768x1024', width: 768, height: 1024 },
  { name: 'Laptop-Short_1280x720', width: 1280, height: 720 },
  { name: 'Desktop_1440x900', width: 1440, height: 900 },
];

test.describe('Local Hero Responsive Audit & Visual Verification', () => {
  for (const dev of DEVICES) {
    test(`hero layout verification on ${dev.name}`, async ({ browser, baseURL }) => {
      const targetUrl = baseURL || 'http://localhost:3000';
      const context = await browser.newContext({
        viewport: { width: dev.width, height: dev.height },
      });
      const page = await context.newPage();

      await page.goto(targetUrl, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000); // Wait for entrance animations

      // Verify no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll, `Horizontal overflow detected on ${dev.name}`).toBeFalsy();

      // Measure bounding boxes
      const metrics = await page.evaluate(() => {
        const header = document.querySelector('header');
        const heroSection = document.querySelector('[data-testid="home-hero"]') || document.querySelector('section');
        const eyebrow = document.querySelector('[data-testid="hero-eyebrow"]');
        const h1 = heroSection?.querySelector('h1');
        const ctas = heroSection?.querySelectorAll('button');
        const highlights = document.querySelector('[data-testid="hero-highlights"]');

        const rect = (el: Element | null | undefined) => (el ? el.getBoundingClientRect() : null);

        const navRect = rect(header);
        const eyeRect = rect(eyebrow);
        const h1Rect = rect(h1);

        return {
          viewportHeight: window.innerHeight,
          navBottom: navRect ? Math.round(navRect.bottom) : 0,
          eyebrowTop: eyeRect ? Math.round(eyeRect.top) : null,
          eyebrowBottom: eyeRect ? Math.round(eyeRect.bottom) : null,
          h1Top: h1Rect ? Math.round(h1Rect.top) : null,
          ctaCount: ctas?.length ?? 0,
          highlightsVisible: highlights ? window.getComputedStyle(highlights).display !== 'none' : false,
        };
      });

      console.log(`[${dev.name}] NavBottom: ${metrics.navBottom}px, EyebrowTop: ${metrics.eyebrowTop}px, H1Top: ${metrics.h1Top}px`);

      // 1. Eyebrow badge MUST be strictly below navbar bottom (never hidden or overlapping)
      if (metrics.eyebrowTop !== null) {
        expect(
          metrics.eyebrowTop,
          `Eyebrow badge top (${metrics.eyebrowTop}px) must be >= navbar bottom (${metrics.navBottom}px) on ${dev.name}`
        ).toBeGreaterThanOrEqual(metrics.navBottom);
      }

      // 2. Headline must be below eyebrow
      if (metrics.h1Top !== null && metrics.eyebrowBottom !== null) {
        expect(
          metrics.h1Top,
          `H1 top (${metrics.h1Top}px) must be >= eyebrow bottom (${metrics.eyebrowBottom}px) on ${dev.name}`
        ).toBeGreaterThanOrEqual(metrics.eyebrowBottom);
      }

      // 3. CTAs must be present
      expect(metrics.ctaCount).toBeGreaterThanOrEqual(3);

      // 4. Save visual screenshot
      const screenshotPath = path.join(ARTIFACT_DIR, `local_verified_hero_${dev.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      await context.close();
    });
  }
});

