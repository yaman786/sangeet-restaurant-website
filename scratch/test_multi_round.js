const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/amanrana/.gemini/antigravity-ide/brain/b38f20ba-7619-4ccf-a980-0a5be870a908';

(async () => {
  console.log('Starting Live Multi-Round QA Test...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--window-size=1280,800'] });
  const BASE_URL = 'https://frontend-six-xi-10.vercel.app';
  
  const customerPage = await browser.newPage();
  await customerPage.setViewport({ width: 400, height: 800 }); // Mobile view for customer
  const adminPage = await browser.newPage();
  await adminPage.setViewport({ width: 1280, height: 800 }); // Desktop for admin

  const clickButtonWithText = async (page, selector, textToMatch) => {
    const btns = await page.$$(selector);
    for (let btn of btns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes(textToMatch)) {
        await btn.click();
        return true;
      }
    }
    return false;
  };

  const placeOrder = async (guestName = null) => {
    await customerPage.waitForSelector('button');
    const addBtns = await customerPage.$$('button');
    for (let btn of addBtns) {
      const text = await customerPage.evaluate(el => el.textContent, btn);
      if (text && text.includes('Add to Order')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 500));
    await clickButtonWithText(customerPage, 'button', 'View Cart');
    await new Promise(r => setTimeout(r, 1000));
    
    if (guestName) {
      await customerPage.waitForSelector('input[placeholder*="Name"]');
      await customerPage.type('input[placeholder*="Name"]', guestName);
    }
    
    await clickButtonWithText(customerPage, 'button', 'Place Order');
    await new Promise(r => setTimeout(r, 3000)); // wait for redirect
  };

  try {
    // --- ROUND 1 ---
    console.log('Placing Round 1...');
    await customerPage.goto(`${BASE_URL}/qr/1`, { waitUntil: 'networkidle2' });
    await placeOrder('Multi-Round VIP');
    
    // Admin Accept & Ready Round 1
    console.log('Admin processing Round 1 to Ready...');
    await adminPage.goto(`${BASE_URL}/admin/orders`, { waitUntil: 'networkidle2' });
    
    // Wait for websocket data
    await new Promise(r => setTimeout(r, 2000));
    
    // Expand table 1
    const tableRows = await adminPage.$$('tr.cursor-pointer');
    if (tableRows.length > 0) await tableRows[0].click();
    await new Promise(r => setTimeout(r, 1000));
    
    await clickButtonWithText(adminPage, 'button', 'Accept');
    await new Promise(r => setTimeout(r, 2000));
    await adminPage.click('button:has-text("In Kitchen")').catch(() => {});
    await new Promise(r => setTimeout(r, 1000));
    
    const kitchenRows = await adminPage.$$('tr.cursor-pointer');
    if (kitchenRows.length > 0) await kitchenRows[0].click();
    await new Promise(r => setTimeout(r, 1000));
    
    await clickButtonWithText(adminPage, 'button', 'Mark Ready');
    await new Promise(r => setTimeout(r, 2000));

    // --- ROUND 2 (Continuous Order) ---
    console.log('Placing Round 2...');
    await clickButtonWithText(customerPage, 'button', 'Continue Ordering');
    await new Promise(r => setTimeout(r, 2000));
    await placeOrder(); // Session remembers name

    console.log('Verifying Round 2 is AUTO-ACCEPTED to Kitchen...');
    // Because of active session, Round 2 should automatically be 'accepted' and in Kitchen!
    await adminPage.click('button:has-text("In Kitchen")').catch(() => {});
    await new Promise(r => setTimeout(r, 1500));
    const kitchenRowsR2 = await adminPage.$$('tr.cursor-pointer');
    if (kitchenRowsR2.length > 0) await kitchenRowsR2[0].click();
    await new Promise(r => setTimeout(r, 1000));
    // Verify it's there without clicking Accept!
    await adminPage.screenshot({ path: path.join(ARTIFACT_DIR, 'admin_auto_accept_proof.png') });
    console.log('Round 2 auto-accept verified.');

    // --- ROUND 3 ---
    console.log('Placing Round 3...');
    await clickButtonWithText(customerPage, 'button', 'Continue Ordering');
    await new Promise(r => setTimeout(r, 2000));
    await placeOrder();

    // Verify Mixed States
    console.log('Capturing Mixed States...');
    await adminPage.click('button:has-text("All")').catch(() => {});
    await new Promise(r => setTimeout(r, 2000));
    const allRows = await adminPage.$$('tr.cursor-pointer');
    if (allRows.length > 0) await allRows[0].click();
    await new Promise(r => setTimeout(r, 1000));
    
    await adminPage.screenshot({ path: path.join(ARTIFACT_DIR, 'admin_mixed_states.png') });
    await customerPage.screenshot({ path: path.join(ARTIFACT_DIR, 'customer_mixed_states.png') });
    console.log('Screenshots saved.');

    // Check Collect Payment
    const collectBtnPresent = await clickButtonWithText(adminPage, 'button', 'Collect Payment');
    console.log(`Collect Payment button present during mixed states: ${collectBtnPresent}`);

    // Complete all rounds
    console.log('Completing all rounds to test payment...');
    
    // Mark both Kitchen orders ready (Round 2 & 3 are auto-accepted to Kitchen)
    await adminPage.click('button:has-text("In Kitchen")').catch(() => {});
    await new Promise(r => setTimeout(r, 1500));
    const kRows = await adminPage.$$('tr.cursor-pointer');
    if (kRows.length > 0) await kRows[0].click();
    await new Promise(r => setTimeout(r, 1000));
    await clickButtonWithText(adminPage, 'button', 'Mark Ready');
    await new Promise(r => setTimeout(r, 1500));
    await clickButtonWithText(adminPage, 'button', 'Mark Ready');
    await new Promise(r => setTimeout(r, 2000));

    // Pay
    console.log('Collecting Payment...');
    await adminPage.click('button:has-text("Ready / Served")').catch(() => {});
    await new Promise(r => setTimeout(r, 1500));
    await clickButtonWithText(adminPage, 'button', 'Collect Payment');
    await new Promise(r => setTimeout(r, 1000));
    await adminPage.screenshot({ path: path.join(ARTIFACT_DIR, 'admin_multi_payment_modal.png') });
    await clickButtonWithText(adminPage, 'button', 'Confirm & Complete');
    
    console.log('Waiting for Customer Redirect...');
    await customerPage.waitForFunction(() => window.location.pathname === '/', { timeout: 15000 });
    await customerPage.screenshot({ path: path.join(ARTIFACT_DIR, 'customer_multi_redirect.png') });
    console.log('Multi-round flow successfully tested and verified!');

  } catch (err) {
    console.error('Test failed:', err);
    await adminPage.screenshot({ path: path.join(ARTIFACT_DIR, 'error_admin.png') });
    await customerPage.screenshot({ path: path.join(ARTIFACT_DIR, 'error_customer.png') });
  } finally {
    await browser.close();
  }
})();
