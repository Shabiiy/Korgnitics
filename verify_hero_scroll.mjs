import puppeteer from 'puppeteer';

async function testHeroScroll() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Wait 1.3s for preloader
  await new Promise(r => setTimeout(r, 1300));

  // 1. Phase 1: Scroll position 0
  await page.screenshot({ path: 'hero_phase1_scroll0.png' });
  console.log('1. Captured hero_phase1_scroll0.png');

  // Check visibility of logo, scroll cue, and that UI is hidden
  const evaluation0 = await page.evaluate(() => {
    const cue = document.querySelector('[class*="uppercase"]');
    const navPill = document.querySelector('nav');
    return {
      scrollPosition: window.scrollY,
      hasNavPill: !!navPill,
    };
  });
  console.log('Phase 1 evaluation:', evaluation0);

  // 2. Phase 2: Scroll to 400px (mid-shrink)
  await page.evaluate(() => window.scrollTo(0, 400));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'hero_phase2_scroll400.png' });
  console.log('2. Captured hero_phase2_scroll400.png');

  // 3. Phase 2: Scroll to 900px (framed card with full UI)
  await page.evaluate(() => window.scrollTo(0, 900));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'hero_phase2_scroll900.png' });
  console.log('3. Captured hero_phase2_scroll900.png');

  // 4. Phase 3: Scroll to 1500px (unpinned, entering Universe)
  await page.evaluate(() => window.scrollTo(0, 1500));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'hero_phase3_scroll1500.png' });
  console.log('4. Captured hero_phase3_scroll1500.png');

  // 5. Scroll back up to 0 (verify exact reversal)
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'hero_phase1_reversed0.png' });
  console.log('5. Captured hero_phase1_reversed0.png');

  await browser.close();
}

testHeroScroll().catch(err => {
  console.error(err);
  process.exit(1);
});

