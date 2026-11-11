const cheerio = require('cheerio');
const { createPage, autoScroll, sleep, resolveUrl } = require('../utils/browser');
const { createNormalizedLaptop } = require('../models/laptopSchema');

const BASE_URL = 'https://cellphones.com.vn';
const INPUT_URL = 'https://cellphones.com.vn/laptop';
const START_URL = 'https://cellphones.com.vn/laptop.html';

function normalizeCellphonesUrl(url) {
  if (!url) return START_URL;
  if (url === 'https://cellphones.com.vn/laptop' || url === 'https://cellphones.com.vn/laptop/') {
    return START_URL;
  }
  return url;
}

/**
 * Discovers laptop categories (brands, segments, series) from CellphoneS laptop page.
 */
function extractCategoriesFromHtml(html) {
  const $ = cheerio.load(html);
  const categoryMap = new Map();

  // Brand links & sub-category links
  $('a.list-brand__item, .brands__content a, .list-sub-category a, a[href*="/laptop/"], a[href*="/laptop-"]').each(
    (_, el) => {
      const $el = $(el);
      if ($el.hasClass('product__link') || $el.hasClass('button__link-banner')) return;

      const rawHref = $el.attr('href');
      const url = resolveUrl(BASE_URL, rawHref);
      if (!url || !url.startsWith(BASE_URL)) return;

      // Filter out individual product detail links (which usually have model codes/numbers)
      const parsed = new URL(url);
      const pathname = parsed.pathname;
      const cleanUrl = `${BASE_URL}${pathname}`;
      const isSubPath = /^\/laptop\/[a-z0-9-]+(?:\.html)?$/i.test(pathname);
      const isSegmentPath =
        /^\/laptop-(?:gaming|van-phong|do-hoa|mong-nhe|sinh-vien|doanh-nhan|ai|cam-ung)[a-z0-9-]*\.html$/i.test(
          pathname
        );

      if (!isSubPath && !isSegmentPath) return;

      const segmentSlugs = new Set(['van-phong', 'gaming', 'mong-nhe', 'do-hoa', 'sinh-vien', 'cam-ung', 'ai', 'doanh-nhan']);
      const subSlug = pathname.replace(/^\/laptop[-/]|(\.html)$/g, '').toLowerCase();
      const categoryType = isSegmentPath || segmentSlugs.has(subSlug) ? 'segment' : 'brand';

      const imgAlt = $el.find('img').attr('alt') || '';
      const name =
        $el.text().replace(/\s+/g, ' ').trim() ||
        imgAlt.replace(/\s+/g, ' ').trim() ||
        subSlug;

      if (!categoryMap.has(cleanUrl)) {
        categoryMap.set(cleanUrl, {
          name,
          slug: pathname.replace(/^\/|(\.html)$/g, ''),
          url: cleanUrl,
          type: categoryType,
        });
      }
    }
  );

  return [...categoryMap.values()];
}

/**
 * Extracts laptop items from a CellphoneS category/listing page HTML using Cheerio.
 */
function extractProductsFromListingHtml(html, categoryContext = null) {
  const $ = cheerio.load(html);
  const products = [];

  $('.product-info-container, .product-item').each((_, el) => {
    const $card = $(el);
    const $link = $card.find('a.product__link').first();
    const rawHref = $link.attr('href') || $card.find('a[href*=".html"]').first().attr('href');
    const url = resolveUrl(BASE_URL, rawHref);
    const name = $card.find('.product__name h3, .product__name').first().text().replace(/\s+/g, ' ').trim();

    if (!name || !url) return;

    const currentPrice = $card.find('.product__price--show').first().text().trim();
    const originalPrice = $card.find('.product__price--through').first().text().trim();
    const discountPercent = $card.find('.product__price--percent-detail').first().text().trim();
    const installment =
      $card.find('.install-0-tag, .box-info__installment').first().text().replace(/\s+/g, ' ').trim() || null;

    const imgEl = $card.find('img.product__img, .product__image img').first();
    const thumbnail = imgEl.attr('src') || imgEl.attr('data-src') || null;

    const badges = [];
    $card.find('.product__more-info__item, .product__badge, .tag-params span').each((__, badgeEl) => {
      const t = $(badgeEl).text().replace(/\s+/g, ' ').trim();
      if (t) badges.push(t);
    });

    const promotions = [];
    $card.find('.product__promotions .promotion, .coupon-price, .gift-cont').each((__, promoEl) => {
      const t = $(promoEl).text().replace(/\s+/g, ' ').trim();
      if (t) promotions.push(t);
    });

    const ratingAvgText = $card.find('.box-rating__score, .rating-average').first().text().trim();

    products.push({
      source: 'cellphones',
      name,
      url,
      currentPrice,
      originalPrice,
      discountPercent,
      installment,
      thumbnail,
      images: thumbnail ? [thumbnail] : [],
      summarySpecs: badges.join(' | '),
      promotions,
      categories: categoryContext ? [categoryContext] : [{ name: 'Laptop', slug: 'laptop', url: START_URL, type: 'root' }],
      rating: {
        average: ratingAvgText ? Number.parseFloat(ratingAvgText) : null,
        count: null,
      },
    });
  });

  return products;
}

/**
 * Enriches a laptop object by visiting its detail page to extract full specs, SKU, and configuration/color options.
 */
async function enrichProductDetail(page, rawProduct) {
  try {
    await page.goto(rawProduct.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(1800);
    const html = await page.content();
    const $ = cheerio.load(html);

    const specs = {};
    $('.technical-content li, .technical-content tr, .box-technical-info li').each((_, el) => {
      const $el = $(el);
      const children = $el.children();
      if (children.length >= 2) {
        const key = $(children[0]).text().replace(/\s+/g, ' ').trim();
        const val = $(children[1]).text().replace(/\s+/g, ' ').trim();
        if (key && val) specs[key] = val;
      } else {
        const text = $el.text().replace(/\s+/g, ' ').trim();
        const colonIdx = text.indexOf(':');
        if (colonIdx > 0) {
          specs[text.slice(0, colonIdx).trim()] = text.slice(colonIdx + 1).trim();
        }
      }
    });

    const options = [];
    $('.list-linked a, .box-linked a, .box-product-variants a, .item-linked').each((_, el) => {
      const $el = $(el);
      const href = resolveUrl(BASE_URL, $el.attr('href'));
      const label = $el
        .find('strong, span, .item-linked__name')
        .first()
        .text()
        .replace(/\s+/g, ' ')
        .trim() || $el.text().replace(/\s+/g, ' ').trim();
      const optPrice = $el.find('.item-linked__price, span:last-child').text().trim();
      const isSelected = $el.hasClass('active') || $el.hasClass('is-active');

      if (label) {
        options.push({
          type: /(đen|bạc|xám|vàng|xanh|trắng|hồng|gold|silver|grey|black)/i.test(label) && !/\b(gb|tb|i[3579]|ryzen)\b/i.test(label)
            ? 'color'
            : 'configuration',
          label,
          value: label,
          price: optPrice || null,
          url: href,
          isSelected,
        });
      }
    });

    // Extract JSON-LD if available for SKU / Rating / Images
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html());
        if (data && data['@type'] === 'Product') {
          if (data.sku && !rawProduct.sku) rawProduct.sku = data.sku;
          if (data.brand?.name && !rawProduct.brand) rawProduct.brand = data.brand.name;
          if (Array.isArray(data.image)) {
            rawProduct.images = [...new Set([...(rawProduct.images || []), ...data.image])];
          } else if (typeof data.image === 'string') {
            rawProduct.images = [...new Set([...(rawProduct.images || []), data.image])];
          }
          if (data.aggregateRating) {
            rawProduct.rating = {
              average: Number.parseFloat(data.aggregateRating.ratingValue) || rawProduct.rating?.average || null,
              count: Number.parseInt(data.aggregateRating.reviewCount || data.aggregateRating.ratingCount, 10) || null,
            };
          }
        }
      } catch {
        // Ignore invalid JSON-LD
      }
    });

    rawProduct.specs = { ...(rawProduct.specs || {}), ...specs };
    if (options.length > 0) {
      rawProduct.options = options;
    }
  } catch (err) {
    console.warn(`[CellphoneS] Warning enriching detail ${rawProduct.url}: ${err.message}`);
  }
  return rawProduct;
}

/**
 * Main CellphoneS crawler runner.
 */
async function crawlCellphones(browser, options = {}) {
  const maxCategories = options.maxCategories ?? 2;
  const maxProducts = options.maxProducts ?? 30;
  const maxDetailPages = options.maxDetailPages ?? 5;

  const page = await createPage(browser);
  const productMap = new Map();
  let categories = [];

  try {
    console.log(`[CellphoneS] Navigating to ${START_URL}...`);
    await page.goto(START_URL, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await sleep(2500);
    await autoScroll(page, 4, 500);

    const mainHtml = await page.content();
    categories = extractCategoriesFromHtml(mainHtml);
    console.log(`[CellphoneS] Discovered ${categories.length} laptop categories.`);

    const mainProducts = extractProductsFromListingHtml(mainHtml, {
      name: 'Laptop',
      slug: 'laptop',
      url: START_URL,
      type: 'root',
    });
    for (const p of mainProducts) {
      productMap.set(p.url, p);
    }

    // Crawl into sub-categories to locate categorized laptops
    const categoriesToVisit = categories.slice(0, maxCategories);
    for (const category of categoriesToVisit) {
      if (productMap.size >= maxProducts) break;
      try {
        console.log(`[CellphoneS] Crawling category "${category.name}" (${category.url})...`);
        await page.goto(category.url, { waitUntil: 'domcontentloaded', timeout: 35000 });
        await sleep(2000);
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
        console.warn(`[CellphoneS] Failed category ${category.url}: ${err.message}`);
      }
    }

    const rawProducts = [...productMap.values()].slice(0, maxProducts);
    console.log(`[CellphoneS] Extracted ${rawProducts.length} unique products. Enriching top ${Math.min(maxDetailPages, rawProducts.length)} detail pages...`);

    for (let i = 0; i < Math.min(maxDetailPages, rawProducts.length); i++) {
      await enrichProductDetail(page, rawProducts[i]);
    }

    const normalizedProducts = rawProducts.map((item) => createNormalizedLaptop(item));
    return {
      source: 'cellphones',
      categories,
      products: normalizedProducts,
    };
  } finally {
    await page.close();
  }
}

module.exports = {
  crawlCellphones,
  extractCategoriesFromHtml,
  extractProductsFromListingHtml,
};
