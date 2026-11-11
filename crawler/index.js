const path = require('path');
const { createBrowser } = require('./src/utils/browser');
const { saveCrawlResult, saveCombinedResult } = require('./src/utils/storage');
const { crawlCellphones } = require('./src/crawlers/cellphonesCrawler');
const { crawlThegioididong } = require('./src/crawlers/thegioididongCrawler');
const { crawlDienmayxanh } = require('./src/crawlers/dienmayxanhCrawler');
const { crawlFptshop } = require('./src/crawlers/fptshopCrawler');

const CRAWLER_MAP = {
  cellphones: crawlCellphones,
  thegioididong: crawlThegioididong,
  dienmayxanh: crawlDienmayxanh,
  fptshop: crawlFptshop,
};

function parseCliArgs(argv) {
  const options = {
    source: 'all',
    maxCategories: 2,
    maxProducts: 15,
    maxDetailPages: 15,
    outputDir: path.resolve(__dirname, '..', 'data'),
  };

  for (const arg of argv) {
    if (arg.startsWith('--source=')) {
      options.source = arg.split('=')[1].trim().toLowerCase();
    } else if (arg.startsWith('--max-categories=')) {
      options.maxCategories = Number.parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--max-products=')) {
      options.maxProducts = Number.parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--max-details=')) {
      options.maxDetailPages = Number.parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--output=')) {
      options.outputDir = path.resolve(arg.split('=')[1]);
    }
  }

  return options;
}

async function run() {
  const options = parseCliArgs(process.argv.slice(2));
  const selectedSources =
    options.source === 'all'
      ? Object.keys(CRAWLER_MAP)
      : options.source.split(',').filter((s) => CRAWLER_MAP[s]);

  if (selectedSources.length === 0) {
    console.error(
      `Invalid --source="${options.source}". Valid options: all, ${Object.keys(CRAWLER_MAP).join(', ')}`
    );
    process.exit(1);
  }

  console.log('==========================================================');
  console.log(' Starting Laptop Retailer Crawler (Puppeteer + Cheerio)');
  console.log(` Sources        : ${selectedSources.join(', ')}`);
  console.log(` Max Categories : ${options.maxCategories} per site`);
  console.log(` Max Products   : ${options.maxProducts} per site`);
  console.log(` Max Details    : ${options.maxDetailPages} per site`);
  console.log(` Output Dir     : ${options.outputDir}`);
  console.log('==========================================================\n');

  const browser = await createBrowser();
  const resultsBySource = {};

  try {
    for (const sourceName of selectedSources) {
      const crawlerFn = CRAWLER_MAP[sourceName];
      const startTime = Date.now();
      try {
        const result = await crawlerFn(browser, options);
        resultsBySource[sourceName] = result;
        const savedPath = saveCrawlResult(options.outputDir, sourceName, result);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(
          `[SUCCESS] ${sourceName}: ${result.categories.length} categories, ${result.products.length} normalized products saved to ${savedPath} (${elapsed}s)\n`
        );
      } catch (err) {
        console.error(`[ERROR] Crawler "${sourceName}" failed:`, err.message);
      }
    }

    if (Object.keys(resultsBySource).length > 0) {
      const combinedPath = saveCombinedResult(options.outputDir, resultsBySource);
      console.log(`==========================================================`);
      console.log(` Unified Normalized Dataset saved to: ${combinedPath}`);
      console.log(`==========================================================`);
    }
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  run().catch((err) => {
    console.error('Fatal crawler error:', err);
    process.exit(1);
  });
}

module.exports = {
  run,
  CRAWLER_MAP,
};
