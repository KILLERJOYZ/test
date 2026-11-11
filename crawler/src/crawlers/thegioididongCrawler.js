const cheerio = require('cheerio');
const { createPage, autoScroll, sleep, resolveUrl } = require('../utils/browser');
const { createNormalizedLaptop } = require('../models/laptopSchema');

const BASE_URL = 'https://www.thegioididong.com';
const START_URL = 'https://www.thegioididong.com/laptop';

/**
 * Discovers laptop categories (brands, series, segments) from TheGioiDiDong laptop page.
 */
function extractCategoriesFromHtml(html) {
  const $ = cheerio.load(html);
  const categoryMap = new Map();

  $('a[href*="/laptop-"], .lst-quickfilter a, .box-quicklink a').each((_, el) => {
    const $el = $(el);
    const rawHref = $el.attr('href');
    const url = resolveUrl(BASE_URL, rawHref);
    if (!url || !url.startsWith(BASE_URL)) return;

    const parsed = new URL(url);
    const pathname = parsed.pathname;
    if (!/^\/laptop-[a-z0-9-]+$/i.test(pathname)) return;

    const cleanUrl = `${BASE_URL}${pathname}`;
    const imgAlt = $el.find('img').attr('alt') || '';
    const rawText = $el.text().replace(/\s+/g, ' ').trim();
    const slug = pathname.replace(/^\//, '');
    const readableFallback = slug
      .replace(/^laptop-/, '')
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const name = rawText || imgAlt || readableFallback;

    if (!categoryMap.has(cleanUrl)) {
      categoryMap.set(cleanUrl, {
        name,
        slug,
        url: cleanUrl,
        type: slug.split('-').length <= 3 ? 'brand' : 'series',
      });
    }
  });

  return [...categoryMap.values()];
}

/**
 * Extracts laptop products from a TheGioiDiDong listing/category HTML using Cheerio.
 * Supports both the modern Tailwind DOM structure and legacy `.listproduct li.item` cards.
 */
function extractProductsFromListingHtml(html, categoryContext = null) {
  const $ = cheerio.load(html);
  const byUrl = new Map();

  // 1. Modern Tailwind UI: group anchors pointing to `/laptop/<product-slug>`
  $('a[href^="/laptop/"], a[href*="thegioididong.com/laptop/"]').each((_, el) => {
    const $a = $(el);
    const rawHref = $a.attr('href');
    const fullUrl = resolveUrl(BASE_URL, rawHref);
    if (!fullUrl) return;

    const parsed = new URL(fullUrl);
    if (!/^\/laptop\/[a-z0-9-]+$/i.test(parsed.pathname)) return;
    const cleanUrl = `${BASE_URL}${parsed.pathname}`;

    if (!byUrl.has(cleanUrl)) {
      byUrl.set(cleanUrl, {
        source: 'thegioididong',
        name: '',
        url: cleanUrl,
        currentPrice: null,
        originalPrice: null,
        discountPercent: null,
        installment: null,
        thumbnail: null,
        images: [],
        specs: {},
        summarySpecs: '',
        promotions: [],
        categories: categoryContext
          ? [categoryContext]
          : [{ name: 'Laptop', slug: 'laptop', url: START_URL, type: 'root' }],
      });
    }

    const entry = byUrl.get(cleanUrl);
    const titleAttr = $a.attr('title');
    if (titleAttr && titleAttr.trim().length > entry.name.length) {
      entry.name = titleAttr.trim();
    }

    const lineClampText = $a.find('.line-clamp-2, h3').first().text().replace(/\s+/g, ' ').trim();
    if (lineClampText && lineClampText.length > entry.name.length) {
      entry.name = lineClampText;
    }

    // Image inside anchor
    const imgEl = $a.find('img').first();
    if (imgEl.length) {
      const src = imgEl.attr('src') || imgEl.attr('data-src');
      if (src && !entry.thumbnail) {
        entry.thumbnail = src;
        entry.images.push(src);
      }
    }

    // Spec badges inside anchor
    const badgeTexts = [];
    $a.find('div.truncate, span.truncate').each((__, bEl) => {
      const t = $(bEl).text().replace(/\s+/g, ' ').trim();
      if (t && /(inch|RAM|SSD|HDD|GB|TB|Hz)/i.test(t)) {
        badgeTexts.push(t);
      }
    });
    if (badgeTexts.length > 0) {
      entry.summarySpecs = [...new Set([...(entry.summarySpecs ? entry.summarySpecs.split(' | ') : []), ...badgeTexts])].join(' | ');
    }

    // Price inside anchor
    const text = $a.text().replace(/\s+/g, ' ').trim();
    const delText = $a.find('del').first().text().trim();
    if (delText) {
      entry.originalPrice = delText;
      const discMatch = text.match(/-\d+\s*%/);
      if (discMatch) entry.discountPercent = discMatch[0];
    } else if (/^\d{1,3}(?:\.\d{3})+\s*[đ₫]$/i.test(text)) {
      entry.currentPrice = text;
    }

    // Check parent card for installment / rating / extra info
    const $card = $a.closest('div.flex-col');
    if ($card.length && !entry.installment) {
      const instText = $card
        .find('div, span')
        .filter((__, d) => /trả chậm|trả góp/i.test($(d).text()) && $(d).text().length < 40)
        .first()
        .text()
        .replace(/\s+/g, ' ')
        .trim();
      if (instText) entry.installment = instText;
    }
  });

  // 2. Fallback / supplement for classic `.listproduct li.item` cards
  $('ul.listproduct li.item, li.item.__cate_44').each((_, el) => {
    const $li = $(el);
    const $a = $li.find('a.main-contain, a[href^="/laptop/"]').first();
    const cleanUrl = resolveUrl(BASE_URL, $a.attr('href'));
    if (!cleanUrl) return;

    const name =
      $a.attr('data-name') ||
      $li.find('h3').first().text().replace(/\s+/g, ' ').trim() ||
      $a.attr('title') ||
      '';
    if (!name) return;

    const sku = $li.attr('data-id') || $a.attr('data-id') || null;
    const currentPrice = $li.find('.price').first().text().trim() || $a.attr('data-price');
    const originalPrice = $li.find('.price-old').first().text().trim();
    const discountPercent = $li.find('.percent').first().text().trim();
    const thumbnail =
      $li.find('img.thumb, img').first().attr('data-src') ||
      $li.find('img.thumb, img').first().attr('src') ||
      null;

    const badgeTexts = $li
      .find('.item-compare span, .utility p')
      .map((__, s) => $(s).text().replace(/\s+/g, ' ').trim())
      .get()
      .filter(Boolean);

    byUrl.set(cleanUrl, {
      source: 'thegioididong',
      sku,
      name,
      url: cleanUrl,
      currentPrice,
      originalPrice,
      discountPercent,
      thumbnail,
      images: thumbnail ? [thumbnail] : [],
      summarySpecs: badgeTexts.join(' | '),
      categories: categoryContext
        ? [categoryContext]
        : [{ name: 'Laptop', slug: 'laptop', url: START_URL, type: 'root' }],
    });
  });

  return [...byUrl.values()].filter((p) => p.name && p.url);
}

/**
 * Visits a TheGioiDiDong laptop detail page to enrich specs, JSON-LD metadata, and variant options.
 */
async function enrichProductDetail(page, rawProduct) {
  try {
    await page.goto(rawProduct.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(1800);
    const html = await page.content();
    const $ = cheerio.load(html);

    const h1Title = $('h1').first().text().replace(/\s+/g, ' ').trim();
    if (h1Title && h1Title.length > rawProduct.name.length) {
      rawProduct.name = h1Title;
    }

    // Parse technical specs from list items
    const specs = {};
    $('li.border-b, .parameter li, .box-specifi li, ul.ulist li').each((_, el) => {
      const $li = $(el);
      const text = $li.text().replace(/\s+/g, ' ').trim();
      const colonIdx = text.indexOf(':');
      if (colonIdx > 0 && colonIdx < 45) {
        const key = text.slice(0, colonIdx).trim();
        const val = text.slice(colonIdx + 1).trim();
        if (key && val && val.length < 300) {
          specs[key] = val;
        }
      } else {
        const children = $li.children();
        if (children.length >= 2) {
          const key = $(children[0]).text().replace(/[:\s]+$/g, '').trim();
          const val = $(children[1]).text().replace(/\s+/g, ' ').trim();
          if (key && val && key.length < 45) {
            specs[key] = val;
          }
        }
      }
    });

    // Extract JSON-LD Product data
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html());
        if (data && data['@type'] === 'Product') {
          if (data.sku) rawProduct.sku = String(data.sku);
          if (data.brand?.name) rawProduct.brand = data.brand.name;
          if (Array.isArray(data.image)) {
            const imgs = data.image.map((img) => (typeof img === 'string' ? img : img?.url || img?.contentUrl)).filter(Boolean);
            rawProduct.images = [...new Set([...(rawProduct.images || []), ...imgs])];
            if (!rawProduct.thumbnail && rawProduct.images.length > 0) {
              rawProduct.thumbnail = rawProduct.images[0];
            }
          }
          if (data.offers && !rawProduct.currentPrice) {
            const offer = Array.isArray(data.offers) ? data.offers[0] : data.offers;
            if (offer?.price) rawProduct.currentPrice = Number(offer.price);
          }
          if (data.aggregateRating) {
            rawProduct.rating = {
              average: Number.parseFloat(data.aggregateRating.ratingValue) || null,
              count: Number.parseInt(data.aggregateRating.ratingCount || data.aggregateRating.reviewCount, 10) || null,
            };
          }
        }
      } catch {
        // Ignore malformed JSON-LD
      }
    });

    // Variant options (RAM/SSD/Color tabs if present)
    const options = [];
    $('.box03 a, .scrolling_inner a').each((_, el) => {
      const $el = $(el);
      const label = $el.text().replace(/\s+/g, ' ').trim();
      const href = resolveUrl(BASE_URL, $el.attr('href'));
      if (label && label.length < 60) {
        options.push({
          type: 'configuration',
          label,
          value: label,
          url: href,
          isSelected: $el.hasClass('act') || $el.hasClass('active'),
        });
      }
    });

    rawProduct.specs = { ...(rawProduct.specs || {}), ...specs };
    if (options.length > 0) {
      rawProduct.options = options;
    }
  } catch (err) {
    console.warn(`[TheGioiDiDong] Warning enriching detail ${rawProduct.url}: ${err.message}`);
  }
  return rawProduct;
}

/**
 * Main TheGioiDiDong crawler runner.
 */
async function crawlThegioididong(browser, options = {}) {
  const maxCategories = options.maxCategories ?? 2;
  const maxProducts = options.maxProducts ?? 30;
  const maxDetailPages = options.maxDetailPages ?? 5;

  const page = await createPage(browser);
  const productMap = new Map();
  let categories = [];

  try {
    console.log(`[TheGioiDiDong] Navigating to ${START_URL}...`);
    await page.goto(START_URL, { waitUntil: 'networkidle2', timeout: 40000 });
    await autoScroll(page, 4, 500);

    const mainHtml = await page.content();
    categories = extractCategoriesFromHtml(mainHtml);
    console.log(`[TheGioiDiDong] Discovered ${categories.length} laptop categories.`);

    const mainProducts = extractProductsFromListingHtml(mainHtml, {
      name: 'Laptop',
      slug: 'laptop',
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
        console.log(`[TheGioiDiDong] Crawling category "${category.name}" (${category.url})...`);
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
        console.warn(`[TheGioiDiDong] Failed category ${category.url}: ${err.message}`);
      }
    }

    const rawProducts = [...productMap.values()].slice(0, maxProducts);
    console.log(`[TheGioiDiDong] Extracted ${rawProducts.length} unique products. Enriching top ${Math.min(maxDetailPages, rawProducts.length)} detail pages...`);

    for (let i = 0; i < Math.min(maxDetailPages, rawProducts.length); i++) {
      await enrichProductDetail(page, rawProducts[i]);
    }

    const normalizedProducts = rawProducts.map((item) => createNormalizedLaptop(item));
    return {
      source: 'thegioididong',
      categories,
      products: normalizedProducts,
    };
  } finally {
    await page.close();
  }
}

module.exports = {
  crawlThegioididong,
  extractCategoriesFromHtml,
  extractProductsFromListingHtml,
};
