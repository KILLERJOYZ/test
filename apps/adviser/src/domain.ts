export type Profile = {
  budget: number;
  tasks: string[];
  priorities: string[];
  vm: "one" | "many" | "unknown";
};
export type Product = {
  id: string;
  name: string;
  subtitle: string;
  ram: number;
  ssd: number;
  weight: number;
  screen: string;
  color: string;
  tone: string;
  level: number;
  upgrade: boolean;
  limitation: string;
};
export type Offer = {
  id: string;
  productId: string;
  seller: string;
  base: number;
  shipping: number | null;
  fee: number;
  coupon: number;
  eligible: boolean;
  status: "current" | "expired" | "unavailable";
};
export type Decision = {
  id: string;
  name: string;
  profile: Profile;
  productIds: string[];
  savedAt: string;
  datasetVersion: string;
  observations?: Array<{
    productId: string;
    total: number | null;
    seller: string | null;
    observedAt: string;
    assessment: string;
  }>;
};
export const DATASET_VERSION = "synthetic-v1";
export const OBSERVED_AT = "11/11/2026 · 09:00";
export const SAMPLE_PROFILE: Profile = {
  budget: 22000000,
  tasks: ["study", "code"],
  priorities: ["portable"],
  vm: "one",
};
export const TASKS = [
  {
    id: "study",
    name: "Học tập & văn phòng",
    detail: "Tài liệu, thuyết trình, nhiều tab",
    icon: "book",
  },
  {
    id: "code",
    name: "Lập trình",
    detail: "IDE, web và dự án cá nhân",
    icon: "code",
  },
  {
    id: "creative",
    name: "Thiết kế & sáng tạo",
    detail: "Ảnh, bố cục và video cơ bản",
    icon: "pen",
  },
  {
    id: "vm",
    name: "Máy ảo & giả lập",
    detail: "Môi trường chạy song song",
    icon: "layers",
  },
];
export const PRIORITIES = [
  { id: "portable", name: "Nhẹ & dễ mang", icon: "feather" },
  { id: "value", name: "Chi phí hợp lý", icon: "wallet" },
  { id: "power", name: "Dư sức làm việc", icon: "cpu" },
];
export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Néo Air 14",
    subtitle: "Gọn nhẹ, đi cùng mọi ý tưởng.",
    ram: 16,
    ssd: 512,
    weight: 1.35,
    screen: "14” · 2.2K",
    color: "#788c8a",
    tone: "#edf1ee",
    level: 2,
    upgrade: false,
    limitation: "RAM cố định 16 GB, ít dư địa cho nhiều máy ảo.",
  },
  {
    id: "p2",
    name: "Forma Pro 14",
    subtitle: "Thêm không gian cho việc lớn.",
    ram: 32,
    ssd: 1024,
    weight: 1.55,
    screen: "14” · 2.8K",
    color: "#b2a391",
    tone: "#f3eee6",
    level: 3,
    upgrade: false,
    limitation: "Nặng hơn dòng Air; mức giá gần trần ngân sách.",
  },
  {
    id: "p3",
    name: "Mộc Everyday 15",
    subtitle: "Đủ việc cần làm, nhẹ khoản chi.",
    ram: 16,
    ssd: 512,
    weight: 1.7,
    screen: "15.6” · FHD",
    color: "#79869a",
    tone: "#ebeff4",
    level: 2,
    upgrade: true,
    limitation: "Màn hình cơ bản, kém thuận tiện khi mang hằng ngày.",
  },
  {
    id: "p4",
    name: "Néo Air 14 Plus",
    subtitle: "Một phiên bản, nhiều khoảng trống hơn.",
    ram: 32,
    ssd: 1024,
    weight: 1.38,
    screen: "14” · 2.2K",
    color: "#718e88",
    tone: "#e8f0ec",
    level: 3,
    upgrade: false,
    limitation: "Vượt ngân sách 22 triệu trong dữ liệu mẫu.",
  },
  {
    id: "p5",
    name: "Forma Studio 16",
    subtitle: "Một góc làm việc rộng mở.",
    ram: 32,
    ssd: 1024,
    weight: 2.05,
    screen: "16” · 2.8K",
    color: "#7f7b78",
    tone: "#ece9e6",
    level: 4,
    upgrade: true,
    limitation: "Khối lượng 2,05 kg và giá cao hơn các lựa chọn gọn nhẹ.",
  },
  {
    id: "p6",
    name: "Mộc Start 14",
    subtitle: "Bắt đầu với những điều thiết yếu.",
    ram: 8,
    ssd: 256,
    weight: 1.4,
    screen: "14” · FHD",
    color: "#a09a8b",
    tone: "#f0eee7",
    level: 1,
    upgrade: false,
    limitation: "8 GB RAM không đạt quy tắc lập trình mẫu.",
  },
  {
    id: "p7",
    name: "Néo Flow 15",
    subtitle: "Cân bằng giữa bàn làm việc và di chuyển.",
    ram: 16,
    ssd: 512,
    weight: 1.55,
    screen: "15” · FHD+",
    color: "#869f9a",
    tone: "#e9f1ee",
    level: 2,
    upgrade: true,
    limitation: "Phí giao hàng chưa rõ, chưa có tổng giá xác minh.",
  },
  {
    id: "p8",
    name: "Forma Core 15",
    subtitle: "Tập trung vào tác vụ chính.",
    ram: 16,
    ssd: 512,
    weight: 1.85,
    screen: "15.6” · FHD",
    color: "#8b939a",
    tone: "#edf0f2",
    level: 2,
    upgrade: true,
    limitation: "Ưu đãi mẫu đã hết hạn.",
  },
  {
    id: "p9",
    name: "Mộc Flex 14",
    subtitle: "Linh hoạt theo cách bạn làm việc.",
    ram: 16,
    ssd: 512,
    weight: 1.5,
    screen: "14” · FHD+",
    color: "#b3a791",
    tone: "#f4efe5",
    level: 2,
    upgrade: true,
    limitation: "Đang hết hàng trong dữ liệu giả lập.",
  },
  {
    id: "p10",
    name: "Néo Work 16",
    subtitle: "Mở rộng khung hình công việc.",
    ram: 32,
    ssd: 1024,
    weight: 1.9,
    screen: "16” · 2.5K",
    color: "#899092",
    tone: "#edf0ef",
    level: 3,
    upgrade: true,
    limitation: "Cần xác nhận riêng điều kiện giảm giá trước khi tính.",
  },
  {
    id: "p11",
    name: "Forma Lite 13",
    subtitle: "Rất gọn, cho công việc quen thuộc.",
    ram: 8,
    ssd: 512,
    weight: 1.15,
    screen: "13.3” · FHD+",
    color: "#b7aaa0",
    tone: "#f5eeea",
    level: 1,
    upgrade: false,
    limitation: "Dung lượng RAM thấp cho nhiều tác vụ đồng thời.",
  },
  {
    id: "p12",
    name: "Mộc Max 16",
    subtitle: "Một lựa chọn tại bàn làm việc.",
    ram: 32,
    ssd: 1024,
    weight: 2.2,
    screen: "16” · FHD+",
    color: "#838a7d",
    tone: "#edf0e8",
    level: 3,
    upgrade: true,
    limitation: "Nặng 2,2 kg; kém phù hợp nếu thường xuyên di chuyển.",
  },
];
export const OFFERS: Offer[] = [
  {
    id: "o1",
    productId: "p1",
    seller: "Trạm Máy",
    base: 18700000,
    shipping: 200000,
    fee: 0,
    coupon: 0,
    eligible: false,
    status: "current",
  },
  {
    id: "o2",
    productId: "p1",
    seller: "Góc Công Nghệ",
    base: 19100000,
    shipping: 0,
    fee: 0,
    coupon: 500000,
    eligible: false,
    status: "current",
  },
  {
    id: "o3",
    productId: "p2",
    seller: "Trạm Máy",
    base: 20700000,
    shipping: 200000,
    fee: 0,
    coupon: 0,
    eligible: false,
    status: "current",
  },
  {
    id: "o4",
    productId: "p2",
    seller: "Nhà Laptop",
    base: 21400000,
    shipping: 0,
    fee: 0,
    coupon: 0,
    eligible: false,
    status: "current",
  },
  {
    id: "o5",
    productId: "p3",
    seller: "Nhà Laptop",
    base: 17200000,
    shipping: 200000,
    fee: 0,
    coupon: 0,
    eligible: false,
    status: "current",
  },
  {
    id: "o6",
    productId: "p3",
    seller: "Góc Công Nghệ",
    base: 17800000,
    shipping: 0,
    fee: 0,
    coupon: 700000,
    eligible: false,
    status: "current",
  },
  {
    id: "o7",
    productId: "p4",
    seller: "Trạm Máy",
    base: 24400000,
    shipping: 200000,
    fee: 0,
    coupon: 0,
    eligible: false,
    status: "current",
  },
  {
    id: "o8",
    productId: "p5",
    seller: "Nhà Laptop",
    base: 28500000,
    shipping: 0,
    fee: 0,
    coupon: 0,
    eligible: false,
    status: "current",
  },
  {
    id: "o9",
    productId: "p6",
    seller: "Nhà Laptop",
    base: 11900000,
    shipping: 0,
    fee: 0,
    coupon: 0,
    eligible: false,
    status: "current",
  },
  {
    id: "o10",
    productId: "p7",
    seller: "Góc Công Nghệ",
    base: 16500000,
    shipping: null,
    fee: 0,
    coupon: 0,
    eligible: false,
    status: "current",
  },
  {
    id: "o11",
    productId: "p8",
    seller: "Trạm Máy",
    base: 16900000,
    shipping: 0,
    fee: 0,
    coupon: 0,
    eligible: false,
    status: "expired",
  },
  {
    id: "o12",
    productId: "p9",
    seller: "Nhà Laptop",
    base: 17900000,
    shipping: 0,
    fee: 0,
    coupon: 0,
    eligible: false,
    status: "unavailable",
  },
  {
    id: "o13",
    productId: "p10",
    seller: "Góc Công Nghệ",
    base: 22900000,
    shipping: 0,
    fee: 0,
    coupon: 2000000,
    eligible: false,
    status: "current",
  },
  {
    id: "o14",
    productId: "p11",
    seller: "Trạm Máy",
    base: 14500000,
    shipping: 200000,
    fee: 0,
    coupon: 0,
    eligible: false,
    status: "current",
  },
  {
    id: "o15",
    productId: "p12",
    seller: "Nhà Laptop",
    base: 18900000,
    shipping: 200000,
    fee: 0,
    coupon: 0,
    eligible: false,
    status: "current",
  },
  {
    id: "o16",
    productId: "p4",
    seller: "Nhà Laptop",
    base: 24900000,
    shipping: 0,
    fee: 0,
    coupon: 0,
    eligible: false,
    status: "current",
  },
  {
    id: "o17",
    productId: "p5",
    seller: "Trạm Máy",
    base: 27900000,
    shipping: 200000,
    fee: 0,
    coupon: 0,
    eligible: false,
    status: "current",
  },
  {
    id: "o18",
    productId: "p12",
    seller: "Trạm Máy",
    base: 19300000,
    shipping: 200000,
    fee: 0,
    coupon: 0,
    eligible: false,
    status: "current",
  },
];
export const money = (n: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
export function total(o: Offer) {
  if (
    o.shipping === null ||
    ![o.base, o.shipping, o.fee, o.coupon].every(
      (n) => Number.isSafeInteger(n) && n >= 0,
    ) ||
    o.coupon > o.base
  )
    return null;
  const n = o.base + o.shipping + o.fee - (o.eligible ? o.coupon : 0);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}
export function bestOffer(id: string, offers = OFFERS) {
  return offers
    .filter(
      (o) => o.productId === id && o.status === "current" && total(o) !== null,
    )
    .sort((a, b) => total(a)! - total(b)!)[0];
}
export function fit(
  p: Product,
  profile: Profile,
  offers = OFFERS,
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (profile.tasks.includes("code") && p.ram < 16)
    reasons.push("Cần ít nhất 16 GB RAM theo quy tắc demo lập trình.");
  if (profile.tasks.includes("creative") && p.level < 3)
    reasons.push("Chưa đạt mức cấu hình sáng tạo trong bộ mẫu.");
  if (profile.tasks.includes("vm")) {
    if (profile.vm === "unknown")
      reasons.push("Cần xác nhận số máy ảo trước khi kết luận phù hợp.");
    else if (p.ram < (profile.vm === "many" ? 32 : 16))
      reasons.push(
        `Cần ${profile.vm === "many" ? 32 : 16} GB RAM theo kịch bản máy ảo mẫu.`,
      );
  }
  const o = bestOffer(p.id, offers);
  if (!o) reasons.push("Chưa có đề nghị bán còn hiệu lực với tổng giá đầy đủ.");
  else if (total(o)! > profile.budget)
    reasons.push(`Vượt trần ngân sách ${money(total(o)! - profile.budget)}.`);
  return { eligible: reasons.length === 0, reasons };
}
export function recommend(profile: Profile, offers = OFFERS) {
  return PRODUCTS.filter((p) => fit(p, profile, offers).eligible).sort(
    (a, b) => {
      const score = (p: Product) =>
        (profile.priorities.includes("portable") ? -p.weight * 5 : 0) +
        (profile.priorities.includes("power") ? p.level * 3 + p.ram / 16 : 0) +
        (profile.priorities.includes("value")
          ? -total(bestOffer(p.id, offers)!)! / 1000000
          : 0);
      return (
        score(b) - score(a) ||
        total(bestOffer(a.id, offers)!)! - total(bestOffer(b.id, offers)!)! ||
        a.id.localeCompare(b.id)
      );
    },
  );
}
