import puppeteer from 'puppeteer';

async function testMobileHero() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Wait for preloader
  await new Promise(r => setTimeout(r, 1300));

  // 1. Mobile Phase 1
  await page.screenshot({ path: 'mobile_hero_phase1.png' });
  console.log('Mobile Phase 1 captured');

  // 2. Mobile Phase 2 (mid-scroll 500px)
  await page.evaluate(() => window.scrollTo(0, 500));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'mobile_hero_phase2.png' });
  console.log('Mobile Phase 2 captured');

  await browser.close();
}

testMobileHero().catch(err => {
  console.error(err);
  process.exit(1);
});

