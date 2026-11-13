# G5 Decision Pack — Real-Data Journeys, Quotation Intake & Pilot Readiness (`REAL-03`, `REAL-04`, `PILOT-01`)

| Document control | Value |
|---|---|
| Date | 13 November 2026 |
| Gate | G5 — Real-data buyer journeys, U06 quotation intake, recommendation evaluation & pilot review (`REAL-03`, `REAL-04`, `PILOT-01`) |
| Governing baseline | [brd.md](../../brd.md) v3.2 · [IMPLEMENTATION_PLAN.md](../planning/IMPLEMENTATION_PLAN.md) v3.2 |
| Evaluation harness | [pilot-eval.mjs](../../services/adviser/pilot-eval.mjs) · [09-retrieval-ranking-evaluation.md](../../research/prebuild/09-retrieval-ranking-evaluation.md) |
| Current status | Engineering journeys (`U01`–`U08`), `U06` quotation intake, `U08` discrepancy reporting, and fixed-snapshot evaluation (`PILOT-01`) complete and passing |

---

## 1. Real-Data Buyer Journey Coverage (`REAL-03`, `REAL-04`, `T-P01`, `T-P02`)

| Journey | Implemented Behavior in v0.4.0 | Verification |
|---|---|---|
| **U01** Guided Needs | Budget ceiling (integer VND), mandatory RAM/storage/OS, and task selection with draft-vs-confirmed isolation | `REAL-03`, `U06-01`–`U06-03`, native smoke |
| **U02** Shortlist & Search | Deterministic search across 70 real listings, retailer source filter, price/name sort, and exclusion breakdown | `REAL-04`, `REAL-09`, native smoke |
| **U03** Exact Variant Detail | Verified specs vs. title conflict detection (`listingEvidence`), sibling configuration switching (`relatedListings`), and observation age (`observationAgeLabel`) | `REAL-10`, `REAL-11`, `EVIDENCE-01`–`02` |
| **U04** Paired Comparison | Side-by-side 2-device comparison ([ComparisonView.tsx](../../apps/adviser/src/ComparisonView.tsx)) with known total cost, task hardware guidance (`taskGuidance`), and budget-headroom reference (`budgetUpgradeCandidates`) | `REAL-11`, `REAL-12`, native `1200dp` config check |
| **U05** Offer & Retailer Handoff | Reproducible total (`advertisedPrice + shipping + fees`), explicit unknown-fee caveats, and HTTPS-validated external retailer handoff (`safeLink`) | `REAL-02`, `REAL-05`, `REAL-09` |
| **U06** Quotation / Link Intake | **Kiểm tra báo giá ngoài** modal ([AdviserApp.tsx](../../apps/adviser/src/AdviserApp.tsx)) + `parseQuotationDraft()` ([catalog.ts](../../apps/adviser/src/catalog.ts)) supporting 8 allowlisted Vietnamese retailers and manual shop quotes | `REAL-13`, `PILOT-01` |
| **U07** Saved Decisions | Serialized persistence, search/date filtering (`savedQuery`), immutable historical snapshots, raw data export, and explicit deletion confirmation | `REAL-08`, `STORE-01`–`05`, native smoke |
| **U08** Discrepancy Report & Share | Source-dated sharing (`Share.share`) and **Báo sai lệch dữ liệu** (`submitListingReport` → `POST /v1/reports` staff triage queue) | `CLIENT-05`, `GOV-03` |

---

## 2. Fixed-Snapshot Pilot Evaluation (`PILOT-01`, `T-P05`)

Executed via [pilot-eval.mjs](../../services/adviser/pilot-eval.mjs) (`PILOT-01` in [server.test.mjs](../../services/adviser/server.test.mjs)) against the 70-listing repository snapshot (`revision 9c3436ed9013359afc3e5d7e3f38cf265b8318eafecadb954557927bd34ec6e6`):

- **Hard Constraint Violations:** `0` across all 8 buyer cohorts (`student_office`, `developer`, `virtualization`, `design`, `no_fit_budget_ceiling`, `near_ceiling`, `retailer_specific`, `os_specific`).
- **Unresolved Conflict Promotions:** `0` (conflicting title/spec listings never pass as verified).
- **Quotation Intake Probe (`U06`):** Verified allowlisted retailer recognition (`thegioididong`) and reproducible total calculation (`19.900.000 ₫ + 100.000 ₫ = 20.000.000 ₫`).
- **No-Fit & Near-Ceiling Integrity:** Tight no-fit profile (`PROF-05-TIGHT-NO-FIT`) returns `0` false-positive matches while preserving confirmed requirements; near-ceiling profile (`PROF-06-NEAR-CEILING-UPGRADE`) surfaces neutral `+5.000.000 ₫` upgrade references without relaxing the hard cap.

---

## 3. Pilot Launch Checklist & Expansion Gate

Before opening the public pilot or selecting post-G5 expansion items (`E/L` scope such as smartphones, price alerts, or PC component compatibility in [IMPLEMENTATION_PLAN.md](../planning/IMPLEMENTATION_PLAN.md#L218-L221)):
1. Complete G3/G4 external human inputs (`P01` source permissions, `P09` physical AICore phone verification, `P10` 12-buyer cohort sessions, `P12` operating cost sheet).
2. Record sponsor sign-off in [PREBUILD_RESEARCH_TRACKER.json](../planning/PREBUILD_RESEARCH_TRACKER.json) and [project-traceability.json](../planning/project-traceability.json).

