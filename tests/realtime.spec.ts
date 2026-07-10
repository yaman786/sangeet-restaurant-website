import { test, expect } from '@playwright/test';

test.describe('Real-Time Pusher Integration (QA)', () => {
  // Use a serial mode since we test real-time which might interact
  test.describe.configure({ mode: 'serial' });

  test('should receive real-time reservation on admin dashboard', async ({ browser }) => {
    // Create two separate browser contexts (to simulate two different users/devices)
    const adminContext = await browser.newContext();
    const customerContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const customerPage = await customerContext.newPage();

    // 1. Admin logs in and goes to Reservations page
    await adminPage.goto('/admin/login');
    await adminPage.fill('input[name="username"]', 'admin');
    await adminPage.fill('input[name="password"]', 'admin123');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL(/.*\/admin\/dashboard/);
    await adminPage.goto('/admin/reservations');
    
    // Ensure admin page has loaded
    await expect(adminPage.locator('h2', { hasText: 'All Reservations' })).toBeVisible({ timeout: 15000 });

    // 2. Customer goes to the public reservation page
    await customerPage.goto('/reservations');
    
    // Fill out the reservation form
    const uniqueName = `RealTime Tester ${Date.now()}`;
    await customerPage.fill('input[name="name"]', uniqueName);
    await customerPage.fill('input[name="email"]', 'realtime@example.com');
    await customerPage.fill('input[name="phone"]', '1234567890');
    
    // Set date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await customerPage.fill('input[name="date"]', dateStr);
    
    // Select time and guests
    await customerPage.selectOption('select[name="time"]', '19:00');
    await customerPage.selectOption('select[name="guests"]', '2');
    
    // Submit reservation
    await customerPage.click('button[type="submit"]');
    
    // Ensure customer success message shows
    await expect(customerPage.locator('h3:has-text("Reservation Confirmed!")')).toBeVisible({ timeout: 15000 });

    // 3. VERIFY REAL-TIME: Admin page should show a toast notification without page reload
    // We look for the custom toast we added: "New Reservation"
    await expect(adminPage.locator('h4:has-text("New Reservation")')).toBeVisible({ timeout: 10000 });
    
    // The name should appear in the table dynamically
    await expect(adminPage.locator(`text=${uniqueName}`)).toBeVisible({ timeout: 5000 });

    await adminContext.close();
    await customerContext.close();
  });

  test('should receive real-time order on kitchen display', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const customerContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const customerPage = await customerContext.newPage();

    // 1. Admin logs in and goes to Kitchen Display
    await adminPage.goto('/kitchen/login');
    await adminPage.fill('input[name="username"]', 'admin');
    await adminPage.fill('input[name="password"]', 'admin123');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL(/.*\/admin\/dashboard/);
    await adminPage.goto('/kitchen/display');
    
    // Ensure kitchen page has loaded
    await expect(adminPage.locator('h1', { hasText: 'Kitchen Display' })).toBeVisible({ timeout: 15000 });

    // 2. Customer goes to QR Menu and places order
    await customerPage.goto('/qr/RT-1'); // Using RT-1 for Real-Time table
    
    // Wait for menu to load
    await expect(customerPage.locator('text=Starters')).toBeVisible({ timeout: 15000 });
    
    // Add first item to cart
    await customerPage.locator('button:has-text("Add to Cart")').first().click();
    
    // Go to cart
    await customerPage.click('button:has-text("View Cart")');
    await customerPage.waitForURL(/.*\/qr\/RT-1\/cart/);
    
    // Checkout
    const uniqueCustomer = `RT Order ${Date.now()}`;
    await customerPage.fill('input[name="customerName"]', uniqueCustomer);
    await customerPage.click('button:has-text("Place Order")');
    
    // Wait for success on customer side
    await expect(customerPage.locator('h2:has-text("Order Placed Successfully!")')).toBeVisible({ timeout: 15000 });

    // 3. VERIFY REAL-TIME: Kitchen display should show "New Order Received!" toast
    await expect(adminPage.locator('text=New Order Received!')).toBeVisible({ timeout: 10000 });
    
    // Order should appear in the queue with the unique customer name
    await expect(adminPage.locator(`text=${uniqueCustomer}`)).toBeVisible({ timeout: 5000 });

    await adminContext.close();
    await customerContext.close();
  });
});
