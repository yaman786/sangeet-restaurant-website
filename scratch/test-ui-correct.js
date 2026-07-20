const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'], defaultViewport: { width: 400, height: 800 } });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to production site...');
    await page.goto('https://frontend-six-xi-10.vercel.app/qr/table-2', { waitUntil: 'networkidle2' });

    // 1. Initial Prompt
    console.log('Checking for name prompt...');
    try {
      await page.waitForSelector('input[placeholder*="Enter your name"]', { timeout: 3000 });
      await page.type('input[placeholder*="Enter your name"]', 'Antigravity Auto Test');
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const viewBtn = btns.find(b => b.innerText.includes('View Menu'));
        if (viewBtn) viewBtn.click();
      });
    } catch(e) {
      console.log('No name prompt, continuing...');
    }

    console.log('Waiting for menu items...');
    await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.innerText.includes('Add to Order'));
    }, { timeout: 10000 });

    console.log('Adding first item...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtns = btns.filter(b => b.innerText.includes('Add to Order'));
      if (addBtns.length > 0) addBtns[0].click();
    });

    console.log('Going to cart...');
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const viewCartBtns = btns.filter(b => b.innerText.includes('Item') || b.innerText.includes('View cart') || b.innerText.includes('View Cart'));
      if (viewCartBtns.length > 0) viewCartBtns[viewCartBtns.length - 1].click();
    });

    console.log('Placing first order...');
    await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.innerText.includes('Place Order'));
    }, { timeout: 10000 });

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const placeBtn = btns.find(b => b.innerText.includes('Place Order'));
      if (placeBtn) placeBtn.click();
    });

    console.log('Waiting for tracking view...');
    await page.waitForFunction(() => {
      return document.body.innerText.includes('Order Tracking') || document.body.innerText.includes('Tracking');
    }, { timeout: 15000 });
    console.log('First order placed successfully!');

    console.log('Clicking Continue Ordering...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const continueBtn = btns.find(b => b.innerText.includes('Continue Ordering'));
      if (continueBtn) continueBtn.click();
    });

    console.log('Reloading the page to simulate the user scanning QR later...');
    await page.reload({ waitUntil: 'networkidle2' });

    console.log('Waiting for menu items again...');
    await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.innerText.includes('Add to Order'));
    }, { timeout: 10000 });

    console.log('Adding second item...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtns = btns.filter(b => b.innerText.includes('Add to Order'));
      if (addBtns.length > 1) addBtns[1].click();
      else if (addBtns.length > 0) addBtns[0].click();
    });

    console.log('Going to cart again...');
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const viewCartBtns = btns.filter(b => b.innerText.includes('Item') || b.innerText.includes('View cart') || b.innerText.includes('View Cart'));
      if (viewCartBtns.length > 0) viewCartBtns[viewCartBtns.length - 1].click();
    });

    console.log('Placing second (merged) order...');
    await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.innerText.includes('Place Order'));
    }, { timeout: 10000 });

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const placeBtn = btns.find(b => b.innerText.includes('Place Order'));
      if (placeBtn) placeBtn.click();
    });

    console.log('Waiting for tracking view after merge...');
    await page.waitForFunction(() => {
      return document.body.innerText.includes('Order Items');
    }, { timeout: 15000 });

    console.log('Success! The UI rendered the tracking view instead of failing/blank screen.');
    
    await new Promise(r => setTimeout(r, 2000));

    const screenshotPath = '/Users/amanrana/.gemini/antigravity-ide/brain/1c861645-e179-4858-b401-5d1edc46b10f/final-success.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);

  } catch (err) {
    console.error('Test Failed:', err);
    const errPath = '/Users/amanrana/.gemini/antigravity-ide/brain/1c861645-e179-4858-b401-5d1edc46b10f/test-error.png';
    await page.screenshot({ path: errPath });
    console.log(`Error screenshot saved to ${errPath}`);
  } finally {
    await browser.close();
  }
})();
