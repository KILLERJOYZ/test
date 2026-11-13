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
import { DATA_VERSION, POLICY_VERSION, evaluate, taskChecks, validateNeeds } from "./picker.ts";
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
  focusVariantIds?: string[],
): string {
  const allowed = allowedClaims(needs, offers);
  if (!Array.isArray(claims) || claims.length < 1 || claims.length > 5)
    throw Error("Danh sách giải thích không hợp lệ.");
  return claims
    .map((c) => {
      if (focusVariantIds && !focusVariantIds.includes(c?.productId)) throw Error("Mệnh đề ngoài cấu hình đang xem.");
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
export function localExplanation(needs: Needs, offers: Offer[] = OFFERS, focusVariantIds?: string[]) {
  const run = evaluate(needs, undefined, offers);
  return `Giải thích xác định · dữ liệu giả\nTrần được giữ: ${money(needs.budget)}.\n${
    run.errors.join(" ") ||
    (focusVariantIds ? focusVariantIds.map(id => PRODUCTS.find(p=>p.id===id)).filter((p): p is typeof PRODUCTS[number] => !!p) : run.visible.slice(0, 2))
      .map(
        (p) =>
          `${p.name}: ${fit(p,needs,offers).eligible ? money(total(bestOffer(p.id, offers)!)!) : fit(p,needs,offers).reasons.join(" ")}; ${p.limitation}`,
      )
      .join("\n") ||
    "Không có cấu hình đạt mọi điều kiện. Hãy xem lý do loại hoặc tự sửa yêu cầu."
  }\nKhông tự thay ngân sách, tác vụ hoặc giá.`;
}
export async function request(url: string, path: string, payload: unknown, options: RequestOptions = {}) {
  if (!url) throw Error("Chưa cấu hình dịch vụ AI.");
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (options.signal?.aborted) throw Error("Request aborted");
  options.signal?.addEventListener("abort", abort, {once:true});
  const timer = (options.setTimer || setTimeout)(abort, options.timeoutMs ?? 8000);
  try {
    const response = await (options.transport || fetch)(`${url}${path}`, {
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
    if(controller.signal.aborted) throw Error("Request aborted");
    return JSON.parse(raw);
  } finally {
    (options.clearTimer || clearTimeout)(timer);
    options.signal?.removeEventListener("abort", abort);
  }
}
export async function explain(
  url: string,
  text: string,
  needs: Needs,
  offers: Offer[],
  options: RequestOptions = {},
) {
  const result = await request(url, "/demo/advice/explain", {
    text: text.slice(0, 2000),
    needs,
    offers,
    ...(options.context ? {context: options.context} : {}),
  }, options);
  if (options.context && JSON.stringify(result.context)!==JSON.stringify(options.context)) throw Error("Stale request context");
  if (result.profileRevision !== needs.revision || result.mode !== "live")
    throw Error("Phản hồi sai phiên bản hoặc chế độ.");
  return {
    text: renderClaims(result.claims, needs, offers, options.context?.focusVariantIds),
    mode: "AI trực tiếp · mệnh đề đã kiểm tra",
  };
}
export async function interpret(url: string, text: string, needs: Needs, options: RequestOptions = {}) {
  const result = await request(url, "/demo/needs/interpret", {
    text: text.slice(0, 2000),
    needs,
    ...(options.context ? {context:options.context} : {}),
  }, options);
  if (options.context && JSON.stringify(result.context)!==JSON.stringify(options.context)) throw Error("Stale request context");
  if (result.profileRevision !== needs.revision || result.mode !== "live")
    throw Error("Đề xuất sai phiên bản.");
  return validatePatch(result.patch, needs);
}

export type AiContext = {decisionId:string;runId:string;requestId:string;profileRevision:number;catalogVersion:string;rulesVersion:string;offerContextHash:string;focusVariantIds:string[];origin:string};
export type RequestOptions = {context?:AiContext;signal?:AbortSignal;transport?:typeof fetch;timeoutMs?:number;setTimer?:any;clearTimer?:any};
// Canonical immutable evidence token, compared exactly; contains no private credentials.
export function offerContext(offers:Offer[]) {return JSON.stringify([...offers].sort((a,b)=>a.id.localeCompare(b.id)));}
export function makeAiContext(needs:Needs,offers:Offer[],requestId:string,focusVariantIds:string[],origin:string,decisionId="local-current"):AiContext {return {decisionId,runId:decisionId+":"+needs.revision+":"+requestId,requestId,profileRevision:needs.revision,catalogVersion:DATA_VERSION,rulesVersion:POLICY_VERSION,offerContextHash:offerContext(offers),focusVariantIds:[...focusVariantIds],origin};}
export function aiContextCurrent(context:AiContext,needs:Needs,offers:Offer[],requestId:string){return context.requestId===requestId&&context.profileRevision===needs.revision&&context.catalogVersion===DATA_VERSION&&context.rulesVersion===POLICY_VERSION&&context.offerContextHash===offerContext(offers);}

export function proposeNeeds(current:Needs,patch:NeedsPatch):Needs {
  const checked=validatePatch(patch,current);
  return {...current,...checked,primaryUseOrder:[...checked.primaryUseOrder],additionalRequiredTaskIds:[...checked.additionalRequiredTaskIds],priorities:[...current.priorities],tasks:[...checked.primaryUseOrder,...checked.additionalRequiredTaskIds],useOrderConfirmed:false,revision:current.revision};
}
