# G3 Decision Pack — Lựa Adviser (v0.4.0)

| Document control | Value |
|---|---|
| Date | 13 November 2026 |
| Gate | G3 — Demo supports a production decision (`REVIEW-01`) |
| Governing baseline | [brd.md](../../brd.md) v3.2 · [IMPLEMENTATION_PLAN.md](../planning/IMPLEMENTATION_PLAN.md) v3.2 |
| Prebuild readiness | [14-build-readiness.md](../../research/prebuild/14-build-readiness.md) · [14-production-backlog.json](../../research/prebuild/14-production-backlog.json) |
| Current recommendation | `revise / pending` (all local engineering, audit remediations, and automated checks pass; external empirical inputs remain pending sponsor decision) |

---

## 1. Install Artifacts & Build Configuration

- **Active Application Entry:** [AdviserApp.tsx](../../apps/adviser/src/AdviserApp.tsx) (`vn.lua.adviser`, v0.4.0, Android versionCode 2, minSdk 26 / targetSdk 36)
- **Android Release Artifact:** `apps/adviser/artifacts/lua-adviser-demo.apk` (ARM64 + x86_64; SHA-256 `574b09bad00a5da774968deb3033110a5e8bc024b36e8641649d4c9bb9099fe2`; [manifest](../../apps/adviser/artifacts/lua-adviser-demo.manifest.json))
- **Self-Contained Web Preview:** `apps/adviser/dist/demo.html` (rebuilt and verified with unified `--adviser-*` Material 3 Expressive tokens)
- **Native Evidence Manifest:** [frontend-expressive/manifest.json](../../apps/adviser/verification/frontend-expressive/manifest.json) and [connected-adviser/IMPLEMENTATION.md](../../research/connected-adviser/IMPLEMENTATION.md)

---

## 2. D0 / D1 & Audit Verification Summary

| Verification Suite | Command | Result |
|---|---|---|
| TypeScript & Static Check | `npm --prefix apps/adviser run check` | **Passed** (`0` errors) |
| App & Domain Unit Suite | `npm --prefix apps/adviser test` | **64 / 64 passed** (includes `REAL-01`–`REAL-12`, `EVIDENCE-01`–`02`, `THEME-01`, `NANO-01`–`07`, `STORE-01`–`05`, `CLIENT-01`–`04`, `U06-*`) |
| Connected Service HTTP Suite | `npm --prefix apps/adviser run test:adviser-service` | **11 / 11 passed** (`HTTP-REAL-01`–`07`, `BUDGET-01`–`02`, `PROVIDER-01`–`02`) |
| Web Preview Bundle | `npm --prefix apps/adviser run build` | **Passed** (`dist/demo.html` generated) |
| Prebuild Unit Packs (17 packs) | `python research/prebuild/tools/run_unit_packs.py --all` | **158 / 158 required cases passed** (165 discovered tests, exit `0`) |
| Prebuild Artifact & Hash Validator | `python research/prebuild/tools/validate.py --all` | **Passed** (exit `0`: all `R00`–`R14` input/output/pack hashes fresh and valid) |

---

## 3. Audit Remediations Completed for G3

1. **Reproducible Total Cost & Budget Ceiling (`AC-U05-01`, `BR-04`, `REAL-09`):**
   - Updated [catalog.ts](../../apps/adviser/src/catalog.ts) `assess()` and `facts()` so listings with known `advertisedPrice`, `shipping`, and `fees` compute a reproducible safe-integer `total`, enforce budget ceiling against the full total, and sort by known total before raw advertised price—while preserving `total: null` and explicit unknown labels whenever any fee component is missing.
2. **Sibling Configuration Switching, Budget Ceiling Reference & Observation Age (`AC-U03-01`, `AC-U04-04`, `AC-U05-03`, `REAL-10`, `REAL-11`):**
   - Added `relatedListings()` in [catalog.ts](../../apps/adviser/src/catalog.ts) and surfaced sibling configurations / alternative retailer offers in the detail view of [AdviserApp.tsx](../../apps/adviser/src/AdviserApp.tsx) (`Các phiên bản / nơi bán cùng dòng máy`) so tapping a sibling immediately updates all specs, prices, conflicts, and AI context.
   - Added `budgetUpgradeCandidates()` in [catalog.ts](../../apps/adviser/src/catalog.ts) and surfaced a neutral reference in the no-fit state when configurations are excluded solely by the current budget ceiling (within `+5.000.000 ₫`) without nudging the user to overspend.
   - Added `observationAgeLabel()` in [catalog.ts](../../apps/adviser/src/catalog.ts) to display explicit observation age in days alongside historical price caveats on every listing card.
3. **Material 3 Expressive Token Unification (`AC-UX01`, `AC-UX02`):**
   - Expanded [expressive-theme.ts](../../apps/adviser/src/expressive-theme.ts) with documented `EXPRESSIVE_SPACE`, `EXPRESSIVE_TYPE`, `EXPRESSIVE_ELEVATION`, and `EXPRESSIVE_SHAPE` tokens and applied them across [AdviserApp.tsx](../../apps/adviser/src/AdviserApp.tsx) with `tabular-nums` VND price formatting.
   - Unified [ExpressiveButton.tsx](../../apps/adviser/src/ExpressiveButton.tsx) and [ExpressiveButton.web.tsx](../../apps/adviser/src/ExpressiveButton.web.tsx) with tonal container fills (`c.container` / `c.onContainer`), border emphasis for selected states, and inline `loading` state support (`accessibilityState={{ busy }}`).
   - Removed legacy `--lua-*` purple token imports and hardcoded hex overrides from [web.css](../../apps/adviser/src/web.css) in favor of `--adviser-*` tokens and a Vietnamese-safe system font stack.
4. **Accessibility, Virtualized History & Expanded Layout (`AC-UX04`, `AC-UX05`):**
   - Added `accessibilityRole="tablist"` to the bottom navigation container, `accessibilityLabel` to every tab item and web button, and increased tab label size to `14px` with single-line truncation in [AdviserApp.tsx](../../apps/adviser/src/AdviserApp.tsx).
   - Added 2-column grid adaptation (`numColumns={2}`) on expanded widths (`width >= 840`) and moved `state.saved` rendering into `FlatList` so up to 1,000 saved decisions remain virtualized.
   - Added per-machine screen-reader labels (`Máy 1 (<name>), <field>: <value>`) and `accessibilityRole="alert"` on specification conflict warnings in [ComparisonView.tsx](../../apps/adviser/src/ComparisonView.tsx).
   - Added a 5-second startup recovery timeout, specific budget validation messages, and an actionable empty-state breakdown showing exact exclusion counts by constraint (budget, RAM, storage, OS).
5. **React Lifecycle & State Purity:**
   - Stabilized `refresh` and `cancel` callbacks via refs in polling and `AppState` effects, removed redundant post-fact-check duplication in `ask()`, removed side-effect `setNotice` calls from inside `setSelected` state updaters, and cleaned up JSX formatting in [AdviserApp.tsx](../../apps/adviser/src/AdviserApp.tsx).

---

## 4. Scripted G3 Review Scenario (`T-D10`)

1. **Launch & Guest Discovery (`U01`, `U02`, `U08`):** Open **Lựa · Adviser** without login. Inspect the 70 dated repository listings and explicit observation-date / unknown-total caveats.
2. **Guided Needs Confirmation (`U01`, `BR-02`):** Tap **Điều chỉnh nhu cầu**, test invalid budget inputs (non-numeric, `0`, `> 1.000.000.000 ₫`) to verify inline error recovery, then confirm `25.000.000 ₫`, `RAM ≥ 16 GB`, `Ổ ≥ 512 GB`, and task `Lập trình`.
3. **Conflict & Evidence Inspection (`U03`, `BR-03`, `EVIDENCE-01/02`):** Filter or search listings; inspect a listing with a title/spec discrepancy (`fptshop:1f1dd132e6326e76` or `dienmayxanh:8566430c8f1ff31e`) to verify that conflicted attributes remain unresolved (`chưa xác minh`) rather than passing hard constraints.
4. **Two-Device Comparison (`U04`, `BR-04`):** Select two configurations (`So sánh`), attempt a third selection to verify the 2-item limit notice, and open the **So sánh** tab to review aligned attributes and conflict alerts.
5. **Contextual AI & Fallback (`D1`, `BR-07`, `NFR-06`):** Open a listing detail view, inspect **Gemini Nano · AI trên thiết bị**, verify explicit availability status, checked-fact constraint (`NANO-02`/`03`), and draft-only requirement proposals (`NANO-05`/`07`).
6. **Persistence & Historical Integrity (`U07`, `BR-06`, `BR-11`):** Save a decision from Detail or Comparison, open **Đã lưu**, inspect the immutable historical snapshot, and verify explicit confirmation/cancellation on deletion.

---

## 5. Remaining External Dependencies & Gate Decision Options

Per [14-build-readiness.json](../../research/prebuild/14-build-readiness.json), local engineering automation is `done` (`15/15` tasks), while six external evidence tracks remain open before production publication (`G4`/`G5`):

- `READY-SOURCE` (`P01`–`P03`): Documented retailer source-use permissions and manually audited complete-offer totals.
- `READY-WORKLOAD` (`P04`, `P07`): Independent hardware/workload suitability adjudication.
- `READY-NATIVE` (`P09`): Physical Android phone execution of TalkBack, timing distributions, and on-device AICore Gemini Nano generation.
- `READY-BUYERS` (`P10`): Exploratory buyer comprehension sessions (5 participants target for G3; 12 across cohorts for G4).
- `READY-OPS` (`P11`–`P13`): Named production operations owner, RPO/RTO targets, and cost/rate inputs.
- `READY-AI` (`P08`, `P14`): Live AI evaluation on supported physical hardware / authorized provider or explicit D1 deferral.

### Sponsor Decision Record (G3)

- **Current Status:** `pending`
- **Options for Product Owner / Sponsor:**
  1. **Accept G3 with bounded D1 / physical-device deferral:** Authorize transition to `REAL-01` (source rights and starter catalog audit for G4) while scheduling the 5-person exploratory buyer session and physical AICore phone check.
  2. **Revise / Retest:** Hold at G3 until physical phone AICore inference and exploratory buyer sessions are recorded.
  3. **Stop / Pivot:** Conclude at the current standalone demo artifact.

