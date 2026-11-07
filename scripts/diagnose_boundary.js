const puppeteer = require('puppeteer');

async function diagnose() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Get boundaries of sections
  const sectionPositions = await page.evaluate(() => {
    const hero = document.getElementById('hero');
    const universe = document.getElementById('universe');
    const lp = document.getElementById('learner-path');
    const activities = document.getElementById('activities');

    return {
      hero: hero ? { top: hero.offsetTop, height: hero.offsetHeight } : null,
      universe: universe ? { top: universe.offsetTop, height: universe.offsetHeight } : null,
      learnerPath: lp ? { top: lp.offsetTop, height: lp.offsetHeight } : null,
      activities: activities ? { top: activities.offsetTop, height: activities.offsetHeight } : null,
    };
  });

  console.log('Section positions:', sectionPositions);

  const client = await page.target().createCDPSession();
  await client.send('Performance.enable');

  // Monitor long tasks and frame drops around boundary
  await page.evaluate(() => {
    window.__boundaryLogs = [];
    window.__longTasks = [];
    window.__frameDeltas = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__longTasks.push({
          startTime: entry.startTime,
          duration: entry.duration,
          scrollY: window.scrollY
        });
      }
    });
    observer.observe({ entryTypes: ['longtask'] });

    let lastTime = performance.now();
    function trackFrame(now) {
      const delta = now - lastTime;
      lastTime = now;
      if (delta > 25) { // frames taking > 25ms (< 40fps)
        window.__frameDeltas.push({ delta: Math.round(delta), scrollY: Math.round(window.scrollY), time: Math.round(now) });
      }
      requestAnimationFrame(trackFrame);
    }
    requestAnimationFrame(trackFrame);
  });

  // Target: Scroll from before LearnerPath (inside Universe), across LearnerPath entry, through LearnerPath, and out into Activities
  const lpStart = sectionPositions.learnerPath ? sectionPositions.learnerPath.top : 4500;
  console.log(`Starting scroll trace around LearnerPath anchor: ${lpStart}px...`);

  const startY = Math.max(0, lpStart - 800); // 800px before
  const endY = lpStart + 5000; // through and out into Activities

  // Position at startY
  await page.evaluate((y) => window.scrollTo(0, y), startY);
  await new Promise((r) => setTimeout(r, 600));

  // Scroll through boundary at realistic wheel scroll increments (100px increments every 16-25ms)
  let curY = startY;
  while (curY < endY) {
    curY += 60;
    await page.evaluate((y) => window.scrollTo(0, y), curY);
    await new Promise((r) => setTimeout(r, 20));
  }

  // Scroll back up across boundary
  while (curY > startY) {
    curY -= 60;
    await page.evaluate((y) => window.scrollTo(0, y), curY);
    await new Promise((r) => setTimeout(r, 20));
  }

  const results = await page.evaluate(() => {
    return {
      longTasks: window.__longTasks,
      slowFrames: window.__frameDeltas,
      totalSlowFrames: window.__frameDeltas.length
    };
  });

  console.log('=== DIAGNOSIS RESULTS ===');
  console.log('Long tasks detected:', results.longTasks);
  console.log('Slow frames count (frame delta > 25ms):', results.totalSlowFrames);
  console.log('Sample slow frames around boundary:', results.slowFrames.slice(0, 15));

  await browser.close();
}

diagnose().catch(console.error);

