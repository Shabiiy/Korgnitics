import puppeteer from 'puppeteer';

async function capture() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // 1. Desktop 1440px full page
  const pageDesktop = await browser.newPage();
  await pageDesktop.setViewport({ width: 1440, height: 900 });
  await pageDesktop.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  // wait 1.5s for preloader to finish
  await new Promise(r => setTimeout(r, 1500));
  await pageDesktop.screenshot({ path: 'screenshot_desktop_full.png', fullPage: true });
  console.log('Desktop full page captured');

  // 2. Tablet 768px
  const pageTablet = await browser.newPage();
  await pageTablet.setViewport({ width: 768, height: 1024 });
  await pageTablet.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await pageTablet.screenshot({ path: 'screenshot_tablet_full.png', fullPage: true });
  console.log('Tablet full page captured');

  // 3. Mobile 390px
  const pageMobile = await browser.newPage();
  await pageMobile.setViewport({ width: 390, height: 844 });
  await pageMobile.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await pageMobile.screenshot({ path: 'screenshot_mobile_full.png', fullPage: true });
  console.log('Mobile full page captured');

  await browser.close();
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});

