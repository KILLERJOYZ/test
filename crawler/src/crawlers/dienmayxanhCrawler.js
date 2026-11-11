const cheerio = require('cheerio');
const { createPage, autoScroll, sleep, resolveUrl } = require('../utils/browser');
const { createNormalizedLaptop } = require('../models/laptopSchema');

const BASE_URL = 'https://www.dienmayxanh.com';
const START_URL = 'https://www.dienmayxanh.com/may-doi-tra/laptop';

/**
 * Discovers laptop categories (brands, price ranges, RAM filters) on DienMayXanh May Doi Tra.
 */
function extractCategoriesFromHtml(html) {
  const $ = cheerio.load(html);
  const categoryMap = new Map();

  $('a.filter-option_item, a[href*="/may-doi-tra/laptop-"], a[href*="/may-doi-tra/laptop?"]').each((_, el) => {
    const $el = $(el);
    const rawHref = $el.attr('href');
    const url = resolveUrl(BASE_URL, rawHref);
    if (!url || !url.startsWith(BASE_URL)) return;

    const parsed = new URL(url);
    const isBrandCategory = /^\/may-doi-tra\/laptop-[a-z0-9-]+$/i.test(parsed.pathname);
    const isFilterCategory = parsed.pathname === '/may-doi-tra/laptop' && parsed.search.length > 1;
    if (!isBrandCategory && !isFilterCategory) return;

    const slug = isBrandCategory
      ? parsed.pathname.replace(/^\/may-doi-tra\//, '')
      : `laptop-${parsed.search.replace(/^[?&]/, '').replace(/[=&]/g, '-')}`;

    const text = $el.text().replace(/\s+/g, ' ').trim();
    const imgAlt = $el.find('img').attr('alt') || '';
    const readableFromSlug = parsed.pathname
      .replace(/^\/may-doi-tra\/laptop-/, '')
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const name = text || imgAlt || readableFromSlug;
    let type = 'brand';
    if (parsed.search.includes('p=')) type = 'price_range';
    else if (parsed.search.includes('g=')) type = 'ram_filter';

    if (!categoryMap.has(url)) {
      categoryMap.set(url, {
        name,
        slug,
        url,
        type,
      });
    }
  });

  return [...categoryMap.values()];
}

/**
 * Parses inline parenthetical spec summary from DienMayXanh product titles,
 * e.g. "Laptop Samsung XE340XDA-KA1VN (N4500, 4GB, 32GB, HD, ChromeOS)"
 * or slash-delimited string "N4500/4GB/32GB/14 inch/ChromeOS/Bạc".
 */
function parseDmxInlineSpecs(nameText = '', slashSpecText = '') {
  const specs = {};

  // 1. Check parenthetical at end ONLY if it has at least 3 comma-separated parts, e.g. (N4500, 4GB, 32GB, HD, ChromeOS)
  const parenMatch = nameText.match(/\(([^)]+)\)\s*$/);
  if (parenMatch && parenMatch[1].includes(',')) {
    const parts = parenMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 3) {
      if (parts[0]) specs['CPU'] = parts[0];
      if (parts[1]) specs['RAM'] = parts[1];
      if (parts[2]) specs['Ổ cứng'] = parts[2];
      if (parts[3]) specs['Màn hình'] = parts[3];
      if (parts[4]) specs['Hệ điều hành'] = parts[4];
    }
  }

  // 2. Parse slash-delimited specs in title or unit card, e.g. "i7 12700H/16GB/512GB/4GB RTX3050Ti/144Hz/Win11"
  const sourceForSlash = slashSpecText || nameText;
  if (sourceForSlash.includes('/')) {
    const rawSegments = sourceForSlash.split('/').map((s) => s.trim()).filter(Boolean);
    if (rawSegments.length >= 2) {
      // Extract CPU from the tail of the first segment
      const cpuFromFirst = rawSegments[0].match(
        /\b((?:Intel\s+)?Core\s+(?:Ultra\s+)?[i3579]?[-\s]?\w+|i[3579][-\s]\d{4,5}[A-Z0-9]*|R[3579][-\s]\d{4}[A-Z0-9]*|Ryzen\s+[3579]\s+\w+|M[12345](?:\s+(?:Pro|Max))?(?:\s+\d+-core\s+CPU)?|N\d{3,4}|Celeron\s+\w+|Pentium\s+\w+)$/i
      );
      if (cpuFromFirst && !specs['CPU']) {
        specs['CPU'] = cpuFromFirst[1].trim();
      }

      for (let i = 1; i < rawSegments.length; i++) {
        const seg = rawSegments[i].replace(/\s+\d{1,3}(?:\.\d{3})+₫.*$/, '').trim();
        if (!specs['RAM'] && /^\d+\s*GB$/i.test(seg)) {
          specs['RAM'] = seg;
        } else if (!specs['Ổ cứng'] && /^\d+\s*(?:GB|TB)(?:\s*SSD)?$/i.test(seg)) {
          specs['Ổ cứng'] = seg;
        } else if (!specs['Card đồ họa'] && /(RTX|GTX|MX\d+|Radeon|GPU|Iris|Arc)/i.test(seg)) {
          specs['Card đồ họa'] = seg;
        } else if (!specs['Màn hình'] && /(inch|FHD|Full\s*HD|HD|OLED|2K|Hz|Retina)/i.test(seg)) {
          specs['Màn hình'] = specs['Màn hình'] ? `${specs['Màn hình']} ${seg}` : seg;
        } else if (!specs['Hệ điều hành'] && /(Win\s*1[01]|Windows|ChromeOS|macOS)/i.test(seg)) {
          specs['Hệ điều hành'] = seg.replace(/\s*\([^)]*\).*$/, '').trim();
        } else if (!specs['Màu sắc'] && /^(Đen|Bạc|Xám|Vàng|Xanh|Trắng|Hồng)$/i.test(seg)) {
          specs['Màu sắc'] = seg;
        }
      }
    }
  }

  return specs;
}

/**
 * Extracts used/refurbished laptop cards from DienMayXanh listing HTML using Cheerio.
 */
function extractProductsFromListingHtml(html, categoryContext = null) {
  const $ = cheerio.load(html);
  const products = [];

  $('.prdItem').each((_, el) => {
    const $item = $(el);
    const $link = $item.find('a[href*="/may-doi-tra/"]').first();
    const rawHref = $link.attr('href');
    const url = resolveUrl(BASE_URL, rawHref);
    const name = $item.find('.prdName, h3').first().text().replace(/\s+/g, ' ').trim();

    if (!name || !url) return;

    const parsedUrl = new URL(url);
    const pid = parsedUrl.searchParams.get('pid') || null;

    const currentPrice = $item.find('.fromPrice strong, .price strong').first().text().trim();
    const discountPercent = $item.find('.lblDis').first().text().trim();

    let originalPrice = null;
    $item.find('.price p').each((__, pEl) => {
      const pText = $(pEl).text().replace(/\s+/g, ' ').trim();
      if (/giá sản phẩm mới/i.test(pText)) {
        originalPrice = pText.replace(/^.*giá sản phẩm mới\s*:\s*/i, '');
      }
    });

    const quantityText = $item.find('.quantity').first().text().replace(/\s+/g, ' ').trim();
    const storeCountMatch = quantityText.match(/(\d+)/);
    const storeCount = storeCountMatch ? Number.parseInt(storeCountMatch[1], 10) : null;

    const installment = $item.find('.installment-label').first().text().replace(/\s+/g, ' ').trim() || null;
    const imgEl = $item.find('.imgThumnb img, img').first();
    const thumbnail = imgEl.attr('src') || imgEl.attr('data-src') || null;

    const inlineSpecs = parseDmxInlineSpecs(name);

    products.push({
      source: 'dienmayxanh',
      sku: pid,
      name,
      url,
      condition: 'used',
      availability: 'in_stock',
      currentPrice,
      originalPrice,
      discountPercent,
      installment,
      thumbnail,
      images: thumbnail ? [thumbnail] : [],
      specs: inlineSpecs,
      summarySpecs: Object.values(inlineSpecs).join(' | '),
      storeCount,
      priceNote: quantityText || 'Máy đổi trả (đã sử dụng)',
      categories: categoryContext
        ? [categoryContext]
        : [{ name: 'Laptop đổi trả', slug: 'may-doi-tra-laptop', url: START_URL, type: 'root' }],
    });
  });

  return products;
}

/**
 * Enriches a DienMayXanh used laptop by visiting its model/IMEI listing page
 * to collect individual used unit options, warranty, store location, and detailed slash specs.
 */
async function enrichProductDetail(page, rawProduct) {
  try {
    await page.goto(rawProduct.url, { waitUntil: 'networkidle2', timeout: 35000 });
    await sleep(1500);
    const html = await page.content();
    const $ = cheerio.load(html);

    const options = [];
    $('.prdItem').each((idx, el) => {
      const $unit = $(el);
      const unitText = $unit.text().replace(/\s+/g, ' ').trim();
      const unitHref = resolveUrl(BASE_URL, $unit.find('a').first().attr('href'));
      const priceText = $unit.find('strong').first().text().trim();

      // Look for slash-separated spec string like "N4500/4GB/32GB/14 inch/ChromeOS/Bạc"
      const slashMatch = unitText.match(/\b([A-Za-z0-9\s.-]+\/\d+\s*GB\/\d+\s*(?:GB|TB)\/[^₫]+?)(?=\s+\d{1,3}(?:\.\d{3})+₫)/i);
      const slashSpec = slashMatch ? slashMatch[1].trim() : '';
      if (slashSpec) {
        const parsedSpecs = parseDmxInlineSpecs(rawProduct.name, slashSpec);
        rawProduct.specs = { ...parsedSpecs, ...(rawProduct.specs || {}) };
      }

      const warrantyMatch = unitText.match(/Bảo hành:\s*([^G]+?)(?=Giá sản phẩm mới|Tiết kiệm|Có tại|$)/i);
      const locationMatch = unitText.match(/Có tại:\s*(.+)$/i);

      if (warrantyMatch && !rawProduct.warranty) {
        rawProduct.warranty = warrantyMatch[1].trim();
      }

      const labelParts = [];
      if (slashSpec) labelParts.push(slashSpec);
      if (locationMatch) labelParts.push(`Tại: ${locationMatch[1].trim()}`);
      if (warrantyMatch) labelParts.push(`BH: ${warrantyMatch[1].trim()}`);

      options.push({
        type: 'condition',
        label: labelParts.join(' - ') || `Máy đổi trả #${idx + 1}`,
        value: slashSpec || `unit_${idx + 1}`,
        price: priceText || rawProduct.currentPrice,
        url: unitHref || rawProduct.url,
        isSelected: idx === 0,
      });
    });

    if (options.length > 0) {
      rawProduct.options = options;
    }
  } catch (err) {
    console.warn(`[DienMayXanh] Warning enriching detail ${rawProduct.url}: ${err.message}`);
  }
  return rawProduct;
}

/**
 * Main DienMayXanh crawler runner.
 */
async function crawlDienmayxanh(browser, options = {}) {
  const maxCategories = options.maxCategories ?? 2;
  const maxProducts = options.maxProducts ?? 30;
  const maxDetailPages = options.maxDetailPages ?? 5;

  const page = await createPage(browser);
  const productMap = new Map();
  let categories = [];

  try {
    console.log(`[DienMayXanh] Navigating to ${START_URL}...`);
    await page.goto(START_URL, { waitUntil: 'networkidle2', timeout: 40000 });
    await autoScroll(page, 4, 500);

    const mainHtml = await page.content();
    categories = extractCategoriesFromHtml(mainHtml);
    console.log(`[DienMayXanh] Discovered ${categories.length} used laptop categories/filters.`);

    const mainProducts = extractProductsFromListingHtml(mainHtml, {
      name: 'Laptop đổi trả',
      slug: 'may-doi-tra-laptop',
      url: START_URL,
      type: 'root',
    });
    for (const p of mainProducts) {
      productMap.set(p.url, p);
    }

    // Visit brand categories
    const categoriesToVisit = categories.filter((c) => c.type === 'brand').slice(0, maxCategories);
    for (const category of categoriesToVisit) {
      if (productMap.size >= maxProducts) break;
      try {
        console.log(`[DienMayXanh] Crawling category "${category.name}" (${category.url})...`);
        await page.goto(category.url, { waitUntil: 'networkidle2', timeout: 35000 });
        await autoScroll(page, 3, 500);

        const catHtml = await page.content();
        const catProducts = extractProductsFromListingHtml(catHtml, category);
        for (const prod of catProducts) {
          if (productMap.has(prod.url)) {
            const existing = productMap.get(prod.url);
            if (!existing.categories.some((c) => c.url === category.url)) {
              existing.categories.push(category);
            }
          } else if (productMap.size < maxProducts) {
            productMap.set(prod.url, prod);
          }
        }
      } catch (err) {
        console.warn(`[DienMayXanh] Failed category ${category.url}: ${err.message}`);
      }
    }

    const rawProducts = [...productMap.values()].slice(0, maxProducts);
    console.log(`[DienMayXanh] Extracted ${rawProducts.length} unique used laptop models. Enriching top ${Math.min(maxDetailPages, rawProducts.length)} detail pages...`);

    for (let i = 0; i < Math.min(maxDetailPages, rawProducts.length); i++) {
      await enrichProductDetail(page, rawProducts[i]);
    }

    const normalizedProducts = rawProducts.map((item) => createNormalizedLaptop(item));
    return {
      source: 'dienmayxanh',
      categories,
      products: normalizedProducts,
    };
  } finally {
    await page.close();
  }
}

module.exports = {
  crawlDienmayxanh,
  extractCategoriesFromHtml,
  extractProductsFromListingHtml,
};
