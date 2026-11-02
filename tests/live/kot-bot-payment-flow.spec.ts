import 'dotenv/config';
import { test, expect } from '@playwright/test';
import jwt from 'jsonwebtoken';
import path from 'path';

const LIVE_URL = 'https://www.sangeet.hk';
const ARTIFACT_DIR =
  '/Users/amanrana/.gemini/antigravity/brain/751c82c2-540c-4678-8e7d-b6f84eddb98a';

test.describe('KOT (Kitchen) + BOT (Bar) Station Routing & Unified Payment E2E', () => {
  test.setTimeout(120000);

  test('Full Lifecycle: Order -> BOT Ready (Bar) -> Live Tracking -> KOT Ready (Kitchen) -> Combined Octopus Payment', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 860 });

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

    // 1. Create a mixed Food (KOT) + Drinks (BOT) Pick-Up Order
    const createRes = await page.request.post(`${LIVE_URL}/api/orders`, {
      data: {
        order_type: 'takeaway',
        customer_name: 'KOT BOT E2E Guest',
        customer_phone: '+85291112222',
        pickup_time: 'ASAP (20-25 mins)',
        total_amount: 173,
        items: [
          {
            menu_item_id: 18, // Butter Chicken ($128) -> KOT
            quantity: 1,
            unit_price: 128,
            total_price: 128,
          },
          {
            menu_item_id: 186, // Coke ($45) -> BOT
            quantity: 1,
            unit_price: 45,
            total_price: 45,
          },
        ],
      },
    });
    expect(createRes.status()).toBe(201);
    const createdBody = await createRes.json();
    const order = createdBody.order;
    const orderId = order.id;
    const orderNumber = order.order_number;

    expect(order.kot_status).toBe('pending');
    expect(order.bot_status).toBe('pending');

    // 2. Reception accepts the order -> moves to 'preparing' for both KOT and BOT
    const acceptRes = await page.request.patch(`${LIVE_URL}/api/orders/${orderId}/status`, {
      headers: { Cookie: `auth_token=${adminToken}` },
      data: { status: 'preparing' },
    });
    expect(acceptRes.status()).toBe(200);

    // 3. Open Bar Display (/admin/bar) -> verify BOT shows ONLY Coke (not Butter Chicken)
    await page.goto(`${LIVE_URL}/admin/bar`, { waitUntil: 'domcontentloaded' });
    const botTicket = page.getByTestId(`station-ticket-bot-${orderNumber}`);
    await expect(botTicket).toBeVisible({ timeout: 20000 });
    await expect(botTicket).toContainText('🍷 BOT');
    await expect(botTicket).toContainText('1x Coke');
    await expect(botTicket).not.toContainText('Butter Chicken');

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'kot_bot_1_bar_display.png'),
      fullPage: false,
    });

    // Mark BOT Ready on Bar Display
    await page.getByTestId(`station-ready-btn-${orderNumber}`).click();

    // Verify via API that bot_status is 'ready', kot_status is 'preparing', and master status is STILL 'preparing'
    await expect
      .poll(
        async () => {
          const checkRes = await page.request.get(
            `${LIVE_URL}/api/orders/${orderId}?tableNumber=PICKUP`
          );
          const checkOrder = await checkRes.json();
          return {
            status: checkOrder.status,
            kot: checkOrder.kot_status,
            bot: checkOrder.bot_status,
          };
        },
        { timeout: 15000 }
      )
      .toEqual({
        status: 'preparing',
        kot: 'preparing',
        bot: 'ready',
      });

    // 4. Open Guest Live Tracking (/dashboard) -> verify BOT is Ready ✓ while KOT is Preparing
    await page.goto(`${LIVE_URL}/dashboard?orderId=${orderId}&table=PICKUP`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByTestId('tracking-kot-status')).toContainText(/preparing/i, {
      timeout: 15000,
    });
    await expect(page.getByTestId('tracking-bot-status')).toContainText(/Ready/i);
    await expect(page.getByText(/Your drinks are packed/i)).toBeVisible();

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'kot_bot_2_guest_tracking_partial.png'),
      fullPage: false,
    });

    // 5. Switch to Kitchen Display (/admin/kitchen) -> verify KOT shows ONLY Butter Chicken (not Coke)
    await page.goto(`${LIVE_URL}/admin/kitchen`, { waitUntil: 'domcontentloaded' });
    const kotTicket = page.getByTestId(`station-ticket-kot-${orderNumber}`);
    await expect(kotTicket).toBeVisible({ timeout: 20000 });
    await expect(kotTicket).toContainText('🍳 KOT');
    await expect(kotTicket).toContainText('1x Butter Chicken');
    await expect(kotTicket).not.toContainText('Coke');

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'kot_bot_3_kitchen_display.png'),
      fullPage: false,
    });

    // Mark KOT Ready on Kitchen Display
    await page.getByTestId(`station-ready-btn-${orderNumber}`).click();

    // Verify that now BOTH KOT + BOT are 'ready', so master order.status transitions to 'ready'
    await expect
      .poll(
        async () => {
          const checkRes = await page.request.get(
            `${LIVE_URL}/api/orders/${orderId}?tableNumber=PICKUP`
          );
          const checkOrder = await checkRes.json();
          return {
            status: checkOrder.status,
            kot: checkOrder.kot_status,
            bot: checkOrder.bot_status,
          };
        },
        { timeout: 15000 }
      )
      .toEqual({
        status: 'ready',
        kot: 'ready',
        bot: 'ready',
      });

    // 6. Open Admin Orders (/admin/orders) -> Ready / Served tab -> Collect Payment with Octopus
    await page.goto(`${LIVE_URL}/admin/orders`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Ready \/ Served/i }).click();

    const pickupMasterRow = page.locator('tr', { hasText: `#${orderNumber}` }).first();
    await expect(pickupMasterRow).toBeVisible({ timeout: 15000 });
    await pickupMasterRow.getByRole('button', { name: /Collect Payment/i }).click();

    // Verify Consolidated Receipt Modal shows KOT ($128.00) + BOT ($45.00) = $173.00 and Payment Method Selector
    await expect(page.getByText('🍳 Kitchen (KOT)')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('$128.00').first()).toBeVisible();
    await expect(page.getByText('🍷 Drinks (BOT)')).toBeVisible();
    await expect(page.getByText('$45.00').first()).toBeVisible();

    await page.getByTestId('payment-method-octopus').click();
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'kot_bot_4_consolidated_payment_modal.png'),
      fullPage: false,
    });

    await page.getByTestId('confirm-payment-btn').click();

    // Verify order is completed with [Paid: Octopus] recorded
    await expect
      .poll(
        async () => {
          const checkRes = await page.request.get(
            `${LIVE_URL}/api/orders/${orderId}?tableNumber=PICKUP`
          );
          const checkOrder = await checkRes.json();
          return {
            status: checkOrder.status,
            hasPaymentTag: String(checkOrder.special_instructions || '').includes(
              '[Paid: Octopus]'
            ),
          };
        },
        { timeout: 15000 }
      )
      .toEqual({
        status: 'completed',
        hasPaymentTag: true,
      });
  });
});

