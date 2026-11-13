const cheerio = require('cheerio');
const { createPage, autoScroll, sleep, resolveUrl } = require('../utils/browser');
const { createNormalizedLaptop } = require('../models/laptopSchema');

const BASE_URL = 'https://laptopaz.vn';
const START_URL = 'https://laptopaz.vn/laptop-moi.html';
const SORTED_URL = 'https://laptopaz.vn/laptop-moi.html?sort=new';

/**
 * Discovers subcategories/brand links from LaptopAZ laptop page.
 */
function extractCategoriesFromHtml(html) {
  const $ = cheerio.load(html);
  const categoryMap = new Map();

  $('.dm-col a, .brand-item a, .filter-brand a, a[href*="/laptop-"]').each((_, el) => {
    const $el = $(el);
    const rawHref = $el.attr('href');
    const url = resolveUrl(BASE_URL, rawHref);
    if (!url || !url.startsWith(BASE_URL)) return;

    const parsed = new URL(url);
    const pathname = parsed.pathname;
    if (!pathname.endsWith('.html') || pathname === '/laptop-moi.html') return;

    const name = $el.text().replace(/\s+/g, ' ').trim() || $el.attr('title') || '';
    if (name && name.length < 40 && !categoryMap.has(url)) {
      categoryMap.set(url, {
        name,
        slug: pathname.replace(/^\/|\.html$/g, ''),
        url,
        type: 'brand',
      });
    }
  });

  return [...categoryMap.values()];
}

/**
 * Extracts product cards from LaptopAZ listing HTML using Cheerio.
 */
function extractProductsFromListingHtml(html, categoryContext = null) {
  const $ = cheerio.load(html);
  const products = [];

  // Cards on LaptopAZ have a div.p-2.flex.flex-col inside a rounded bg-white card container
  $('div.p-2.flex.flex-col').each((_, infoEl) => {
    const $info = $(infoEl);
    const $card = $info.parent();
    const $titleLink = $info.find('> a').first();
    const rawHref = $titleLink.attr('href') || $card.find('a[href$=".html"]').first().attr('href');
    const url = resolveUrl(BASE_URL, rawHref);

    const fullTitle =
      $titleLink.text().replace(/\s+/g, ' ').trim() ||
      $card.find('img').first().attr('alt') ||
      '';

    if (!fullTitle || !url) return;

    // LaptopAZ titles often have format: "Lenovo IdeaPad Slim 5 ... | Ryzen 7 H 255, 16GB, 512GB, 14inch FHD+ 60Hz, Win 11, Xám"
    let name = fullTitle;
    let summarySpecs = '';
    if (fullTitle.includes('|')) {
      const parts = fullTitle.split('|');
      name = parts[0].trim();
      summarySpecs = parts.slice(1).join(' | ').trim();
    } else if (fullTitle.includes('(') && fullTitle.includes(')')) {
      const match = fullTitle.match(/\(([^)]+)\)/);
      if (match) summarySpecs = match[1];
    }

    const currentPrice = $info.find('span.font-bold.text-sm, .p-price, .price').first().text().trim();
    const originalPrice = $info.find('span.line-through, .p-old-price').first().text().trim();
    const discountPercent = $info.find('span.bg-red-500, .p-discount').first().text().trim();

    const imgEl = $card.find('img').first();
    const rawImg = imgEl.attr('data-src') || imgEl.attr('src') || null;
    const thumbnail = rawImg ? resolveUrl(BASE_URL, rawImg) : null;

    // Extract SKU from onclick="addProductToCart('5813', ...)"
    let sku = null;
    const cartBtnOnclick = $info.find('button[onclick*="addProductToCart"]').attr('onclick') || '';
    const skuMatch = cartBtnOnclick.match(/addProductToCart\(['"]?(\d+)['"]?/);
    if (skuMatch) {
      sku = skuMatch[1];
    }

    const statusText = $info.text();
    const availability = /hết hàng|liên hệ/i.test(statusText) ? 'out_of_stock' : 'in_stock';

    products.push({
      source: 'laptopaz',
      sku,
      name: fullTitle,
      url,
      availability,
      currentPrice,
      originalPrice,
      discountPercent,
      installment: null,
      thumbnail,
      images: thumbnail ? [thumbnail] : [],
      summarySpecs: summarySpecs || fullTitle,
      promotions: [],
      categories: categoryContext
        ? [categoryContext]
        : [{ name: 'Laptop mới', slug: 'laptop-moi', url: START_URL, type: 'root' }],
      rating: {
        average: null,
        count: null,
      },
    });
  });

  return products;
}

/**
 * Enriches product details by visiting the single laptop page on LaptopAZ.
 */
async function enrichProductDetail(page, rawProduct) {
  try {
    await page.goto(rawProduct.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(1500);
    const html = await page.content();
    const $ = cheerio.load(html);

    const specs = {};
    $('table tr, .table-spec tr, .table-technical tr, .box-spec tr, #spec-detail tr').each((_, el) => {
      const $el = $(el);
      const cells = $el.find('th, td');
      if (cells.length >= 2) {
        const key = $(cells[0]).text().replace(/\s+/g, ' ').trim();
        const val = $(cells[1]).text().replace(/\s+/g, ' ').trim();
        if (key && val && key !== val && key.length < 60) {
          specs[key] = val;
        }
      }
    });

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
        }
      } catch {
        // Ignore JSON-LD parse errors
      }
    });

    // Trích xuất toàn bộ ảnh sản phẩm thực tế trong gallery / slider trên trang chi tiết
    const galleryImages = [];
    $('img').each((_, el) => {
      const src = $(el).attr('data-src') || $(el).attr('src') || $(el).attr('data-zoom-image');
      if (src && (src.includes('/media/product/') || src.includes('/product/')) && !src.includes('category') && !src.includes('news') && !src.includes('logo')) {
        const full = resolveUrl(BASE_URL, src);
        if (full) galleryImages.push(full);
      }
    });
    if (galleryImages.length > 0) {
      rawProduct.images = [...new Set([...(rawProduct.images || []), ...galleryImages])];
    }

    rawProduct.specs = { ...(rawProduct.specs || {}), ...specs };
  } catch (err) {
    console.warn(`[LaptopAZ] Warning enriching ${rawProduct.url}: ${err.message}`);
  }
  return rawProduct;
}

/**
 * Main LaptopAZ crawler runner.
 * Chiến thuật: Chọn mục "Sắp xếp theo", chọn "Mới nhất" và đợi dữ liệu cập nhật trước khi thu thập.
 */
async function crawlLaptopaz(browser, options = {}) {
  const maxProducts = options.maxProducts ?? 30;
  const maxDetailPages = options.maxDetailPages ?? 5;

  const page = await createPage(browser);
  const productMap = new Map();
  let categories = [];

  try {
    console.log(`[LaptopAZ] Navigating to ${START_URL}...`);
    await page.goto(START_URL, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await sleep(2000);

    // Chiến thuật: Chọn mục "Sắp xếp theo", chọn "Mới nhất" và đợi dữ liệu cập nhật
    try {
      console.log('[LaptopAZ] Áp dụng chiến thuật: Chọn mục "Sắp xếp theo" -> "Mới nhất"...');
      const selected = await page.evaluate(() => {
        const selects = Array.from(document.querySelectorAll('select'));
        for (const sel of selects) {
          const opt = Array.from(sel.options).find(
            (o) => o.value.includes('sort=new') || (o.textContent && o.textContent.trim() === 'Mới nhất')
          );
          if (opt) {
            sel.value = opt.value;
            sel.dispatchEvent(new Event('change', { bubbles: true }));
            return opt.value;
          }
        }
        return null;
      });

      if (selected) {
        console.log(`[LaptopAZ] Đã chọn tùy chọn "Mới nhất" (${selected}), đợi dữ liệu cập nhật...`);
        await sleep(3000);
      } else {
        await page.goto(SORTED_URL, { waitUntil: 'domcontentloaded', timeout: 35000 });
        await sleep(2000);
      }
    } catch (err) {
      console.warn(`[LaptopAZ] Chuyển thẳng tới SORTED_URL: ${err.message}`);
      await page.goto(SORTED_URL, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await sleep(2000);
    }

    await autoScroll(page, 4, 500);

    const mainHtml = await page.content();
    categories = extractCategoriesFromHtml(mainHtml);
    console.log(`[LaptopAZ] Tìm thấy ${categories.length} danh mục / thương hiệu.`);

    const mainProducts = extractProductsFromListingHtml(mainHtml, {
      name: 'Laptop mới',
      slug: 'laptop-moi',
      url: START_URL,
      type: 'root',
    });

    for (const p of mainProducts) {
      productMap.set(p.url, p);
    }

    const rawProducts = [...productMap.values()].slice(0, maxProducts);
    console.log(`[LaptopAZ] Thu thập được ${rawProducts.length} sản phẩm. Đang làm giàu ${Math.min(maxDetailPages, rawProducts.length)} trang chi tiết...`);

    for (let i = 0; i < Math.min(maxDetailPages, rawProducts.length); i++) {
      await enrichProductDetail(page, rawProducts[i]);
    }

    const normalizedProducts = rawProducts.map((item) => createNormalizedLaptop(item));
    return {
      source: 'laptopaz',
      categories,
      products: normalizedProducts,
    };
  } finally {
    await page.close();
  }
}

module.exports = {
  crawlLaptopaz,
  extractCategoriesFromHtml,
  extractProductsFromListingHtml,
};
