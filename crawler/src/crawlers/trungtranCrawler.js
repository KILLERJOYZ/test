const cheerio = require('cheerio');
const { createPage, autoScroll, sleep, resolveUrl } = require('../utils/browser');
const { createNormalizedLaptop } = require('../models/laptopSchema');

const BASE_URL = 'https://trungtran.vn';
const START_URL = 'https://trungtran.vn/laptop/';
const SORTED_URL = 'https://trungtran.vn/laptop/?sort_r=hits';

/**
 * Discovers subcategories/brand links from TrungTran laptop page.
 */
function extractCategoriesFromHtml(html) {
  const $ = cheerio.load(html);
  const categoryMap = new Map();

  $('.filter-brand a, .filter-item a, a[href*="/laptop-"]').each((_, el) => {
    const $el = $(el);
    const rawHref = $el.attr('href');
    const url = resolveUrl(BASE_URL, rawHref);
    if (!url || !url.startsWith(BASE_URL)) return;

    const parsed = new URL(url);
    const pathname = parsed.pathname;
    if (pathname === '/laptop/' || pathname === '/laptop') return;

    const name = $el.text().replace(/\s+/g, ' ').trim();
    if (name && name.length < 40 && !categoryMap.has(url)) {
      categoryMap.set(url, {
        name,
        slug: pathname.replace(/^\/|\/$/g, ''),
        url,
        type: 'brand',
      });
    }
  });

  return [...categoryMap.values()];
}

/**
 * Extracts product cards from TrungTran listing HTML using Cheerio.
 */
function extractProductsFromListingHtml(html, categoryContext = null) {
  const $ = cheerio.load(html);
  const products = [];

  $('.frame.cat_item, .cat_item').each((_, el) => {
    const $card = $(el);
    const $titleDiv = $card.find('.frame_title').first();
    const $titleLink = $titleDiv.closest('a').length > 0
      ? $titleDiv.closest('a')
      : $card.find('.frame_inner a:not(.text_trangthai)').first();

    const rawHref = $titleLink.attr('href');
    const url = resolveUrl(BASE_URL, rawHref);

    const name =
      $titleDiv.text().replace(/\s+/g, ' ').trim() ||
      $card.find('img').first().attr('alt') ||
      '';

    if (!name || !url) return;

    const currentPrice = $card.find('.frame_price .price, .price_current, .price').first().text().trim();
    const originalPrice = $card.find('.frame_price .price_old, .price_old, .old_price').first().text().trim();

    const imgEl = $card.find('.product_image img, .frame_inner img, img').first();
    const rawImg = imgEl.attr('data-src') || imgEl.attr('src') || null;
    const thumbnail = rawImg ? resolveUrl(BASE_URL, rawImg) : null;

    const warranty = $card.find('.text_xuhuong').first().text().replace(/\s+/g, ' ').trim() || null;
    const statusText = $card.find('.text_trangthai').first().text().replace(/\s+/g, ' ').trim();
    const availability = /hết hàng/i.test(statusText)
      ? 'out_of_stock'
      : /đặt trước/i.test(statusText)
        ? 'pre_order'
        : 'in_stock';

    // Spec summary (also extracted from full title which contains CPU, RAM, SSD, Screen)
    const specItems = [name];
    $card.find('.frame_desc, .summary, .desc').each((__, sEl) => {
      const s = $(sEl).text().replace(/\s+/g, ' ').trim();
      if (s) specItems.push(s);
    });

    products.push({
      source: 'trungtran',
      name,
      url,
      availability,
      warranty,
      currentPrice,
      originalPrice,
      discountPercent: null,
      installment: null,
      thumbnail,
      images: thumbnail ? [thumbnail] : [],
      summarySpecs: specItems.join(' | '),
      promotions: [],
      categories: categoryContext
        ? [categoryContext]
        : [{ name: 'Laptop', slug: 'laptop', url: START_URL, type: 'root' }],
      rating: {
        average: null,
        count: null,
      },
    });
  });

  return products;
}

/**
 * Enriches product details by visiting the single laptop page on TrungTran.
 */
async function enrichProductDetail(page, rawProduct) {
  try {
    await page.goto(rawProduct.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(1500);
    const html = await page.content();
    const $ = cheerio.load(html);

    const specs = {};
    $('table tr, .table-specification tr, .table_specs tr, .spec-table tr, .technical-content tr').each((_, el) => {
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

    // Trích xuất toàn bộ ảnh trong gallery / slider trên trang chi tiết
    const galleryImages = [];
    $('.product-images img, .gallery-item img, .item_thumb img, .product_image img, [class*="thumb"] img, [class*="slider"] img').each((_, el) => {
      const src = $(el).attr('data-src') || $(el).attr('src') || $(el).attr('data-zoom');
      if (
        src &&
        (src.includes('/products/') || src.includes('/upload_images/')) &&
        !src.includes('icon') &&
        !src.includes('logo') &&
        !src.includes('.svg') &&
        !src.includes('combo')
      ) {
        const full = resolveUrl(BASE_URL, src);
        if (full) galleryImages.push(full);
      }
    });
    if (galleryImages.length > 0) {
      rawProduct.images = [...new Set([...(rawProduct.images || []), ...galleryImages])];
    }

    rawProduct.specs = { ...(rawProduct.specs || {}), ...specs };
  } catch (err) {
    console.warn(`[TrungTran] Warning enriching ${rawProduct.url}: ${err.message}`);
  }
  return rawProduct;
}

/**
 * Main TrungTran crawler runner.
 * Chiến thuật: Mở trang -> Ấn vào "Sắp xếp" -> chọn radiobox "Nổi bật nhất" và đợi dữ liệu cập nhật.
 */
async function crawlTrungtran(browser, options = {}) {
  const maxProducts = options.maxProducts ?? 30;
  const maxDetailPages = options.maxDetailPages ?? 5;

  const page = await createPage(browser);
  const productMap = new Map();
  let categories = [];

  try {
    console.log(`[TrungTran] Navigating to ${START_URL}...`);
    await page.goto(START_URL, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await sleep(2000);

    // Chiến thuật: Ấn vào "Sắp xếp" -> Chọn radiobox "Nổi bật nhất"
    try {
      console.log('[TrungTran] Áp dụng chiến thuật: Ấn nút "Sắp xếp" -> chọn radiobox "Nổi bật nhất"...');
      const sortBtn = await page.$('.sort-right-button .dropdown-button, .dropdown-button');
      if (sortBtn) {
        await sortBtn.click();
        await sleep(600);
      }

      const clicked = await page.evaluate(() => {
        const item =
          document.querySelector('a.item_sapxep.filter-sort[data="hits"]') ||
          document.querySelector('a[data="hits"]') ||
          document.querySelector('input[type="radio"][name="sort_r"][value="hits"]');
        if (item) {
          item.click();
          return true;
        }
        return false;
      });

      if (clicked) {
        console.log('[TrungTran] Đã chọn radiobox "Nổi bật nhất", đợi dữ liệu cập nhật...');
        await sleep(3000);
        if (!page.url().includes('sort_r=hits')) {
          await page.goto(SORTED_URL, { waitUntil: 'domcontentloaded', timeout: 35000 });
          await sleep(2000);
        }
      } else {
        await page.goto(SORTED_URL, { waitUntil: 'domcontentloaded', timeout: 35000 });
        await sleep(2000);
      }
    } catch (err) {
      console.warn(`[TrungTran] Chuyển thẳng tới SORTED_URL: ${err.message}`);
      await page.goto(SORTED_URL, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await sleep(2000);
    }

    await autoScroll(page, 4, 500);

    const mainHtml = await page.content();
    categories = extractCategoriesFromHtml(mainHtml);
    console.log(`[TrungTran] Tìm thấy ${categories.length} danh mục / thương hiệu.`);

    const mainProducts = extractProductsFromListingHtml(mainHtml, {
      name: 'Laptop',
      slug: 'laptop',
      url: SORTED_URL,
      type: 'root',
    });

    for (const p of mainProducts) {
      productMap.set(p.url, p);
    }

    const rawProducts = [...productMap.values()].slice(0, maxProducts);
    console.log(`[TrungTran] Thu thập được ${rawProducts.length} sản phẩm. Đang làm giàu ${Math.min(maxDetailPages, rawProducts.length)} trang chi tiết...`);

    for (let i = 0; i < Math.min(maxDetailPages, rawProducts.length); i++) {
      await enrichProductDetail(page, rawProducts[i]);
    }

    const normalizedProducts = rawProducts.map((item) => createNormalizedLaptop(item));
    return {
      source: 'trungtran',
      categories,
      products: normalizedProducts,
    };
  } finally {
    await page.close();
  }
}

module.exports = {
  crawlTrungtran,
  extractCategoriesFromHtml,
  extractProductsFromListingHtml,
};
