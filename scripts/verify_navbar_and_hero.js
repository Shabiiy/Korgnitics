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
  
  // Start navigation
  const navPromise = page.goto('http://localhost:3000');

  // Check state early (during preloader)
  await new Promise(r => setTimeout(r, 400));
  
  const earlyState = await page.evaluate(() => {
    const video = document.querySelector('section#hero video');
    return {
      hasVideo: !!video,
      videoPaused: video ? video.paused : null,
      videoCurrentTime: video ? video.currentTime : null,
      preloaderExists: !!document.querySelector('.fixed.inset-0.z-50')
    };
  });
  console.log('Early state during preloader:', earlyState);

  await navPromise;

  // Wait for preloader to finish (preloader takes ~1.2s total)
  await new Promise(r => setTimeout(r, 1600));

  // Check state after preloader
  const afterPreloaderState = await page.evaluate(() => {
    const video = document.querySelector('section#hero video');
    const header = document.querySelector('header');
    const navPill = document.querySelector('header nav');
    const applyNow = Array.from(document.querySelectorAll('header a')).find(a => a.textContent.includes('Apply Now'));
    const logoImgs = Array.from(document.querySelectorAll('header img'));

    const getOpacity = (el) => el ? window.getComputedStyle(el).opacity : null;
    const getVisibility = (el) => el ? window.getComputedStyle(el).visibility : null;
    const getDisplay = (el) => el ? window.getComputedStyle(el).display : null;

    return {
      videoPaused: video ? video.paused : null,
      videoCurrentTime: video ? video.currentTime : null,
      preloaderExists: !!document.querySelector('.fixed.inset-0.z-50'),
      headerOpacity: getOpacity(header),
      navPillOpacity: getOpacity(navPill),
      navPillDisplay: getDisplay(navPill),
      applyNowOpacity: getOpacity(applyNow),
      applyNowText: applyNow ? applyNow.textContent.trim() : null,
      logoImgsCount: logoImgs.length
    };
  });
  console.log('After preloader state at scroll 0:', afterPreloaderState);

  // Take screenshot at scroll 0 (Hero)
  const heroScreenshot = path.join(artifactDir, 'verify_navbar_hero_scroll0.png');
  await page.screenshot({ path: heroScreenshot });
  console.log('Saved scroll 0 screenshot to:', heroScreenshot);

  // Scroll to universe section
  await page.evaluate(() => {
    const universe = document.getElementById('universe');
    if (universe) {
      if (window.__lenis) {
        window.__lenis.scrollTo(universe, { immediate: true });
      } else {
        universe.scrollIntoView();
      }
    }
  });

  await new Promise(r => setTimeout(r, 800));

  const universeState = await page.evaluate(() => {
    const header = document.querySelector('header');
    const navPill = document.querySelector('header nav');
    const applyNow = Array.from(document.querySelectorAll('header a')).find(a => a.textContent.includes('Apply Now'));
    return {
      scrollY: window.scrollY,
      headerOpacity: header ? window.getComputedStyle(header).opacity : null,
      navPillOpacity: navPill ? window.getComputedStyle(navPill).opacity : null,
      applyNowOpacity: applyNow ? window.getComputedStyle(applyNow).opacity : null
    };
  });
  console.log('Universe section navbar state:', universeState);

  const universeScreenshot = path.join(artifactDir, 'verify_navbar_universe.png');
  await page.screenshot({ path: universeScreenshot });
  console.log('Saved universe screenshot to:', universeScreenshot);

  // Scroll to learner-path section
  await page.evaluate(() => {
    const lp = document.getElementById('learner-path');
    if (lp) {
      if (window.__lenis) {
        window.__lenis.scrollTo(lp, { immediate: true });
      } else {
        lp.scrollIntoView();
      }
    }
  });

  await new Promise(r => setTimeout(r, 800));

  const lpScreenshot = path.join(artifactDir, 'verify_navbar_learner_path.png');
  await page.screenshot({ path: lpScreenshot });
  console.log('Saved learner-path screenshot to:', lpScreenshot);

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
