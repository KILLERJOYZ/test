# Artifact contracts for Codex research execution

Version 2.1. Used by [plan](../../docs/planning/PREBUILD_RESEARCH_PLAN.md), [tracker](../../docs/planning/PREBUILD_RESEARCH_TRACKER.json) and [unit-pack catalog](../../docs/planning/PREBUILD_TEST_PACKS.json). This file specifies artifacts to implement; it contains no research findings. Paths are repository-relative.

## 1. Common rules

- R00–R14 research JSON except run-config, evidence index, run records, unit-pack execution reports and OpenAPI uses the envelope below. Specification catalogs and the earlier `flow-review/` diagnostic record have their own schemas; they are not completed R06 artifacts. Reports use the compact Markdown layout below. Tools/source files use their native format.
- Keep raw snapshots unchanged. Store credentials, participant contacts/recordings and confidential agreements outside the repository; reference authorized sanitized evidence only.
- Dates are ISO 8601; observations record timezone. Money is safe integer VND or null. Missing is not zero. Source/dataset/rule/model versions are explicit.
- Every record ID is stable and unique within its artifact. References must resolve. Preserve failed observations and earlier runs.
- Synthetic, inferred and proposed records cannot satisfy real-participant, live-provider, hardware-measurement or source-permission evidence.

~~~json
{
  "schemaVersion": 1,
  "taskId": "R04",
  "inputs": [{"ref": "data/all_laptops_normalized.json", "sha256": "<actual hash>"}],
  "data": {},
  "evidenceRefs": [],
  "gaps": [{"id": "GAP-R04-001", "reason": "Exact identity unresolved", "nextAction": "Check part-number evidence"}]
}
~~~

The example is a schema illustration, not an accepted output. No placeholder hash in executed artifacts.

Markdown report sections: **Conclusion; Observed results; Changes/decisions; Checks; Gaps and next action.** Use counts and references. No repeated project background, invented meetings or staffing prose.

## 2. Run configuration — R00

`research/prebuild/run-config.json`:

~~~text
schemaVersion: 1
runId: unique stable identifier for this execution
timezone: Asia/Saigon
baseline: {commit, inspectedRefs, inputHashes}
scope: {platform, market, category, includedRequirementIds, excludedIds, decisionRefs}
seed: 20261113
corpus: {profileCount:120, development:80, heldout:40, groupCounts}
retrieval: {queryCount:60, development:40, heldout:20, k:10}
ai: {provider, model, keyEnvName, maxRequests:null, maxCostVnd:null,
     authorizationRef:null, priceEvidenceRef:null, spendingMechanism:null}
thresholds: {status:"proposed", coverage:0.80, recallAt10:0.90, usability:0.80}
externalInputs: [{id, status, evidenceRef, nextAction}]
~~~

A non-null provider/model or an environment key alone does not authorize paid calls. Reuse existing session authorization when present; record its reference. Null caps mean live mode is disabled. Store key environment-variable names, never values.

## 3. Evidence index and run records — R00/all tasks

Evidence index:

~~~text
{schemaVersion:1, items:[
  {id, taskId, kind, claim, sourceRef, observedAt, method,
   versions, sampleSize, denominator, limitations, reviewerRef, supports}
]}
kind = observed | historical | synthetic | inferred | proposed | unknown
~~~

`observed` requires an actual source/tool observation. `historical` retains original date/version. `reviewerRef` is null unless actual review exists. A source reference must support the claim; a valid URL alone is insufficient.

Run record at `research/prebuild/runs/<runId>/<taskId>.json`:

~~~text
{schemaVersion:1, runId, taskId, automationStatus, evidenceStatus,
 definitionHash, inputHashes, consumedConfig, consumedEvidenceHashes,
 outputHashes, sharedWrites, decisions, gaps, blocker,
 unitPackResults:[{packId, reportRef, reportHash, definitionHash, testedFileHashes,
                  passedCaseIds, failedCaseIds, skippedCaseIds, notRunCaseIds}], checks:[
  {id, command, cwd, startedAt, finishedAt, exitCode,
   result:"pass|fail|not_run", mode, outputRef, reason}
 ]}
~~~

For `not_run`, exitCode/timestamps may be null and reason is mandatory. Executed checks keep actual exit codes and sanitized logs. Record unavailable controlled/live/device checks separately. Commands and logs cannot expose secrets or private prompts.

Each required unit case must execute and pass; no empty suite, skipped required case, missing case ID or stale source/fixture hash counts as pass. Preserve future dependent packs as `not_run/deferred_owner` until their creators run; they must not introduce backwards task dependencies. Pack reports record actual results and logs, not just a declared case count. Whole manifest hashes are provenance; freshness compares selected pack definitions and consumed files.

`definitionHash` covers the task's steps/dependencies/inputs/outputs/check definitions, excluding runtime status. `consumedConfig` stores the actual configuration keys/values used; `consumedEvidenceHashes` hashes only cited index entries. Do not hash entire shared control files as task inputs: later updates would invalidate unrelated results or the current task itself. `inputHashes` covers consumed ordinary source/data/artifact files; `outputHashes` covers ordinary declared outputs.

The tracker, run-config and evidence index are shared control files. Validate their current structure, but exclude whole-file hashes from individual tasks' output-freshness checks. Record additions/changes in `sharedWrites` by config key or evidence ID; preserve existing values when resuming R00. Later evidence appends must not invalidate R00 merely because its index grew. Consumers still invalidate when the config keys or evidence entries they actually used change.

## 4. R01–R03: empirical evidence and source access

| Artifact | Required data fields | Reject |
|---|---|---|
| 01-buyer-protocol.json | cohorts, targetCount=12, screening, questions, taskEffectByQuestion, consent/retention procedure | Leading prompts that assume AI is the answer |
| 01-buyer-observations.json | collectedCount, participants[], observations[], hypotheses[] | Count differs from real sourced participants; synthetic observations counted as interviews |
| 02-journey-benchmark.json | taskIds, entries[{sourceUrl, observedAt, method, taskId, status, observations, evidenceRefs}], hypotheses | Inaccessible/advertised behavior labelled observed |
| 03-source-register.json | sources[{id, accessRoute, coverage, uses[], cadence, retention, evidenceRefs, unresolved}] | Public page/robots status treated as a production license |

Source use: `{purpose, status:"documented_basis|prohibited|unresolved", evidenceRefs, scope, expiresAt}`. Separate research, storage/history, display/redistribution, images/reviews and AI processing. Unknown permissions remain unresolved.

R01 can have zero participants and complete automation. R02/R03 can record inaccessible sources. Such artifacts cannot independently establish demand, usability or source readiness.

## 5. R04: catalog/offer audit

Required data: `sourceHash, counts, listings[], canonicalCandidates[], reviewQueue[], reviewedCount, rejectedCount, unknownCount`.

Each listing carries source ID/URL, condition, raw/model/SKU identity, missing/invalid fields, original availability, availability basis, observation time and evidence refs. Canonical matches use `accepted|unresolved|rejected`; acceptance requires exact-configuration evidence, not family-name similarity.

Each audited offer carries:
- exact variant candidate and match status;
- `baseVnd, shippingVnd, mandatoryExtraFeesVnd, includedCharges, discountVnd`;
- discount eligibility/stacking and delivery context;
- `knownSubtotalVnd, completeTotalVnd, priceCompleteness`;
- `offerValidity, observedAt, expiresAt, destination, datasetKind, evidenceRefs`.

Null mandatory cost => completeTotalVnd=null. Conditional discount stays separate unless eligibility/stacking is confirmed. Track already-included charges to prevent double counting. A current listing price alone cannot establish current stock.

Audit tests must include source duplication, mixed new/used, absent SKU/CPU/RAM, ambiguous variants, missing shipping, inferred stock, unsafe/negative values and repeat-run consistency. Count actual current input; prior 70-row counts are historical expectations, not hardcoded assertions.

## 6. R05–R06: policy, cases and flow

`05-workload-policy.json`: `rulesVersion, datasetKind, supportedWorkloads, rules[], unknownPolicy, evidenceRefs`. Each rule: `id, applicability, constraintType, expression/threshold, sourceRefs, labelProvenance`. Synthetic capability rules are limited to synthetic mode.

`05-evaluation-cases.json`: `corpusVersion, seed, snapshotHashes, freezeHash, cases[]`. Hash canonical case/partition content with the hash field itself omitted; do not mutate a frozen corpus to record later use.
Each case:
~~~text
{id, primaryGroup, tags, partition, needs, snapshotRef, expected,
 labelProvenance:"synthetic_rule|primary_evidence|independent_review|unknown",
 evidenceRefs, adjudication}
~~~

Counts: 50 ordinary + 20 price/budget + 15 identity/condition + 15 unknown/no-fit + ten freshness + ten revision. Split 80/40, disjoint and stratified. Cases and queries use stable IDs. Expected amounts come from explicit charge inputs; do not call the implementation under test to generate its own expected results. Unreviewed real suitability is unknown.

`06-flow-validation.json`: `buildRef, states[], automatedChecks[], participantSessions[], findings[]`. State: `entry, action, guard, expectedNextState, committedMutation, effects, cancel/back, recovery, sourceSymbol, unitCaseIds, deviceCaseIds`. Finding: `id, evidenceRefs, severity, proposedChange, patchRef, failingRegressionRef, retestRef`. Carry T01–T23 and FLOW-01–08 from the deep review where applicable. Automated walkthroughs and source probes do not count as participant sessions or native verification.

## 7. R07–R08: API and integration contracts

`07-api-contract.json` is OpenAPI 3.1 in JSON format, not the common envelope. Include paths, request/response schemas, component refs and `x-research` metadata with input/evidence refs. `07-contract-examples.json` uses the envelope; include valid/invalid examples and expected error codes. Test both field shape and semantic contradictions.

Minimum domain:
~~~text
Needs: decisionId, profileRevision, confirmed, budgetVnd, budgetScope,
       orderedUses, requiredTasks, hardConstraints, preferences
Variant: variantId, familyId, exactConfiguration, condition, publicationState
Offer: offerId, variantId, matchStatus, sellerId, datasetKind,
       costs, discountEligibility, validity, observedAt, evidenceRefs
Result: runId, decisionId, profileRevision, catalogVersion, rulesVersion,
        offerContextHash, state, candidates[], excluded[], unknowns[]
RequestContext: decisionId, runId, requestId, profileRevision, catalogVersion,
                rulesVersion, offerContextHash, focusVariantIds, origin
Candidate: variantId, fit, offerValidity, priceCompleteness, affordability,
           completeTotalVnd, reasonCodes[], evidenceRefs[]
SavedDecision: schemaVersion, needs, variantIds, historicalConfigurations,
               observations, savedAt, catalogVersion, rulesVersion
~~~

Enums:
- fit: pass/fail/unknown.
- offerValidity: current/stale/expired/unavailable/suspended/unknown.
- priceCompleteness: complete/partial/conditional.
- affordability: within_budget/over_budget/unknown.
- datasetKind: synthetic/crawled_draft/reviewed_research/production.

Required result/error examples: needs_clarification, evidence_unknown, eligible, no_fit, no_verified_affordable_offer, filter_empty, source_unavailable, stale_revision. Names may follow existing conventions only with an explicit mapping. Use the ordered decision table in APP_FLOW_DEEP_RESEARCH.md; distinguish unknown capability from known failure and source outage from an empty successful result.

R08 tests exercise the service/client boundary and saved round-trip: wrong variant, exact budget and one dong less, unknown shipping, expired/withdrawn offer, no-fit versus no-offer, source outage and old revision. Include one evidence update/withdrawal. Record actual storage/index/client implementation; a local adapter is not proof of external database or Android integration.

## 8. R09–R11: evaluation and device outputs

| Artifact | Required data |
|---|---|
| 09-query-cases.json | version, seed, snapshotHashes, partitions, queries with relevance/label provenance |
| 09-retrieval-ranking-results.json | runs by case/arm/partition, inputHash, returned IDs, expected/unknown labels, metric numerators/denominators, latency samples, unavailable arms |
| 09-holdout-usage.json | corpus/config hash, partition, first qualifying run, subsequent diagnostic uses, consumed status and reason; frozen input files remain unchanged |
| 10-ai-evaluation.json | controlledCases, live{status, reason, runs}, provider/model, authorizationRef, request count, actual usage/cost, knownSubtotal and unknown components |
| 11-android-cases.json | buildHash, target matrix, physicalDeviceValidated, cases with result/method/evidence, raw timing samples, limitations |

Metrics must be recomputable. Unknown relevance is excluded from accuracy denominators and counted separately. Compare arms on the same snapshot/hard rules. Keep synthetic invariant performance separate from reviewed real-world usefulness.

AI suite IDs F01–F12 correspond in order to the 12 failures in the plan. Test that absent configuration/cap exhaustion calls no live provider. Live and injected-provider records cannot share a misleading “live passed” flag.

PhysicalDeviceValidated=true requires actual named-phone observations. Historical emulator captures do not qualify. ADB inspection alone cannot pass unperformed journey/accessibility checks. Report sample count and failures with any timing percentile.

## 9. R12–R14: operations, cost and readiness

`12-operations-scenarios.json`: six scenarios with `trigger, authority, expectedTransitions, userState, recoveryCheck, mode, result, evidenceRefs`. Mode: sandbox/tabletop/not_run. Only executed controls establish implemented behavior.

`13-cost-inputs.json`: `currency, datedRates, authorization/quoteRefs, usage, staffEffort, usefulSessionDefinition, scenarios`. Unknown rate/capacity is null.
`13-cost-results.json`: `scenarios, components, knownSubtotal, missingComponents, completeTotal, denominator, costPerUsefulSession`.
No complete total when a required component is unknown; no cost per useful session when denominator is missing/zero; no mixed-currency sum without a dated conversion rate. Count failed/retried calls as incurred usage.

`14-production-backlog.json`: `items[{id, requirementIds, outcome, modules/files, contractChanges, stateChanges, dependsOn, exceptionBehavior, acceptanceCommands/scenarios, evidenceRefs, estimateAssumptions, scopeStatus}]`. Scope status: proposed/accepted/deferred. Accepted needs an applicable decision ref.

`14-build-readiness.json`:
~~~text
{automationSummary, researchQuestions[], gaps[], criticalIssues[],
 gates:[{id, checklist, recommendation, decision, decisionRef, scope}],
 nextRunnableTask, externalInputs, resumeCommand}
~~~

Prepare the proposed backlog before requesting approval. G3/G4 acceptance needs an actual applicable decision and sufficient scoped evidence. Pending external evidence is not erased by completed automation. A D1 deferral names scope impact and does not certify live AI.

## 10. Validator implementation contract — create in R00

Use standard-library Python; validate structure and documented invariants, not arbitrary truth of a source. No automatic approvals or repairs.

1. Load tracker v2 / plan v2.1; reuse `plan_contracts.py` for task-pack/command links, case IDs, dependency order and test-file ownership. Validate state enums and root-contained artifact paths. Git input refs are source identities, not filesystem paths.
2. `--task Rxx`: require its declared outputs; parse applicable JSON/enums/references and task-specific counts/invariants above; ensure required executed checks have logs/results. Allow partial external evidence.
3. During the first validation, the current task may be running and its own validator result absent. After exit 0, Codex appends that result, hashes outputs and marks automation done. `--all` requires the final record for every done task.
4. `--all`: validate tracker plus completed task records/artifacts, ordinary input/output hashes and consumed shared entries; do not require uncreated outputs for todo/blocked tasks. Flag stale consumed inputs, not unrelated ledger appends; preserve historical records.
5. `--gate G4`: malformed/contradictory acceptance claim => exit 1; valid pending/insufficient readiness => exit 2; sufficient applicable evidence plus actual accepted decision => exit 0. An accurately reported critical blocker is valid not-ready evidence, not a malformed report.
6. Add negative tests: dependency cycle, invalid reference/path, missing done output, stale hash, invented participant count, controlled-as-live, emulator-as-phone, unknown-cost-as-zero, duplicate/leaked partitions and unapproved accepted gate.
7. Validate required/activated unit-pack execution reports against the case catalog and current tested inputs. Parse actual runner results; absent/zero/skipped required tests cannot be successful checks. Keep deferred future consumers and unavailable external checks distinct from executed failures.
8. Output concise errors with artifact, field, expected rule and actual value. Never print credentials/private records. No pass claim when required checks were not executed.

The validator can prove consistency and detect unsupported completion flags. It cannot prove a cited agreement is legally sufficient, a buyer quote is authentic or a hardware judgment is correct; preserve provenance and the applicable review requirements.
