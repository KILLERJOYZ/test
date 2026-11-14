# Device Advisor recommendation module


**13 November extension:** the current [full Device Advisor system](./DEVICE_ADVISOR_SYSTEM.md) supersedes the laptop-only scope in the historical implementation note below. The live path accepts all 19 category-specific purposes and ten priorities, mandatory form/warranty/OS/RAM, used/new condition, desktop applicability, real category references and signed SQLite updates. The same deterministic engine drives the shared results, detail, comparison and saved decisions. Current evidence and remaining Nano/source-quality acceptance are recorded separately in the linked document.

Implemented against the supplied `Android_Device_Advisor_Integration_Plan (8).md`, principally §§5–9 and §14, using the current React Native laptop journey and real SQLite reference catalog. This is the deterministic recommendation integration; Nano intake, multi-category data and authenticated remote synchronization retain their separate delivery scope.

## Execution path

SQLite source listings → `referenceCandidate()` / `referenceRequirement()` → `recommendCandidates()` → current results, detail, comparison and saved-decision snapshots. `advisor-engine.ts` contains pure TypeScript contracts and computation. It has no native, network, model or database dependency.

The picker now captures optional explicit minimum RAM, mandatory OS and required accessory cost. These appear in review before confirmation. Empty accessory cost means unknown; zero means none required. A missing required cost cannot become zero. Existing saved profiles without these additions remain readable.

## Contracts implemented

| Specification | Integrated behavior |
|---|---|
| PurchaseCandidate (§8.1) | Exact source configuration/offer identity, body price, shipping, fees, mandatory accessories and explicitly eligible discount; safe integer VND and overflow checks |
| Hard constraints (§8.2) | PASS/FAIL/UNKNOWN checks for category, market, condition, currency, cost validity, full-total budget, freshness, stock, explicit RAM/OS and evidenced workloads |
| Rules/evidence (§8.3) | Fixed typed operators/checks, versioned policy, reason codes and source/evaluation evidence IDs; no downloaded executable rule or model verdict |
| No fit (§8.4) | Ranked exclusion causes; voluntary budget-change exploration for known complete totals; review and confirmation before changing the profile; unresolved other blocks remain visible |
| Ordered weighting (§9.1) | Normalized 0.5/0.3/0.2 rank seeds, task/priority mixture 0.6/0.4, one combined weight per dimension; one/two-item lists normalized |
| Utility/evidence (§9.2–3) | Only supplied, bounded evidence utilities contribute known score. Missing utilities yield lower/upper score bounds and evidence coverage, not an invented average |
| Reproducibility (§9.4) | Profile revision and confirmed fields, catalog, rule and scoring versions in the run key; deterministic score/coverage/cost/date/ID tie-breaks |
| Shortlist (§9.4) | Up to three eligible unique variants; overall, cheaper eligible alternative and portability alternative where evidenced, then remaining eligible candidates. No padding with failed/unknown mandatory candidates |
| Reasons (§9.5/14) | Template-based check outcomes, source IDs, uncertainty and current input context. Validated data owns prices and suitability verdicts |
| Host integration | Same results component before/after intake; grouped qualified/needs-verification/excluded counts, first three records plus more, ranking/price/weight choices, result/evidence export, comparison and historical saved evaluation snapshots |

## Policy and evidence limits

The coefficient values are versioned starting policies from the attachment, not calibrated research findings. Portability maps source weight 1–3 kg to a bounded utility; this is a stated preference anchor, not measured performance. Current source data does not contain reviewed workload compatibility or comparable battery/performance/display/repair utilities, so those dimensions stay unknown. RAM thresholds are no longer inferred as mandatory from occupation/task: only explicit minimum RAM is a hard RAM constraint. The synthetic Demo 1 engine retains its separately labelled fixture rules.

The reference adapter keeps absent shipping/fees unknown, does not silently merge similar retailer names, and does not deduct unconfirmed discounts. Its 24-hour freshness window is a conservative test policy, not a source guarantee. Old or future-dated observations cannot certify current availability. All current real observations therefore may remain in the needs-verification group even though the engine supports fully evidenced candidates. Controlled fixtures test the PASS path without publishing fictional compatibility claims about real products.

Score intervals can overlap. A stable display order does not establish an absolute winner. Coverage describes weighted evidence availability, not confidence or match probability. When coverage is zero the UI suppresses a numeric score and explains the missing evidence. Hard failures cannot be compensated by utility.

Budget proposals are generated only on an explicit exploration action, carry the profile revision, and enter the review screen. The current confirmed profile remains intact until successful persistence. Incomplete-cost reference records do not produce a promised budget-compromise price. Existing typed budget parsing/review and provider fallback remain independent of the recommendation engine.

## Verification

`npm test` includes twelve independent engine tests covering complete/unknown costs, exact ceiling/one-dong boundary, conditional discounts, overflow, hard RAM/OS/workload failures, freshness, score intervals, ordered weights, clarification, shortlist identity, reproducibility and compromise non-mutation. Together with prior suites, 40 tests pass.

`npm run test:demo2` passes 18 component checks including mandatory RAM/OS selections and the shared review/results flow, reference detail, comparison and saved decisions. Native/storage boundaries are mocked in those checks. Database integrity/import rollback remains separately verified by `npm run reference:database`. Installed Android evidence and artifact identity are recorded in `verification/advisor-module-build.json` and its linked native smoke report; no product gate is accepted by a passing software test.

Installed release smoke passed on the task emulator: explicit 32 GB RAM and Windows constraints were selected, reviewed and confirmed; the shared real-reference recommendation and detail screens opened with the engine checks. Raw evidence identifiers are available behind the expandable technical-evidence control. See `verification/advisor-native-results.json`. This is emulator software evidence, not physical-hardware suitability or product acceptance.
