const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  const artifactDir = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\a82f2ad5-7d66-49a5-afca-e4c60d43c046';
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // 1. Check scrollbar visibility
  const scrollbarCheck = await page.evaluate(() => {
    const innerW = window.innerWidth;
    const clientW = document.documentElement.clientWidth;
    return {
      innerW,
      clientW,
      hasNoScrollbarWidth: innerW === clientW
    };
  });
  console.log('Scrollbar check:', scrollbarCheck);

  // 2. Check Navbar styling at top
  const navInitial = await page.evaluate(() => {
    const header = document.querySelector('header');
    return {
      classes: header ? header.className : '',
      bg: header ? window.getComputedStyle(header).backgroundColor : ''
    };
  });
  console.log('Nav initial:', navInitial);

  // Take screenshot at scroll 0
  await page.screenshot({ path: path.join(artifactDir, 'verify_01_hero.png') });

  // Scroll to Universe section start
  const universeInfo = await page.evaluate(() => {
    const el = document.getElementById('universe');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      height: rect.height
    };
  });
  console.log('Universe info:', universeInfo);

  // Scroll to right where Universe starts
  await page.evaluate((top) => {
    window.scrollTo({ top, behavior: 'instant' });
  }, universeInfo.top);
  await new Promise(r => setTimeout(r, 600));

  // Check nav styling at Universe
  const navAtUniverse = await page.evaluate(() => {
    const header = document.querySelector('header');
    return {
      classes: header ? header.className : '',
      bg: header ? window.getComputedStyle(header).backgroundColor : ''
    };
  });
  console.log('Nav at Universe:', navAtUniverse);
  await page.screenshot({ path: path.join(artifactDir, 'verify_02_universe_start.png') });

  // Scroll through Universe pinned scrub (progress ~0.33, ~0.66, ~0.95)
  // Universe is pinned for innerHeight * 2.5 = 900 * 2.5 = 2250px
  const scrubStart = universeInfo.top;
  
  // Card 0 expanded
  await page.evaluate((y) => {
    window.scrollTo({ top: y + 700, behavior: 'instant' });
  }, scrubStart);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'verify_03_card0_expanded.png') });

  // Card 1 stacked over Card 0
  await page.evaluate((y) => {
    window.scrollTo({ top: y + 1450, behavior: 'instant' });
  }, scrubStart);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'verify_04_card1_stacked.png') });

  // Card 2 stacked over Card 1 & Card 0
  await page.evaluate((y) => {
    window.scrollTo({ top: y + 2150, behavior: 'instant' });
  }, scrubStart);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'verify_05_card2_stacked_deck.png') });

  // Mobile test
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 500));
  const mobileUniverse = await page.evaluate(() => {
    const el = document.getElementById('universe');
    return el ? el.getBoundingClientRect().top + window.scrollY : 800;
  });
  await page.evaluate((y) => {
    window.scrollTo({ top: y, behavior: 'instant' });
  }, mobileUniverse);
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(artifactDir, 'verify_06_mobile_universe.png') });

  await browser.close();
  console.log('Verification complete!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

