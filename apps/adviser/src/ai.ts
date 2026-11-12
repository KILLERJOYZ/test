import {
  PRODUCTS,
  OFFERS,
  TASKS,
  bestOffer,
  fit,
  money,
  total,
} from "./domain.ts";
import type { Offer } from "./domain.ts";
import { DATA_VERSION, evaluate, taskChecks, validateNeeds } from "./picker.ts";
import type { Needs } from "./picker.ts";
export type NeedsPatch = {
  primaryUseOrder: string[];
  additionalRequiredTaskIds: string[];
  budget: number;
  vm: "one" | "many" | "unknown";
  reason: string;
};
export function validatePatch(value: any, current: Needs): NeedsPatch {
  const allowed = [
    "primaryUseOrder",
    "additionalRequiredTaskIds",
    "budget",
    "vm",
    "reason",
  ];
  if (
    !value ||
    Object.keys(value).some((k) => !allowed.includes(k)) ||
    !Array.isArray(value.primaryUseOrder) ||
    !Array.isArray(value.additionalRequiredTaskIds) ||
    !["one", "many", "unknown"].includes(value.vm) ||
    typeof value.reason !== "string" ||
    value.reason.length > 500
  )
    throw Error("Đề xuất chứa trường không được phép.");
  const p = {
    ...current,
    ...value,
    tasks: [...value.primaryUseOrder, ...value.additionalRequiredTaskIds],
    useOrderConfirmed: true,
  };
  // An explicit unknown VM value may be proposed; the review still blocks confirmed fit.
  const errors = validateNeeds(p).filter(
    (e) => !(value.vm === "unknown" && e === "Cần xác nhận quy mô máy ảo."),
  );
  if (errors.length) throw Error(errors.join(" "));
  return value;
}
export type Claim = {
  productId: string;
  kind: "fit" | "limitation" | "unknown";
  factId: string;
};
export function allowedClaims(needs: Needs, offers: Offer[] = OFFERS): Claim[] {
  return PRODUCTS.flatMap((p) => {
    const ok =
      validateNeeds(needs).length === 0 && fit(p, needs, offers).eligible;
    return [
      {
        productId: p.id,
        kind: ok ? "fit" : "unknown",
        factId: `${DATA_VERSION}:${p.id}:verdict`,
      },
      {
        productId: p.id,
        kind: "limitation",
        factId: `${DATA_VERSION}:${p.id}:limitation`,
      },
    ] as Claim[];
  });
}
export function renderClaims(
  claims: any,
  needs: Needs,
  offers: Offer[] = OFFERS,
): string {
  const allowed = allowedClaims(needs, offers);
  if (!Array.isArray(claims) || claims.length < 1 || claims.length > 5)
    throw Error("Danh sách giải thích không hợp lệ.");
  return claims
    .map((c) => {
      if (
        !c ||
        Object.keys(c).some(
          (k) => !["productId", "kind", "factId"].includes(k),
        ) ||
        !allowed.some(
          (a) =>
            a.productId === c.productId &&
            a.kind === c.kind &&
            a.factId === c.factId,
        )
      )
        throw Error("Mệnh đề không khớp bằng chứng hoặc kết luận hiện tại.");
      const p = PRODUCTS.find((p) => p.id === c.productId)!;
      const o = bestOffer(p.id, offers);
      return c.kind === "limitation"
        ? `${p.name}: ${p.limitation}`
        : c.kind === "fit"
          ? `${p.name} đạt các quy tắc tác vụ mô phỏng; tổng ${money(total(o!)!)} nằm trong trần ${money(needs.budget)}. Chưa có kiểm chứng phần cứng thực tế.`
          : `${p.name}: ${fit(p, needs, offers).reasons.join(" ") || "Cần xác nhận hồ sơ trước khi kết luận."}`;
    })
    .join("\n\n");
}
export function localExplanation(needs: Needs, offers: Offer[] = OFFERS) {
  const run = evaluate(needs, undefined, offers);
  return `Giải thích xác định · dữ liệu giả\nTrần được giữ: ${money(needs.budget)}.\n${
    run.errors.join(" ") ||
    PRODUCTS.filter((p) => fit(p, needs, offers).eligible)
      .slice(0, 2)
      .map(
        (p) =>
          `${p.name}: ${money(total(bestOffer(p.id, offers)!)!)}; ${p.limitation}`,
      )
      .join("\n") ||
    "Không có cấu hình đạt mọi điều kiện. Hãy xem lý do loại hoặc tự sửa yêu cầu."
  }\nKhông tự thay ngân sách, tác vụ hoặc giá.`;
}
async function request(url: string, path: string, payload: unknown) {
  if (!url) throw Error("Chưa cấu hình dịch vụ AI.");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${url}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const raw = await response.text();
    if (raw.length > 16000) throw Error("Phản hồi quá lớn.");
    if (!response.ok)
      throw Error(
        response.status === 503
          ? "Nhà cung cấp AI chưa sẵn sàng."
          : `Dịch vụ trả lỗi ${response.status}.`,
      );
    return JSON.parse(raw);
  } finally {
    clearTimeout(timer);
  }
}
export async function explain(
  url: string,
  text: string,
  needs: Needs,
  offers: Offer[],
) {
  const result = await request(url, "/demo/advice/explain", {
    text: text.slice(0, 2000),
    needs,
    offers,
  });
  if (result.profileRevision !== needs.revision || result.mode !== "live")
    throw Error("Phản hồi sai phiên bản hoặc chế độ.");
  return {
    text: renderClaims(result.claims, needs, offers),
    mode: "AI trực tiếp · mệnh đề đã kiểm tra",
  };
}
export async function interpret(url: string, text: string, needs: Needs) {
  const result = await request(url, "/demo/needs/interpret", {
    text: text.slice(0, 2000),
    needs,
  });
  if (result.profileRevision !== needs.revision || result.mode !== "live")
    throw Error("Đề xuất sai phiên bản.");
  return validatePatch(result.patch, needs);
}
