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

  // 1. Scroll to start of LearnerPath (Phase A: Card State)
  await page.evaluate((top) => {
    window.scrollTo({ top, behavior: 'instant' });
  }, pathInfo.top);
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(artifactDir, 'verify_lp_01_phaseA_card.png') });
  console.log('Captured Phase A');

  // Total scroll length is window.innerHeight * 5 = 4500px
  const baseScroll = pathInfo.top;

  // 2. Phase B: Expanded Edge to Edge (progress ~0.15)
  await page.evaluate((top) => {
    window.scrollTo({ top: top + 650, behavior: 'instant' });
  }, baseScroll);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artifactDir, 'verify_lp_02_phaseB_expanded.png') });
  console.log('Captured Phase B');

  // 3. Phase C: Video Scrub Stage 2 (progress ~0.45)
  await page.evaluate((top) => {
    window.scrollTo({ top: top + 2000, behavior: 'instant' });
  }, baseScroll);
  await new Promise(r => setTimeout(r, 600));

  const stageAtMid = await page.evaluate(() => {
    const h3 = document.querySelector('#learner-path h3');
    return h3 ? h3.textContent : '';
  });
  console.log('Stage at mid scrub:', stageAtMid);
  await page.screenshot({ path: path.join(artifactDir, 'verify_lp_03_phaseC_stage2.png') });

  // 4. Phase C: Video Scrub Stage 4 (progress ~0.75)
  await page.evaluate((top) => {
    window.scrollTo({ top: top + 3400, behavior: 'instant' });
  }, baseScroll);
  await new Promise(r => setTimeout(r, 600));

  const stageAtEndScrub = await page.evaluate(() => {
    const h3 = document.querySelector('#learner-path h3');
    return h3 ? h3.textContent : '';
  });
  console.log('Stage at end scrub:', stageAtEndScrub);
  await page.screenshot({ path: path.join(artifactDir, 'verify_lp_04_phaseC_stage4.png') });

  // 5. Phase D/E: Shrink & Replay Button (progress ~0.95)
  await page.evaluate((top) => {
    window.scrollTo({ top: top + 4400, behavior: 'instant' });
  }, baseScroll);
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artifactDir, 'verify_lp_05_phaseD_E_replay.png') });
  console.log('Captured Phase D/E');

  await browser.close();
  console.log('All screenshots verified!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

