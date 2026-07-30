const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting Puppeteer test...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  
  // 1. Open Customer Page
  const customerPage = await browser.newPage();
  await customerPage.goto('http://localhost:3000/qr/table-1', { waitUntil: 'networkidle2' });
  console.log('Customer page loaded. Placing order...');
  
  // Add item and place order
  await customerPage.waitForSelector('.add-to-cart-btn', { timeout: 5000 }).catch(() => {});
  const addBtns = await customerPage.$$('.add-to-cart-btn');
  if (addBtns.length > 0) {
    await addBtns[0].click();
    console.log('Added item to cart.');
  }
  
  await customerPage.waitForSelector('button[aria-label="View Cart"]');
  await customerPage.click('button[aria-label="View Cart"]');
  
  await customerPage.waitForSelector('button.bg-sangeet-orange', { text: /Place Order/i });
  const placeBtns = await customerPage.$$('button.bg-sangeet-orange');
  for (let btn of placeBtns) {
    const text = await customerPage.evaluate(el => el.textContent, btn);
    if (text.includes('Place Order')) {
      await btn.click();
      console.log('Placed order.');
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 4000));
  
  const currentUrl = customerPage.url();
  console.log('Customer URL after order:', currentUrl);
  
  // Expose console logs
  customerPage.on('console', msg => console.log('CUSTOMER CONSOLE:', msg.text()));
  
  // 2. Open Admin Page
  const adminPage = await browser.newPage();
  await adminPage.goto('http://localhost:3000/admin/orders', { waitUntil: 'networkidle2' });
  console.log('Admin page loaded.');
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Find the Collect Payment button
  const collectBtns = await adminPage.$$('button');
  let foundCollect = false;
  for (let btn of collectBtns) {
    const text = await adminPage.evaluate(el => el.textContent, btn);
    if (text && text.includes('Collect Payment')) {
      await btn.click();
      foundCollect = true;
      console.log('Clicked Collect Payment on Admin.');
      break;
    }
  }
  
  if (foundCollect) {
    await new Promise(r => setTimeout(r, 1000));
    const confirmBtns = await adminPage.$$('button');
    for (let btn of confirmBtns) {
      const text = await adminPage.evaluate(el => el.textContent, btn);
      if (text && text.includes('Confirm & Complete')) {
        await btn.click();
        console.log('Confirmed Collect Payment.');
        break;
      }
    }
  }
  
  // Wait to see if Customer redirects
  await new Promise(r => setTimeout(r, 5000));
  const finalCustomerUrl = customerPage.url();
  console.log('Customer final URL:', finalCustomerUrl);
  
  await browser.close();
})();
