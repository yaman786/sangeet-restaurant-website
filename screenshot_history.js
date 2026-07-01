const puppeteer = require('puppeteer');
const fs = require('fs');

async function waitPort(port) {
  return new Promise(resolve => {
    const net = require('net');
    const timer = setInterval(() => {
      const socket = new net.Socket();
      socket.on('connect', () => {
        clearInterval(timer);
        socket.destroy();
        resolve();
      });
      socket.on('error', () => {});
      socket.connect(port, '127.0.0.1');
    }, 1000);
  });
}

async function takeScreenshots() {
  console.log("Waiting for frontend port 3000...");
  await waitPort(3000);
  console.log("Frontend is up!");
  
  // Wait an extra 5 seconds for React to finish compiling
  await new Promise(r => setTimeout(r, 5000));

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    console.log("Logging in...");
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
    
    // Check if already logged in (redirected to dashboard)
    if (page.url().includes('login')) {
      await page.waitForSelector('#username', { timeout: 10000 });
      await page.type('#username', 'admin');
      await page.type('#password', 'SangeetAdmin2026');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});
    }

    console.log("Navigating to dashboard...");
    await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'networkidle2' });
    
    // Give animations a moment to settle
    await new Promise(r => setTimeout(r, 2000));
    
    // Copy the file to the artifacts directory
    const artifactsDir = '/Users/amanrana/.gemini/antigravity-ide/brain/7d981a82-4617-4e38-a727-7fdcf76bde41';
    
    console.log("Taking dashboard screenshot...");
    await page.screenshot({ path: `${artifactsDir}/dashboard_history_card.png`, fullPage: true });

    console.log("Navigating to history page...");
    await page.goto('http://localhost:3000/admin/history', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("Taking history screenshot...");
    await page.screenshot({ path: `${artifactsDir}/history_page.png`, fullPage: true });

    console.log("Screenshots captured successfully!");
  } catch (error) {
    console.error("Error capturing screenshots:", error);
  } finally {
    await browser.close();
  }
}

takeScreenshots();
