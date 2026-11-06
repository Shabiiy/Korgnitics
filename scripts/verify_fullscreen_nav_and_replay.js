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

  console.log('1. Navigating to http://127.0.0.1:3000...');
  await page.goto('http://127.0.0.1:3000');

  // Wait for preloader animation to complete (~1.5s)
  await new Promise(r => setTimeout(r, 1600));

  // Helper to get nav elements visibility
  const getNavState = async () => {
    return await page.evaluate(() => {
      const header = document.querySelector('header');
      const logo = document.querySelector('header a[aria-label*="Home"]');
      const navCollapsibles = Array.from(document.querySelectorAll('.nav-fullscreen-hide'));
      const centerPill = navCollapsibles[0];
      const rightCta = navCollapsibles[1];
      const replayBtn = document.querySelector('button[aria-label*="Replay"]');

      const getStyle = (el) => {
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        return {
          opacity: cs.opacity,
          pointerEvents: cs.pointerEvents,
          visibility: cs.visibility,
          transform: cs.transform
        };
      };

      return {
        scrollY: window.scrollY,
        header: getStyle(header),
        logo: getStyle(logo),
        centerPill: getStyle(centerPill),
        rightCta: getStyle(rightCta),
        hasReplayBtn: !!replayBtn
      };
    });
  };

  // CHECK 1: Hero Full Screen at Scroll 0
  const heroFullscreenState = await getNavState();
  console.log('Hero Full Screen state at scroll 0:', heroFullscreenState);

  const heroFsPath = path.join(artifactDir, 'verify_01_hero_fullscreen.png');
  await page.screenshot({ path: heroFsPath });
  console.log('Saved hero fullscreen screenshot to:', heroFsPath);

  // CHECK 2: Hero Exited Full Screen (Card state)
  console.log('2. Scrolling into Hero Card state (scrollY: 750)...');
  await page.evaluate(() => {
    window.__lenis.scrollTo(750, { immediate: true });
  });
  await new Promise(r => setTimeout(r, 600));

  const heroCardState = await getNavState();
  console.log('Hero Card state at scrollY 750:', heroCardState);

  const heroCardPath = path.join(artifactDir, 'verify_02_hero_card_state.png');
  await page.screenshot({ path: heroCardPath });
  console.log('Saved hero card screenshot to:', heroCardPath);

  // CHECK 3: Universe section (Light card state)
  console.log('3. Scrolling to Universe section...');
  await page.evaluate(() => {
    window.__lenis.scrollTo('#universe', { immediate: true });
  });
  await new Promise(r => setTimeout(r, 600));

  const universeState = await getNavState();
  console.log('Universe state:', universeState);

  const universePath = path.join(artifactDir, 'verify_03_universe.png');
  await page.screenshot({ path: universePath });
  console.log('Saved universe screenshot to:', universePath);

  // CHECK 4: Student Journey (LearnerPath) Full Screen
  // Get learner-path top and pin distance
  const lpInfo = await page.evaluate(() => {
    const el = document.getElementById('learner-path');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top + window.scrollY };
  });
  console.log('LearnerPath section anchor:', lpInfo);

  // Scroll into Phase C of LearnerPath (middle 60% where it is full screen)
  // Pin duration is 5.5 * 900 = ~4950px.
  // Phase C is progress 0.2 to 0.8, so around progress 0.5:
  const lpFullscreenY = lpInfo.top + 900 * 2.5;
  console.log(`4. Scrolling to LearnerPath Full Screen (scrollY: ${lpFullscreenY})...`);
  await page.evaluate((y) => {
    window.__lenis.scrollTo(y, { immediate: true });
  }, lpFullscreenY);
  await new Promise(r => setTimeout(r, 800));

  const lpFullscreenState = await getNavState();
  console.log('LearnerPath Full Screen state:', lpFullscreenState);

  const lpFsPath = path.join(artifactDir, 'verify_04_student_journey_fullscreen.png');
  await page.screenshot({ path: lpFsPath });
  console.log('Saved student journey fullscreen screenshot to:', lpFsPath);

  // CHECK 5: Student Journey Exited Full Screen (Card state at end)
  // Scroll to Phase D/E at end of LearnerPath pin
  const lpCardEndY = lpInfo.top + 900 * 5.2;
  console.log(`5. Scrolling to LearnerPath Card state at end (scrollY: ${lpCardEndY})...`);
  await page.evaluate((y) => {
    window.__lenis.scrollTo(y, { immediate: true });
  }, lpCardEndY);
  await new Promise(r => setTimeout(r, 800));

  const lpCardState = await getNavState();
  console.log('LearnerPath Card state at end:', lpCardState);

  const lpCardPath = path.join(artifactDir, 'verify_05_student_journey_card_end.png');
  await page.screenshot({ path: lpCardPath });
  console.log('Saved student journey card end screenshot to:', lpCardPath);

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
