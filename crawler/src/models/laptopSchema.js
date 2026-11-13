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
    { pattern: /\b(lenovo|thinkpad|ideapad|ideacentre|legion|loq|yoga|thinkbook)\b/i, brand: 'Lenovo' },
    { pattern: /\b(hp|pavilion|envy|victus|omen|probook|elitebook|omnibook)\b/i, brand: 'HP' },
    { pattern: /\b(dell|inspiron|vostro|latitude|xps|alienware)\b/i, brand: 'Dell' },
    { pattern: /\b(msi|katana|cyborg|thin|modern|prestige|stealth|raider)\b/i, brand: 'MSI' },
    { pattern: /\b(gigabyte|aorus|aero)\b/i, brand: 'GIGABYTE' },
    { pattern: /\b(lg|gram)\b/i, brand: 'LG' },
    { pattern: /\b(huawei|matebook)\b/i, brand: 'Huawei' },
    { pattern: /\b(surface|microsoft)\b/i, brand: 'Microsoft' },
    { pattern: /\b(samsung|galaxy\s*book|chromebook)\b/i, brand: 'Samsung' },
    { pattern: /\b(masstel)\b/i, brand: 'Masstel' },
    { pattern: /\b(avita)\b/i, brand: 'Avita' },
    { pattern: /\b(vaio)\b/i, brand: 'VAIO' },
    { pattern: /\b(thunderobot)\b/i, brand: 'Thunderobot' },
    { pattern: /\b(singpc)\b/i, brand: 'SingPC' },
    { pattern: /\b(colorful)\b/i, brand: 'Colorful' },
  ];
  for (const item of knownBrands) {
    if (item.pattern.test(name)) {
      return item.brand;
    }
  }
  return null;
}

/**
 * Infers the laptop model name from the full product title when not explicitly provided.
 * Example: "Laptop Dell Inspiron 15 3530 - P16WD (i7 1355U, 16GB...)" -> "Inspiron 15 3530 - P16WD"
 */
function inferModel(name = '', brand = null, explicitModel = null) {
  if (explicitModel && typeof explicitModel === 'string' && explicitModel.trim()) {
    return explicitModel.trim();
  }
  if (!name || typeof name !== 'string') return null;

  let cleaned = name
    .replace(/^máy tính xách tay\s+/i, '')
    .replace(/^laptop\s+/i, '')
    .trim();

  if (brand) {
    const brandRegex = new RegExp(`^${brand}\\s+`, 'i');
    cleaned = cleaned.replace(brandRegex, '').trim();
    if (/^apple$/i.test(brand)) {
      cleaned = cleaned.replace(/^apple\s+/i, '').trim();
    }
  }

  // Strip pipe-delimited spec tail, e.g. "Lenovo IdeaPad ... | Ryzen 7, 16GB..."
  const pipeIdx = cleaned.indexOf('|');
  if (pipeIdx > 0) {
    cleaned = cleaned.slice(0, pipeIdx).trim();
  }

  // Strip parenthetical spec list at the end if it contains commas, e.g. (i7 1355U, 16GB, ...)
  cleaned = cleaned.replace(/\s*\([^)]*,[^)]*\)\s*$/, '').trim();

  // Strip slash-delimited spec tail, e.g. "R7 7730U/8GB/512GB/14.5\" FHD/Win11"
  const slashIdx = cleaned.indexOf('/');
  if (slashIdx > 0) {
    const beforeSlash = cleaned.slice(0, slashIdx).trim();
    // Strip trailing CPU token at the end of beforeSlash if present
    cleaned = beforeSlash
      .replace(
        /\s+(?:(?:Intel\s+)?Core\s+(?:Ultra\s+)?[i3579]?[-\s]?\w+|i[3579][-\s]\d{4,5}[A-Z0-9]*|R[3579][-\s]\d{4}[A-Z0-9]*|Ryzen\s+[3579]\s+\w+|N\d{3,4})$/i,
        ''
      )
      .trim();
  }

  return cleaned || null;
}

function extractRegex(text, regex) {
  if (!text) return null;
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Extracts normalized weight (e.g. "1.65 kg") from dedicated weight keys or combined dimension/weight strings
 * such as "Dài 358.5 mm - Rộng 235.6 mm - Dày 19 mm - 1.65 kg" or "Nặng 1.402 kg".
 */
function extractWeight(specsMap, combinedText) {
  for (const [k, v] of Object.entries(specsMap)) {
    if (/^(trọng lượng|khối lượng|weight|cân nặng)$/i.test(k)) {
      const m = v.match(/(\d+(?:[.,]\d+)?\s*(?:kg|g))\b/i);
      return m ? m[1].trim() : v;
    }
  }
  for (const [k, v] of Object.entries(specsMap)) {
    if (/(kích thước|khối lượng|trọng lượng|cân nặng|weight)/i.test(k)) {
      const m = v.match(/(?:nặng\s*|-\s*|\b)(\d+(?:[.,]\d+)?\s*kg)\b/i);
      if (m) return m[1].trim();
    }
  }
  return extractRegex(combinedText, /\b(\d+(?:[.,]\d{1,3})?\s*kg)\b/i);
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
    findByKeyPattern(/^(công nghệ cpu|loại cpu|cpu|vi xử lý|bộ vi xử lý|processor)$/i) ||
    findByKeyPattern(/(công nghệ cpu|loại cpu|\bcpu\b|vi xử lý)/i) ||
    extractRegex(
      combinedText,
      /\b((?:Intel\s+)?Core\s+(?:Ultra\s+)?[i3579]?[-\s]?\w+|Apple\s+M[12345](?:\s+(?:Pro|Max|Ultra))?|AMD\s+Ryzen\s+[3579]\s+\w+|Ryzen\s+[3579]\s+\w+|Snapdragon\s+X\s+\w+|Celeron\s+\w+|Pentium\s+\w+|i[3579][-\s]\d{4,5}[A-Z0-9]*|R[3579]\s*\d{4}[A-Z0-9]*)\b/i
    );

  const ram =
    findByKeyPattern(/^(ram|dung lượng ram|bộ nhớ ram|memory)$/i) ||
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
    findByKeyPattern(/^(card màn hình|loại card đồ họa|card đồ họa|vga|gpu|đồ họa|graphics)$/i) ||
    findByKeyPattern(/(card màn hình|card đồ họa|đồ họa|vga|gpu)/i) ||
    extractRegex(
      combinedText,
      /\b((?:NVIDIA\s+)?(?:GeForce\s+)?(?:RTX|GTX|MX)\s*\d{3,4}(?:\s*Ti|\s*SUPER)?|AMD\s+Radeon\s+\w+|Intel\s+(?:Iris\s+Xe|Arc|UHD)\s*(?:Graphics)?|Card\s+tích\s+hợp\s*[-–]?\s*[A-Za-z0-9\s]+|GPU\s+\d+\s*lõi)\b/i
    );

  // Combine screen size + resolution + refresh rate if available in separate keys
  const screenExplicit = findByKeyPattern(/^(màn hình|man hinh|screen|display)$/i);
  const screenSize = findByKeyPattern(/^(kích thước màn hình)$/i);
  const screenRes = findByKeyPattern(/^(độ phân giải|độ phân giải màn hình)$/i);
  const screenHz = findByKeyPattern(/^(tần số quét)$/i);

  let screen = null;
  if (screenSize) {
    const parts = [screenSize];
    if (screenRes && !screenSize.includes(screenRes)) parts.push(screenRes);
    if (screenHz && !/hãng không công bố/i.test(screenHz) && !screenSize.includes(screenHz)) {
      parts.push(screenHz);
    }
    screen = parts.join(', ');
  } else {
    screen =
      screenExplicit ||
      findByKeyPattern(/(màn hình|display|screen)/i) ||
      extractRegex(
        combinedText,
        /\b(\d{2}(?:[.,]\d)?\s*(?:inch|"|''|\s*in)(?:\s*(?:FHD|Full\s*HD|2K|2\.8K|3K|4K|OLED|IPS|WUXGA|QHD|\d{2,3}Hz))*)/i
      );
  }

  const battery =
    findByKeyPattern(/^(thông tin pin|pin|battery|dung lượng pin)$/i) ||
    findByKeyPattern(/\b(pin|battery)\b/i);

  const weight = extractWeight(specsMap, combinedText);

  const os =
    findByKeyPattern(/^(hệ điều hành|hệ điều hành khi ra mắt|os|operating system)$/i) ||
    findByKeyPattern(/(hệ điều hành|\bos\b)/i) ||
    extractRegex(combinedText, /\b(Windows\s*1[01](?:\s*Home(?:\s*SL)?|\s*Pro)?|Win\s*1[01]|macOS|ChromeOS|FreeDOS|Ubuntu|Linux)\b/i);

  const ports =
    findByKeyPattern(/^(cổng giao tiếp|cổng kết nối|ports|kết nối)$/i) ||
    findByKeyPattern(/(cổng giao tiếp|cổng kết nối)/i);

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

/**
 * Normalizes a raw laptop product object into a strict, database-ready schema
 * suitable for both relational (SQL) and document (NoSQL) databases.
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
  const model = inferModel(name, brand, raw.model);
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
          sku: o.sku ? String(o.sku).trim() : null,
          isSelected: Boolean(o.isSelected),
        }))
    : [];

  const rawImages = Array.isArray(raw.images) ? [...raw.images] : [];
  if (raw.thumbnail && typeof raw.thumbnail === 'string') {
    rawImages.unshift(raw.thumbnail.trim());
  }

  const images = [
    ...new Set(
      rawImages
        .filter(
          (img) =>
            typeof img === 'string' &&
            img.trim().length > 0 &&
            !img.trim().startsWith('data:image') &&
            !img.toLowerCase().includes('.svg')
        )
        .map((img) => img.trim())
    ),
  ];

  const thumbnail = raw.thumbnail ? raw.thumbnail.trim() : images[0] || null;

  const promotions = Array.isArray(raw.promotions)
    ? raw.promotions
        .filter((p) => p && (typeof p === 'string' ? p.trim() : p.title || p.description))
        .map((p) => (typeof p === 'string' ? { title: p.trim() } : p))
    : [];

  return {
    id: generateId(source, identifier),
    source,
    sku,
    name,
    brand,
    model,
    url,
    condition: raw.condition || 'new',
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
      thumbnail,
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
  inferModel,
  normalizeSpecs,
  generateId,
};
