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
 * e.g. "Laptop Dell Inspiron 15 3530 - P16WD (i7 1355U, 16GB, 1TB, Full HD 120Hz, OfficeHS, Win11)"
 * or slash-delimited string "Dell Inspiron 15 3530 i7 1355U/16GB/1TB/15.6 inchF/120Hz/OfficeHS/Win11/(P16WD)/Bạc".
 */
function parseDmxInlineSpecs(nameText = '', slashSpecText = '') {
  const specs = {};

  const classifyTailToken = (token) => {
    const t = token.trim();
    if (!t) return;
    if (/(RTX|GTX|MX\d+|Radeon|Iris|Arc|UHD|GPU)/i.test(t) && !specs['Card màn hình']) {
      specs['Card màn hình'] = t;
    } else if (/(inch|Full\s*HD|FHD|\bHD\b|OLED|2K|2\.8K|Hz|WUXGA|Retina)/i.test(t)) {
      const cleanedScreen = t.replace(/inchF\b/i, 'inch Full HD');
      specs['Màn hình'] = specs['Màn hình'] ? `${specs['Màn hình']}, ${cleanedScreen}` : cleanedScreen;
    } else if (/(Win\s*1[01]|Windows|ChromeOS|macOS|Ubuntu|FreeDOS)/i.test(t)) {
      const cleanedOs = t.replace(/\s*\([^)]*\).*$/, '').trim();
      specs['Hệ điều hành'] = specs['Hệ điều hành'] ? `${specs['Hệ điều hành']}, ${cleanedOs}` : cleanedOs;
    } else if (/Office/i.test(t)) {
      specs['Phần mềm'] = t;
    } else if (/^(Đen|Bạc|Xám|Vàng|Xanh|Trắng|Hồng)$/i.test(t) && !specs['Màu sắc']) {
      specs['Màu sắc'] = t;
    }
  };

  // 1. Check parenthetical at end ONLY if it has at least 3 comma-separated parts
  const parenMatch = nameText.match(/\(([^)]+)\)\s*$/);
  if (parenMatch && parenMatch[1].includes(',')) {
    const parts = parenMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 3) {
      if (parts[0]) specs['CPU'] = parts[0];
      if (parts[1]) specs['RAM'] = parts[1];
      if (parts[2]) specs['Ổ cứng'] = parts[2];
      for (let i = 3; i < parts.length; i++) {
        classifyTailToken(parts[i]);
      }
    }
  }

  // 2. Parse slash-delimited specs in title or unit card
  const sourceForSlash = slashSpecText || nameText;
  if (sourceForSlash.includes('/')) {
    const rawSegments = sourceForSlash.split('/').map((s) => s.trim()).filter(Boolean);
    if (rawSegments.length >= 3) {
      const cpuFromFirst = rawSegments[0].match(
        /\b((?:Intel\s+)?Core\s+(?:Ultra\s+)?[i3579]?[-\s]?\w+|i[3579][-\s]\d{4,5}[A-Z0-9]*|R[3579][-\s]\d{4}[A-Z0-9]*|Ryzen\s+[3579]\s+\w+|M[12345](?:\s+(?:Pro|Max))?(?:\s+\d+-core\s+CPU)?|N\d{3,4}|Celeron\s+\w+|Pentium\s+\w+)$/i
      );
      if (cpuFromFirst && !specs['CPU']) {
        specs['CPU'] = cpuFromFirst[1].trim();
      }

      for (let i = 1; i < rawSegments.length; i++) {
        const seg = rawSegments[i].replace(/\s+\d{1,3}(?:\.\d{3})+₫.*$/, '').trim();
        if (!seg || /^\([^)]+\)$/.test(seg) || /^[A-Z]?\)$/.test(seg)) continue;
        if (!specs['RAM'] && /^\d+\s*GB$/i.test(seg)) {
          specs['RAM'] = seg;
        } else if (!specs['Ổ cứng'] && /^\d+\s*(?:GB|TB)(?:\s*SSD)?$/i.test(seg)) {
          specs['Ổ cứng'] = seg;
        } else {
          classifyTailToken(seg);
        }
      }
    }
  }

  return specs;
}

/**
 * Clicks "Xem thêm ... Laptop" button on DienMayXanh listing pages to reveal more products.
 */
async function clickListingLoadMore(page, maxClicks = 2) {
  for (let i = 0; i < maxClicks; i++) {
    const clicked = await page.evaluate(() => {
      const btn = document.querySelector('.view-more a, .view-more button, button.btnviewmore');
      if (btn && btn.offsetParent !== null) {
        btn.click();
        return true;
      }
      return false;
    });
    if (!clicked) break;
    await sleep(1800);
  }
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
 * Enriches a DienMayXanh used laptop by:
 * 1) Visiting its model/IMEI listing page (`?pid=...&isimei=1`)
 * 2) Clicking `button.btnviewmore` ("Xem thêm X sản phẩm") to load all available used units/options
 * 3) Extracting all `.prdItem` unit options (IMEI/oldid, price, color, warranty, province/store location)
 * 4) Navigating into the unit detail page (`/detail?oldid=...&pid=...&type=2`) and clicking
 *    `button.btnViewFullSpec` ("Xem chi tiết thông số") to extract full hardware specs:
 *    GPU ("Card màn hình"), Weight (from "Kích thước" / "Kích thước, khối lượng"), Ports ("Cổng giao tiếp" / "Cổng kết nối"),
 *    Battery ("Thông tin Pin"), OS ("Hệ điều hành"), Condition/Defect ("Tình trạng sản phẩm"), and actual used unit photos.
 */
async function enrichProductDetail(page, rawProduct, maxLoadMoreClicks = 3) {
  try {
    await page.goto(rawProduct.url, { waitUntil: 'networkidle2', timeout: 35000 });
    await sleep(1200);

    // Click "Xem thêm X sản phẩm" (.listingIMEI button.btnviewmore) to load more unit options if present
    for (let clickIdx = 0; clickIdx < maxLoadMoreClicks; clickIdx++) {
      const clickedMoreUnits = await page.evaluate(() => {
        const btn = document.querySelector('.listingIMEI button.btnviewmore, button.btnviewmore');
        if (btn && btn.offsetParent !== null) {
          btn.click();
          return true;
        }
        return false;
      });
      if (!clickedMoreUnits) break;
      await sleep(1500);
    }

    const html = await page.content();
    const $ = cheerio.load(html);

    const options = [];
    let firstUnitDetailUrl = null;

    $('.prdItem').each((idx, el) => {
      const $unit = $(el);
      const rawUnitHref = $unit.find('a').first().attr('href');
      const unitUrl = resolveUrl(BASE_URL, rawUnitHref);
      if (unitUrl && !firstUnitDetailUrl && unitUrl.includes('/detail')) {
        firstUnitDetailUrl = unitUrl;
      }

      let oldId = null;
      if (unitUrl) {
        try {
          oldId = new URL(unitUrl).searchParams.get('oldid');
        } catch {
          // ignore
        }
      }

      const inventoryType = $unit.find('.lblInvenType').text().replace(/\s+/g, ' ').trim();
      const color = $unit.find('.prdColor').text().replace(/\s+/g, ' ').trim();
      const unitName = $unit.find('.prdName').text().replace(/\s+/g, ' ').trim();
      const priceText = $unit.find('.price strong').first().text().trim();

      let unitWarranty = null;
      let unitLocation = null;
      $unit.find('.prdInfo p').each((__, pEl) => {
        const pText = $(pEl).text().replace(/\s+/g, ' ').trim();
        if (/^bảo hành\s*:/i.test(pText)) {
          unitWarranty = pText.replace(/^bảo hành\s*:\s*/i, '').trim();
        } else if (/^có tại\s*:/i.test(pText)) {
          unitLocation = pText.replace(/^có tại\s*:\s*/i, '').trim();
        }
      });

      if (unitWarranty && !rawProduct.warranty) {
        rawProduct.warranty = unitWarranty;
      }

      if (unitName) {
        const parsedInline = parseDmxInlineSpecs(rawProduct.name, unitName);
        rawProduct.specs = { ...parsedInline, ...(rawProduct.specs || {}) };
      }

      const unitImg = $unit.find('.imgThumnb img').attr('src') || $unit.find('.imgThumnb img').attr('data-src');
      if (unitImg && !rawProduct.images.includes(unitImg)) {
        rawProduct.images.push(unitImg);
      }

      const labelParts = [];
      if (inventoryType) labelParts.push(inventoryType);
      if (color) labelParts.push(`Màu ${color}`);
      if (unitLocation) labelParts.push(`Tại: ${unitLocation}`);
      if (unitWarranty) labelParts.push(`BH: ${unitWarranty}`);

      options.push({
        type: 'condition',
        sku: oldId,
        label: labelParts.join(' | ') || unitName || `Máy đổi trả #${idx + 1}`,
        value: unitName || `unit_${oldId || idx + 1}`,
        price: priceText || rawProduct.currentPrice,
        url: unitUrl || rawProduct.url,
        isSelected: idx === 0,
      });
    });

    if (options.length > 0) {
      rawProduct.options = options;
      if (!rawProduct.storeCount || options.length > rawProduct.storeCount) {
        rawProduct.storeCount = options.length;
      }
    }

    // Visit the Unit Detail Page (/detail?oldid=...&pid=...&type=2) to get GPU, Weight, Ports, Battery, Defect Note, etc.
    if (firstUnitDetailUrl) {
      await page.goto(firstUnitDetailUrl, { waitUntil: 'networkidle2', timeout: 35000 });
      await sleep(1000);

      // Click "Xem chi tiết thông số" (.btnViewFullSpec) to load the full specification table in DOM
      const clickedFullSpec = await page.evaluate(() => {
        const btn = document.querySelector('button.btnViewFullSpec, .btnViewFullSpec');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });
      if (clickedFullSpec) {
        await sleep(1500);
      }

      const unitDetailHtml = await page.content();
      const $u = cheerio.load(unitDetailHtml);

      const detailSpecs = {};
      $u('tr').each((_, tr) => {
        if ($u(tr).closest('.article-detail, .content-article, .box-article, .the-article').length > 0) {
          return;
        }
        const tds = $u(tr).find('td, th');
        if (tds.length >= 2) {
          const key = $u(tds[0]).text().replace(/[:\s]+$/g, '').replace(/\s+/g, ' ').trim();
          const valParts = [];
          $u(tds[1])
            .contents()
            .each((__, node) => {
              const t = $u(node).text().replace(/^[•\-*]\s*/, '').replace(/\s+/g, ' ').trim();
              if (t) valParts.push(t);
            });
          const val = valParts.join(', ').replace(/\s*,\s*,/g, ',').replace(/^,\s*|\s*,$/g, '').trim();
          if (key && val && key.length < 45 && !/^(tiêu chí|hãng)$/i.test(key)) {
            detailSpecs[key] = val;
          }
        }
      });

      // Extract warranty, defect condition ("Tình trạng sản phẩm: Có trầy xước"), and accessories from ul.ulm li
      $u('ul.ulm li, .prd-info li, .warranty-info li').each((_, li) => {
        const liText = $u(li).text().replace(/\s+/g, ' ').trim();
        if (/^tình trạng sản phẩm\s*:/i.test(liText)) {
          rawProduct.defectNote = liText.replace(/^tình trạng sản phẩm\s*:\s*/i, '').trim();
        } else if (/^bảo hành\s*:/i.test(liText) && !rawProduct.warranty) {
          const shortWarr = liText
            .replace(/^bảo hành\s*:\s*/i, '')
            .split(/Bảo hành tại ĐMX/i)[0]
            .trim();
          if (shortWarr) rawProduct.warranty = shortWarr;
        } else if (/^phụ kiện\s*:/i.test(liText)) {
          const acc = liText
            .replace(/^phụ kiện\s*:\s*/i, '')
            .split(/Số IMEI/i)[0]
            .trim();
          if (acc) detailSpecs['Phụ kiện'] = acc;
        }
      });

      // Collect actual photos of the used unit
      $u('img').each((_, img) => {
        const src = $u(img).attr('src') || $u(img).attr('data-src') || '';
        if (src && src.includes('posimageused') && !rawProduct.images.includes(src)) {
          rawProduct.images.push(src);
        }
      });

      // Merge specs so detailed table specs take precedence over inline title shorthand
      rawProduct.specs = {
        ...(rawProduct.specs || {}),
        ...detailSpecs,
      };
      if (detailSpecs['Hệ điều hành']) {
        rawProduct.specs['Hệ điều hành'] = detailSpecs['Hệ điều hành'];
      }
      if (detailSpecs['Card màn hình']) {
        rawProduct.specs['Card màn hình'] = detailSpecs['Card màn hình'];
      }
      if (detailSpecs['Công nghệ CPU']) {
        rawProduct.specs['CPU'] = detailSpecs['Công nghệ CPU'];
      }
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
  const maxProducts = options.maxProducts ?? 25;
  const maxDetailPages = options.maxDetailPages ?? maxProducts;

  const page = await createPage(browser);
  const productMap = new Map();
  let categories = [];

  try {
    console.log(`[DienMayXanh] Navigating to ${START_URL}...`);
    await page.goto(START_URL, { waitUntil: 'networkidle2', timeout: 40000 });
    await autoScroll(page, 4, 500);

    if (maxProducts > 20) {
      const extraClicks = Math.ceil((maxProducts - 20) / 20);
      await clickListingLoadMore(page, Math.min(extraClicks, 5));
    }

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
    const detailsCount = Math.min(maxDetailPages, rawProducts.length);
    console.log(
      `[DienMayXanh] Extracted ${rawProducts.length} unique used laptop models. Enriching ${detailsCount} detail pages...`
    );

    for (let i = 0; i < detailsCount; i++) {
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
  parseDmxInlineSpecs,
};
