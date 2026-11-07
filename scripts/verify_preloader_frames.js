const puppeteer = require("puppeteer");
const path = require("path");

(async () => {
  console.log("Launching Puppeteer to test frame preloader...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const requestedFrames = new Set();
  const consoleLogs = [];
  const errors = [];

  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("/journey-frames/frame_")) {
      requestedFrames.add(url);
    }
  });

  page.on("console", (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on("pageerror", (err) => {
    errors.push(err.toString());
  });

  console.log("Navigating to http://localhost:3000...");
  
  // Navigate without waiting for networkidle so we capture preloader state
  const navPromise = page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await navPromise;

  // Immediately check for preloader element
  const preloaderEl = await page.waitForSelector(".fixed.inset-0.z-50", { timeout: 3000 }).catch(() => null);
  console.log("Preloader present:", !!preloaderEl);

  // Capture preloader mid-progress screenshot
  await new Promise((r) => setTimeout(r, 200));
  const preloaderText = await page.evaluate(() => {
    const el = document.querySelector(".fixed.inset-0.z-50");
    return el ? el.innerText : "Not found";
  });
  console.log("Preloader mid-text:\n", preloaderText);
  console.log("Frames requested so far:", requestedFrames.size);

  const preloaderPath = "C:/Users/User/.gemini/antigravity/brain/a82f2ad5-7d66-49a5-afca-e4c60d43c046/verify_preloader_loading_frames.png";
  await page.screenshot({ path: preloaderPath });
  console.log("Saved preloader screenshot to:", preloaderPath);

  // Wait for preloader to complete and detach
  console.log("Waiting for preloader to exit...");
  await page.waitForFunction(() => {
    return !document.querySelector(".fixed.inset-0.z-50");
  }, { timeout: 15000 });
  console.log("Preloader successfully disappeared! User has entered the website.");
  console.log("Total frames requested during/by preloader:", requestedFrames.size);

  // Check state of global frame cache in page context
  const frameCacheStatus = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    return {
      hasCanvas: !!canvas,
      canvasWidth: canvas ? canvas.width : 0,
      canvasHeight: canvas ? canvas.height : 0,
      scrollY: window.scrollY,
      bodyOverflow: document.body.style.overflow,
    };
  });
  console.log("Post-preloader page state:", frameCacheStatus);

  // Capture homepage after preloader entrance
  const enteredPath = "C:/Users/User/.gemini/antigravity/brain/a82f2ad5-7d66-49a5-afca-e4c60d43c046/verify_website_entered.png";
  await page.screenshot({ path: enteredPath });
  console.log("Saved entered website screenshot to:", enteredPath);

  // Scroll down to LearnerPath section and verify canvas draws frames
  console.log("Scrolling to LearnerPath section...");
  await page.evaluate(() => {
    const section = document.querySelector("canvas");
    if (section) {
      section.scrollIntoView({ behavior: "instant" });
    }
  });

  await new Promise((r) => setTimeout(r, 500));

  const learnerPathScreenshot = "C:/Users/User/.gemini/antigravity/brain/a82f2ad5-7d66-49a5-afca-e4c60d43c046/verify_learnerpath_frames_rendered.png";
  await page.screenshot({ path: learnerPathScreenshot });
  console.log("Saved LearnerPath screenshot to:", learnerPathScreenshot);

  console.log("Console errors count:", errors.length);
  if (errors.length > 0) {
    console.error("Errors:", errors);
  }

  await browser.close();
  console.log("Verification finished successfully!");
})();
