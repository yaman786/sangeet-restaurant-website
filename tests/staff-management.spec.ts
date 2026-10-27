import { test, expect, request as playwrightRequest, type Page, type APIRequestContext } from '@playwright/test';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'SangeetAdmin!2026';

const suffix = Date.now().toString(36);
const QA_USERNAME = `qa_staff_${suffix}`;
const QA_EMAIL = `${QA_USERNAME}@example.com`;
const QA_PASSWORD = 'QaStaff!2026x';

const row = (page: Page, username: string) => page.getByTestId(`staff-row-${username}`);

async function loginAsAdmin(page: Page) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('#username').fill(ADMIN_USERNAME);
  await page.locator('#password').fill(ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*admin.*/, { timeout: 20000 });
}

async function openStaffManagement(page: Page) {
  await page.goto('/admin/staff-management', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Staff Management', level: 1 }).first()).toBeVisible({ timeout: 20000 });
}

async function currentAdminId(api: APIRequestContext): Promise<number> {
  const res = await api.get('/api/auth/me');
  expect(res.status()).toBe(200);
  return (await res.json()).user.id;
}

test.describe('Staff Management (admin)', () => {
  test.describe.configure({ mode: 'serial' });

  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await (await browser.newContext()).newPage();
    await loginAsAdmin(page);
  });

  test.afterAll(async () => {
    await page.context().close();
  });

  test('stays logged in on /admin/staff-management and lists the current admin', async () => {
    await openStaffManagement(page);

    // Regression: the page used to call /api/auth/profile (404) and then log the admin out.
    await expect(page).toHaveURL(/\/admin\/staff-management/);
    await expect(page.getByTestId('staff-error')).toHaveCount(0);

    const adminRow = row(page, ADMIN_USERNAME);
    await expect(adminRow).toBeVisible();
    await expect(adminRow.getByText('You', { exact: true })).toBeVisible();
    await expect(page.locator('#staff-add-user')).toBeVisible();

    // Still authenticated after the page settled.
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL(/\/admin\/staff-management/);
  });

  test('prevents admins from deleting or disabling themselves in the UI', async () => {
    const adminRow = row(page, ADMIN_USERNAME);
    await expect(page.getByTestId(`staff-delete-${ADMIN_USERNAME}`)).toBeDisabled();
    await expect(page.getByTestId(`staff-toggle-${ADMIN_USERNAME}`)).toBeDisabled();
    await expect(adminRow).toBeVisible();
  });

  test('creates a staff member through the UI', async () => {
    await page.locator('#staff-add-user').click();
    await expect(page.getByTestId('staff-form')).toBeVisible();

    await page.locator('#staff-full-name').fill('QA Kitchen Tester');
    await page.locator('#staff-phone').fill('+85212345678');
    await page.locator('#staff-username').fill(QA_USERNAME);
    await page.locator('#staff-email').fill(QA_EMAIL);
    await page.locator('#staff-password').fill(QA_PASSWORD);
    await page.locator('#staff-role').selectOption('kitchen');
    await page.locator('#staff-form-submit').click();

    const created = row(page, QA_USERNAME);
    await expect(created).toBeVisible({ timeout: 15000 });
    await expect(created).toContainText('QA Kitchen Tester');
    await expect(created).toContainText('Kitchen Staff');
    await expect(created).toContainText('Active Account');
  });

  test('rejects duplicate usernames with a clear error', async () => {
    await page.locator('#staff-add-user').click();
    await page.locator('#staff-full-name').fill('Duplicate Person');
    await page.locator('#staff-username').fill(QA_USERNAME);
    await page.locator('#staff-email').fill(`other_${QA_EMAIL}`);
    await page.locator('#staff-password').fill(QA_PASSWORD);
    await page.locator('#staff-form-submit').click();

    await expect(page.getByText('Username or email already exists')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByTestId('staff-form')).toHaveCount(0);
  });

  test('edits a staff member (name and role)', async () => {
    await page.getByTestId(`staff-edit-${QA_USERNAME}`).click();
    await expect(page.locator('#staff-full-name')).toHaveValue('QA Kitchen Tester');

    await page.locator('#staff-full-name').fill('QA Reception Tester');
    await page.locator('#staff-role').selectOption('reception');
    await page.locator('#staff-form-submit').click();

    const updated = row(page, QA_USERNAME);
    await expect(updated).toContainText('QA Reception Tester', { timeout: 15000 });
    await expect(updated).toContainText('Reception');
  });

  test('disables a staff member and blocks their login, then re-enables', async ({ playwright }) => {
    await page.getByTestId(`staff-toggle-${QA_USERNAME}`).click();
    await page.locator('#staff-confirm-action').click();
    await expect(row(page, QA_USERNAME)).toContainText('Disabled Account', { timeout: 15000 });

    const anon = await playwright.request.newContext({ baseURL: process.env.BASE_URL || 'http://localhost:3000' });
    const blocked = await anon.post('/api/auth/login', { data: { username: QA_USERNAME, password: QA_PASSWORD } });
    expect(blocked.status()).toBe(401);
    await anon.dispose();

    await page.getByTestId(`staff-toggle-${QA_USERNAME}`).click();
    await page.locator('#staff-confirm-action').click();
    await expect(row(page, QA_USERNAME)).toContainText('Active Account', { timeout: 15000 });
  });

  test('server enforces self-protection and input validation', async () => {
    const api = page.request;
    const adminId = await currentAdminId(api);

    const selfDelete = await api.delete(`/api/auth/users/${adminId}`);
    expect(selfDelete.status()).toBe(409);

    const selfToggle = await api.patch(`/api/auth/users/${adminId}/toggle-status`);
    expect(selfToggle.status()).toBe(409);

    const selfDemote = await api.put(`/api/auth/users/${adminId}`, { data: { role: 'waiter' } });
    expect(selfDemote.status()).toBe(409);

    const weak = await api.post('/api/auth/users', {
      data: { username: `${QA_USERNAME}_w`, email: `w_${QA_EMAIL}`, role: 'waiter', password: 'weak', full_name: 'Weak Pass' }
    });
    expect(weak.status()).toBe(400);

    const badRole = await api.post('/api/auth/users', {
      data: { username: `${QA_USERNAME}_r`, email: `r_${QA_EMAIL}`, role: 'superuser', password: QA_PASSWORD, full_name: 'Bad Role' }
    });
    expect(badRole.status()).toBe(400);

    const badId = await api.delete('/api/auth/users/not-a-number');
    expect(badId.status()).toBe(400);

    const missing = await api.delete('/api/auth/users/99999999');
    expect(missing.status()).toBe(404);
  });

  test('exposes stats and a paginated list that match the UI contract', async () => {
    const stats = await page.request.get('/api/auth/users/stats');
    expect(stats.status()).toBe(200);
    const body = await stats.json();
    for (const key of ['total', 'active', 'inactive', 'admins', 'staff', 'recent']) {
      expect(typeof body[key]).toBe('number');
    }
    expect(body.roles.admin).toBeGreaterThanOrEqual(1);

    const list = await page.request.get('/api/auth/users?page=1&limit=5');
    expect(list.status()).toBe(200);
    const payload = await list.json();
    expect(payload.data.length).toBeLessThanOrEqual(5);
    expect(payload.metadata.limit).toBe(5);
    for (const u of payload.data) {
      expect(u).not.toHaveProperty('password_hash');
    }
  });

  test('profile endpoint returns the signed-in user without secrets', async () => {
    const res = await page.request.get('/api/auth/profile');
    expect(res.status()).toBe(200);
    const profile = await res.json();
    expect(profile.username).toBe(ADMIN_USERNAME);
    expect(profile).not.toHaveProperty('password_hash');
  });

  test('deletes (soft) a staff member through the UI', async () => {
    await page.getByTestId(`staff-delete-${QA_USERNAME}`).click();
    await page.locator('#staff-confirm-action').click();
    await expect(row(page, QA_USERNAME)).toHaveCount(0, { timeout: 15000 });

    // Deleted accounts cannot sign in.
    const anon = await playwrightRequest.newContext({ baseURL: process.env.BASE_URL || 'http://localhost:3000' });
    const res = await anon.post('/api/auth/login', { data: { username: QA_USERNAME, password: QA_PASSWORD } });
    expect(res.status()).toBe(401);
    await anon.dispose();
  });
});

test.describe('Staff Management API without authentication', () => {
  const endpoints: Array<{ method: 'get' | 'post' | 'put' | 'delete' | 'patch'; url: string }> = [
    { method: 'get', url: '/api/auth/users' },
    { method: 'post', url: '/api/auth/users' },
    { method: 'get', url: '/api/auth/users/stats' },
    { method: 'put', url: '/api/auth/users/1' },
    { method: 'delete', url: '/api/auth/users/1' },
    { method: 'patch', url: '/api/auth/users/1/toggle-status' },
    { method: 'get', url: '/api/auth/profile' },
    { method: 'post', url: '/api/auth/change-password' }
  ];

  for (const { method, url } of endpoints) {
    test(`${method.toUpperCase()} ${url} requires authentication`, async ({ request }) => {
      const res = await request[method](url, method === 'get' || method === 'delete' ? undefined : { data: {} });
      expect(res.status()).toBe(401);
    });
  }
});

test.describe('Forgot Password Flow & Assistance UI', () => {
  test('login page has working Forgot Password modal and assistance info', async ({ page }) => {
    await page.goto('/admin/login');
    const forgotLink = page.getByTestId('forgot-password-link');
    await expect(forgotLink).toBeVisible();

    await forgotLink.click();
    const modal = page.getByTestId('forgot-password-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Staff Password Assistance');
    await expect(modal).toContainText('+852 26568820');

    // Fill identifier and submit
    await page.fill('#forgot-identifier', 'admin');
    await page.getByTestId('submit-forgot-password').click();

    // Verify response message
    await expect(modal).toContainText('Password reset request received');

    // Close modal
    await page.getByTestId('close-forgot-modal').click();
    await expect(modal).toBeHidden();
  });

  test('POST /api/auth/forgot-password validates input properly', async ({ request }) => {
    const empty = await request.post('/api/auth/forgot-password', { data: { identifier: '' } });
    expect(empty.status()).toBe(400);

    const valid = await request.post('/api/auth/forgot-password', { data: { identifier: 'admin' } });
    expect(valid.status()).toBe(200);
    const body = await valid.json();
    expect(body.message).toBeTruthy();
  });
});

