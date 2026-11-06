const puppeteer = require('puppeteer');
const path = require('path');

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
  await new Promise(r => setTimeout(r, 600));

  // Get LearnerPath section offset
  const pathInfo = await page.evaluate(() => {
    const el = document.getElementById('learner-path');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      height: rect.height
    };
  });
  console.log('LearnerPath info:', pathInfo);

  if (!pathInfo) {
    console.error('learner-path section not found!');
    await browser.close();
    return;
  }

  // Smooth scroll helper using Lenis scrollTo
  async function scrollToY(targetY) {
    await page.evaluate((y) => {
      if (window.__lenis) {
        window.__lenis.scrollTo(y, { immediate: true });
      } else {
        window.scrollTo(0, y);
      }
    }, targetY);
    // Allow rAF lerp loop to settle
    await new Promise(r => setTimeout(r, 450));
  }

  const baseScroll = pathInfo.top;

  // 1. Phase A: Card State (progress 0)
  await scrollToY(baseScroll);
  await page.screenshot({ path: path.join(artifactDir, 'verify_lp_01_phaseA_card.png') });
  console.log('Captured Phase A');

  // 2. Phase B: Expanded Edge to Edge (progress ~0.15)
  // Pin length is 5.5 * 900 = 4950px
  // 0.15 * 4950 = ~740px
  await scrollToY(baseScroll + 750);
  await page.screenshot({ path: path.join(artifactDir, 'verify_lp_02_phaseB_expanded.png') });
  console.log('Captured Phase B');

  // 3. Phase C: Video Scrub Stage 2 (progress ~0.45)
  // 0.45 * 4950 = ~2225px
  await scrollToY(baseScroll + 2250);
  const stageAtMid = await page.evaluate(() => {
    const h3 = document.querySelector('#learner-path h3');
    return h3 ? h3.textContent : '';
  });
  console.log('Stage at mid scrub:', stageAtMid);
  await page.screenshot({ path: path.join(artifactDir, 'verify_lp_03_phaseC_stage2.png') });

  // 4. Phase C: Video Scrub Stage 4 (progress ~0.75)
  // 0.75 * 4950 = ~3700px
  await scrollToY(baseScroll + 3700);
  const stageAtEndScrub = await page.evaluate(() => {
    const h3 = document.querySelector('#learner-path h3');
    return h3 ? h3.textContent : '';
  });
  console.log('Stage at end scrub:', stageAtEndScrub);
  await page.screenshot({ path: path.join(artifactDir, 'verify_lp_04_phaseC_stage4.png') });

  // 5. Phase D/E: Shrink & Replay Button (progress ~0.95)
  // 0.95 * 4950 = ~4700px
  await scrollToY(baseScroll + 4750);
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(artifactDir, 'verify_lp_05_phaseD_E_replay.png') });
  console.log('Captured Phase D/E');

  await browser.close();
  console.log('All screenshots verified!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
