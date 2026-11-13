import seed from "./reference-seed.json" with { type: "json" };
import type { Needs } from "./picker.ts";
import {
  assessCandidate,
  recommendCandidates,
  type Candidate,
  type Requirement,
} from "./advisor-engine.ts";
export type Reference = {
  id: string;
  name: string;
  brand: string;
  source: string;
  url: string;
  condition: string;
  availability: string;
  price: number | null;
  ramGiB: number | null;
  storageGiB: number | null;
  weightKg: number | null;
  observedAt: string;
  specs: Record<string, unknown>;
  catalogVersion?: string;
  category?: "phone" | "tablet" | "laptop" | "desktop";
  formFactor?: string;
};
export const referenceSeed = seed as {
  version: string;
  generatedAt: string;
  rows: Reference[];
};
export function referenceRequirement(needs: Needs): Requirement {
  const p = needs.deviceProfile;
  if (p)
    return {
      revision: p.revision,
      confirmed: p.confirmed,
      category:
        p.category === "Phone"
          ? "phone"
          : p.category === "Tablet"
            ? "tablet"
            : p.pcType === "DESKTOP"
              ? "desktop"
              : "laptop",
      market: "VN",
      currency: "VND",
      ceiling: p.ceilingVnd,
      purposes: p.purposes,
      priorities: p.priorities,
      workloads: p.purposes,
      constraints: {
        minimumRamGiB: p.minimumRamGiB ?? undefined,
        mandatoryOS: p.osMandatory ? (p.os ?? undefined) : undefined,
        mandatoryFormFactor: p.formMandatory
          ? (p.formFactor ?? undefined)
          : undefined,
        minimumWarrantyMonths:
          p.warranty === "UNKNOWN" ? undefined : Number(p.warranty),
        requiredAccessoriesVnd: p.accessoriesVnd,
      },
      condition: p.condition,
      notApplicable: [
        ...(p.category === "PC" && p.pcType === "DESKTOP"
          ? (["portability", "battery"] as const)
          : []),
        ...(p.osMandatory ? (["operating_system"] as const) : []),
        ...(p.formMandatory ? (["form_factor"] as const) : []),
      ],
    };
  return {
    revision: needs.revision,
    confirmed: needs.useOrderConfirmed,
    category: "laptop",
    market: "VN",
    currency: "VND",
    ceiling: needs.budget,
    purposes: needs.primaryUseOrder,
    priorities: needs.priorities,
    constraints: needs.advisor ?? {},
    workloads: needs.tasks,
  };
}
export function referenceCandidate(row: Reference, needs: Needs): Candidate {
  const profile = needs.deviceProfile;
  const category = row.category ?? "laptop";
  const low = category === "phone" ? 0.14 : category === "tablet" ? 0.25 : 1,
    high = category === "phone" ? 0.3 : category === "tablet" ? 0.85 : 3;
  const prefix = `${row.catalogVersion ?? referenceSeed.version}:${row.id}`;
  const utility =
    row.weightKg !== null && Number.isFinite(row.weightKg) && row.weightKg > 0
      ? {
          portability: {
            value: Math.max(
              0,
              Math.min(1, (high - row.weightKg) / (high - low)),
            ),
            evidenceId: `${prefix}:weightKg`,
          },
        }
      : {};
  return {
    id: row.id,
    variantId: row.id,
    category,
    market: "VN",
    formFactor: row.formFactor ?? null,
    condition: row.condition === "unknown" ? null : row.condition,
    currency: "VND",
    price: row.price,
    shipping: null,
    fees: null,
    accessories:
      needs.advisor?.requiredAccessoriesVnd === undefined
        ? 0
        : needs.advisor.requiredAccessoriesVnd,
    discount: null,
    ramGiB: row.ramGiB,
    os: typeof row.specs.os === "string" ? row.specs.os : null,
    stock:
      row.availability === "in_stock"
        ? true
        : row.availability === "out_of_stock"
          ? false
          : null,
    observedAt: row.observedAt,
    workloadEvidence: {},
    utilities: {
      ...utility,
      ...(profile?.os &&
      !profile.osMandatory &&
      typeof row.specs.os === "string"
        ? {
            operating_system: {
              value: row.specs.os
                .toLowerCase()
                .includes(profile.os.toLowerCase())
                ? 1
                : 0,
              evidenceId: `${prefix}:os`,
            },
          }
        : {}),
      ...(profile?.formFactor && !profile.formMandatory && row.formFactor
        ? {
            form_factor: {
              value: row.formFactor === profile.formFactor ? 1 : 0,
              evidenceId: `${prefix}:formFactor`,
            },
          }
        : {}),
    },
    factPrefix: prefix,
  };
}
export function recommendationRun(
  rows: Reference[],
  needs: Needs,
  now = Date.now(),
) {
  return recommendCandidates(
    rows.map((row) => referenceCandidate(row, needs)),
    referenceRequirement(needs),
    rows[0]?.catalogVersion ?? referenceSeed.version,
    now,
  );
}
export function referenceAssessment(row: Reference, needs: Needs) {
  const result = assessCandidate(
    referenceCandidate(row, needs),
    referenceRequirement(needs),
    Date.now(),
  );
  return {
    ...result,
    failures: result.checks
      .filter((c) => c.state === "FAIL")
      .map((c) => c.message),
    unknowns: [
      ...result.checks
        .filter((c) => c.state === "UNKNOWN")
        .map((c) => c.message),
      ...(row.ramGiB === null &&
      needs.tasks.some((x) => x === "code" || x === "vm")
        ? ["Chưa xác minh dung lượng RAM."]
        : []),
    ],
    state:
      result.eligibility === "FAIL"
        ? ("excluded" as const)
        : result.eligibility === "PASS"
          ? ("qualified" as const)
          : ("provisional" as const),
  };
}
export function selectReferences(
  rows: Reference[],
  needs: Needs,
  query = "",
  maxWeight = "",
  sort = "fit",
  showAll = false,
) {
  rows = rows.filter(
    (row) =>
      (row.category ?? "laptop") === referenceRequirement(needs).category,
  );
  const run = recommendationRun(rows, needs);
  const shortlistIds = new Set(run.shortlist.map((a) => a.candidate.id));
  const eligible = [
    ...run.shortlist,
    ...run.qualified.filter((a) => !shortlistIds.has(a.candidate.id)),
    ...run.verify,
  ].map((a) => rows.find((r) => r.id === a.candidate.id)!);
  const visible = (showAll ? rows : eligible).filter(
    (r) =>
      `${r.name} ${r.brand} ${r.source} ${r.specs.ram ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!maxWeight ||
        (Number(maxWeight) > 0 &&
          r.weightKg !== null &&
          r.weightKg <= Number(maxWeight))),
  );
  if (sort === "price" || sort === "weight")
    visible.sort(
      (a, b) =>
        (sort === "weight"
          ? (a.weightKg ?? Infinity) - (b.weightKg ?? Infinity)
          : (a.price ?? Infinity) - (b.price ?? Infinity)) ||
        a.id.localeCompare(b.id),
    );
  return { eligible, visible, run };
}
export function referenceUrl(row: Reference) {
  const u = new URL(row.url);
  const host: Record<string, string> = {
    apple: "www.apple.com",
    samsung: "samsungmobilepress.com",
    cellphones: "cellphones.com.vn",
    thegioididong: "www.thegioididong.com",
    dienmayxanh: "www.dienmayxanh.com",
    fptshop: "fptshop.com.vn",
  };
  if (
    u.protocol !== "https:" ||
    u.username ||
    u.password ||
    u.hostname !== host[row.source]
  )
    throw Error("Nguồn liên kết không được hỗ trợ.");
  return u.href;
}
