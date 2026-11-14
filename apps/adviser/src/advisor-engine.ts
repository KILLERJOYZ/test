import { PURPOSES } from "./device-profile.ts";
/** Deterministic recommendation core adapted from Device Advisor §§5–9/14.
 * All utilities and compatibility passes require supplied evidence; no model verdicts.
 */
export const RULE_VERSION = "advisor-rules-2";
export const SCORING_VERSION = "advisor-utility-intervals-2";
export type Verdict = "PASS" | "FAIL" | "UNKNOWN";
export type Dimension =
  | "portability"
  | "performance"
  | "battery"
  | "display"
  | "repair"
  | "value"
  | "strength"
  | "build_quality"
  | "security"
  | "form_factor"
  | "operating_system"
  | "upgrade";
export type EvidenceValue = { value: number; evidenceId: string };
export type AdvisorConstraints = {
  minimumRamGiB?: number;
  minimumStorageGiB?: number;
  mandatoryFormFactor?: string;
  minimumWarrantyMonths?: number;
  mandatoryOS?: string;
  requiredAccessoriesVnd?: number | null;
};
export type Requirement = {
  revision: number;
  confirmed: boolean;
  category: string;
  market: string;
  currency: string;
  ceiling: number | null;
  purposes: string[];
  priorities: string[];
  constraints: AdvisorConstraints;
  workloads: string[];
  condition?: "new" | "used";
  notApplicable?: Dimension[];
};
export type Candidate = {
  id: string;
  variantId: string;
  category: string;
  market: string;
  condition: string | null;
  currency: string;
  price: number | null;
  shipping: number | null;
  fees: number | null;
  accessories: number | null;
  discount: { value: number; eligible: boolean | null } | null;
  ramGiB: number | null;
  storageGiB?: number | null;
  os: string | null;
  stock: boolean | null;
  observedAt: string;
  workloadEvidence: Record<string, { supported: boolean; evidenceId: string }>;
  utilities: Partial<Record<Dimension, EvidenceValue>>;
  factPrefix: string;
  formFactor?: string | null;
  warrantyMonths?: number | null;
};
export type Check = {
  code: string;
  state: Verdict;
  evidenceIds: string[];
  message: string;
};
export type Assessed = {
  candidate: Candidate;
  eligibility: Verdict;
  checks: Check[];
  total: number | null;
  knownSubtotal: number | null;
  scoreLower: number;
  scoreUpper: number;
  evidenceCoverage: number;
  reasons: Check[];
  tradeoffs: Check[];
};
const safe = (n: unknown): n is number =>
  typeof n === "number" && Number.isSafeInteger(n) && n >= 0;
export function purchaseCost(c: Candidate) {
  const values = [c.price, c.shipping, c.fees, c.accessories];
  if (
    values.some((n) => n !== null && !safe(n)) ||
    c.price === 0 ||
    (c.discount &&
      (!safe(c.discount.value) ||
        (c.price !== null && c.discount.value > c.price)))
  )
    return { total: null, knownSubtotal: null, invalid: true };
  const discount = c.discount?.eligible === true ? c.discount.value : 0;
  const subtotal =
    values.reduce<number>((sum, n) => sum + (n ?? 0), 0) - discount;
  if (!Number.isSafeInteger(subtotal) || subtotal < 0)
    return { total: null, knownSubtotal: null, invalid: true };
  return {
    total: values.every((n) => n !== null) ? subtotal : null,
    knownSubtotal: subtotal,
    invalid: false,
  };
}
const purposeDimensions: Record<string, Partial<Record<Dimension, number>>> = {
  study: { portability: 0.4, display: 0.3, battery: 0.3 },
  code: { performance: 0.7, repair: 0.3 },
  creative: { performance: 0.6, display: 0.4 },
  vm: { performance: 1 },
};
for (const list of Object.values(PURPOSES))
  for (const p of list)
    purposeDimensions[p.id] =
      p.id.includes("gaming") ||
      p.id.includes("ai_data") ||
      p.id.includes("editing_3d")
        ? { performance: 1 }
        : p.id.includes("reading") || p.id.includes("media")
          ? { display: 0.6, battery: 0.4 }
          : p.id.includes("development") || p.id.includes("engineering")
            ? { performance: 0.7, repair: 0.3 }
            : p.id.includes("design") ||
                p.id.includes("editing_2d") ||
                p.id.includes("creator")
              ? { display: 0.5, performance: 0.5 }
              : { portability: 0.3, performance: 0.3, display: 0.4 };
const priorityDimensions: Record<string, Dimension> = {
  strength: "strength",
  build_quality: "build_quality",
  security: "security",
  form_factor: "form_factor",
  operating_system: "operating_system",
  portable: "portability",
  portability: "portability",
  power: "performance",
  performance: "performance",
  value: "value",
  battery: "battery",
  display: "display",
  upgrade_repair: "repair",
};
export function dimensionWeights(purposes: string[], priorities: string[]) {
  const combined: Partial<Record<Dimension, number>> = {};
  const ranked = [0.5, 0.3, 0.2];
  const add = (d: Dimension, n: number) => {
    combined[d] = (combined[d] ?? 0) + n;
  };
  const p = purposes.filter((id) => purposeDimensions[id]),
    q = priorities.filter((id) => priorityDimensions[id]);
  const ps = ranked.slice(0, p.length).reduce((a, b) => a + b, 0),
    qs = ranked.slice(0, q.length).reduce((a, b) => a + b, 0);
  p.slice(0, 3).forEach((id, i) =>
    Object.entries(purposeDimensions[id]).forEach(([d, n]) =>
      add(d as Dimension, ((0.6 * ranked[i]) / ps) * n),
    ),
  );
  q.slice(0, 3).forEach((id, i) =>
    id === "upgrade_repair"
      ? (add("upgrade", (0.2 * ranked[i]) / qs),
        add("repair", (0.2 * ranked[i]) / qs))
      : add(priorityDimensions[id], (0.4 * ranked[i]) / qs),
  );
  const sum = Object.values(combined).reduce((a, b) => a + b, 0);
  return Object.fromEntries(
    Object.entries(combined).map(([d, w]) => [d, w / sum]),
  ) as Partial<Record<Dimension, number>>;
}
export function applicableWeights(r: Requirement) {
  const weights = dimensionWeights(r.purposes, r.priorities);
  for (const d of r.notApplicable ?? []) delete weights[d];
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  if (sum)
    for (const d of Object.keys(weights) as Dimension[])
      weights[d] = weights[d]! / sum;
  return weights;
}
export function requirementErrors(r: Requirement) {
  const errors: string[] = [];
  if (!r.confirmed) errors.push("Xác nhận nhu cầu trước khi kết luận phù hợp.");
  if (!safe(r.ceiling) || r.ceiling === 0)
    errors.push("Cần trần chi tiêu hợp lệ.");
  if (!Number.isSafeInteger(r.revision) || r.revision < 0)
    errors.push("Phiên nhu cầu không hợp lệ.");
  if (
    !r.purposes.length ||
    r.purposes.length > 3 ||
    new Set(r.purposes).size !== r.purposes.length ||
    r.purposes.some((id) => !purposeDimensions[id])
  )
    errors.push("Mục đích chưa được hỗ trợ hoặc bị trùng.");
  if (
    r.priorities.length > 3 ||
    new Set(r.priorities).size !== r.priorities.length ||
    r.priorities.some((id) => !priorityDimensions[id])
  )
    errors.push("Ưu tiên không hợp lệ.");
  if (
    r.constraints.minimumRamGiB !== undefined &&
    (!safe(r.constraints.minimumRamGiB) || r.constraints.minimumRamGiB === 0)
  )
    errors.push("RAM tối thiểu không hợp lệ.");
  if (r.constraints.minimumStorageGiB !== undefined && (!safe(r.constraints.minimumStorageGiB) || r.constraints.minimumStorageGiB === 0))
    errors.push("Lưu trữ tối thiểu không hợp lệ.");
  if (
    r.constraints.requiredAccessoriesVnd !== undefined &&
    r.constraints.requiredAccessoriesVnd !== null &&
    !safe(r.constraints.requiredAccessoriesVnd)
  )
    errors.push("Chi phí phụ kiện không hợp lệ.");
  if (
    r.constraints.mandatoryOS !== undefined &&
    (!r.constraints.mandatoryOS.trim() || r.constraints.mandatoryOS.length > 80)
  )
    errors.push("OS bắt buộc không hợp lệ.");
  return errors;
}
export function assessCandidate(
  c: Candidate,
  r: Requirement,
  now: number,
): Assessed {
  const checks: Check[] = [];
  const add = (
    code: string,
    state: Verdict,
    message: string,
    evidenceIds = [`${c.factPrefix}:${code}`],
  ) => checks.push({ code, state, message, evidenceIds });
  add(
    "CATEGORY",
    c.category === r.category ? "PASS" : "FAIL",
    "Loại thiết bị phải khớp nhu cầu.",
  );
  add(
    "MARKET",
    c.market === r.market ? "PASS" : "FAIL",
    "Thị trường phải khớp.",
  );
  add(
    "CONDITION",
    c.condition === null
      ? "UNKNOWN"
      : c.condition === (r.condition ?? "new")
        ? "PASS"
        : "FAIL",
    `Điều kiện máy yêu cầu: ${r.condition ?? "new"}.`,
  );
  add(
    "CURRENCY",
    c.currency === r.currency ? "PASS" : "FAIL",
    "Tiền tệ của giá phải khớp ngân sách.",
  );
  const cost = purchaseCost(c);
  add(
    "COST_VALID",
    cost.invalid ? "FAIL" : "PASS",
    cost.invalid
      ? "Chi phí âm, sai kiểu hoặc bị tràn."
      : "Các chi phí đã biết hợp lệ.",
  );
  add(
    "BUDGET",
    !safe(r.ceiling) || r.ceiling === 0
      ? "UNKNOWN"
      : cost.knownSubtotal !== null && cost.knownSubtotal > r.ceiling
        ? "FAIL"
        : cost.total === null
          ? "UNKNOWN"
          : "PASS",
    cost.total === null
      ? "Chưa đủ phí giao hàng/phí bắt buộc để kết luận tổng trong trần."
      : cost.total > r.ceiling!
        ? "Tổng chi phí vượt trần đã xác nhận."
        : "Tổng chi phí trong trần đã xác nhận.",
  );
  const timestamp = Date.parse(c.observedAt),
    fresh =
      Number.isFinite(timestamp) &&
      timestamp <= now &&
      now - timestamp <= 24 * 60 * 60 * 1000;
  add(
    "FRESHNESS",
    fresh ? "PASS" : "UNKNOWN",
    fresh
      ? "Quan sát nằm trong cửa sổ tham chiếu 24 giờ."
      : "Quan sát cũ, tương lai hoặc sai ngày; cần kiểm tra lại giá/tồn kho.",
  );
  add(
    "STOCK",
    c.stock === false ? "FAIL" : c.stock === true && fresh ? "PASS" : "UNKNOWN",
    "Tồn kho cần có quan sát còn hiệu lực.",
  );
  const storage = r.constraints.minimumStorageGiB;
  if (storage !== undefined)
    add("STORAGE", c.storageGiB == null ? "UNKNOWN" : c.storageGiB >= storage ? "PASS" : "FAIL",
      `Lưu trữ tối thiểu ${storage} GB; nguồn ghi ${c.storageGiB ?? "chưa rõ"}.`);
  const min = r.constraints.minimumRamGiB;
  if (min !== undefined)
    add(
      "RAM",
      c.ramGiB === null ? "UNKNOWN" : c.ramGiB >= min ? "PASS" : "FAIL",
      c.ramGiB === null
        ? "Chưa có RAM được xác định."
        : `RAM ${c.ramGiB} GB; yêu cầu tối thiểu ${min} GB.`,
    );
  const os = r.constraints.mandatoryOS;
  if (os)
    add(
      "OS",
      !c.os
        ? "UNKNOWN"
        : c.os.toLowerCase().includes(os.toLowerCase())
          ? "PASS"
          : "FAIL",
      `OS bắt buộc: ${os}; nguồn ghi ${c.os ?? "chưa rõ"}.`,
    );
  for (const id of r.workloads) {
    const evidence = c.workloadEvidence[id];
    add(
      `WORKLOAD_${id}`,
      !evidence ? "UNKNOWN" : evidence.supported ? "PASS" : "FAIL",
      `Khả năng đáp ứng tác vụ ${id}: ${!evidence ? "chưa có bằng chứng" : evidence.supported ? "có bằng chứng" : "không đạt"}.`,
      evidence ? [evidence.evidenceId] : [],
    );
  }
  if (r.constraints.mandatoryFormFactor)
    add(
      "FORM_FACTOR",
      !c.formFactor
        ? "UNKNOWN"
        : c.formFactor === r.constraints.mandatoryFormFactor
          ? "PASS"
          : "FAIL",
      `Kiểu dáng bắt buộc: ${r.constraints.mandatoryFormFactor}.`,
    );
  if (r.constraints.minimumWarrantyMonths !== undefined)
    add(
      "WARRANTY",
      c.warrantyMonths === null || c.warrantyMonths === undefined
        ? "UNKNOWN"
        : c.warrantyMonths >= r.constraints.minimumWarrantyMonths
          ? "PASS"
          : "FAIL",
      `Bảo hành tối thiểu ${r.constraints.minimumWarrantyMonths} tháng.`,
    );
  const weights = applicableWeights(r);
  let lower = 0,
    upper = 0,
    coverage = 0;
  for (const [key, w] of Object.entries(weights)) {
    const value = c.utilities[key as Dimension];
    if (
      value &&
      value.evidenceId &&
      Number.isFinite(value.value) &&
      value.value >= 0 &&
      value.value <= 1
    ) {
      lower += w * value.value;
      upper += w * value.value;
      coverage += w;
      add(`UTILITY_${key}`, "PASS", `Có dữ liệu cho ưu tiên ${key}.`, [
        value.evidenceId,
      ]);
    } else {
      upper += w;
      add(
        `UTILITY_${key}`,
        "UNKNOWN",
        key === "strength"
          ? "Strength chưa có rubric: UNRATED."
          : `Chưa đủ chứng cứ để chấm ${key}.`,
        [],
      );
    }
  }
  const hard = checks.filter((x) => !x.code.startsWith("UTILITY_"));
  return {
    candidate: c,
    eligibility: hard.some((x) => x.state === "FAIL")
      ? "FAIL"
      : hard.some((x) => x.state === "UNKNOWN")
        ? "UNKNOWN"
        : "PASS",
    checks,
    total: cost.total,
    knownSubtotal: cost.knownSubtotal,
    scoreLower: lower * 100,
    scoreUpper: upper * 100,
    evidenceCoverage: coverage,
    reasons: checks.filter((x) => x.state === "PASS"),
    tradeoffs: checks.filter((x) => x.state !== "PASS"),
  };
}
export function recommendCandidates(
  candidates: Candidate[],
  r: Requirement,
  catalogVersion: string,
  now = Date.now(),
) {
  const errors = requirementErrors(r);
  const runKey = JSON.stringify([
    r.revision,
    catalogVersion,
    RULE_VERSION,
    SCORING_VERSION,
    r,
  ]);
  const weights = applicableWeights(r);
  if (errors.length)
    return {
      state: "needsClarification" as const,
      errors,
      runKey,
      weights,
      assessments: [] as Assessed[],
      qualified: [] as Assessed[],
      verify: [] as Assessed[],
      excluded: [] as Assessed[],
      shortlist: [] as Assessed[],
      exclusions: [] as { code: string; count: number }[],
      compromises: [] as {
        candidateId: string;
        proposedCeiling: number;
        baseRevision: number;
        runKey: string;
        otherBlocks: string[];
      }[],
    };
  if (new Set(candidates.map((c) => c.id)).size !== candidates.length)
    throw Error("Duplicate purchase candidate ID");
  const assessments = candidates.map((c) => assessCandidate(c, r, now));
  const compare = (a: Assessed, b: Assessed) =>
    Number(b.evidenceCoverage >= 0.999999) -
      Number(a.evidenceCoverage >= 0.999999) ||
    b.scoreLower - a.scoreLower ||
    b.evidenceCoverage - a.evidenceCoverage ||
    (a.total ?? a.candidate.price ?? Infinity) -
      (b.total ?? b.candidate.price ?? Infinity) ||
    (Date.parse(b.candidate.observedAt) || 0) -
      (Date.parse(a.candidate.observedAt) || 0) ||
    a.candidate.id.localeCompare(b.candidate.id);
  const qualified = assessments
      .filter((a) => a.eligibility === "PASS")
      .sort(compare),
    verify = assessments
      .filter((a) => a.eligibility === "UNKNOWN")
      .sort(compare),
    excluded = assessments
      .filter((a) => a.eligibility === "FAIL")
      .sort(compare);
  const seen = new Set<string>();
  const shortlist: Assessed[] = [];
  const add = (a: Assessed | undefined) => {
    if (a && !seen.has(a.candidate.variantId) && shortlist.length < 3) {
      seen.add(a.candidate.variantId);
      shortlist.push(a);
    }
  };
  add(qualified[0]);
  const cheapest = [...qualified].sort(
    (a, b) => a.total! - b.total! || compare(a, b),
  )[0];
  if (cheapest && shortlist[0] && cheapest.total! < shortlist[0].total!)
    add(cheapest);
  if ((weights.portability ?? 0) > 0)
    add(
      [...qualified]
        .filter((a) => a.candidate.utilities.portability)
        .sort(
          (a, b) =>
            b.candidate.utilities.portability!.value -
              a.candidate.utilities.portability!.value || compare(a, b),
        )[0],
    );
  qualified.forEach(add);
  const counts = new Map<string, number>();
  excluded.forEach((a) =>
    a.checks
      .filter((c) => c.state === "FAIL")
      .forEach((c) => counts.set(c.code, (counts.get(c.code) ?? 0) + 1)),
  );
  const exclusions = [...counts]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));
  const compromises = excluded
    .filter(
      (a) =>
        a.checks.some((c) => c.code === "BUDGET" && c.state === "FAIL") &&
        a.total !== null,
    )
    .map((a) => ({
      candidateId: a.candidate.id,
      proposedCeiling: a.total!,
      baseRevision: r.revision,
      runKey,
      otherBlocks: a.checks
        .filter(
          (c) =>
            c.code !== "BUDGET" &&
            c.state !== "PASS" &&
            !c.code.startsWith("UTILITY_"),
        )
        .map((c) => c.code),
    }))
    .sort((a, b) => a.proposedCeiling - b.proposedCeiling)
    .slice(0, 3);
  return {
    state: qualified.length
      ? ("qualified" as const)
      : verify.length
        ? ("needsVerification" as const)
        : ("noEligible" as const),
    errors,
    runKey,
    weights,
    assessments,
    qualified,
    verify,
    excluded,
    shortlist,
    exclusions,
    compromises,
  };
}
