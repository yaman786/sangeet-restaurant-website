import { test, expect, request as playwrightRequest, type Page, type APIRequestContext } from '@playwright/test';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'SangeetAdmin!2026';

const suffix = Date.now().toString(36);
const phoneDigits = String(Date.now()).slice(-8);
const QA_PHONE = `+852${phoneDigits}`;
const QA_USERNAME = `qa_kitchen_tester_${phoneDigits.slice(-4)}`;
const QA_EMAIL = `${QA_USERNAME}@example.com`;
const QA_PASSWORD = 'QaStaff!2026x';

const row = (page: Page, username: string) => page.getByTestId(`staff-row-${username}`);

async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login', { waitUntil: 'networkidle' });
  await page.locator('#username').fill(ADMIN_USERNAME);
  await expect(page.locator('#username')).toHaveValue(ADMIN_USERNAME);
  await page.locator('#password').fill(ADMIN_PASSWORD);
  await expect(page.locator('#password')).toHaveValue(ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*admin\/dashboard.*/, { timeout: 20000 });
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
    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Order Management' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Menu Management' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Staff Management' })).toBeVisible();

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

  test('creates a staff member through the UI (mobile number mandatory, no username input)', async () => {
    await page.locator('#staff-add-user').click();
    await expect(page.getByTestId('staff-form')).toBeVisible();
    await expect(page.locator('#staff-username')).toHaveCount(0);

    await page.locator('#staff-full-name').fill('QA Kitchen Tester');
    await page.locator('#staff-phone').fill(QA_PHONE);
    await page.locator('#staff-email').fill(QA_EMAIL);
    await page.locator('#staff-password').fill(QA_PASSWORD);
    await page.locator('#staff-role').selectOption('kitchen');
    await page.locator('#staff-form-submit').click();

    const created = row(page, QA_USERNAME);
    await expect(created).toBeVisible({ timeout: 15000 });
    await expect(created).toContainText('QA Kitchen Tester');
    await expect(created).toContainText(QA_PHONE);
    await expect(created).toContainText('Kitchen Staff');
    await expect(created).toContainText('Active Account');
  });

  test('rejects duplicate mobile numbers or emails with a clear error', async () => {
    await page.locator('#staff-add-user').click();
    await page.locator('#staff-full-name').fill('Duplicate Person');
    await page.locator('#staff-phone').fill(QA_PHONE);
    await page.locator('#staff-email').fill(`other_${QA_EMAIL}`);
    await page.locator('#staff-password').fill(QA_PASSWORD);
    await page.locator('#staff-form-submit').click();

    await expect(page.getByText('Username, mobile number, or email already exists')).toBeVisible({ timeout: 10000 });
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

    // Strictly ONE Super Admin: creating a second 'admin' (Super Admin) is blocked with 409 Conflict
    const secondSuperAdmin = await api.post('/api/auth/users', {
      data: { username: `${QA_USERNAME}_sa`, email: `sa_${QA_EMAIL}`, role: 'admin', password: QA_PASSWORD, full_name: 'Second Super Admin' }
    });
    expect(secondSuperAdmin.status()).toBe(409);

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

  test('archives a staff member, restores them from Archive, and permanently deletes them', async () => {
    // Verify mobile number AND email-based login both work before deletion
    const anonBefore = await playwrightRequest.newContext({ baseURL: process.env.BASE_URL || 'http://localhost:3000' });
    const phoneLoginRes = await anonBefore.post('/api/auth/login', { data: { username: QA_PHONE, password: QA_PASSWORD } });
    expect(phoneLoginRes.status()).toBe(200);
    const localDigitsLoginRes = await anonBefore.post('/api/auth/login', { data: { username: phoneDigits, password: QA_PASSWORD } });
    expect(localDigitsLoginRes.status()).toBe(200);
    const emailLoginRes = await anonBefore.post('/api/auth/login', { data: { username: QA_EMAIL, password: QA_PASSWORD } });
    expect(emailLoginRes.status()).toBe(200);
    await anonBefore.dispose();

    // 1. Archive (soft-delete) user from Active view
    await page.getByTestId(`staff-delete-${QA_USERNAME}`).click();
    await page.locator('#staff-confirm-action').click();
    await expect(row(page, QA_USERNAME)).toHaveCount(0, { timeout: 15000 });

    // Archived accounts cannot sign in.
    const anon = await playwrightRequest.newContext({ baseURL: process.env.BASE_URL || 'http://localhost:3000' });
    const res = await anon.post('/api/auth/login', { data: { username: QA_USERNAME, password: QA_PASSWORD } });
    expect(res.status()).toBe(401);

    // 2. Open Archive view and verify user appears with Archived Account badge
    await page.getByTestId('staff-archive-tab').click();
    const archivedRow = row(page, QA_USERNAME);
    await expect(archivedRow).toBeVisible({ timeout: 15000 });
    await expect(archivedRow).toContainText('Archived Account');

    // 3. Restore user from Archive back to Active Team
    await page.getByTestId(`staff-restore-${QA_USERNAME}`).click();
    await page.locator('#staff-confirm-action').click();
    await expect(row(page, QA_USERNAME)).toHaveCount(0, { timeout: 15000 });

    // Switch back to Active view and verify restored user is active and can sign in
    await page.getByTestId('staff-archive-tab').click();
    await expect(row(page, QA_USERNAME)).toBeVisible({ timeout: 15000 });
    await expect(row(page, QA_USERNAME)).toContainText('Active Account');
    const restoredLogin = await anon.post('/api/auth/login', { data: { username: QA_USERNAME, password: QA_PASSWORD } });
    expect(restoredLogin.status()).toBe(200);
    await anon.dispose();

    // 4. Archive again, then Delete Permanently from Archive
    await page.getByTestId(`staff-delete-${QA_USERNAME}`).click();
    await page.locator('#staff-confirm-action').click();
    await expect(row(page, QA_USERNAME)).toHaveCount(0, { timeout: 15000 });

    await page.getByTestId('staff-archive-tab').click();
    await expect(row(page, QA_USERNAME)).toBeVisible({ timeout: 15000 });
    await page.getByTestId(`staff-permanent-delete-${QA_USERNAME}`).click();
    await page.locator('#staff-confirm-action').click();
    await expect(row(page, QA_USERNAME)).toHaveCount(0, { timeout: 15000 });
    // Return to active view for subsequent tests
    await page.getByTestId('staff-archive-tab').click();
  });

  test('manages hospitality roles, creates custom role, and enforces role-based dashboard cards', async ({ browser }) => {
    const customRoleName = `Sommelier ${suffix}`;
    const customRoleKey = `sommelier_${suffix}`;
    const barPhoneDigits = String((Number(phoneDigits) + 1) % 100000000).padStart(8, '9');
    const barPhone = `+852${barPhoneDigits}`;
    const barStaffUser = `qa_bar_specialist_${barPhoneDigits.slice(-4)}`;

    await openStaffManagement(page);

    // 1. Open Roles & Permissions Matrix tab
    await page.getByTestId('tab-roles-permissions').click();
    await expect(page.getByTestId('roles-permissions-matrix')).toBeVisible({ timeout: 10000 });

    // Verify all core hospitality roles exist in the matrix
    for (const roleKey of [
      'admin',
      'gm',
      'operations_manager',
      'manager',
      'assistant_manager',
      'bar_staff',
      'floor_staff',
      'kitchen',
    ]) {
      await expect(page.getByTestId(`role-matrix-row-${roleKey}`)).toBeVisible();
    }

    // 2. Create a Custom Role via the UI modal
    await page.getByTestId('create-custom-role-btn').click();
    await expect(page.getByTestId('custom-role-modal')).toBeVisible();
    await page.locator('#custom-role-label').fill(customRoleName);
    await page.locator('#custom-role-description').fill('Wine & Beverage pairing specialist');
    await page.getByTestId('modal-perm-bar').click();
    await page.getByTestId('save-custom-role-btn').click();

    await expect(page.getByTestId(`role-matrix-row-${customRoleKey}`)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`role-matrix-row-${customRoleKey}`)).toContainText('Custom');

    if (process.env.CAPTURE_LIVE_RBAC_SCREENSHOTS === '1') {
      await page.screenshot({
        path: '/Users/amanrana/.gemini/antigravity/brain/751c82c2-540c-4678-8e7d-b6f84eddb98a/live_staff_roles_matrix.png',
        fullPage: true,
      });
    }

    // 3. Switch back to Team Directory and create a Bar Staff user (with mandatory mobile number & optional email left blank!)
    await page.getByTestId('tab-team-directory').click();
    await page.locator('#staff-add-user').click();
    await page.locator('#staff-full-name').fill('QA Bar Specialist');
    await page.locator('#staff-phone').fill(barPhone);
    await page.locator('#staff-password').fill(QA_PASSWORD);
    await page.locator('#staff-role').selectOption('bar_staff');
    await page.locator('#staff-form-submit').click();

    const barRow = row(page, barStaffUser);
    await expect(barRow).toBeVisible({ timeout: 15000 });
    await expect(barRow).toContainText('Bar Staff');
    await expect(barRow).toContainText(barPhone);
    await expect(barRow).toContainText('No email linked');

    if (process.env.CAPTURE_LIVE_RBAC_SCREENSHOTS === '1') {
      await page.screenshot({
        path: '/Users/amanrana/.gemini/antigravity/brain/751c82c2-540c-4678-8e7d-b6f84eddb98a/live_staff_directory.png',
        fullPage: false,
      });
    }

    // 4. Sign in as the Bar Staff user using their MOBILE NUMBER in an isolated browser context and verify Dashboard Cards
    const barContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const barPage = await barContext.newPage();
    await barPage.goto('/admin/login', { waitUntil: 'networkidle' });
    await barPage.locator('#username').fill(barPhone);
    await expect(barPage.locator('#username')).toHaveValue(barPhone);
    await barPage.locator('#password').fill(QA_PASSWORD);
    await expect(barPage.locator('#password')).toHaveValue(QA_PASSWORD);
    await barPage.click('button[type="submit"]');
    await expect(barPage).toHaveURL(/\/admin\/dashboard/, { timeout: 20000 });

    // Bar Staff sees their Role Badge and only 'orders' and 'bar' cards (not 'staff' or 'website')
    await expect(barPage.getByTestId('dashboard-role-badge')).toContainText('Bar Staff');
    await expect(barPage.getByTestId('dashboard-card-bar')).toBeVisible();
    await expect(barPage.getByTestId('dashboard-card-orders')).toBeVisible();
    await expect(barPage.getByTestId('dashboard-card-staff')).toHaveCount(0);
    await expect(barPage.getByTestId('dashboard-card-website')).toHaveCount(0);

    if (process.env.CAPTURE_LIVE_RBAC_SCREENSHOTS === '1') {
      await barPage.screenshot({
        path: '/Users/amanrana/.gemini/antigravity/brain/751c82c2-540c-4678-8e7d-b6f84eddb98a/live_bar_staff_dashboard.png',
        fullPage: false,
      });
    }
    await barContext.close();

    // 5. Verify Stealth Root Mode: create a GM account, verify Super Admin & Roles Tab are 100% invisible to GM
    const gmUsername = `qa_gm_${suffix}`;
    const createGmRes = await page.request.post('/api/auth/users', {
      data: {
        username: gmUsername,
        email: `${gmUsername}@sangeet.hk`,
        role: 'gm',
        password: QA_PASSWORD,
        full_name: 'QA General Manager',
      },
    });
    expect(createGmRes.status()).toBe(201);
    const createdGm = await createGmRes.json();

    const gmContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const gmPage = await gmContext.newPage();
    await gmPage.goto('/admin/login', { waitUntil: 'networkidle' });
    await gmPage.locator('#username').fill(gmUsername);
    await expect(gmPage.locator('#username')).toHaveValue(gmUsername);
    await gmPage.locator('#password').fill(QA_PASSWORD);
    await expect(gmPage.locator('#password')).toHaveValue(QA_PASSWORD);
    await gmPage.click('button[type="submit"]');
    await expect(gmPage).toHaveURL(/\/admin\/dashboard/, { timeout: 20000 });

    // GM sees Staff Management card on Dashboard
    await expect(gmPage.getByTestId('dashboard-card-staff')).toBeVisible();

    // Open Staff Management as GM: Super Admin row is invisible and Roles & Permissions tab is hidden
    await gmPage.goto('/admin/staff-management', { waitUntil: 'domcontentloaded' });
    await expect(gmPage.getByRole('heading', { name: 'Staff Management', level: 1 }).first()).toBeVisible({ timeout: 20000 });
    await expect(row(gmPage, gmUsername)).toBeVisible({ timeout: 15000 });
    await expect(row(gmPage, ADMIN_USERNAME)).toHaveCount(0);
    await expect(gmPage.getByTestId('tab-roles-permissions')).toHaveCount(0);
    await gmContext.close();

    // 6. Clean up: permanently delete the GM user, Bar Staff user, and Custom Role
    await page.request.delete(`/api/auth/users/${createdGm.id}?permanent=true`);
    const usersRes = await page.request.get(`/api/auth/users?search=${barStaffUser}`);
    const usersPayload = await usersRes.json();
    const createdBarUser = usersPayload.data?.find((u: { username: string }) => u.username === barStaffUser);
    if (createdBarUser) {
      await page.request.delete(`/api/auth/users/${createdBarUser.id}?permanent=true`);
    }

    await page.getByTestId('tab-roles-permissions').click();
    await page.getByTestId(`delete-role-${customRoleKey}`).click();
    await expect(page.getByTestId(`role-matrix-row-${customRoleKey}`)).toHaveCount(0, { timeout: 10000 });
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
    expect(body.isSuperAdmin).toBe(true);
  });

  test('Super Admin self-recovery rejects invalid codes and resets password with Master Recovery Key', async ({ request }) => {
    const invalidOtp = await request.post('/api/auth/forgot-password', {
      data: {
        action: 'reset_super_admin',
        method: 'otp',
        code: '000000',
        newPassword: ADMIN_PASSWORD
      }
    });
    expect(invalidOtp.status()).toBe(401);

    const invalidKey = await request.post('/api/auth/forgot-password', {
      data: {
        action: 'reset_super_admin',
        method: 'recovery_key',
        code: 'WrongRecoveryKey!999',
        newPassword: ADMIN_PASSWORD
      }
    });
    expect(invalidKey.status()).toBe(401);

    const recoveryKey = process.env.SUPER_ADMIN_RECOVERY_KEY || 'SangeetMasterRecovery!2026';
    const validReset = await request.post('/api/auth/forgot-password', {
      data: {
        action: 'reset_super_admin',
        method: 'recovery_key',
        code: recoveryKey,
        newPassword: ADMIN_PASSWORD
      }
    });
    expect(validReset.status()).toBe(200);
    const resetBody = await validReset.json();
    expect(resetBody.message).toContain('Super Admin password has been reset successfully');
  });
});

