# G2 Decision Pack — Deterministic Domain, Flow & Failure Readiness (`DEMO-03`–`DEMO-08`)

| Document control | Value |
|---|---|
| Date | 13 November 2026 |
| Gate | G2 — Deterministic D0 journeys, accessibility & failure handling (`DEMO-03`–`DEMO-08`) |
| Governing baseline | [brd.md](../../brd.md) v3.2 · [IMPLEMENTATION_PLAN.md](../planning/IMPLEMENTATION_PLAN.md) v3.2 |
| Prebuild records | [04-catalog-audit.md](../../research/prebuild/04-catalog-audit.md) · [05-workload-suitability.md](../../research/prebuild/05-workload-suitability.md) · [06-flow-validation.md](../../research/prebuild/06-flow-validation.md) |
| Current status | All deterministic domain, state-machine, and UI/UX regression suites pass (`66/66` app tests, `158/158` prebuild unit pack cases) |

---

## 1. Work Package Completion Summary (`DEMO-03`–`DEMO-08`)

| Package | Deliverable | Verification Evidence |
|---|---|---|
| **DEMO-03** | Runtime schemas (`validCatalog`, `validRequirements`, `validSaved`), 70 dated real listings (`real-catalog.json`), and 12/18/3 synthetic baseline fixtures (`domain.ts`) | `REAL-01`, `REAL-03`, `REAL-05`, `EVIDENCE-01`, `EVIDENCE-02` ([catalog.test.ts](../../apps/adviser/src/catalog.test.ts)) |
| **DEMO-04** | Safe-integer VND arithmetic, reproducible known total (`advertisedPrice + shipping + fees`), hard budget/RAM/storage/OS checks before ordering, and task hardware guidance | `REAL-02`, `REAL-04`, `REAL-09`, `REAL-11`, `REAL-12` ([catalog.test.ts](../../apps/adviser/src/catalog.test.ts)) |
| **DEMO-05** | Android app shell ([AdviserApp.tsx](../../apps/adviser/src/AdviserApp.tsx)), draft-vs-confirmed requirements, profile revision invalidation, search/source filtering, and async cancellation | `REAL-07`, `U06-01`–`U06-08` ([decision-state.test.ts](../../apps/adviser/src/decision-state.test.ts)) |
| **DEMO-06** | Source-bound detail view, sibling configuration switching (`relatedListings`), 2-item paired comparison ([ComparisonView.tsx](../../apps/adviser/src/ComparisonView.tsx)), and budget-headroom reference | `REAL-10`, `REAL-11`, `U06-05`, `U06-13` |
| **DEMO-07** | Serialized local store ([adviser-store.ts](../../apps/adviser/src/adviser-store.ts)), corrupt-read write-lock & raw export recovery, immutable historical snapshots, and explicit delete confirmation | `STORE-01`–`STORE-05`, `REAL-08`, `U06-09`–`U06-15` ([adviser-store.test.ts](../../apps/adviser/src/adviser-store.test.ts)) |
| **DEMO-08** | Named failure states (source outage vs. empty filter vs. no-fit exclusion breakdown), `AC-UX01`–`AC-UX05` compliance, and dual-ABI release APK | [smoke-result.json](../../apps/adviser/verification/frontend-expressive/smoke-result.json) · [configuration-result.json](../../apps/adviser/verification/frontend-expressive/configuration-result.json) |

---

## 2. Deterministic Invariants Verified (`T-D02`–`T-D08`)

1. **Hard Ceiling & Reproducible Total (`BR-02`, `BR-04`, `AC-U05-01`):**
   - Exact budget ceiling passes (`25.000.000 ₫`); `1 ₫` above ceiling (`25.000.001 ₫`) is deterministically excluded (`REAL-02`, `REAL-09`).
   - Missing shipping or fee components keep `total: null` and never fabricate a complete payable total.
2. **Evidence & Title/Spec Conflict Isolation (`BR-03`, `EVIDENCE-01`, `EVIDENCE-02`):**
   - Contradictory RAM (`fptshop:1f1dd132e6326e76`) and storage (`dienmayxanh:8566430c8f1ff31e`) observations are flagged as conflicts (`chưa xác minh`) and cannot satisfy hard constraints or AI fact assertions.
3. **Failure & Outage Separation (`BR-05`, `BR-11`, `NFR-08`):**
   - Network/service failure preserves the last valid catalog and confirmed requirements; corrupt storage blocks writes until the user exports raw data or explicitly resets to initial state (`STORE-01`, `STORE-02`).

---

## 3. Known Issues & Residual Scope

- All in-repo code, domain, and UI/UX findings from [audit-report.md](file:///C:/Users/luken/.gemini/antigravity/brain/ea135e74-54c0-4715-9dc0-30caf52a5c9a/audit-report.md) are resolved.
- External physical-device timing/TalkBack (`P09`) and uncoached buyer comprehension sessions (`P10`) remain tracked in [14-build-readiness.json](../../research/prebuild/14-build-readiness.json).

