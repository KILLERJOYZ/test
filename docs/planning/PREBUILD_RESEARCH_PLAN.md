# Codex execution plan: pre-build research

Version 2.1 · 13 November 2026 · Executor: Codex · Root: `E:\test`

**Deliverable:** implement reproducible research tools, contracts and one integration spike; produce evidence and a production backlog. Full production development starts only within the scope authorized by the user. This plan does not itself accept G3/G4.

Read [tracker](./PREBUILD_RESEARCH_TRACKER.json) for exact task inputs, outputs, dependencies and checks. Read [artifact contracts](../../research/prebuild/RESEARCH_TEMPLATES.md) only when producing those artifacts. Context: [audit](./REPOSITORY_RESEARCH_2026-11-13.md), [flow](./APP_FLOW.md), [selected BRD](../../brd.md). The older [delivery plan](./IMPLEMENTATION_PLAN.md) supplies requirement/gate definitions.

Required testing: [test-pack guide](./PREBUILD_TEST_PACKS.md) and [case catalog](./PREBUILD_TEST_PACKS.json) define 17 packs / 148 behavior cases. [Deep flow research](./APP_FLOW_DEEP_RESEARCH.md) records 23 transitions and eight findings, including six source-level reproductions. Use those findings as regression inputs; no app fixes or research-task completion are implied by the specification.

## 1. Execution contract

- Execute tasks; do not stop at another plan. Create the named tools, schemas, tests, reports and bounded spike when asked to execute this specification.
- Reuse the current checkout and preserve existing changes. Inspect local `main` with Git; do not merge it just to obtain the retrieval prototype.
- Default research scope: Android/Expo/TypeScript, Vietnamese/VND, new laptops, guest U01–U05/U07/U08, contextual AI. Treat production cohort/workload coverage as provisional. Keep U06 and other expansion out unless an existing or new scope decision includes them.
- Reuse pinned dependencies and current domain invariants. Default the spike to TypeScript to reuse checked rules; R07 may choose Python with a documented technical reason and equivalent behavioral fixtures. Do not request a framework preference before investigating.
- Write research code under `research/prebuild/tools/` and `spikes/prebuild-contract/`. Touch the existing app/service for traced defects, bounded UI experiments, or minimal extraction of production-used helpers needed by required unit packs. Record why; do not build a parallel test-only state model.
- Local code, fixture checks, document inspection and public-source research proceed autonomously within current authorization. Resolve ordinary implementation choices and record them.
- Never invent interviews, independent expert review, source permission, live-provider calls, physical-device observations, measurements or gate approval. Synthetic fixtures are valid test inputs, not empirical buyer/hardware evidence.
- Source claims need dated primary evidence. Preserve unknown identity/fees/stock; a listed price does not verify stock or payable total. Keep source/variant/policy references attached to conclusions.
- No provider calls without configured access and a numeric authorized limit. No purchase, message to a participant/provider, broad crawl, publication or deployment is implied by this plan. Reuse authorization already present; do not ask again.
- Continue independent tasks when an external step is unavailable. A missing participant, key, device or named human reviewer must not block local audit/contract/harness work.

## 2. Two states, not one “complete” flag

| Field | Values | Meaning |
|---|---|---|
| `automationStatus` | `todo / running / done / blocked` | Codex artifacts and required local checks |
| `evidenceStatus` | `unassessed / partial / sufficient` | Whether the package's research question has enough actual evidence |
| Check result | `pass / fail / not_run` | An executed check or an explicitly unexecuted one |
| Gate decision | `pending / accept / revise / stop` | Recorded accountable decision, independent of task execution |

`automationStatus=done` requires outputs, successful mandatory local checks and a task record. External gaps can leave `evidenceStatus=partial`. For example, R01 can finish a study protocol and empty, correctly labelled findings ledger while interviews remain pending. Its buyer-validation evidence is not sufficient.

Never use `done` to mean “wrote a report saying it passed.” Required local failures block that task; unavailable external checks are `not_run`, with reason and next action. An environment-denied localhost test is not a product failure or a pass.

## 3. Resume algorithm

1. Read this file and the tracker. Inspect Git status and current commit. Load only the selected task's inputs.
2. Reuse existing outputs only if their input hashes, consumed configuration/evidence and check records still match. Changed inputs or newly available external evidence/authorization reopen affected tasks and consumers; preserve old run records. Hash task definitions and consumed evidence entries, not entire shared control files.
3. Resume a `running` task from its record first; otherwise choose the lowest-order `todo` task whose artifact dependencies are done. Dependencies require artifacts, not external research approval.
4. Set it `running`; implement its steps and required tools. Use the provided defaults for reversible choices.
5. Implement and run its `requiredUnitPacks`, then activated change-impact packs and relevant integration/build checks. Capture actual case IDs/results, tested hashes, command, working directory, exit code, versions and sanitized output. Validate artifacts. Future dependent packs remain explicitly deferred until their owners run.
6. Record evidence gaps separately; update tracker and write `runs/<runId>/<taskId>.json`. Resume the next runnable task.
7. For a technical blocker, try at most two materially different targeted remedies without expanding scope. Record the exact failure/attempts, set `blocked`, and continue unaffected tasks. Reattempt when inputs or access change.
8. When no ordinary task remains runnable, execute R14 even if some tasks are blocked. Emit readiness findings and the smallest actionable external-input list. Stop with accurate remaining work; do not fabricate completion.

A pending external question does not authorize its dependent action. Bundle required questions after preparing reviewable options. If all remaining work needs external input, report that condition once with artifacts and resume instructions.

## 4. Bootstrap and command vocabulary

Run from the repository root using PowerShell. These commands exist now:

~~~powershell
$researchTracker = Get-Content docs/planning/PREBUILD_RESEARCH_TRACKER.json -Raw | ConvertFrom-Json
$researchTracker.tasks | Where-Object { $_.id -eq 'R00' } | ConvertTo-Json -Depth 12
git status --short
git rev-parse HEAD
git branch -avv
git show main:spikes/brd-retrieval/README.md
node --version
python --version
python -m unittest discover -s research/prebuild/tools -p test_plan_contract.py -v
npm --prefix apps/adviser run check
node --experimental-strip-types --test apps/adviser/src/domain.test.ts apps/adviser/src/picker.test.ts apps/adviser/src/ai.test.ts
node --experimental-strip-types --test services/demo-ai/server.test.mjs
~~~

Run the baseline checks once in R00; rerun affected checks after relevant changes. Do not rebuild APKs, reinstall dependencies or rerun crawlers just to reproduce the audit. If a dependency is absent, use its checked-in lockfile and record the installation/environment limitation.

**R00 must create the following validator before these commands are available:**

~~~powershell
python research/prebuild/tools/validate.py --task R04
python research/prebuild/tools/validate.py --all
python research/prebuild/tools/validate.py --gate G4
~~~

Validator contract: standard-library Python; relative paths resolved from repo root; no network or data mutation. Exit 0 = requested artifact checks pass; exit 1 = malformed/missing required artifact or failed mandatory check; `--gate` additionally returns 2 for valid but pending/insufficient readiness. A structural validation pass never creates scientific evidence or accepts a gate. See the artifact contracts for fields and tests.

### Unit completion rules

R00 implements the unit-pack runner described in the catalog. A task is done only when every required case executes and passes against current consumed inputs. Zero-test suites, skipped required cases, stale reports and missing tests do not pass. Run implemented consumers after shared changes; future packs activate with their owner rather than blocking earlier tasks. `--all` must report missing planned packs as incomplete.

For flow defects, preserve failing-before/passing-after regression evidence. Unit isolation covers injected storage, clock, transport and deterministic state, while HTTP integration, device/lifecycle, buyer research and live-provider evidence retain separate results. The flow probes confirm existing issues; a successful reproduction is not a fixed defect.

## 5. Task sequence

Detailed steps and paths are in the tracker. These rows specify the intended implementation:

| ID | Build / execute | Required technical outcome | External evidence kept separate |
|---|---|---|---|
| R00 | Bootstrap run configuration, evidence index, validator, unit-pack runner and task records | Current-source baseline; validated resume/check machinery | Scope decisions or spending authority not already available |
| R01 | Prepare buyer protocol; ingest available anonymized observations | Question-to-decision mapping; source-tagged findings, including zero observations | Real interviews; target 12 across three cohorts |
| R02 | Inspect accessible reference/retailer journeys using one task script | Dated observed/advertised/inaccessible matrix; actionable flow hypotheses | Access failures stay unknown |
| R03 | Inspect first-party source terms/access routes | Per-use permission/status register; selected research routes | Agreements/clarifications not established by public evidence |
| R04 | Implement deterministic JSON audit and canonical draft mapping | Reproducible counts, condition separation, unresolved identity/cost/stock | Manual exact-variant and offer verification |
| R05 | Implement versioned workload policy and evaluation corpus | 120 tagged cases; frozen 80/40 split; evidence/label provenance | Independent suitability adjudication |
| R06 | Audit app states; extract tested transitions and fix scoped flow defects | FLOW-01–04 regressions; state/return-path contract; finding-to-code/test links | 3–4 cognitive interviews and five uncoached sessions |
| R07 | Define one API, schemas and backend reuse decision | Fit, offer, total, affordability and revision contracts | Production-scope decisions still provisional |
| R08 | Implement one isolated end-to-end spike and checks | Correct identities/totals/states, saved history, failure handling | Production database/real-data acceptance if not exercised |
| R09 | Implement retrieval/ranking harness and report comparisons | Same snapshot and eligibility rules across arms; actual denominators | Held-out quality claims require adjudicated labels |
| R10 | Implement controlled AI suite; run live only if configured | 12 failure cases; recorded actual calls/cost/fallback | Initial 30-case live set and authorized cap |
| R11 | Run available Android checks; collect reproducible device evidence | Release/build/device IDs, raw timings, lifecycle/accessibility findings | Physical phone and accessibility interaction when unavailable |
| R12 | Implement operating scenario records and narrow sandbox checks | Six correction/outage/access/rollback cases with observed/simulated labels | Actual production controls and owner decisions |
| R13 | Implement cost/capacity calculator and draft build estimate | Low/base/high scenarios from dated prices and actual usage; unknowns stay null | Unavailable rates, funding and staffing |
| R14 | Aggregate gaps, gate checklist and concrete production backlog | Every readiness conclusion resolves to evidence; no false approval | G3/G4 decision by accountable owner |

### Hard invariants: apply to R04–R10

1. Match offers to exact variants; similar family names never establish identity.
2. Integer VND; safe bounds; no unknown fee treated as zero; discount only when eligibility/stacking is confirmed; no double-counted included charges.
3. Separate `fit`, `offerValidity`, `priceCompleteness` and `affordability`. A verified affordable result requires the relevant states all pass.
4. Hard tasks/budget precede ranking. A soft weight, embedding score or model output cannot override failure.
5. Preserve draft, confirmed and historical records. Responses carry decision/run/profile/catalog/rule versions; reject outdated results.
6. AI may propose needs or select checked claims. It cannot supply authoritative price, identity, verdict or seller URL. A real fact ID with contradictory semantics fails.
7. Fixture, crawled draft, reviewed research and production data remain distinct. A reviewed research record is not automatic publication permission.
8. Persist before acknowledging a save; preserve recoverable data on migration/write failure.
9. Source outage differs from no match. Cached data keeps its observation time; reopening does not refresh a quote.

## 6. Defaults for reproducible experiments

Store these settings in R00's `run-config.json`; record changes before rerunning comparisons.

- Seed: 20261113. Sorted stable case IDs; persist partition assignments and file hashes. A seed alone is not proof of a frozen corpus.
- Profile corpus: 120 cases = 50 ordinary, 20 price/budget, 15 identity/condition, 15 unknown/conflict/no-fit, ten freshness/availability, ten revision/persistence. Development 80; held-out 40, stratified. Draft synthetic labels are not independent hardware judgments.
- Retrieval corpus: 60 queries = 30 exact variants, 15 Vietnamese task queries, ten typo/alias, five ambiguous/unsupported. Development 40; held-out 20. Use the same catalog and hard eligibility for lexical, workload-ranking and optional vector arms.
- AI: 30 proposed live cases, 15 interpretation + 15 explanation. Controlled failure suite: absent configuration, provider error, timeout, oversized output, malformed output, forbidden patch fields, invented facts/URLs, contradictory fact ID, stale revision, cancellation, out-of-order responses, exhausted cap.
- Catalog: structurally audit every current row. Manually verify a proposed initial 20 new-device listings; expand toward the existing 30–50 canonical-variant hypothesis only if coverage/access justify it. Count reviewed, rejected and unknown separately.
- Integrity: zero unresolved critical identity/budget/unsupported-claim failures in the evaluated accepted scope. Report counts; never claim universal correctness.
- Proposed utility targets: at least 80% verified-offer coverage on realistic supported profiles; mean recall@10 at least 0.90 on answerable held-out queries; four of five users complete/comprehend defined tasks. These are provisional review criteria, not approved promises.
- Android: named release build/device/network; initial 30 samples per timing case; retain failures and raw samples. Reuse BRD provisional latency targets with their measurement limits.
- Cost caps: `liveAiMaxRequests=null`, `liveAiMaxCostVnd=null` until authorization/configuration supplies numeric values. Controlled fake-provider tests remain runnable. Null rate or unknown cost is never zero.
- Record held-out consumption in `09-holdout-usage.json`; leave the frozen corpus unchanged. Once results influence changes, a subsequent confirmation needs newly withheld/adjudicated cases; archived failures remain visible.

## 7. Required finish and handoff

R14 must produce a concrete backlog before asking for a build decision. Each item specifies requirement IDs, affected files/modules, inputs/API/state changes, dependency, exception behavior, executable acceptance tests, evidence and scope status.

Produce two separate conclusions:

- **Automation:** completed/blocked task IDs, checks actually run, changed files and resume command.
- **Readiness:** adequate/partial evidence by research question, unresolved critical issues and explicit G3/G4 decisions. Pending external evidence can coexist with completed automation.

Gate checks preserve the BRD: G1/G2 demo evidence → G3 demo/AI/user findings or explicit D1 deferral → G4 usable sources/catalog/workloads/owners/capacity → subsequent production work and G5. Readiness requires an actual recorded decision; an agent-generated recommendation is not approval. Existing user decisions remain valid—do not create a repeated permission loop.

Do not run research merely because this specification was edited. Start execution when the user requests it.

## 8. Start/resume prompt

~~~text
Execute docs/planning/PREBUILD_RESEARCH_PLAN.md using its JSON tracker.
Start the first runnable automation task; implement its tools/artifacts, run
its checks, and continue through independent tasks. Preserve existing work.
Keep external evidence gaps separate from completed automation. Produce the
R14 readiness pack when no further local work is runnable. Do not begin the
full production build or mark G3/G4 accepted without the applicable decision.
~~~
