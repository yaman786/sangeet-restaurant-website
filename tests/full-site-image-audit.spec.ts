import { test, expect } from '@playwright/test';

const PAGES = [
  '/',
  '/menu',
  '/pickup',
  '/about',
  '/reservations',
  '/contact',
  '/location',
  '/track-order',
  '/terms',
  '/privacy',
  '/admin/login',
];

test.describe('Full-Website Image Health Audit', () => {
  test.setTimeout(120000);

  test('every public page loads all images cleanly without broken <img> or 4xx/5xx responses', async ({ page }) => {
    const baseUrl = process.env.AUDIT_URL || 'https://www.sangeet.hk';
    const allFailures: Array<{ route: string; type: string; detail: string }> = [];

    for (const route of PAGES) {
      const failedRequests: Array<{ url: string; status: number }> = [];
      const onResponse = (res: any) => {
        const req = res.request();
        const resourceType = req.resourceType();
        const url = res.url();
        if (
          (resourceType === 'image' || /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(url) || url.includes('/_next/image')) &&
          res.status() >= 400
        ) {
          failedRequests.push({ url, status: res.status() });
        }
      };

      page.on('response', onResponse);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 30000 });

      // Scroll through the page to trigger lazy-loaded images
      await page.evaluate(async () => {
        const step = 600;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(800);

      // Force all images on the page to load eagerly and verify every single one decodes cleanly
      const checkImgs = async (label: string) => {
        const brokenImgs = await page.evaluate(async () => {
          const imgs = Array.from(document.querySelectorAll('img'));
          for (const img of imgs) {
            if (img.loading === 'lazy') {
              img.loading = 'eager';
            }
          }
          await Promise.all(
            imgs.map((img) => {
              if (img.complete && img.naturalWidth > 0) return Promise.resolve();
              return new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
                setTimeout(resolve, 12000);
              });
            })
          );
          return imgs
            .filter((img) => !img.complete || img.naturalWidth === 0 || (img.currentSrc || img.src).includes('/_next/image'))
            .map((img) => ({
              alt: img.alt,
              src: img.currentSrc || img.src,
              complete: img.complete,
              naturalWidth: img.naturalWidth,
            }));
        });
        for (const b of brokenImgs) {
          allFailures.push({
            route: `${route} (${label})`,
            type: 'broken_img',
            detail: `alt="${b.alt}" src="${b.src}" complete=${b.complete} naturalWidth=${b.naturalWidth}`,
          });
        }
      };

      await checkImgs('default');

      if (route === '/menu') {
        const drinksTab = page.getByTestId('public-menu-drinks');
        if (await drinksTab.isVisible()) {
          await drinksTab.click();
          await page.waitForTimeout(1000);
          await page.evaluate(async () => {
            for (let y = 0; y < Math.min(document.body.scrollHeight, 3600); y += 600) {
              window.scrollTo(0, y);
              await new Promise((r) => setTimeout(r, 120));
            }
          });
          await page.waitForTimeout(800);
          await checkImgs('beverages');
        }
      }

      if (route === '/pickup') {
        const drinksTab = page.getByTestId('qr-menu-drinks');
        if (await drinksTab.isVisible()) {
          await drinksTab.click();
          await page.waitForTimeout(1000);
          await page.evaluate(async () => {
            for (let y = 0; y < Math.min(document.body.scrollHeight, 3600); y += 600) {
              window.scrollTo(0, y);
              await new Promise((r) => setTimeout(r, 120));
            }
          });
          await page.waitForTimeout(800);
          await checkImgs('beverages');
        }
      }

      for (const f of failedRequests) {
        allFailures.push({
          route,
          type: 'http_error',
          detail: `HTTP ${f.status} ${f.url}`,
        });
      }

      page.off('response', onResponse);
    }

    if (allFailures.length > 0) {
      console.log('FOUND IMAGE FAILURES:\n' + JSON.stringify(allFailures, null, 2));
    } else {
      console.log('ALL PAGES & IMAGES PASSED WITH ZERO BROKEN IMAGES!');
    }
    expect(allFailures).toEqual([]);
  });
});
