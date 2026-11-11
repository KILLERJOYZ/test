const crypto = require('crypto');

/**
 * Generates a deterministic ID from source + url or sku
 */
function generateId(source, identifier) {
  return crypto
    .createHash('sha256')
    .update(`${source}:${identifier}`)
    .digest('hex')
    .slice(0, 16);
}

/**
 * Parses a Vietnamese currency string (e.g. "15.990.000₫", "15,990,000đ") into a number (VND).
 */
function parsePriceVnd(rawPrice) {
  if (typeof rawPrice === 'number' && !Number.isNaN(rawPrice)) {
    return rawPrice;
  }
  if (!rawPrice || typeof rawPrice !== 'string') return null;
  const cleaned = rawPrice.replace(/[^\d]/g, '');
  if (!cleaned) return null;
  const value = Number.parseInt(cleaned, 10);
  return Number.isNaN(value) || value === 0 ? null : value;
}

/**
 * Parses discount percentage string (e.g. "-15%", "Giảm 12%") into a number.
 */
function parseDiscountPercent(rawDiscount, currentPrice, originalPrice) {
  if (typeof rawDiscount === 'number' && !Number.isNaN(rawDiscount)) {
    return Math.abs(rawDiscount);
  }
  if (typeof rawDiscount === 'string') {
    const match = rawDiscount.match(/(\d+(?:[.,]\d+)?)\s*%/);
    if (match) {
      return Number.parseFloat(match[1].replace(',', '.'));
    }
  }
  if (currentPrice && originalPrice && originalPrice > currentPrice) {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }
  return null;
}

/**
 * Extracts normalized brand name from product name or explicit brand string.
 */
function inferBrand(name = '', explicitBrand = null) {
  if (explicitBrand && typeof explicitBrand === 'string' && explicitBrand.trim()) {
    return explicitBrand.trim();
  }
  const knownBrands = [
    { pattern: /\b(macbook|apple)\b/i, brand: 'Apple' },
    { pattern: /\b(asus|rog|tuf|vivobook|zenbook)\b/i, brand: 'ASUS' },
    { pattern: /\b(acer|nitro|predator|aspire|swift)\b/i, brand: 'Acer' },
    { pattern: /\b(lenovo|thinkpad|ideapad|legion|loq|yoga|thinkbook)\b/i, brand: 'Lenovo' },
    { pattern: /\b(hp|pavilion|envy|victus|omen|probook|elitebook)\b/i, brand: 'HP' },
    { pattern: /\b(dell|inspiron|vostro|latitude|xps|alienware)\b/i, brand: 'Dell' },
    { pattern: /\b(msi|katana|cyborg|thin|modern|prestige|stealth|raider)\b/i, brand: 'MSI' },
    { pattern: /\b(gigabyte|aorus|aero)\b/i, brand: 'GIGABYTE' },
    { pattern: /\b(lg|gram)\b/i, brand: 'LG' },
    { pattern: /\b(huawei|matebook)\b/i, brand: 'Huawei' },
    { pattern: /\b(surface|microsoft)\b/i, brand: 'Microsoft' },
    { pattern: /\b(samsung|galaxy\s*book)\b/i, brand: 'Samsung' },
    { pattern: /\b(masstel)\b/i, brand: 'Masstel' },
    { pattern: /\b(avita)\b/i, brand: 'Avita' },
    { pattern: /\b(vaio)\b/i, brand: 'VAIO' },
  ];
  for (const item of knownBrands) {
    if (item.pattern.test(name)) {
      return item.brand;
    }
  }
  return null;
}

/**
 * Parses common hardware specs from free-form text or spec key-value map.
 */
function normalizeSpecs(rawSpecs = {}, fallbackText = '') {
  const specsMap = {};
  if (Array.isArray(rawSpecs)) {
    for (const item of rawSpecs) {
      if (item && typeof item === 'object' && item.key && item.value) {
        specsMap[String(item.key).trim()] = String(item.value).trim();
      } else if (typeof item === 'string' && item.trim()) {
        specsMap[`spec_${Object.keys(specsMap).length + 1}`] = item.trim();
      }
    }
  } else if (rawSpecs && typeof rawSpecs === 'object') {
    for (const [k, v] of Object.entries(rawSpecs)) {
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        specsMap[k.trim()] = String(v).trim();
      }
    }
  }

  const findByKeyPattern = (regex) => {
    for (const [k, v] of Object.entries(specsMap)) {
      if (regex.test(k)) return v;
    }
    return null;
  };

  const combinedText = `${fallbackText} ${Object.values(specsMap).join(' | ')}`;

  const cpu =
    findByKeyPattern(/^(cpu|loại cpu|công nghệ cpu|vi xử lý|bộ vi xử lý|processor)$/i) ||
    findByKeyPattern(/(loại cpu|công nghệ cpu|\bcpu\b|vi xử lý)/i) ||
    extractRegex(
      combinedText,
      /\b((?:Intel\s+)?Core\s+(?:Ultra\s+)?[i3579]?[-\s]?\w+|Apple\s+M[12345](?:\s+(?:Pro|Max|Ultra))?|AMD\s+Ryzen\s+[3579]\s+\w+|Ryzen\s+[3579]\s+\w+|Snapdragon\s+X\s+\w+|Celeron\s+\w+|Pentium\s+\w+|i[3579]-\d{4,5}[A-Z0-9]*|R[3579]\s*\d{4}[A-Z0-9]*)\b/i
    );

  const ram =
    findByKeyPattern(/^(ram|bộ nhớ ram|dung lượng ram|memory)$/i) ||
    findByKeyPattern(/\bram\b/i) ||
    extractRegex(combinedText, /\b(\d{1,3}\s*GB(?:\s*(?:DDR[45]|LPDDR[45]X?))?)\b/i);

  const storage =
    findByKeyPattern(/^(ổ cứng|o cung|storage|ssd|hdd|bộ nhớ trong|dung lượng ổ cứng)$/i) ||
    findByKeyPattern(/(ổ cứng|ssd|storage)/i) ||
    extractRegex(
      combinedText,
      /\b((?:SSD\s*)?(?:128|256|512)\s*GB(?:\s*SSD)?|(?:SSD\s*)?[124]\s*TB(?:\s*SSD)?)\b/i
    );

  const gpu =
    findByKeyPattern(/^(vga|gpu|card đồ họa|card màn hình|đồ họa|graphics)$/i) ||
    findByKeyPattern(/(card|đồ họa|vga|gpu)/i) ||
    extractRegex(
      combinedText,
      /\b((?:NVIDIA\s+)?(?:GeForce\s+)?(?:RTX|GTX|MX)\s*\d{3,4}(?:\s*Ti|\s*SUPER)?|AMD\s+Radeon\s+\w+|Intel\s+(?:Iris\s+Xe|Arc|UHD)\s*Graphics?|GPU\s+\d+\s*lõi)\b/i
    );

  const screen =
    findByKeyPattern(/^(màn hình|man hinh|screen|display|kích thước màn hình)$/i) ||
    findByKeyPattern(/(màn hình|display|screen)/i) ||
    extractRegex(
      combinedText,
      /\b(\d{2}(?:[.,]\d)?\s*(?:inch|"|''|\s*in)(?:\s*(?:FHD|Full\s*HD|2K|2\.8K|3K|4K|OLED|IPS|WUXGA|QHD|\d{2,3}Hz))*)/i
    );

  const battery =
    findByKeyPattern(/^(pin|battery|dung lượng pin)$/i) ||
    findByKeyPattern(/\b(pin|battery)\b/i);

  const weight =
    findByKeyPattern(/^(trọng lượng|khối lượng|weight|cân nặng)$/i) ||
    findByKeyPattern(/(trọng lượng|khối lượng|weight)/i) ||
    extractRegex(combinedText, /\b(\d(?:[.,]\d{1,2})?\s*kg)\b/i);

  const os =
    findByKeyPattern(/^(hệ điều hành|os|operating system)$/i) ||
    findByKeyPattern(/(hệ điều hành|\bos\b)/i) ||
    extractRegex(combinedText, /\b(Windows\s*1[01](?:\s*Home|\s*Pro)?|macOS|FreeDOS|Ubuntu|Linux)\b/i);

  const ports =
    findByKeyPattern(/^(cổng kết nối|cổng giao tiếp|ports|kết nối)$/i) ||
    findByKeyPattern(/(cổng kết nối|giao tiếp)/i);

  return {
    cpu: cpu || null,
    ram: ram || null,
    storage: storage || null,
    gpu: gpu || null,
    screen: screen || null,
    battery: battery || null,
    weight: weight || null,
    os: os || null,
    ports: ports || null,
    rawSpecs: specsMap,
  };
}

function extractRegex(text, regex) {
  if (!text) return null;
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Normalizes a raw laptop product object into a strict, database-ready schema
 * suitable for both relational (SQL) and document (NoSQL) databases.
 *
 * Relational mapping design:
 * - `products` table: id, source, sku, name, slug, url, brand, model, condition, availability, rating_average, rating_count, crawled_at
 * - `product_prices` table: product_id, current_price, original_price, discount_percent, currency, installment_info, updated_at
 * - `product_specs` table: product_id, cpu, ram, storage, gpu, screen, battery, weight, os, ports, raw_specs_json
 * - `product_options` table: product_id, option_type ('configuration' | 'color' | 'condition'), label, value, price, url, sku, is_selected
 * - `product_categories` table: product_id, category_name, category_slug, category_url, category_type
 * - `product_media` / `product_promotions`: images[], promotions[]
 */
function createNormalizedLaptop(raw = {}) {
  const source = raw.source || 'unknown';
  const url = raw.url || '';
  const sku = raw.sku ? String(raw.sku).trim() : null;
  const name = raw.name ? String(raw.name).replace(/\s+/g, ' ').trim() : '';
  const identifier = sku || url || name;

  const currentPrice = parsePriceVnd(raw.price?.current ?? raw.currentPrice ?? raw.price);
  const originalPrice = parsePriceVnd(raw.price?.original ?? raw.originalPrice);
  const discountPercent = parseDiscountPercent(
    raw.price?.discountPercent ?? raw.discountPercent ?? raw.discount,
    currentPrice,
    originalPrice
  );

  const brand = inferBrand(name, raw.brand);
  const specs = normalizeSpecs(raw.specs || raw.specifications || {}, `${name} ${raw.summarySpecs || ''}`);

  const categories = Array.isArray(raw.categories)
    ? raw.categories
        .filter((c) => c && (c.name || c.url))
        .map((c) => ({
          name: c.name ? String(c.name).trim() : null,
          slug: c.slug || null,
          url: c.url || null,
          type: c.type || 'category',
        }))
    : [];

  const options = Array.isArray(raw.options)
    ? raw.options
        .filter((o) => o && (o.label || o.value))
        .map((o) => ({
          type: o.type || 'configuration', // 'configuration' | 'color' | 'storage' | 'condition'
          label: String(o.label || o.value).trim(),
          value: String(o.value || o.label).trim(),
          price: parsePriceVnd(o.price),
          url: o.url || null,
          sku: o.sku || null,
          isSelected: Boolean(o.isSelected),
        }))
    : [];

  const images = Array.isArray(raw.images)
    ? [...new Set(raw.images.filter((img) => typeof img === 'string' && img.trim().length > 0))]
    : raw.thumbnail
      ? [raw.thumbnail]
      : [];

  const promotions = Array.isArray(raw.promotions)
    ? [...new Set(raw.promotions.map((p) => String(p).replace(/\s+/g, ' ').trim()).filter(Boolean))]
    : [];

  return {
    id: generateId(source, identifier),
    source,
    sku,
    name,
    brand,
    model: raw.model || null,
    url,
    condition: raw.condition || 'new', // 'new' | 'used' | 'refurbished' (e.g. Dien May Xanh may-doi-tra)
    availability: raw.availability || (currentPrice ? 'in_stock' : 'unknown'),
    categories,
    pricing: {
      currency: 'VND',
      current: currentPrice,
      original: originalPrice || currentPrice,
      discountPercent,
      installment: raw.installment || null,
      priceNote: raw.priceNote || null,
    },
    specs,
    options,
    promotions,
    rating: {
      average:
        raw.rating?.average !== undefined && raw.rating?.average !== null
          ? Number(raw.rating.average)
          : null,
      count:
        raw.rating?.count !== undefined && raw.rating?.count !== null
          ? Number.parseInt(raw.rating.count, 10) || 0
          : null,
    },
    media: {
      thumbnail: images[0] || null,
      images,
    },
    metadata: {
      warranty: raw.warranty || null,
      storeCount: raw.storeCount || null,
      defectNote: raw.defectNote || null,
      crawledAt: new Date().toISOString(),
    },
  };
}

module.exports = {
  createNormalizedLaptop,
  parsePriceVnd,
  parseDiscountPercent,
  inferBrand,
  normalizeSpecs,
  generateId,
};
