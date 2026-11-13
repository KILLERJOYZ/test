import type {
  CatalogQuery,
  CatalogRepository,
  EvidenceQuery,
  EvidenceRetriever,
  Offer,
  PriceHistoryPoint,
  ProductVariant,
  RetrievedEvidence,
  Store,
  VariantOffer,
  VerifiedEvidence,
} from "../../types/db.types.js";

/**
 * Realistic Vietnamese laptop catalog used by the AI eval suite.
 *
 * Prices are VND, dates are 2026, and every variant is a distinct SKU so the
 * tests can prove that the engine never mixes an 8GB/16GB/32GB or
 * RTX 4050/4060 configuration. Review sources intentionally include one
 * wrong-GPU article for the version-mismatch guard.
 */

export interface ReviewSourceFixture {
  id: string;
  variant_id: string;
  source_name: string;
  source_url: string;
  measured_at: string;
  raw_text: string;
}

function makeVariant(input: {
  id: string;
  model_id: string;
  model_name: string;
  brand: string;
  sku_code: string;
  cpu: string;
  gpu: string;
  ram_gb: number;
  ram_type: string;
  ram_upgradable: boolean;
  storage_gb: number;
  storage_slots: number;
  display_size: number;
  display_res: string;
  display_panel: string;
  color_gamut: string;
  refresh_rate: number;
  battery_wh: number;
  weight_kg: number;
  os: string;
}): ProductVariant {
  return {
    ...input,
    category: "laptop",
    region: "VN",
    specs_json: {},
    status: "published",
    merged_into_id: null,
  };
}

export const mockStores: Store[] = [
  {
    id: "store-cellphones",
    name: "CellphoneS",
    website: "https://cellphones.com.vn",
    shipping_regions: ["HCM", "HN", "Da Nang"],
    warranty_policy: "Bảo hành 12 tháng theo hãng",
    return_policy: "Đổi trả 30 ngày nếu lỗi kỹ thuật",
    is_verified: true,
  },
  {
    id: "store-fpt",
    name: "FPT Shop",
    website: "https://fptshop.com.vn",
    shipping_regions: ["Toàn quốc"],
    warranty_policy: "Bảo hành 12 tháng",
    return_policy: "Đổi mới 30 ngày",
    is_verified: true,
  },
  {
    id: "store-gearvn",
    name: "GearVN",
    website: "https://gearvn.com",
    shipping_regions: ["Toàn quốc"],
    warranty_policy: "Bảo hành 12-24 tháng theo sản phẩm",
    return_policy: "Đổi trả 7 ngày",
    is_verified: true,
  },
  {
    id: "store-thinkpro",
    name: "ThinkPro",
    website: "https://thinkpro.vn",
    shipping_regions: ["HCM", "HN"],
    warranty_policy: "Bảo hành 12 tháng",
    return_policy: "Đổi trả 15 ngày",
    is_verified: true,
  },
];

export const mockVariants: ProductVariant[] = [
  makeVariant({
    id: "v-mba-m2-8-256",
    model_id: "model-macbook-air-m2",
    model_name: "MacBook Air M2 13.6",
    brand: "Apple",
    sku_code: "MLXW3VN/A",
    cpu: "Apple M2 8-core",
    gpu: "Apple M2 8-core GPU",
    ram_gb: 8,
    ram_type: "LPDDR5",
    ram_upgradable: false,
    storage_gb: 256,
    storage_slots: 1,
    display_size: 13.6,
    display_res: "2560x1664",
    display_panel: "IPS Liquid Retina",
    color_gamut: "100% sRGB",
    refresh_rate: 60,
    battery_wh: 52.6,
    weight_kg: 1.24,
    os: "macOS",
  }),
  makeVariant({
    id: "v-mba-m2-16-512",
    model_id: "model-macbook-air-m2",
    model_name: "MacBook Air M2 13.6",
    brand: "Apple",
    sku_code: "MLY33VN/A",
    cpu: "Apple M2 8-core",
    gpu: "Apple M2 10-core GPU",
    ram_gb: 16,
    ram_type: "LPDDR5",
    ram_upgradable: false,
    storage_gb: 512,
    storage_slots: 1,
    display_size: 13.6,
    display_res: "2560x1664",
    display_panel: "IPS Liquid Retina",
    color_gamut: "100% sRGB",
    refresh_rate: 60,
    battery_wh: 52.6,
    weight_kg: 1.24,
    os: "macOS",
  }),
  makeVariant({
    id: "v-ideapad-8-512",
    model_id: "model-ideapad-slim5",
    model_name: "IdeaPad Slim 5 14IRL8",
    brand: "Lenovo",
    sku_code: "83BF0042VN",
    cpu: "Intel Core i5-13420H",
    gpu: "Intel UHD Graphics",
    ram_gb: 8,
    ram_type: "LPDDR5",
    ram_upgradable: false,
    storage_gb: 512,
    storage_slots: 1,
    display_size: 14,
    display_res: "1920x1200",
    display_panel: "IPS",
    color_gamut: "45% NTSC",
    refresh_rate: 60,
    battery_wh: 56.6,
    weight_kg: 1.46,
    os: "Windows 11",
  }),
  makeVariant({
    id: "v-ideapad-16-512",
    model_id: "model-ideapad-slim5",
    model_name: "IdeaPad Slim 5 14IRL8",
    brand: "Lenovo",
    sku_code: "83BF0043VN",
    cpu: "Intel Core i5-13420H",
    gpu: "Intel UHD Graphics",
    ram_gb: 16,
    ram_type: "LPDDR5",
    ram_upgradable: false,
    storage_gb: 512,
    storage_slots: 1,
    display_size: 14,
    display_res: "1920x1200",
    display_panel: "IPS",
    color_gamut: "45% NTSC",
    refresh_rate: 60,
    battery_wh: 56.6,
    weight_kg: 1.46,
    os: "Windows 11",
  }),
  makeVariant({
    id: "v-vivobook-4050",
    model_id: "model-vivobook-pro15",
    model_name: "Vivobook Pro 15 OLED M6500XV",
    brand: "ASUS",
    sku_code: "M6500XV-R74050",
    cpu: "AMD Ryzen 7 7840HS",
    gpu: "NVIDIA GeForce RTX 4050 6GB",
    ram_gb: 16,
    ram_type: "DDR5",
    ram_upgradable: true,
    storage_gb: 512,
    storage_slots: 2,
    display_size: 15.6,
    display_res: "2880x1620",
    display_panel: "OLED",
    color_gamut: "100% DCI-P3",
    refresh_rate: 120,
    battery_wh: 70,
    weight_kg: 1.8,
    os: "Windows 11",
  }),
  makeVariant({
    id: "v-vivobook-4060",
    model_id: "model-vivobook-pro15",
    model_name: "Vivobook Pro 15 OLED M6500XV",
    brand: "ASUS",
    sku_code: "M6500XV-R74060",
    cpu: "AMD Ryzen 7 7840HS",
    gpu: "NVIDIA GeForce RTX 4060 8GB",
    ram_gb: 32,
    ram_type: "DDR5",
    ram_upgradable: true,
    storage_gb: 1024,
    storage_slots: 2,
    display_size: 15.6,
    display_res: "2880x1620",
    display_panel: "OLED",
    color_gamut: "100% DCI-P3",
    refresh_rate: 120,
    battery_wh: 70,
    weight_kg: 1.8,
    os: "Windows 11",
  }),
  makeVariant({
    id: "v-nitro-4050",
    model_id: "model-nitro-v15",
    model_name: "Nitro V 15 ANV15-51",
    brand: "Acer",
    sku_code: "ANV15-51-51H9",
    cpu: "Intel Core i5-13420H",
    gpu: "NVIDIA GeForce RTX 4050 6GB",
    ram_gb: 16,
    ram_type: "DDR5",
    ram_upgradable: true,
    storage_gb: 512,
    storage_slots: 2,
    display_size: 15.6,
    display_res: "1920x1080",
    display_panel: "IPS",
    color_gamut: "45% NTSC",
    refresh_rate: 144,
    battery_wh: 57,
    weight_kg: 2.1,
    os: "Windows 11",
  }),
  makeVariant({
    id: "v-legion-4060",
    model_id: "model-legion5",
    model_name: "Legion 5 15IRX9",
    brand: "Lenovo",
    sku_code: "82YU00VHVN",
    cpu: "Intel Core i7-13650HX",
    gpu: "NVIDIA GeForce RTX 4060 8GB",
    ram_gb: 16,
    ram_type: "DDR5",
    ram_upgradable: true,
    storage_gb: 1024,
    storage_slots: 2,
    display_size: 15.6,
    display_res: "2560x1440",
    display_panel: "IPS",
    color_gamut: "100% sRGB",
    refresh_rate: 165,
    battery_wh: 80,
    weight_kg: 2.4,
    os: "Windows 11",
  }),
];

function makeOffer(input: {
  variantId: string;
  storeId: string;
  total: number;
  url: string;
  checkedAt: string;
}): Offer {
  return {
    id: `offer-${input.variantId}`,
    variant_id: input.variantId,
    store_id: input.storeId,
    listed_price_vnd: input.total,
    mandatory_fees_vnd: 0,
    total_known_price_vnd: input.total,
    conditional_price_vnd: null,
    promo_conditions: null,
    stock_status: "in_stock",
    product_condition: "new",
    source_url: input.url,
    is_sponsored: false,
    checked_at: input.checkedAt,
    expires_at: null,
    status: "active",
  };
}

export const mockOffers: Offer[] = [
  makeOffer({
    variantId: "v-mba-m2-8-256",
    storeId: "store-cellphones",
    total: 23_990_000,
    url: "https://cellphones.com.vn/laptop-apple-macbook-air-m2-2022-8gb-256gb.html",
    checkedAt: "2026-11-10T09:00:00.000Z",
  }),
  makeOffer({
    variantId: "v-mba-m2-16-512",
    storeId: "store-fpt",
    total: 31_990_000,
    url: "https://fptshop.com.vn/may-tinh-xach-tay/macbook-air-m2-16gb-512gb",
    checkedAt: "2026-11-10T09:05:00.000Z",
  }),
  makeOffer({
    variantId: "v-ideapad-8-512",
    storeId: "store-gearvn",
    total: 15_490_000,
    url: "https://gearvn.com/products/laptop-lenovo-ideapad-slim-5-14irl8-83bf0042vn",
    checkedAt: "2026-11-10T09:10:00.000Z",
  }),
  makeOffer({
    variantId: "v-ideapad-16-512",
    storeId: "store-cellphones",
    total: 17_990_000,
    url: "https://cellphones.com.vn/laptop-lenovo-ideapad-slim-5-14irl8-16gb.html",
    checkedAt: "2026-11-10T09:15:00.000Z",
  }),
  makeOffer({
    variantId: "v-vivobook-4050",
    storeId: "store-gearvn",
    total: 24_990_000,
    url: "https://gearvn.com/products/laptop-asus-vivobook-pro-15-oled-m6500xv-r74050",
    checkedAt: "2026-11-10T09:20:00.000Z",
  }),
  makeOffer({
    variantId: "v-vivobook-4060",
    storeId: "store-gearvn",
    total: 29_990_000,
    url: "https://gearvn.com/products/laptop-asus-vivobook-pro-15-oled-m6500xv-r74060",
    checkedAt: "2026-11-10T09:25:00.000Z",
  }),
  makeOffer({
    variantId: "v-nitro-4050",
    storeId: "store-fpt",
    total: 20_490_000,
    url: "https://fptshop.com.vn/may-tinh-xach-tay/acer-nitro-v-15-anv15-51-51h9",
    checkedAt: "2026-11-10T09:30:00.000Z",
  }),
  makeOffer({
    variantId: "v-legion-4060",
    storeId: "store-thinkpro",
    total: 31_990_000,
    url: "https://thinkpro.vn/laptop-lenovo-legion-5-15irx9-82yu00vhvn",
    checkedAt: "2026-11-10T09:35:00.000Z",
  }),
];

export const mockVariantOffers: VariantOffer[] = mockVariants.map((variant) => {
  const offer = mockOffers.find((item) => item.variant_id === variant.id);
  const store = mockStores.find((item) => item.id === offer?.store_id);
  if (!offer || !store) throw new Error(`fixture offer missing for ${variant.id}`);
  return { variant, offer, store };
});

function history(
  variantId: string,
  points: readonly (readonly [string, number])[],
): PriceHistoryPoint[] {
  return points.map(([recordedAt, priceVnd], index) => ({
    id: `ph-${variantId}-${index + 1}`,
    offer_id: `offer-${variantId}`,
    variant_id: variantId,
    store_id: null,
    price_vnd: priceVnd,
    recorded_at: recordedAt,
  }));
}

export const mockPriceHistory: PriceHistoryPoint[] = [
  ...history("v-mba-m2-8-256", [
    ["2026-08-01T00:00:00.000Z", 25_990_000],
    ["2026-09-15T00:00:00.000Z", 24_990_000],
    ["2026-11-01T00:00:00.000Z", 23_990_000],
  ]),
  ...history("v-mba-m2-16-512", [
    ["2026-08-01T00:00:00.000Z", 33_990_000],
    ["2026-09-15T00:00:00.000Z", 32_990_000],
    ["2026-11-01T00:00:00.000Z", 31_990_000],
  ]),
  ...history("v-ideapad-8-512", [
    ["2026-08-01T00:00:00.000Z", 16_490_000],
    ["2026-09-15T00:00:00.000Z", 15_990_000],
    ["2026-11-01T00:00:00.000Z", 15_490_000],
  ]),
  ...history("v-ideapad-16-512", [
    ["2026-08-01T00:00:00.000Z", 18_990_000],
    ["2026-09-15T00:00:00.000Z", 18_490_000],
    ["2026-11-01T00:00:00.000Z", 17_990_000],
  ]),
  ...history("v-vivobook-4050", [
    ["2026-08-01T00:00:00.000Z", 27_990_000],
    ["2026-09-01T00:00:00.000Z", 27_490_000],
    ["2026-11-01T00:00:00.000Z", 24_990_000],
  ]),
  ...history("v-vivobook-4060", [
    ["2026-08-01T00:00:00.000Z", 31_990_000],
    ["2026-09-01T00:00:00.000Z", 30_990_000],
    ["2026-11-01T00:00:00.000Z", 29_990_000],
  ]),
  ...history("v-nitro-4050", [
    ["2026-08-01T00:00:00.000Z", 21_490_000],
    ["2026-09-15T00:00:00.000Z", 20_990_000],
    ["2026-11-01T00:00:00.000Z", 20_490_000],
  ]),
  ...history("v-legion-4060", [
    ["2026-08-01T00:00:00.000Z", 33_990_000],
    ["2026-09-15T00:00:00.000Z", 32_990_000],
    ["2026-11-01T00:00:00.000Z", 31_990_000],
  ]),
];

export const mockApprovedEvidence: VerifiedEvidence[] = [
  {
    id: "ev-relab-vivobook-4050",
    model_id: "model-vivobook-pro15",
    variant_id: "v-vivobook-4050",
    sku_code: "M6500XV-R74050",
    source_name: "Relab",
    source_url: "https://relab.vn/review/asus-vivobook-pro-15-oled-m6500xv-rtx-4050",
    evidence_type: "editorial_review",
    summary_performance:
      "Cinebench R23 đa nhân 12.450 điểm; Cyberpunk 2077 đạt 72 fps ở thiết lập High.",
    summary_thermals_noise:
      "CPU khoảng 82 độ C khi render, quạt ồn 47 dB ở mức tải cao.",
    summary_battery: "Pin văn phòng 6 giờ 15 phút.",
    summary_cons_quirks: "Bàn phím nông, webcam 1080p thiếu chi tiết khi thiếu sáng.",
    raw_excerpt:
      "Bài đo trên đúng phiên bản M6500XV-R74050 với RTX 4050 6GB và 16GB RAM. " +
      "Cinebench R23 đa nhân 12.450 điểm. Cyberpunk 2077 đạt 72 fps ở High.",
    measured_at: "2026-09-20",
    status: "approved",
  },
  {
    id: "ev-relab-ideapad-16",
    model_id: "model-ideapad-slim5",
    variant_id: "v-ideapad-16-512",
    sku_code: "83BF0043VN",
    source_name: "Relab",
    source_url: "https://relab.vn/review/lenovo-ideapad-slim-5-14irl8-16gb",
    evidence_type: "editorial_review",
    summary_performance: "Cinebench R23 đơn nhân 1.690 điểm, đủ mượt cho văn phòng và lập trình nhẹ.",
    summary_thermals_noise: "CPU khoảng 75 độ C, quạt khá êm khi làm việc văn phòng.",
    summary_battery: "Pin đọc tài liệu 9 giờ 30 phút.",
    summary_cons_quirks: "Màn hình chỉ 45% NTSC, loa nhỏ.",
    raw_excerpt:
      "Bài đo trên bản 16GB 83BF0043VN. Pin đọc tài liệu đạt 9 giờ 30 phút; " +
      "màn hình 45% NTSC không phù hợp đồ họa màu.",
    measured_at: "2026-10-02",
    status: "approved",
  },
  {
    id: "ev-relab-nitro-4050",
    model_id: "model-nitro-v15",
    variant_id: "v-nitro-4050",
    sku_code: "ANV15-51-51H9",
    source_name: "Relab",
    source_url: "https://relab.vn/review/acer-nitro-v-15-anv15-51-rtx-4050",
    evidence_type: "editorial_review",
    summary_performance: "Valorant đạt 58 fps; hiệu năng gaming ổn trong tầm giá.",
    summary_thermals_noise: "GPU khoảng 78 độ C, quạt ồn rõ khi chơi game.",
    summary_battery: "Pin chơi game khoảng 4 giờ 20 phút.",
    summary_cons_quirks: "Màn hình 144Hz nhưng độ phủ màu thấp, bản lề hơi lỏng.",
    raw_excerpt:
      "Acer Nitro V 15 ANV15-51-51H9 dùng RTX 4050. Valorant đạt 58 fps; " +
      "quạt ồn rõ khi chơi game.",
    measured_at: "2026-08-18",
    status: "approved",
  },
];

export const mockReviewSources: ReviewSourceFixture[] = [
  {
    id: "review-vivobook-4050",
    variant_id: "v-vivobook-4050",
    source_name: "Relab",
    source_url: "https://relab.vn/review/asus-vivobook-pro-15-oled-m6500xv-rtx-4050",
    measured_at: "2026-09-20",
    raw_text:
      "Trong bài đo hiệu năng, ASUS Vivobook Pro 15 OLED M6500XV đạt 12.450 điểm Cinebench R23 đa nhân và 72 fps trong Cyberpunk 2077 ở thiết lập High. " +
      "Nhiệt độ CPU ổn định khoảng 82 độ C, quạt chạy ồn 47 dB khi render. " +
      "Pin dùng văn phòng được 6 giờ 15 phút. " +
      "Điểm trừ là bàn phím hơi nông và webcam 1080p thiếu chi tiết trong điều kiện thiếu sáng.",
  },
  {
    id: "review-ideapad-16",
    variant_id: "v-ideapad-16-512",
    source_name: "Relab",
    source_url: "https://relab.vn/review/lenovo-ideapad-slim-5-14irl8-16gb",
    measured_at: "2026-10-02",
    raw_text:
      "Lenovo IdeaPad Slim 5 14IRL8 83BF0043VN có hiệu năng văn phòng mượt, Cinebench R23 đơn nhân 1.690 điểm. " +
      "Nhiệt độ CPU khoảng 75 độ C và quạt khá êm. " +
      "Pin đạt 9 giờ 30 phút khi đọc tài liệu. " +
      "Nhược điểm là màn hình 45% NTSC không phù hợp đồ họa màu và loa nhỏ.",
  },
  {
    id: "review-nitro-4050",
    variant_id: "v-nitro-4050",
    source_name: "Relab",
    source_url: "https://relab.vn/review/acer-nitro-v-15-anv15-51-rtx-4050",
    measured_at: "2026-08-18",
    raw_text:
      "Acer Nitro V 15 ANV15-51-51H9 chạy RTX 4050 có hiệu năng gaming ổn, 58 fps trong Valorant. " +
      "Nhiệt độ GPU khoảng 78 độ C, quạt ồn rõ khi chơi game. " +
      "Pin chỉ 4 giờ 20 phút. " +
      "Điểm trừ là màn hình 144Hz nhưng độ phủ màu thấp và bản lề hơi lỏng.",
  },
  {
    id: "review-legion-wrong-gpu",
    variant_id: "v-legion-4060",
    source_name: "Relab",
    source_url: "https://relab.vn/review/lenovo-legion-5-15irx9-rtx-4070",
    measured_at: "2026-07-12",
    raw_text:
      "Bài đo trên Lenovo Legion 5 15IRX9 82YU00VHVN phiên bản RTX 4070 có hiệu năng rất mạnh, 95 fps trong Cyberpunk 2077. " +
      "Nhiệt độ CPU 88 độ C, quạt ồn 50 dB. " +
      "Pin được 4 giờ. " +
      "Nhược điểm là máy nặng 2,4kg và bàn phím nóng.",
  },
];

function cloneRow(row: VariantOffer): VariantOffer {
  return {
    variant: { ...row.variant, specs_json: { ...row.variant.specs_json } },
    offer: { ...row.offer },
    store: { ...row.store },
  };
}

/** Fake PostgreSQL adapter with the same read-only contract as production. */
export function createFakeCatalogRepository(
  overrides: Partial<CatalogRepository> = {},
): CatalogRepository {
  return {
    async queryVariants(input: CatalogQuery): Promise<VariantOffer[]> {
      const limit = Math.max(1, Math.min(input.limit ?? 20, 100));
      return mockVariantOffers
        .filter((row) => row.variant.status === "published")
        .filter((row) => !input.category || row.variant.category === input.category)
        .filter((row) => row.offer.status === "active")
        .filter((row) => row.offer.stock_status === "in_stock" || row.offer.stock_status === "low_stock")
        .filter(
          (row) =>
            row.offer.total_known_price_vnd != null &&
            row.offer.total_known_price_vnd <= input.max_budget_vnd,
        )
        .sort(
          (left, right) =>
            (left.offer.total_known_price_vnd ?? Infinity) -
            (right.offer.total_known_price_vnd ?? Infinity),
        )
        .slice(0, limit)
        .map(cloneRow);
    },

    async getVariantsByIds(variantIds: readonly string[]): Promise<VariantOffer[]> {
      const ids = new Set(variantIds);
      return mockVariantOffers
        .filter((row) => ids.has(row.variant.id))
        .filter((row) => row.offer.status === "active")
        .filter((row) => row.offer.stock_status === "in_stock" || row.offer.stock_status === "low_stock")
        .map(cloneRow);
    },

    async listResolutionVariants(): Promise<ProductVariant[]> {
      return mockVariants
        .filter((variant) => variant.status === "published")
        .map((variant) => ({ ...variant, specs_json: { ...variant.specs_json } }));
    },

    async getPriceHistory(
      variantIds: readonly string[],
      since?: string,
    ): Promise<PriceHistoryPoint[]> {
      const ids = new Set(variantIds);
      return mockPriceHistory
        .filter((point) => ids.has(point.variant_id))
        .filter((point) => !since || String(point.recorded_at ?? "") >= since)
        .map((point) => ({ ...point }));
    },

    async findApprovedEvidences(
      variantIds: readonly string[],
      limit = 12,
    ): Promise<VerifiedEvidence[]> {
      const ids = new Set(variantIds);
      return mockApprovedEvidence
        .filter((row) => ids.has(row.variant_id))
        .slice(0, Math.max(1, Math.min(limit, 50)))
        .map((row) => ({ ...row }));
    },

    async findSimilarOffers(variantId: string): Promise<VariantOffer[]> {
      const target = mockVariants.find((variant) => variant.id === variantId);
      if (!target) return [];
      return mockVariantOffers
        .filter((row) => row.variant.id !== variantId)
        .filter((row) => row.variant.model_id === target.model_id)
        .filter((row) => row.offer.status === "active")
        .filter((row) => row.offer.stock_status === "in_stock" || row.offer.stock_status === "low_stock")
        .map(cloneRow);
    },

    ...overrides,
  };
}

function pickClaim(row: VerifiedEvidence, query: string): string {
  const candidates = [
    row.summary_performance,
    row.summary_thermals_noise,
    row.summary_battery,
    row.summary_cons_quirks,
    row.raw_excerpt,
  ].filter((value): value is string => Boolean(value && value.trim()));
  const tokens = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 3);
  return (
    candidates.find((candidate) =>
      tokens.some((token) => candidate.toLowerCase().includes(token)),
    ) ??
    candidates[0] ??
    row.raw_excerpt
  );
}

/** Fake hybrid retriever that only returns approved rows for exact variants. */
export function createFakeEvidenceRetriever(
  options: { fail?: boolean } = {},
): EvidenceRetriever {
  return {
    async search(input: EvidenceQuery): Promise<RetrievedEvidence[]> {
      if (options.fail) throw new Error("evidence backend unavailable");
      const ids = new Set(input.variant_ids);
      const limit = Math.max(1, Math.min(input.limit ?? 6, 20));
      return mockApprovedEvidence
        .filter((row) => ids.has(row.variant_id))
        .slice(0, limit)
        .map((row) => ({
          ...row,
          claim: pickClaim(row, input.query),
          score: 1,
        }));
    },
  };
}
