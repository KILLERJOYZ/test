const puppeteer = require('puppeteer');

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/**
 * Launches a configured Puppeteer browser instance with anti-bot evasions.
 */
async function createBrowser(options = {}) {
  const headless = options.headless !== undefined ? options.headless : 'new';
  const browser = await puppeteer.launch({
    headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--window-size=1440,900',
    ],
    defaultViewport: { width: 1440, height: 900 },
    ...options,
  });
  return browser;
}

/**
 * Creates a new page with realistic headers, viewport, and stealth tweaks.
 */
async function createPage(browser, options = {}) {
  const page = await browser.newPage();
  await page.setUserAgent(options.userAgent || DEFAULT_USER_AGENT);
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
  });

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    Object.defineProperty(navigator, 'languages', { get: () => ['vi-VN', 'vi', 'en-US', 'en'] });
  });

  if (options.blockMedia) {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['media', 'font'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  return page;
}

/**
 * Scrolls the page smoothly to trigger lazy-loaded elements.
 */
async function autoScroll(page, maxScrolls = 6, delayMs = 600) {
  for (let i = 0; i < maxScrolls; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 0.85);
    });
    await new Promise((r) => setTimeout(r, delayMs));
  }
}

/**
 * Helper to sleep for a given duration in ms.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolves a relative URL against a base URL safely.
 */
function resolveUrl(baseUrl, href) {
  if (!href || typeof href !== 'string') return null;
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('javascript:') || trimmed === '#') return null;
  try {
    return new URL(trimmed, baseUrl).href;
  } catch {
    return null;
  }
}

module.exports = {
  createBrowser,
  createPage,
  autoScroll,
  sleep,
  resolveUrl,
  DEFAULT_USER_AGENT,
};
