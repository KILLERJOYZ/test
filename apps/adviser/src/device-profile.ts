export const TAXONOMY_VERSION = "device-advisor-1";
export type Category = "Phone" | "Tablet" | "PC";
export const CATEGORIES: Category[] = ["Phone", "Tablet", "PC"];
export const PURPOSES: Record<
  Category,
  { id: string; label: string; persona?: boolean }[]
> = {
  Phone: [
    ["student", "Students", true],
    ["elderly", "Elderly", true],
    ["creator", "Creators", false],
    ["business", "Business", false],
    ["basic", "Basics", false],
    ["gaming", "Gamers", false],
  ].map(([id, label, persona]) => ({
    id: `phone.${id}`,
    label: String(label),
    persona: Boolean(persona),
  })),
  Tablet: [
    ["basic", "Basics"],
    ["reading", "Readers"],
    ["media", "Media"],
    ["student", "Student"],
    ["design", "Designer"],
  ].map(([id, label]) => ({
    id: `tablet.${id}`,
    label,
    persona: id === "student",
  })),
  PC: [
    ["student", "Students"],
    ["basic", "Basic uses"],
    ["development", "Software Programming"],
    ["editing_2d", "2D Editing"],
    ["editing_3d", "3D Editing"],
    ["music", "Music production"],
    ["ai_data", "AI & Data"],
    ["hardware_engineering", "Hardware Engineering"],
  ].map(([id, label]) => ({
    id: `pc.${id}`,
    label,
    persona: id === "student",
  })),
};
export const DEVICE_PRIORITIES = [
  [
    "portability",
    "Compactness & Mobility",
    "Kích thước, khối lượng và di chuyển",
  ],
  ["performance", "Performance", "Theo công việc và điều kiện đo"],
  ["strength", "Strength", "Chưa có rubric: giữ trạng thái chưa đánh giá"],
  ["battery", "Battery Endurance", "Thời lượng theo bài đo tương thích"],
  [
    "build_quality",
    "Built quality",
    "Kết cấu và trải nghiệm thao tác có chứng cứ",
  ],
  [
    "upgrade_repair",
    "Upgradability & Repairability",
    "Khả năng nâng cấp và sửa chữa",
  ],
  ["security", "Security", "Khả năng bảo vệ và chính sách hỗ trợ"],
  ["display", "Viewing experience", "Màn hình theo ngữ cảnh sử dụng"],
  ["form_factor", "Form factors", "2-in-1, Foldable hoặc Classics"],
  ["operating_system", "OS", "Hệ điều hành bắt buộc hoặc ưu tiên"],
].map(([id, label, description]) => ({ id, label, description }));
export const OS_OPTIONS: Record<Category, string[]> = {
  Phone: ["Android", "iOS"],
  Tablet: ["Android", "iPadOS", "Windows"],
  PC: ["Windows", "macOS", "Linux", "ChromeOS"],
};
export const FORM_OPTIONS: Record<Category, string[]> = {
  Phone: ["Classics", "Foldable"],
  Tablet: ["Classics", "2-in-1"],
  PC: ["Classics", "2-in-1"],
};
export type Answer = {
  value: string;
  origin: "FORM" | "USER_TEXT";
  confirmed: boolean;
};
export type DeviceProfile = {
  schema: 1;
  taxonomyVersion: string;
  sessionId: string;
  revision: number;
  confirmed: boolean;
  category: Category | null;
  pcType: "LAPTOP" | "DESKTOP";
  purposes: string[];
  priorities: string[];
  bandId: string | null;
  targetVnd: number | null;
  ceilingVnd: number | null;
  accessoriesVnd: number | null;
  condition: "new" | "used";
  warranty: string;
  answers: Record<string, Answer>;
  provenance?: Record<
    string,
    { origin: "FORM" | "USER_TEXT"; confirmed: boolean; evidence?: string }
  >;
  minimumRamGiB: number | null;
  minimumStorageGiB?: number | null;
  os: string | null;
  osMandatory: boolean;
  formFactor: string | null;
  formMandatory: boolean;
};
export function newProfile(): DeviceProfile {
  return {
    schema: 1,
    taxonomyVersion: TAXONOMY_VERSION,
    sessionId: `advisor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    revision: 0,
    confirmed: false,
    category: null,
    pcType: "LAPTOP",
    purposes: [],
    priorities: [],
    bandId: null,
    targetVnd: null,
    ceilingVnd: null,
    accessoriesVnd: 0,
    condition: "new",
    warranty: "UNKNOWN",
    answers: {},
    provenance: {},
    minimumRamGiB: null,
    os: null,
    osMandatory: false,
    formFactor: null,
    formMandatory: false,
  };
}
export function bands(category: Category) {
  const bounds = category === "PC" ? [0, 16, 32, 62, 92] : [0, 8, 16, 24, 32];
  return bounds.map((v, i) => ({
    id: `${category === "PC" ? "pc" : "phone_tablet"}_vn_v1_tier_${i + 1}`,
    min: v * 1000000,
    max: i === 4 ? null : bounds[i + 1] * 1000000,
  }));
}
export function changeCategory(
  p: DeviceProfile,
  category: Category,
): DeviceProfile {
  if (p.category === category) return p;
  return {
    ...p,
    category,
    purposes: [],
    priorities: [],
    bandId: null,
    answers: {},
    os: null,
    formFactor: null,
    osMandatory: false,
    formMandatory: false,
    minimumRamGiB: null,
    confirmed: false,
    revision: p.revision + 1,
  };
}
export function setPurposes(p: DeviceProfile, ids: string[]): DeviceProfile {
  const allowed = new Set(ids);
  return {
    ...p,
    purposes: ids,
    answers: Object.fromEntries(
      Object.entries(p.answers).filter(([key]) => allowed.has(key)),
    ),
    confirmed: false,
  };
}
export function reorder<T>(items: T[], index: number, direction: -1 | 1) {
  const next = [...items],
    target = index + direction;
  if (target >= 0 && target < items.length)
    [next[index], next[target]] = [next[target], next[index]];
  return next;
}
const QUESTIONS: Record<string, string> = {
  "phone.student": "Bạn dùng ứng dụng học tập nào, liên lạc hay chụp tài liệu?",
  "phone.elderly": "Bạn cần cỡ chữ, âm lượng và thao tác như thế nào?",
  "phone.creator": "Bạn tạo ảnh/video bằng ứng dụng nào, ở độ phân giải nào?",
  "phone.business": "Ứng dụng, tài khoản công việc hoặc bảo mật nào bắt buộc?",
  "phone.basic": "Bạn cần gọi, nhắn tin, bản đồ hoặc ứng dụng nào?",
  "phone.gaming": "Bạn chơi game gì, bao lâu và muốn mức đồ họa nào?",
  "tablet.basic": "Bạn cần dùng ứng dụng nào trên tablet?",
  "tablet.reading": "Bạn đọc sách/tài liệu loại gì, trong môi trường nào?",
  "tablet.media": "Bạn xem nội dung gì, có yêu cầu DRM hoặc màn hình không?",
  "tablet.student": "Bạn học bằng ứng dụng nào, có cần bút và bàn phím?",
  "tablet.design": "Ứng dụng thiết kế nào bắt buộc, có cần bút hoặc bàn phím?",
  "pc.student": "Bạn cần học và chạy những ứng dụng nào?",
  "pc.basic": "Bạn cần làm những việc cơ bản nào?",
  "pc.development": "Công cụ, ngôn ngữ, build hoặc máy ảo nào bắt buộc?",
  "pc.editing_2d": "Ứng dụng, loại ảnh và kích thước dự án 2D?",
  "pc.editing_3d": "Ứng dụng 3D, renderer và kích thước cảnh?",
  "pc.music": "DAW, plugin và giao tiếp âm thanh nào bắt buộc?",
  "pc.ai_data":
    "Bạn gọi API, chạy inference hay training; framework và dữ liệu nào?",
  "pc.hardware_engineering":
    "Phần mềm, board, debugger, driver và cổng nào bắt buộc?",
};
export function questions(p: DeviceProfile) {
  return p.purposes.map((id) => ({
    id,
    prompt: QUESTIONS[id],
    why: "Câu trả lời giúp kiểm tra ứng dụng, tương thích và chi phí; không suy cấu hình chỉ từ nghề nghiệp.",
  }));
}
export function profileErrors(p: DeviceProfile, requireConfirmed = false) {
  const errors: string[] = [];
  if (!p || p.schema !== 1 || p.taxonomyVersion !== TAXONOMY_VERSION)
    return ["Phiên bản hồ sơ chưa được hỗ trợ."];
  if (!p.category || !CATEGORIES.includes(p.category))
    return ["Chọn loại thiết bị."];
  if (
    p.purposes.length !== 3 ||
    new Set(p.purposes).size !== 3 ||
    p.purposes.some((id) => !PURPOSES[p.category!].some((x) => x.id === id))
  )
    errors.push("Chọn đúng ba mục đích hợp lệ theo thứ tự.");
  if (
    p.priorities.length !== 3 ||
    new Set(p.priorities).size !== 3 ||
    p.priorities.some((id) => !DEVICE_PRIORITIES.some((x) => x.id === id))
  )
    errors.push("Chọn đúng ba ưu tiên hợp lệ theo thứ tự.");
  if (!bands(p.category).some((b) => b.id === p.bandId))
    errors.push("Chọn khoảng giá.");
  const money = (n: unknown) =>
    typeof n === "number" && Number.isSafeInteger(n) && n >= 0;
  if (!money(p.ceilingVnd) || p.ceilingVnd === 0)
    errors.push("Xác nhận trần tổng chi tiêu.");
  if (
    p.targetVnd !== null &&
    p.ceilingVnd !== null &&
    p.targetVnd > p.ceilingVnd
  )
    errors.push("Mức mong muốn vượt trần tổng chi tiêu.");
  if (p.targetVnd !== null && !money(p.targetVnd))
    errors.push("Mức mong muốn không hợp lệ.");
  if (p.accessoriesVnd !== null && !money(p.accessoriesVnd))
    errors.push("Chi phí phụ kiện không hợp lệ.");
  if (
    p.minimumRamGiB !== null &&
    (!money(p.minimumRamGiB) || p.minimumRamGiB === 0)
  )
    errors.push("RAM tối thiểu không hợp lệ.");
  if (!["new", "used"].includes(p.condition))
    errors.push("Điều kiện máy không hợp lệ.");
  if (p.minimumStorageGiB != null && (!money(p.minimumStorageGiB) || p.minimumStorageGiB === 0))
    errors.push("Lưu trữ tối thiểu không hợp lệ.");
  if (
    p.priorities.includes("operating_system") &&
    (!p.os || !OS_OPTIONS[p.category].includes(p.os))
  )
    errors.push("Chọn hệ điều hành và tính bắt buộc/ưu tiên.");
  if (
    p.priorities.includes("form_factor") &&
    (!p.formFactor || !FORM_OPTIONS[p.category].includes(p.formFactor))
  )
    errors.push("Chọn kiểu dáng và tính bắt buộc/ưu tiên.");
  if (p.os && !OS_OPTIONS[p.category].includes(p.os))
    errors.push("OS không phù hợp loại thiết bị.");
  if (p.formFactor && !FORM_OPTIONS[p.category].includes(p.formFactor))
    errors.push("Kiểu dáng không phù hợp loại thiết bị.");
  if (questions(p).some((q) => !p.answers[q.id]?.value.trim()))
    errors.push("Trả lời các câu hỏi hoặc chọn Chưa biết.");
  if (!["UNKNOWN", "12", "24"].includes(p.warranty))
    errors.push("Bảo hành không hợp lệ.");
  if (questions(p).some((q) => p.answers[q.id] && !p.answers[q.id].confirmed))
    errors.push("Xác nhận câu trả lời làm rõ.");
  if (requireConfirmed && !p.confirmed)
    errors.push("Hồ sơ chưa được xác nhận.");
  return errors;
}
export function validateRestoredProfile(value: unknown): DeviceProfile {
  const p = value as DeviceProfile;
  if (
    !p ||
    p.schema !== 1 ||
    typeof p.sessionId !== "string" ||
    !Number.isSafeInteger(p.revision) ||
    !Array.isArray(p.purposes) ||
    !Array.isArray(p.priorities) ||
    [...p.purposes, ...p.priorities].some((id) => typeof id !== "string") ||
    typeof p.confirmed !== "boolean" ||
    typeof p.osMandatory !== "boolean" ||
    typeof p.formMandatory !== "boolean" ||
    !["UNKNOWN", "12", "24"].includes(p.warranty) ||
    !["new", "used"].includes(p.condition) ||
    [p.ceilingVnd, p.targetVnd, p.accessoriesVnd, p.minimumRamGiB].some(
      (n) => n !== null && (!Number.isSafeInteger(n) || n! < 0),
    ) ||
    (p.minimumStorageGiB != null && (!Number.isSafeInteger(p.minimumStorageGiB) || p.minimumStorageGiB <= 0)) ||
    (p.os !== null && typeof p.os !== "string") ||
    (p.formFactor !== null && typeof p.formFactor !== "string") ||
    !p.answers ||
    typeof p.answers !== "object"
  )
    throw Error("Hồ sơ lưu không hợp lệ. Dữ liệu gốc được giữ.");
  if (
    p.taxonomyVersion !== TAXONOMY_VERSION ||
    (p.category !== null && !CATEGORIES.includes(p.category)) ||
    !["LAPTOP", "DESKTOP"].includes(p.pcType) ||
    Object.values(p.answers).some(
      (a) =>
        !a ||
        typeof a.value !== "string" ||
        typeof a.confirmed !== "boolean" ||
        !["FORM", "USER_TEXT"].includes(a.origin),
    )
  )
    throw Error("Hồ sơ không tương thích; dữ liệu gốc được giữ.");
  if (p.confirmed && profileErrors(p, true).length)
    throw Error("Hồ sơ đã lưu cần kiểm tra lại.");
  return p;
}
export type TextProposal = {
  sessionId: string;
  baseRevision: number;
  ceilingVnd?: number;
  category?: Category;
  evidence: string;
};
export function parseDeviceText(text: string, p: DeviceProfile): TextProposal {
  if (text.length > 2000) throw Error("Nội dung quá dài.");
  const lower = text.toLowerCase();
  const found: Category[] = [];
  if (lower.includes("điện thoại") || /\bphone\b/i.test(text))
    found.push("Phone");
  if (/\b(tablet|ipad)\b/i.test(text)) found.push("Tablet");
  if (lower.includes("máy tính") || /\b(pc|laptop)\b/i.test(text))
    found.push("PC");
  if (found.length > 1 || /(không (?:cần|muốn|mua)|đừng mua)/iu.test(text))
    throw Error("Loại thiết bị chưa rõ; hãy chọn ở biểu mẫu.");
  const category = found[0];
  const m = /(?:tối đa|không quá)\s*(\d+(?:[.,]\d+)?)\s*triệu/giu;
  const matches = [...text.matchAll(m)];
  if (matches.length > 1) throw Error("Có nhiều trần tiền; hãy làm rõ.");
  const ceilingVnd = matches.length
    ? Number(matches[0][1].replace(",", ".")) * 1000000
    : undefined;
  if (
    ceilingVnd !== undefined &&
    (!Number.isSafeInteger(ceilingVnd) || ceilingVnd <= 0)
  )
    throw Error("Trần tiền không hợp lệ.");
  if (!category && ceilingVnd === undefined)
    throw Error(
      "Hãy dùng biểu mẫu hoặc ghi rõ loại thiết bị và “tối đa … triệu”.",
    );
  return {
    sessionId: p.sessionId,
    baseRevision: p.revision,
    ceilingVnd,
    category,
    evidence: text,
  };
}
export function applyDeviceText(p: DeviceProfile, proposal: TextProposal) {
  if (
    p.sessionId !== proposal.sessionId ||
    p.revision !== proposal.baseRevision
  )
    throw Error("Đề xuất đã cũ.");
  const next = proposal.category ? changeCategory(p, proposal.category) : p;
  return {
    ...next,
    ...(proposal.ceilingVnd === undefined
      ? {}
      : { ceilingVnd: proposal.ceilingVnd }),
    provenance: {
      ...next.provenance,
      ...(proposal.category
        ? {
            category: {
              origin: "USER_TEXT" as const,
              confirmed: false,
              evidence: proposal.evidence,
            },
          }
        : {}),
      ...(proposal.ceilingVnd === undefined
        ? {}
        : {
            ceilingVnd: {
              origin: "USER_TEXT" as const,
              confirmed: false,
              evidence: proposal.evidence,
            },
          }),
    },
    revision: p.revision + 1,
    confirmed: false,
  };
}
