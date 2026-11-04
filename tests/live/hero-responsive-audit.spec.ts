import { test } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Hero Section Responsive Audit (diagnostic — does not fail, it measures & screenshots).
 * Measures every hero element against the fixed navbar bottom and the viewport bottom,
 * so we can see exactly what is hidden behind the nav or clipped off-screen.
 */
const LIVE_URL = process.env.BASE_URL || 'https://www.sangeet.hk';
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

test.describe('Hero Responsive Audit', () => {
  test.setTimeout(120000);

  test('measure hero overlap across devices', async ({ browser }) => {
    const report: string[] = [];

    for (const d of DEVICES) {
      const context = await browser.newContext({ viewport: { width: d.width, height: d.height } });
      const page = await context.newPage();
      await page.goto(LIVE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500); // let entrance animations settle

      const m = await page.evaluate(() => {
        const header = document.querySelector('header');
        const section = document.querySelector('section');
        const rect = (el: Element | null) => (el ? el.getBoundingClientRect() : null);
        const navBottom = rect(header)?.bottom ?? 0;
        const vh = window.innerHeight;
        const secRect = rect(section);
        const content = section?.querySelector('div.relative.z-20');
        const eyebrow = content?.children[0] ?? null;
        const h1 = section?.querySelector('h1') ?? null;
        const ctas = Array.from(section?.querySelectorAll('button') ?? []);
        const badges = content?.children[4] ?? null;
        const r = (el: Element | null) => {
          const b = rect(el);
          return b ? { top: Math.round(b.top), bottom: Math.round(b.bottom) } : null;
        };
        return {
          vh,
          navBottom: Math.round(navBottom),
          sectionBottom: secRect ? Math.round(secRect.bottom) : null,
          contentHeight: content ? Math.round(content.getBoundingClientRect().height) : null,
          eyebrow: r(eyebrow),
          h1: r(h1),
          ctas: ctas.map((b) => ({ text: b.textContent?.trim(), ...r(b) })),
          badges: r(badges),
          hScroll: document.documentElement.scrollWidth > window.innerWidth,
        };
      });

      const visibleTop = m.navBottom;
      const visibleBottom = Math.min(m.vh, m.sectionBottom ?? m.vh);
      const issues: string[] = [];
      if (m.eyebrow && m.eyebrow.top < visibleTop) issues.push(`Eyebrow pill hidden behind navbar (top ${m.eyebrow.top}px < nav ${visibleTop}px)`);
      if (m.h1 && m.h1.top < visibleTop) issues.push(`Headline overlaps navbar (top ${m.h1.top}px)`);
      for (const c of m.ctas) {
        if (c.bottom !== undefined && c.bottom > visibleBottom) issues.push(`CTA "${c.text}" cut off (bottom ${c.bottom}px > visible ${visibleBottom}px)`);
      }
      if (m.badges && m.badges.bottom > visibleBottom) issues.push(`Feature badges cut off / below fold (bottom ${m.badges.bottom}px)`);
      if (m.hScroll) issues.push('Horizontal scroll detected');

      report.push(
        `### ${d.name}\n- Viewport height: ${m.vh}px | Navbar bottom: ${m.navBottom}px | Hero content height: ${m.contentHeight}px (space available: ${m.vh - m.navBottom}px)\n` +
          (issues.length ? issues.map((i) => `- ❌ ${i}`).join('\n') : '- ✅ All hero content visible') +
          '\n'
      );

      await page.screenshot({ path: path.join(ARTIFACT_DIR, `hero_audit_${d.name}.png`), fullPage: false });
      await context.close();
    }

    fs.writeFileSync(path.join(ARTIFACT_DIR, 'scratch', 'hero_audit_report.md'), report.join('\n'));
    console.log('\n' + report.join('\n'));
  });
});

