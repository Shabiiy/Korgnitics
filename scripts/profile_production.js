const puppeteer = require('puppeteer');

async function profile() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  let totalTransferBytes = 0;
  const resourceBreakdown = {};

  page.on('response', (response) => {
    try {
      const headers = response.headers();
      const length = parseInt(headers['content-length'] || '0', 10);
      const url = response.url();
      totalTransferBytes += length;

      const type = response.request().resourceType();
      resourceBreakdown[type] = (resourceBreakdown[type] || 0) + length;
    } catch {}
  });

  console.log('Navigating to production site...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Setup performance metrics observer in page
  await page.evaluate(() => {
    window.__longTasks = [];
    window.__fpsFrames = 0;
    window.__fpsStartTime = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__longTasks.push({
          duration: entry.duration,
          startTime: entry.startTime,
        });
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
  });

  // Start FPS measuring loop
  await page.evaluate(() => {
    window.__fpsStartTime = performance.now();
    let frames = 0;
    function count() {
      frames++;
      window.__fpsFrames = frames;
      requestAnimationFrame(count);
    }
    requestAnimationFrame(count);
  });

  // Scroll smoothly from top to bottom
  console.log('Simulating full page scroll...');
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const steps = 40;
  const stepDistance = scrollHeight / steps;

  for (let i = 0; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * stepDistance);
    await new Promise((r) => setTimeout(r, 60)); // ~2.5s total scroll
  }

  // Retrieve metrics
  const metrics = await page.evaluate(() => {
    const totalTime = (performance.now() - window.__fpsStartTime) / 1000;
    const avgFps = Math.round(window.__fpsFrames / totalTime);
    return {
      avgFps,
      longTasksCount: window.__longTasks.length,
      longTasksTotalDurationMs: Math.round(
        window.__longTasks.reduce((acc, t) => acc + t.duration, 0)
      ),
      longTasks: window.__longTasks.map((t) => Math.round(t.duration)),
    };
  });

  console.log('=== PERFORMANCE REPORT ===');
  console.log(`Scroll FPS: ${metrics.avgFps} fps`);
  console.log(`Long Tasks (>50ms): ${metrics.longTasksCount} tasks (Total duration: ${metrics.longTasksTotalDurationMs} ms)`);
  console.log(`Total Transfer Size: ${(totalTransferBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log('Breakdown by type:', Object.entries(resourceBreakdown).map(([k, v]) => `${k}: ${(v / 1024).toFixed(1)} KB`).join(', '));

  await browser.close();
}

profile().catch(console.error);
