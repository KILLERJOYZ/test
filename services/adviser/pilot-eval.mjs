import {
  assess,
  budgetUpgradeCandidates,
  parseQuotationDraft,
  relatedListings,
  searchCatalog,
  taskGuidance,
  validRequirements,
} from "../../apps/adviser/src/catalog.ts";
import { listingEvidence } from "../../apps/adviser/src/listing-evidence.ts";

export const PILOT_PROFILES = [
  {
    id: "PROF-01-STUDENT-OFFICE",
    cohort: "student_office",
    requirements: {
      budget: 15000000,
      minRam: 8,
      minStorage: 256,
      os: "",
      tasks: ["Văn phòng & học tập"],
    },
    query: "",
    source: "",
  },
  {
    id: "PROF-02-DEV-MAINSTREAM",
    cohort: "developer",
    requirements: {
      budget: 25000000,
      minRam: 16,
      minStorage: 512,
      os: "",
      tasks: ["Lập trình"],
    },
    query: "",
    source: "",
  },
  {
    id: "PROF-03-VM-HEAVY",
    cohort: "virtualization",
    requirements: {
      budget: 35000000,
      minRam: 32,
      minStorage: 512,
      os: "",
      tasks: ["Lập trình", "Máy ảo"],
    },
    query: "",
    source: "",
  },
  {
    id: "PROF-04-DESIGN-CREATIVE",
    cohort: "design",
    requirements: {
      budget: 30000000,
      minRam: 16,
      minStorage: 512,
      os: "",
      tasks: ["Thiết kế"],
    },
    query: "",
    source: "",
  },
  {
    id: "PROF-05-TIGHT-NO-FIT",
    cohort: "no_fit_budget_ceiling",
    requirements: {
      budget: 12000000,
      minRam: 32,
      minStorage: 1024,
      os: "",
      tasks: ["Máy ảo"],
    },
    query: "",
    source: "",
  },
  {
    id: "PROF-06-NEAR-CEILING-UPGRADE",
    cohort: "near_ceiling",
    requirements: {
      budget: 14500000,
      minRam: 16,
      minStorage: 512,
      os: "",
      tasks: ["Lập trình"],
    },
    query: "",
    source: "",
  },
  {
    id: "PROF-07-SOURCE-FILTER-FPTSHOP",
    cohort: "retailer_specific",
    requirements: {
      budget: 25000000,
      minRam: 16,
      minStorage: 512,
      os: "",
      tasks: ["Lập trình"],
    },
    query: "",
    source: "fptshop",
  },
  {
    id: "PROF-08-MACOS-STRICT",
    cohort: "os_specific",
    requirements: {
      budget: 28000000,
      minRam: 16,
      minStorage: 256,
      os: "macOS",
      tasks: ["Lập trình", "Thiết kế"],
    },
    query: "MacBook",
    source: "",
  },
];

export function evaluatePilotSnapshot(catalog, profiles = PILOT_PROFILES) {
  let hardConstraintViolations = 0;
  let unresolvedConflictPromotions = 0;
  const profileResults = [];

  for (const p of profiles) {
    if (!validRequirements(p.requirements)) {
      throw Error(`INVALID_PILOT_PROFILE:${p.id}`);
    }
    const ranked = searchCatalog(
      catalog,
      p.requirements,
      p.query,
      p.source,
      "price",
    );
    const eligible = ranked.filter((x) => x.assessment.state !== "excluded");
    const excluded = ranked.filter((x) => x.assessment.state === "excluded");

    for (const row of eligible) {
      const ev = listingEvidence(row.listing);
      const price = row.assessment.total ?? row.listing.advertisedPrice;
      if (price !== null && price > p.requirements.budget) {
        hardConstraintViolations++;
      }
      if (
        p.requirements.minRam > 0 &&
        ev.ram !== null &&
        ev.ram < p.requirements.minRam
      ) {
        hardConstraintViolations++;
      }
      if (
        p.requirements.minStorage > 0 &&
        ev.storage !== null &&
        ev.storage < p.requirements.minStorage
      ) {
        hardConstraintViolations++;
      }
      if (ev.conflicts.length > 0 && row.assessment.unknown.length === 0) {
        unresolvedConflictPromotions++;
      }
    }

    const withTaskStrengths = eligible.filter(
      (x) => taskGuidance(x.listing, p.requirements).strengths.length > 0,
    );
    const upgrades = budgetUpgradeCandidates(catalog, p.requirements, 5000000);
    const topSiblings =
      eligible.length > 0
        ? relatedListings(catalog, eligible[0].listing).length
        : 0;

    profileResults.push({
      id: p.id,
      cohort: p.cohort,
      totalMatched: ranked.length,
      eligibleCount: eligible.length,
      excludedCount: excluded.length,
      taskStrengthMatchCount: withTaskStrengths.length,
      nearCeilingUpgradeCount: upgrades.length,
      topCandidateSiblingCount: topSiblings,
    });
  }

  const quoteProbe = parseQuotationDraft({
    name: "Laptop Pilot Quotation Probe 16GB/512GB",
    url: "https://thegioididong.com/laptop/pilot-probe",
    advertisedPrice: "19900000",
    shipping: "100000",
    fees: "0",
    ram: "16",
    storage: "512",
    nowIso: "2026-11-13T00:00:00Z",
  });

  return {
    catalogRevision: catalog.revision,
    listingCount: catalog.listings.length,
    profileCount: profiles.length,
    hardConstraintViolations,
    unresolvedConflictPromotions,
    quotationIntakeVerified:
      !!quoteProbe &&
      quoteProbe.recognizedRetailer &&
      assess(quoteProbe.listing, PILOT_PROFILES[1].requirements).total ===
        20000000,
    profiles: profileResults,
  };
}

