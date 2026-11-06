const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await sleep(2000);

  const artifactDir = 'C:/Users/User/.gemini/antigravity/brain/a82f2ad5-7d66-49a5-afca-e4c60d43c046';

  console.log('=== TEST 1: FIND UNIVERSE TRIGGER & MEASURE INITIAL STATE ===');
  
  // Find where #universe trigger starts
  const universeInfo = await page.evaluate(() => {
    const univ = document.getElementById('universe');
    const hero = document.getElementById('hero');
    const triggers = window.ScrollTrigger ? window.ScrollTrigger.getAll() : [];
    const univST = triggers.find(t => t.trigger && (t.trigger.id === 'universe' || t.trigger.contains(univ)));
    return {
      univTop: univ ? univ.getBoundingClientRect().top : null,
      scrollTriggerStart: univST ? univST.start : null,
      scrollTriggerEnd: univST ? univST.end : null,
      scrollY: window.scrollY,
    };
  });
  console.log('Universe trigger info:', universeInfo);

  // Scroll to universe start position (hero finishes around ~900, universe starts pinning)
  // Let's get the exact scroll position where universe starts
  const startY = universeInfo.scrollTriggerStart || 900;
  console.log(`Scrolling to start of universe pin: y = ${startY}`);
  
  await page.evaluate((y) => window.scrollTo(0, y), startY);
  await sleep(400);

  // 1. Initial Collapsed State (progress 0 of universe)
  const collapsedState = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#universe [style*=\"z-index\"]'));
    return cards.map((c, i) => {
      const rect = c.getBoundingClientRect();
      const miniTitle = c.querySelector('h4');
      const expandedTitle = c.querySelector('h3');
      const learnMoreBtn = c.querySelector('a[href*=\"learner-path\"]');
      return {
        cardIndex: i,
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
        miniTitle: miniTitle ? miniTitle.textContent.trim() : null,
        miniTitleOpacity: miniTitle ? getComputedStyle(miniTitle.parentElement).opacity : null,
        expandedTitleOpacity: expandedTitle ? getComputedStyle(expandedTitle).opacity : null,
        learnMorePointerEvents: learnMoreBtn ? getComputedStyle(learnMoreBtn.closest('.fade-slide-el') || learnMoreBtn).pointerEvents : null,
      };
    });
  });
  console.log('Collapsed State (scroll = ' + startY + '):', JSON.stringify(collapsedState, null, 2));

  // Take screenshot of Collapsed State
  await page.screenshot({ path: path.join(artifactDir, 'universe_morph_01_collapsed.png') });
  console.log('Saved screenshot: universe_morph_01_collapsed.png');

  // Total scrub distance for universe is ~2700px (300vh)
  const pinDuration = universeInfo.scrollTriggerEnd ? (universeInfo.scrollTriggerEnd - universeInfo.scrollTriggerStart) : 2700;
  console.log(`Pin total scrub distance: ${pinDuration}px`);

  // 2. Segment 1: Card 1 expanded (progress ~0.35)
  const ySegment1 = startY + pinDuration * 0.35;
  await page.evaluate((y) => window.scrollTo(0, y), ySegment1);
  await sleep(400);

  const segment1State = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#universe [style*=\"z-index\"]'));
    return cards.map((c, i) => {
      const rect = c.getBoundingClientRect();
      return {
        cardIndex: i,
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
      };
    });
  });
  console.log('Segment 1 State (scroll = ' + Math.round(ySegment1) + '):', JSON.stringify(segment1State, null, 2));
  await page.screenshot({ path: path.join(artifactDir, 'universe_morph_02_card1_expanded.png') });
  console.log('Saved screenshot: universe_morph_02_card1_expanded.png');

  // 3. Segment 2: Card 2 expanded (progress ~0.68)
  const ySegment2 = startY + pinDuration * 0.68;
  await page.evaluate((y) => window.scrollTo(0, y), ySegment2);
  await sleep(400);

  const segment2State = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#universe [style*=\"z-index\"]'));
    return cards.map((c, i) => {
      const rect = c.getBoundingClientRect();
      return {
        cardIndex: i,
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
      };
    });
  });
  console.log('Segment 2 State (scroll = ' + Math.round(ySegment2) + '):', JSON.stringify(segment2State, null, 2));
  await page.screenshot({ path: path.join(artifactDir, 'universe_morph_03_card2_expanded.png') });
  console.log('Saved screenshot: universe_morph_03_card2_expanded.png');

  // 4. Segment 3: All 3 Cards expanded (progress 1.0)
  const ySegment3 = startY + pinDuration;
  await page.evaluate((y) => window.scrollTo(0, y), ySegment3);
  await sleep(400);

  const finalState = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#universe [style*=\"z-index\"]'));
    return cards.map((c, i) => {
      const rect = c.getBoundingClientRect();
      const expandedTitle = c.querySelector('h3');
      const learnMoreBtn = c.querySelector('a[href*=\"learner-path\"]');
      return {
        cardIndex: i,
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
        expandedTitle: expandedTitle ? expandedTitle.textContent.trim() : null,
        expandedTitleOpacity: expandedTitle ? getComputedStyle(expandedTitle).opacity : null,
        learnMorePointerEvents: learnMoreBtn ? getComputedStyle(learnMoreBtn.closest('.fade-slide-el') || learnMoreBtn).pointerEvents : null,
      };
    });
  });
  console.log('Final Expanded State (scroll = ' + Math.round(ySegment3) + '):', JSON.stringify(finalState, null, 2));
  await page.screenshot({ path: path.join(artifactDir, 'universe_morph_04_all_expanded.png') });
  console.log('Saved screenshot: universe_morph_04_all_expanded.png');

  console.log('\n=== TEST 2: MOBILE (< 1024px) CHECK ===');
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);

  // Scroll to universe on mobile
  await page.evaluate(() => {
    const u = document.getElementById('universe');
    if (u) u.scrollIntoView();
  });
  await sleep(400);

  const mobileCards = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('#universe [style*=\"z-index\"]'));
    return cards.map((c, i) => {
      const rect = c.getBoundingClientRect();
      const h3 = c.querySelector('h3');
      return {
        cardIndex: i,
        title: h3 ? h3.textContent.trim() : null,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    });
  });
  console.log('Mobile Cards:', mobileCards);
  await page.screenshot({ path: path.join(artifactDir, 'universe_mobile_stacked.png') });
  console.log('Saved screenshot: universe_mobile_stacked.png');

  await browser.close();
  console.log('\nALL UNIVERSE MORPH TESTS COMPLETED!');
}

main().catch(console.error);

