const fs = require('fs');
const path = require('path');

/**
 * Saves normalized laptop items and discovered categories to JSON files.
 */
function saveCrawlResult(outputDir, sourceName, payload) {
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, `${sourceName}.json`);

  const structuredOutput = {
    source: sourceName,
    crawledAt: new Date().toISOString(),
    totalCategories: Array.isArray(payload.categories) ? payload.categories.length : 0,
    totalProducts: Array.isArray(payload.products) ? payload.products.length : 0,
    categories: payload.categories || [],
    products: payload.products || [],
  };

  fs.writeFileSync(filePath, JSON.stringify(structuredOutput, null, 2), 'utf8');
  return filePath;
}

/**
 * Merges and saves all crawled datasets into a unified JSON file for database import.
 */
function saveCombinedResult(outputDir, resultsBySource) {
  fs.mkdirSync(outputDir, { recursive: true });
  const allCategories = [];
  const allProducts = [];

  for (const [source, data] of Object.entries(resultsBySource)) {
    if (Array.isArray(data.categories)) {
      for (const cat of data.categories) {
        allCategories.push({ source, ...cat });
      }
    }
    if (Array.isArray(data.products)) {
      allProducts.push(...data.products);
    }
  }

  const combinedPath = path.join(outputDir, 'all_laptops_normalized.json');
  const payload = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    sources: Object.keys(resultsBySource),
    totalCategories: allCategories.length,
    totalProducts: allProducts.length,
    categories: allCategories,
    products: allProducts,
  };

  fs.writeFileSync(combinedPath, JSON.stringify(payload, null, 2), 'utf8');
  return combinedPath;
}

module.exports = {
  saveCrawlResult,
  saveCombinedResult,
};
