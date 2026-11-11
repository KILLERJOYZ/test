const cheerio = require('cheerio');
const { createPage, autoScroll, sleep, resolveUrl } = require('../utils/browser');
const { createNormalizedLaptop, parsePriceVnd } = require('../models/laptopSchema');

const BASE_URL = 'https://fptshop.com.vn';
const START_URL = 'https://fptshop.com.vn/may-tinh-xach-tay';

const KNOWN_BRAND_SLUGS = new Set([
  'apple-macbook',
  'macbook',
  'asus',
  'acer',
  'lenovo',
  'hp',
  'dell',
  'msi',
  'lg',
  'gigabyte',
  'huawei',
  'microsoft',
  'surface',
  'samsung',
  'masstel',
  'vaio',
  'avita',
  'thunderobot',
]);

/**
 * Discovers laptop categories (brands & usage segments) from FPTShop laptop page.
 */
function extractCategoriesFromHtml(html) {
  const $ = cheerio.load(html);
  const categoryMap = new Map();

  // Collect all product URLs inside .cardInfo so we never mistake a product for a category
  const productUrls = new Set();
  $('.cardInfo a[href*="/may-tinh-xach-tay/"]').each((_, el) => {
    const u = resolveUrl(BASE_URL, $(el).attr('href'));
    if (u) productUrls.add(new URL(u).pathname);
  });

  $('a[href*="/may-tinh-xach-tay/"]').each((_, el) => {
    const $el = $(el);
    if ($el.closest('.cardInfo').length > 0) return;

    const rawHref = $el.attr('href');
    const url = resolveUrl(BASE_URL, rawHref);
    if (!url || !url.startsWith(BASE_URL)) return;

    const parsed = new URL(url);
    const pathname = parsed.pathname;
    if (productUrls.has(pathname)) return;

    const match = pathname.match(/^\/may-tinh-xach-tay\/([a-z0-9-]+)$/i);
    if (!match) return;

    const slug = match[1].toLowerCase();
    // Exclude product-like slugs that contain RAM/storage or long model codes
    if (slug.length > 28 || /\b(\d+gb|\d+tb|core|ryzen|r[3579]|i[3579])\b/i.test(slug)) return;

    const cleanUrl = `${BASE_URL}${pathname}`;
    const h2Text = $el.find('h2, h3, span').first().text().replace(/\s+/g, ' ').trim();
    const rawText = $el.text().replace(/\s+/g, ' ').trim();
    const imgAlt = $el.find('img').attr('alt') || '';
    const readableFallback = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const name =
      h2Text ||
      (rawText && rawText.length < 40 ? rawText : '') ||
      (imgAlt && !imgAlt.startsWith('http') ? imgAlt : '') ||
      readableFallback;

    const isBrand = KNOWN_BRAND_SLUGS.has(slug);

    if (!categoryMap.has(cleanUrl)) {
      categoryMap.set(cleanUrl, {
        name,
        slug: `may-tinh-xach-tay/${slug}`,
        url: cleanUrl,
        type: isBrand ? 'brand' : 'segment',
      });
    }
  });

  return [...categoryMap.values()];
}

/**
 * Parses slash-delimited specs from FPTShop H1 or product title
 * e.g. "Laptop Acer Aspire Lite 14 AL14-44P-R0SP R7 7730U/8GB/512GB/14.5\" FHD/Win11"
 */
function parseFptTitleSpecs(title = '') {
  const specs = {};
  const parts = title.split('/').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    // First segment ends with CPU after model name
    const cpuMatch = parts[0].match(
      /\b((?:Intel\s+)?Core\s+(?:Ultra\s+)?[i3579]?[-\s]?\w+|R[3579][-\s]\w+|Ryzen\s+[3579]\s+\w+|Apple\s+M[12345](?:\s+(?:Pro|Max))?|M[12345](?:\s+(?:Pro|Max))?|N\d{3,4}|Snapdragon\s+[\w\s]+)$/i
    );
    if (cpuMatch) specs['CPU'] = cpuMatch[1].trim();

    for (let i = 1; i < parts.length; i++) {
      const seg = parts[i];
      if (!specs['RAM'] && /^\d+\s*GB$/i.test(seg)) {
        specs['RAM'] = seg;
      } else if (!specs['Ổ cứng'] && /^\d+\s*(?:GB|TB)(?:\s*SSD)?$/i.test(seg)) {
        specs['Ổ cứng'] = seg.includes('SSD') ? seg : `${seg} SSD`;
      } else if (!specs['Màn hình'] && /(inch|"|FHD|OLED|WUXGA|2K|2\.8K|Retina|Hz)/i.test(seg)) {
        specs['Màn hình'] = seg;
      } else if (!specs['Hệ điều hành'] && /(Win|macOS|FreeDOS|Linux)/i.test(seg)) {
        specs['Hệ điều hành'] = seg;
      } else if (!specs['Card đồ họa'] && /(RTX|GTX|MX\d+|Arc|Radeon)/i.test(seg)) {
        specs['Card đồ họa'] = seg;
      }
    }
  }
  return specs;
}

/**
 * Extracts laptop products from an FPTShop listing/category HTML using Cheerio.
 */
function extractProductsFromListingHtml(html, categoryContext = null) {
  const $ = cheerio.load(html);
  const byUrl = new Map();

  $('.cardInfo').each((_, el) => {
    const $cardInfo = $(el);
    const $card = $cardInfo.closest('.group');
    const $link = $cardInfo.find('a[href*="/may-tinh-xach-tay/"]').first();
    const rawHref =
      $link.attr('href') || $card.find('a[href*="/may-tinh-xach-tay/"]').first().attr('href');
    const fullUrl = resolveUrl(BASE_URL, rawHref);
    if (!fullUrl) return;

    const parsed = new URL(fullUrl);
    const cleanUrl = `${BASE_URL}${parsed.pathname}`;
    const skuFromQuery = parsed.searchParams.get('sku') || null;

    const topLink = $card.find('a[aria-label], a[title]').first();
    let name =
      topLink.attr('aria-label') ||
      topLink.attr('title') ||
      $cardInfo.find('h3').first().text().replace(/\s+/g, ' ').trim() ||
      '';

    const cardText = $cardInfo.text().replace(/\s+/g, ' ').trim();
    if (!name) {
      const laptopIdx = cardText.indexOf('Laptop ');
      if (laptopIdx >= 0) name = cardText.slice(laptopIdx).trim();
    }
    if (!name) return;

    // Extract prices (exclude "Giảm X.XXX.000đ" savings amount)
    const textWithoutSavings = cardText.replace(/Giảm\s+\d{1,3}(?:\.\d{3})+\s*[đ₫]/gi, '');
    const priceMatches = textWithoutSavings.match(/\d{1,3}(?:\.\d{3})+\s*[đ₫]/g) || [];
    const numericPrices = priceMatches.map((p) => parsePriceVnd(p)).filter(Boolean);

    let currentPrice = null;
    let originalPrice = null;
    if (numericPrices.length >= 2) {
      currentPrice = Math.min(numericPrices[0], numericPrices[1]);
      originalPrice = Math.max(numericPrices[0], numericPrices[1]);
    } else if (numericPrices.length === 1) {
      currentPrice = numericPrices[0];
      originalPrice = numericPrices[0];
    }

    const discMatch = cardText.match(/-\d+\s*%/);
    const discountPercent = discMatch ? discMatch[0] : null;

    // Extract image
    let thumbnail = null;
    $card.find('img').each((__, imgEl) => {
      const src = $(imgEl).attr('src') || '';
      if (src && !src.includes('/svg/') && !thumbnail) {
        thumbnail = src;
      }
    });

    // Extract feature highlights on the card
    const featureBadges = [];
    $card.find('div.text-center').each((__, fEl) => {
      const t = $(fEl).text().replace(/\s+/g, ' ').trim();
      if (t && t.length > 3 && t.length < 45) featureBadges.push(t);
    });

    const titleSpecs = parseFptTitleSpecs(name);

    byUrl.set(cleanUrl, {
      source: 'fptshop',
      sku: skuFromQuery,
      name,
      url: cleanUrl,
      currentPrice,
      originalPrice,
      discountPercent,
      thumbnail,
      images: thumbnail ? [thumbnail] : [],
      specs: titleSpecs,
      summarySpecs: [...Object.values(titleSpecs), ...featureBadges].join(' | '),
      categories: categoryContext
        ? [categoryContext]
        : [{ name: 'Máy tính xách tay', slug: 'may-tinh-xach-tay', url: START_URL, type: 'root' }],
    });
  });

  return [...byUrl.values()];
}

/**
 * Enriches an FPTShop laptop product by visiting its detail page (JSON-LD + H1 slash specs + spec grid).
 */
async function enrichProductDetail(page, rawProduct) {
  try {
    await page.goto(rawProduct.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(1800);
    const html = await page.content();
    const $ = cheerio.load(html);

    const h1Text = $('h1').first().text().replace(/\s+/g, ' ').trim();
    if (h1Text) {
      rawProduct.name = h1Text;
      const h1Specs = parseFptTitleSpecs(h1Text);
      rawProduct.specs = { ...(rawProduct.specs || {}), ...h1Specs };
    }

    // Spec key-value elements on detail page
    const detailSpecs = {};
    $('div.flex.flex-col, li, tr').each((_, el) => {
      const children = $(el).children();
      if (children.length === 2) {
        const k = $(children[0]).text().replace(/\s+/g, ' ').trim();
        const v = $(children[1]).text().replace(/\s+/g, ' ').trim();
        if (
          k &&
          v &&
          k.length < 35 &&
          v.length < 150 &&
          /^(CPU|RAM|Ổ cứng|Kích thước màn hình|Màn hình|Đồ họa|Card đồ họa|Trọng lượng|Pin|Hệ điều hành|Tấm nền)$/i.test(k)
        ) {
          detailSpecs[k] = v;
        }
      }
    });
    rawProduct.specs = { ...(rawProduct.specs || {}), ...detailSpecs };

    // Parse JSON-LD Product block
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html());
        if (data && data['@type'] === 'Product') {
          if (data.sku) rawProduct.sku = String(data.sku);
          if (data.brand?.name) rawProduct.brand = data.brand.name;
          if (typeof data.image === 'string') {
            rawProduct.images = [...new Set([...(rawProduct.images || []), data.image])];
          } else if (Array.isArray(data.image)) {
            rawProduct.images = [...new Set([...(rawProduct.images || []), ...data.image])];
          }
          if (data.offers && !rawProduct.currentPrice) {
            const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
            if (offer?.price) rawProduct.currentPrice = Number(offer.price);
          }
          if (data.aggregateRating) {
            rawProduct.rating = {
              average: Number.parseFloat(data.aggregateRating.ratingValue) || null,
              count: Number.parseInt(data.aggregateRating.reviewCount || data.aggregateRating.ratingCount, 10) || null,
            };
          }
        }
      } catch {
        // Ignore invalid JSON-LD
      }
    });
  } catch (err) {
    console.warn(`[FPTShop] Warning enriching detail ${rawProduct.url}: ${err.message}`);
  }
  return rawProduct;
}

/**
 * Main FPTShop crawler runner.
 */
async function crawlFptshop(browser, options = {}) {
  const maxCategories = options.maxCategories ?? 2;
  const maxProducts = options.maxProducts ?? 30;
  const maxDetailPages = options.maxDetailPages ?? 5;

  const page = await createPage(browser);
  const productMap = new Map();
  let categories = [];

  try {
    console.log(`[FPTShop] Navigating to ${START_URL}...`);
    await page.goto(START_URL, { waitUntil: 'networkidle2', timeout: 40000 });
    await autoScroll(page, 4, 500);

    const mainHtml = await page.content();
    categories = extractCategoriesFromHtml(mainHtml);
    console.log(`[FPTShop] Discovered ${categories.length} laptop categories.`);

    const mainProducts = extractProductsFromListingHtml(mainHtml, {
      name: 'Máy tính xách tay',
      slug: 'may-tinh-xach-tay',
      url: START_URL,
      type: 'root',
    });
    for (const p of mainProducts) {
      productMap.set(p.url, p);
    }

    // Visit sub-categories to gather categorized laptops
    const categoriesToVisit = categories.slice(0, maxCategories);
    for (const category of categoriesToVisit) {
      if (productMap.size >= maxProducts) break;
      try {
        console.log(`[FPTShop] Crawling category "${category.name}" (${category.url})...`);
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
        console.warn(`[FPTShop] Failed category ${category.url}: ${err.message}`);
      }
    }

    const rawProducts = [...productMap.values()].slice(0, maxProducts);
    console.log(`[FPTShop] Extracted ${rawProducts.length} unique products. Enriching top ${Math.min(maxDetailPages, rawProducts.length)} detail pages...`);

    for (let i = 0; i < Math.min(maxDetailPages, rawProducts.length); i++) {
      await enrichProductDetail(page, rawProducts[i]);
    }

    const normalizedProducts = rawProducts.map((item) => createNormalizedLaptop(item));
    return {
      source: 'fptshop',
      categories,
      products: normalizedProducts,
    };
  } finally {
    await page.close();
  }
}

module.exports = {
  crawlFptshop,
  extractCategoriesFromHtml,
  extractProductsFromListingHtml,
};
