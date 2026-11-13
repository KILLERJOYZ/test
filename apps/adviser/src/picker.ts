import {
  PRODUCTS,
  OFFERS,
  TASKS,
  PRIORITIES,
  total,
  bestOffer,
  fit,
} from "./domain.ts";
import type { Profile, Product, Offer } from "./domain.ts";

export const POLICY_VERSION = "picker-experiment-3-2-1-v2";
export const DATA_VERSION = "synthetic-android-v2";
export type Needs = Profile & {
  primaryUseOrder: string[];
  additionalRequiredTaskIds: string[];
  useOrderConfirmed: boolean;
  revision: number;
  budgetScope: "device-delivered";
};
export type Filters = {
  screenMin: number | null;
  screenMax: number | null;
  maxWeight: number | null;
  sort: "fit" | "price" | "weight";
};
export const EMPTY_FILTERS: Filters = {
  screenMin: null,
  screenMax: null,
  maxWeight: null,
  sort: "fit",
};
export const EMPTY_NEEDS: Needs = {
  budget: 22000000,
  tasks: [],
  priorities: [],
  vm: "unknown",
  primaryUseOrder: [],
  additionalRequiredTaskIds: [],
  useOrderConfirmed: false,
  revision: 0,
  budgetScope: "device-delivered",
};
const ids = new Set(TASKS.map((t) => t.id));
// Numeric fixture attributes are deliberately independent of presentation strings.
export const SCREEN: Record<string, number> = {
  p1: 14,
  p2: 14,
  p3: 15.6,
  p4: 14,
  p5: 16,
  p6: 14,
  p7: 15,
  p8: 15.6,
  p9: 14,
  p10: 16,
  p11: 13.3,
  p12: 16,
};
// Illustrative preference quality, not benchmark measurements or buying advice.
const QUALITY: Record<string, Record<string, number>> = Object.fromEntries(
  PRODUCTS.map((p) => [
    p.id,
    {
      study: Math.max(0, Math.min(1, (1.75 - p.weight) / 0.4)),
      code: Math.min(1, p.ram / 32),
      creative: Math.min(1, p.level / 4),
      vm: Math.min(1, p.ram / 32),
    },
  ]),
);
export function validateNeeds(p: Needs, requireConfirmation = true): string[] {
  const errors: string[] = [];
  if (!Number.isSafeInteger(p.budget) || p.budget <= 0)
    errors.push("Nhập trần ngân sách VND hợp lệ.");
  if (p.primaryUseOrder.length < 1 || p.primaryUseOrder.length > 3)
    errors.push("Chọn từ 1 đến 3 mục đích chính.");
  const all = [...p.primaryUseOrder, ...p.additionalRequiredTaskIds];
  if (new Set(all).size !== all.length || all.some((id) => !ids.has(id)))
    errors.push("Mục đích trùng hoặc chưa được hỗ trợ.");
  if (p.tasks.length !== all.length || all.some((id) => !p.tasks.includes(id)))
    errors.push("Tác vụ không khớp hồ sơ.");
  if (
    p.priorities.length > 2 ||
    new Set(p.priorities).size !== p.priorities.length ||
    p.priorities.some((id) => !PRIORITIES.some((t) => t.id === id))
  )
    errors.push("Chọn tối đa hai ưu tiên hợp lệ.");
  if (all.includes("vm") && p.vm === "unknown")
    errors.push("Cần xác nhận quy mô máy ảo.");
  if (requireConfirmation && !p.useOrderConfirmed)
    errors.push("Xác nhận thứ tự và hồ sơ trước khi xem mức phù hợp.");
  return errors;
}
export function updateTasks(
  p: Needs,
  primary: string[],
  additional: string[],
): Needs {
  const tasks = [...primary, ...additional];
  return {
    ...p,
    primaryUseOrder: primary,
    additionalRequiredTaskIds: additional,
    tasks,
    vm: tasks.includes("vm") ? p.vm : "unknown",
    useOrderConfirmed: false,
  };
}
export function taskChecks(p: Product, needs: Needs) {
  return needs.tasks.map((id) => {
    const unknown = id === "vm" && needs.vm === "unknown";
    const ok =
      id === "code"
        ? p.ram >= 16
        : id === "creative"
          ? p.level >= 3
          : id === "vm"
            ? p.ram >= (needs.vm === "many" ? 32 : 16)
            : true;
    return {
      id,
      state: unknown ? "unknown" : ok ? "pass" : "fail",
      factId: `${DATA_VERSION}:${p.id}:${id}`,
      reason: unknown
        ? "Chưa rõ quy mô"
        : id === "study"
          ? "Quy tắc học tập mẫu"
          : id === "creative"
            ? "Mức cấu hình mẫu ≥ 3"
            : `RAM mẫu ≥ ${id === "vm" && needs.vm === "many" ? 32 : 16} GB`,
    };
  });
}
export function rank(needs: Needs, offers: Offer[] = OFFERS) {
  const score = (p: Product) => {
    const weights = [3, 2, 1];
    const denominator = weights
      .slice(0, needs.primaryUseOrder.length)
      .reduce((a, b) => a + b, 0);
    return (
      needs.primaryUseOrder.reduce(
        (n, id, i) => n + QUALITY[p.id][id] * weights[i],
        0,
      ) / denominator
    );
  };
  const preference = (p: Product) =>
    (needs.priorities.includes("portable") ? -p.weight : 0) +
    (needs.priorities.includes("power") ? p.level / 4 : 0) +
    (needs.priorities.includes("value")
      ? -total(bestOffer(p.id, offers)!)! / 30000000
      : 0);
  return PRODUCTS.filter((p) => fit(p, needs, offers).eligible).sort(
    (a, b) =>
      score(b) - score(a) ||
      preference(b) - preference(a) ||
      total(bestOffer(a.id, offers)!)! - total(bestOffer(b.id, offers)!)! ||
      a.id.localeCompare(b.id),
  );
}
export function evaluate(
  needs: Needs,
  filters: Filters = EMPTY_FILTERS,
  offers: Offer[] = OFFERS,
) {
  const errors = validateNeeds(needs);
  if (errors.length)
    return {
      state: "needsClarification" as const,
      eligible: [] as Product[],
      visible: [] as Product[],
      errors,
    };
  const eligible = rank(needs, offers);
  const visible = eligible.filter(
    (p) =>
      (filters.screenMin === null || SCREEN[p.id] >= filters.screenMin) &&
      (filters.screenMax === null || SCREEN[p.id] <= filters.screenMax) &&
      (filters.maxWeight === null || p.weight <= filters.maxWeight),
  );
  if (filters.sort === "price")
    visible.sort(
      (a, b) =>
        total(bestOffer(a.id, offers)!)! - total(bestOffer(b.id, offers)!)! ||
        a.id.localeCompare(b.id),
    );
  if (filters.sort === "weight")
    visible.sort((a, b) => a.weight - b.weight || a.id.localeCompare(b.id));
  return {
    state: !eligible.length
      ? ("noEligible" as const)
      : !visible.length
        ? ("filterEmpty" as const)
        : ("eligible" as const),
    eligible,
    visible,
    errors,
  };
}
export type Snapshot = {
  id: string;
  name: string;
  needs: Needs;
  productIds: string[];
  savedAt: string;
  datasetVersion: string;
  policyVersion: string;
  observations: {
    productId: string;
    total: number | null;
    seller: string | null;
  }[];
};
export type Store = {
  version: 2;
  needs: Needs;
  saved: Snapshot[];
  dark: boolean;
  offers: Offer[];
  serviceUrl: string;
};
export const INITIAL_STORE: Store = {
  version: 2,
  needs: EMPTY_NEEDS,
  saved: [],
  dark: false,
  offers: OFFERS,
  serviceUrl: "",
};
export function validOffers(value: unknown): value is Offer[] {
  return (
    Array.isArray(value) &&
    value.length === 18 &&
    new Set(value.map((o) => o?.id)).size === 18 &&
    value.every(
      (o) =>
        !!o &&
        OFFERS.some(
          (base) =>
            base.id === o.id &&
            base.productId === o.productId &&
            base.seller === o.seller,
        ) &&
        ["current", "expired", "unavailable"].includes(o.status) &&
        typeof o.eligible === "boolean" &&
        [o.base, o.fee, o.coupon].every(
          (n) => Number.isSafeInteger(n) && n >= 0,
        ) &&
        (o.shipping === null ||
          (Number.isSafeInteger(o.shipping) && o.shipping >= 0)) &&
        o.coupon <= o.base,
    )
  );
}
export function validStoredNeeds(p: any): p is Needs {
  return (
    !!p &&
    Array.isArray(p.tasks) &&
    Array.isArray(p.primaryUseOrder) &&
    Array.isArray(p.additionalRequiredTaskIds) &&
    Array.isArray(p.priorities) &&
    ["unknown", "one", "many"].includes(p.vm) &&
    typeof p.useOrderConfirmed === "boolean" &&
    Number.isSafeInteger(p.revision) &&
    p.revision >= 0 &&
    p.budgetScope === "device-delivered" &&
    Number.isSafeInteger(p.budget) &&
    p.budget > 0 &&
    p.tasks.every((id: string) => ids.has(id)) &&
    p.primaryUseOrder.length <= 3 &&
    p.priorities.length <= 2 &&
    p.priorities.every((id: string) => PRIORITIES.some((t) => t.id === id)) &&
    new Set([...p.primaryUseOrder, ...p.additionalRequiredTaskIds]).size ===
      p.primaryUseOrder.length + p.additionalRequiredTaskIds.length &&
    new Set(p.priorities).size === p.priorities.length &&
    (!p.useOrderConfirmed || validateNeeds(p).length === 0) &&
    new Set(p.tasks).size === p.tasks.length &&
    p.tasks.length ===
      p.primaryUseOrder.length + p.additionalRequiredTaskIds.length &&
    [...p.primaryUseOrder, ...p.additionalRequiredTaskIds].every((id: string) =>
      p.tasks.includes(id),
    )
  );
}
function migrateProfile(p: Profile): Needs {
  if (
    !p ||
    !Array.isArray(p.tasks) ||
    p.tasks.some((id) => !ids.has(id)) ||
    !Number.isSafeInteger(p.budget) ||
    p.budget <= 0 ||
    !Array.isArray(p.priorities) ||
    p.priorities.length > 2 ||
    p.priorities.some((id) => !PRIORITIES.some((t) => t.id === id)) ||
    new Set(p.tasks).size !== p.tasks.length ||
    !["one", "many", "unknown"].includes(p.vm)
  )
    throw Error("Hồ sơ v1 không hợp lệ.");
  return {
    ...p,
    primaryUseOrder: p.tasks.slice(0, 3),
    additionalRequiredTaskIds: p.tasks.slice(3),
    useOrderConfirmed: false,
    revision: 0,
    budgetScope: "device-delivered",
  };
}
export function validSnapshot(d: any): d is Snapshot {
  return !!d && typeof d.id === "string" && d.id.length > 0 &&
    typeof d.name === "string" && d.name.length > 0 &&
    validStoredNeeds(d.needs) &&
    Array.isArray(d.productIds) && d.productIds.length > 0 && d.productIds.length <= 2 &&
    new Set(d.productIds).size === d.productIds.length &&
    d.productIds.every((id: unknown) => typeof id === "string" && PRODUCTS.some(p => p.id === id)) &&
    typeof d.savedAt === "string" && /^\d{4}-\d{2}-\d{2}T/.test(d.savedAt) &&
    Number.isFinite(Date.parse(d.savedAt)) && new Date(d.savedAt).toISOString() === d.savedAt &&
    typeof d.datasetVersion === "string" && d.datasetVersion.length > 0 &&
    typeof d.policyVersion === "string" && d.policyVersion.length > 0 &&
    Array.isArray(d.observations) && d.observations.length === d.productIds.length &&
    new Set(d.observations.map((o: any) => o?.productId)).size === d.observations.length &&
    d.observations.every((o: any) => !!o && d.productIds.includes(o.productId) &&
      (o.total === null || (Number.isSafeInteger(o.total) && o.total >= 0)) &&
      (o.seller === null || typeof o.seller === "string"));
}
export function restore(raw: string): { store: Store; warnings: string[] } {
  const value = JSON.parse(raw);
  const warnings: string[] = [];
  if (value.version === 1) {
    const needs = migrateProfile(value.profile);
    const saved: Snapshot[] = [];
    for (const d of value.saved || [])
      try {
        if (
          !d ||
          typeof d.id !== "string" ||
          typeof d.name !== "string" ||
          !Array.isArray(d.productIds) ||
          d.productIds.some(
            (id: string) => !PRODUCTS.some((p) => p.id === id),
          ) ||
          typeof d.savedAt !== "string"
        )
          throw Error("Invalid legacy decision");
        saved.push({
          id: d.id,
          name: d.name,
          needs: migrateProfile(d.profile),
          productIds: d.productIds,
          savedAt: d.savedAt,
          datasetVersion: d.datasetVersion,
          policyVersion: "legacy-order-unconfirmed",
          observations: d.observations || [],
        });
      } catch {
        warnings.push("Một bản lưu cũ cần phục hồi thủ công.");
      }
    warnings.push(
      "Đã đọc dữ liệu v1. Thứ tự tác vụ cần bạn xác nhận; bản gốc được giữ trong bản sao phục hồi.",
    );
    return {
      store: {
        ...INITIAL_STORE,
        needs,
        saved,
        offers: validOffers(value.offers) ? value.offers : OFFERS,
      },
      warnings,
    };
  }
  if (value.version !== 2)
    throw Error("Phiên bản dữ liệu chưa được hỗ trợ. Bản gốc được giữ nguyên.");
  if (
    !validStoredNeeds(value.needs) ||
    !validOffers(value.offers) ||
    !Array.isArray(value.saved)
  )
    throw Error("Dữ liệu không hợp lệ. Hãy xuất bản gốc trước khi đặt lại.");
  const saved = value.saved.filter((d: any) => {
    const ok = validSnapshot(d);
    if (!ok)
      warnings.push(
        "Một bản lưu hỏng đã được cô lập; bản gốc vẫn có trong bản sao phục hồi.",
      );
    return ok;
  });
  return {
    store: {
      ...value,
      saved,
      dark: !!value.dark,
      serviceUrl: typeof value.serviceUrl === "string" ? value.serviceUrl : "",
    },
    warnings,
  };
}
