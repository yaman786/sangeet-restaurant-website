import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = '/Users/amanrana/.gemini/antigravity/brain/751c82c2-540c-4678-8e7d-b6f84eddb98a';

test.describe('Social Media Channels (Instagram & Facebook) Suite', () => {

  test('1. API: /api/website/public-config and /api/website/social return valid social channels', async ({ request }) => {
    // Check public-config
    const pubRes = await request.get('/api/website/public-config');
    expect(pubRes.ok()).toBeTruthy();
    const pubData = await pubRes.json();
    expect(pubData.social).toBeDefined();
    expect(pubData.social.instagram).toContain('instagram.com');
    expect(pubData.social.facebook).toContain('facebook.com');
    console.log('✅ Public config social links:', pubData.social);

    // Check direct social endpoint
    const socRes = await request.get('/api/website/social');
    expect(socRes.ok()).toBeTruthy();
    const socData = await socRes.json();
    expect(socData.instagram).toContain('instagram.com');
    expect(socData.facebook).toContain('facebook.com');
    console.log('✅ Direct /api/website/social links:', socData);
  });

  test('2. Public Site: Footer renders Instagram and Facebook links with valid URLs', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Scroll to footer
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000); // let entrance animation complete

    const instaLink = page.locator('[data-testid="footer-instagram-link"]');
    const fbLink = page.locator('[data-testid="footer-facebook-link"]');

    await expect(instaLink).toBeVisible();
    await expect(fbLink).toBeVisible();

    const instaHref = await instaLink.getAttribute('href');
    const fbHref = await fbLink.getAttribute('href');

    expect(instaHref).toContain('instagram.com');
    expect(fbHref).toContain('facebook.com');

    // Ensure they open in a new tab safely
    expect(await instaLink.getAttribute('target')).toBe('_blank');
    expect(await instaLink.getAttribute('rel')).toBe('noopener noreferrer');
    expect(await fbLink.getAttribute('target')).toBe('_blank');
    expect(await fbLink.getAttribute('rel')).toBe('noopener noreferrer');

    await footer.screenshot({
      path: path.join(ARTIFACT_DIR, 'public_footer_social_links.png'),
    });
    console.log('✅ Footer social links verified and screenshot captured.');
  });

  test('3. Public Site: Contact Page renders social media connect buttons', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'networkidle' });

    const instaLink = page.locator('[data-testid="contact-instagram-link"]');
    const fbLink = page.locator('[data-testid="contact-facebook-link"]');

    await instaLink.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    await expect(instaLink).toBeVisible();
    await expect(fbLink).toBeVisible();

    const instaHref = await instaLink.getAttribute('href');
    const fbHref = await fbLink.getAttribute('href');

    expect(instaHref).toContain('instagram.com');
    expect(fbHref).toContain('facebook.com');

    // Screenshot the contact information card
    const contactCard = page.locator('text=Connect With Us').locator('..');
    await contactCard.screenshot({
      path: path.join(ARTIFACT_DIR, 'public_contact_social_links.png'),
    });
    console.log('✅ Contact page social links verified and screenshot captured.');
  });

  test('4. Mobile View: Navigation drawer renders social links', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }, // Mobile viewport
    });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });

    // Open mobile hamburger menu
    const hamburger = page.locator('button[aria-label="Open menu"]');
    await hamburger.click();
    await page.waitForTimeout(600); // Wait for drawer animation

    const mobileInsta = page.locator('[data-testid="mobile-nav-instagram"]');
    const mobileFb = page.locator('[data-testid="mobile-nav-facebook"]');

    await expect(mobileInsta).toBeVisible();
    await expect(mobileFb).toBeVisible();

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'mobile_drawer_social_links.png'),
      fullPage: false,
    });
    console.log('✅ Mobile drawer social links verified.');
    await context.close();
  });

  test('5. Admin CMS: Website Management has Social Media Channels section with working controls', async ({ page }) => {
    // 1. Login as admin
    await page.goto('/admin/login', { waitUntil: 'networkidle' });
    await page.fill('#username', 'admin');
    await page.fill('#password', 'SangeetAdmin!2026');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL(/.*\/admin\/dashboard/, { timeout: 15000 });

    // 2. Navigate to CMS Website Management
    await page.goto('/admin/website-management', { waitUntil: 'networkidle' });
    
    // Wait for loading indicator to finish
    await page.waitForSelector('text=Loading Website CMS Engine...', { state: 'detached', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // 3. Switch to Contact & Social Tab
    const contactTabBtn = page.locator('button').filter({ hasText: 'Contact & Social' });
    await expect(contactTabBtn).toBeVisible({ timeout: 10000 });
    await contactTabBtn.click();
    await page.waitForTimeout(600);

    // 4. Verify Social Media section
    const socialHeader = page.locator('text=Social Media Channels');
    await expect(socialHeader).toBeVisible();

    const saveChannelsBtn = page.locator('button:has-text("Save Channels")');
    await expect(saveChannelsBtn).toBeVisible();

    const instaInput = page.locator('input[placeholder*="instagram.com"]');
    const fbInput = page.locator('input[placeholder*="facebook.com"]');

    await expect(instaInput).toBeVisible();
    await expect(fbInput).toBeVisible();

    expect(await instaInput.inputValue()).toContain('instagram.com');
    expect(await fbInput.inputValue()).toContain('facebook.com');

    // Screenshot the Social Channels card
    const socialCard = page.locator('text=Social Media Channels').locator('xpath=ancestor::div[contains(@class, "rounded-xl")][1]');
    await socialCard.screenshot({
      path: path.join(ARTIFACT_DIR, 'cms_admin_social_channels_card.png'),
    });
    console.log('✅ CMS Admin social channels verified and screenshot captured.');
  });
});
