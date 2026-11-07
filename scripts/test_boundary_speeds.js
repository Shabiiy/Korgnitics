const puppeteer = require('puppeteer');

async function testBoundaries() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  // Initialize performance observers
  await page.evaluate(() => {
    window.__longTasks = [];
    window.__fpsRecords = [];
    window.__boundarySpans = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__longTasks.push({
          duration: Math.round(entry.duration),
          startTime: Math.round(entry.startTime),
        });
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
  });

  async function measureScrollProfile(testName, stepPx, intervalMs) {
    console.log(`\n--- Running: ${testName} (step: ${stepPx}px, interval: ${intervalMs}ms) ---`);

    await page.evaluate(() => {
      window.__longTasks = [];
      window.__fpsFrames = 0;
      window.__fpsStart = performance.now();

      function tick() {
        window.__fpsFrames++;
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });

    const scrollMax = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);

    // Scroll Down
    let y = 0;
    while (y < scrollMax) {
      y = Math.min(scrollMax, y + stepPx);
      await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
      await new Promise((r) => setTimeout(r, intervalMs));
    }

    // Scroll Up
    while (y > 0) {
      y = Math.max(0, y - stepPx);
      await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
      await new Promise((r) => setTimeout(r, intervalMs));
    }

    const report = await page.evaluate(() => {
      const elapsedSec = (performance.now() - window.__fpsStart) / 1000;
      const fps = Math.round(window.__fpsFrames / elapsedSec);
      return {
        fps,
        longTasksCount: window.__longTasks.length,
        longTasks: window.__longTasks,
      };
    });

    console.log(`Result for ${testName}:`);
    console.log(`  Average FPS: ${report.fps} fps`);
    console.log(`  Long Tasks (>50ms): ${report.longTasksCount}`, report.longTasks);
    return report;
  }

  // 1. Slow speed (precision wheel / gentle trackpad)
  const slowRes = await measureScrollProfile('Slow Scroll (Smooth Wheel)', 40, 30);

  // 2. Medium speed (typical scrolling)
  const medRes = await measureScrollProfile('Medium Scroll (Normal Use)', 100, 20);

  // 3. Fast / Hard flick speed (rapid flick)
  const fastRes = await measureScrollProfile('Hard Wheel Flick (Fast Scroll)', 260, 16);

  console.log('\n=== FINAL BOUNDARY BENCHMARK SUMMARY ===');
  console.log(`Slow:   FPS = ${slowRes.fps}, Long Tasks = ${slowRes.longTasksCount}`);
  console.log(`Medium: FPS = ${medRes.fps}, Long Tasks = ${medRes.longTasksCount}`);
  console.log(`Hard:   FPS = ${fastRes.fps}, Long Tasks = ${fastRes.longTasksCount}`);

  await browser.close();
}

testBoundaries().catch(console.error);

