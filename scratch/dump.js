const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://sangeet-restaurant-website.vercel.app/qr/TB-2', { waitUntil: 'networkidle2' });

  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.innerText);
  });
  console.log("BUTTONS FOUND:", buttons);
  
  await browser.close();
})();
