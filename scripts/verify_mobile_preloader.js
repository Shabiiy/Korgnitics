const puppeteer = require("puppeteer");

(async () => {
  console.log("Testing mobile frame preloader...");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const requestedFrames = new Set();
  const errors = [];

  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("/journey-frames-sm/frame_")) {
      requestedFrames.add(url);
    }
  });

  page.on("pageerror", (err) => {
    errors.push(err.toString());
  });

  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });

  const preloaderPath = "C:/Users/User/.gemini/antigravity/brain/a82f2ad5-7d66-49a5-afca-e4c60d43c046/verify_mobile_preloader_loading.png";
  await new Promise((r) => setTimeout(r, 150));
  await page.screenshot({ path: preloaderPath });
  console.log("Saved mobile preloader screenshot to:", preloaderPath);

  // Wait for preloader to exit
  await page.waitForFunction(() => !document.querySelector(".fixed.inset-0.z-50"), { timeout: 15000 });
  console.log("Mobile preloader finished! User entered website.");
  console.log("Total mobile frames requested:", requestedFrames.size);

  const enteredPath = "C:/Users/User/.gemini/antigravity/brain/a82f2ad5-7d66-49a5-afca-e4c60d43c046/verify_mobile_website_entered.png";
  await page.screenshot({ path: enteredPath });
  console.log("Saved mobile entered screenshot to:", enteredPath);

  console.log("Console errors:", errors.length);
  await browser.close();
  console.log("Mobile test complete!");
})();
