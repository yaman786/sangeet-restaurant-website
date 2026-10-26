import { defineConfig, devices } from '@playwright/test';

/**
 * Live production smoke-test config.
 * Targets the deployed site directly — no local webServer is started.
 * Usage: npx playwright test --config=playwright.live.config.ts
 */
export default defineConfig({
  testDir: './tests/live',
  fullyParallel: true,
  retries: 1,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: process.env.LIVE_URL || 'https://www.sangeet.hk',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
});
