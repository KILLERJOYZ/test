# Codex unit-test packs

Version 2.1 · [Execution plan](./PREBUILD_RESEARCH_PLAN.md) · [Task tracker](./PREBUILD_RESEARCH_TRACKER.json) · [Machine-readable pack catalog](./PREBUILD_TEST_PACKS.json)

**Contract:** implement and execute the named packs as their owning research tasks change code. The catalog specifies 17 packs and 148 required behavior cases with IDs, Given/When/Then assertions, source modules, test paths and command references. UPLAN and UBASE exist now: 10 specification checks and 18 existing application tests. The other 120 cases are implementation requirements, not completed tests.

## 1. Pack inventory

| Pack | Create in | Behavior covered | Required cases | Tracker command IDs |
|---|---|---|---:|---|
| UPLAN | Existing | Plan/test-pack contract guard | 10 | `plan_contract_tests` |
| UBASE | Existing | Existing app/domain regression | 18 | `baseline_domain` |
| U00 | R00 | Execution, validation and unit runner | 10 | `validator_tests`, `unit_runner_tests` |
| U01 | R01 | Buyer evidence integrity | 5 | `buyer_evidence_tests` |
| U02 | R02 | Journey evidence integrity | 5 | `journey_evidence_tests` |
| U03 | R03 | Source-use scope | 5 | `source_register_tests` |
| U04 | R04 | Catalog, identity and money audit | 8 | `audit_tests` |
| U05 | R05 | Workload rules and corpus isolation | 8 | `corpus_tests` |
| U06 | R06 | Client decision transitions | 14 | `decision_state_tests` |
| U07 | R07 | API payload and semantic contracts | 7 | `contract_tests` |
| U08 | R08 | Spike policy and repository units | 9 | `spike_unit_tests` |
| U09 | R09 | Retrieval metrics and experiment fairness | 8 | `eval_tests` |
| U10 | R10 | AI authority and bounded runner | 14 | `ai_controlled` |
| U11 | R11 | Android evidence and timing integrity | 6 | `android_evidence_tests` |
| U12 | R12 | Operations evidence and state transitions | 6 | `operations_evidence_tests` |
| U13 | R13 | Cost arithmetic and uncertainty | 7 | `cost_tests` |
| U14 | R14 | Readiness, scope and backlog integrity | 8 | `readiness_tests` |

The JSON is the authoritative case list; command text lives in the tracker. Never infer implementation from this table. Research findings FLOW-01–08 map directly to U06/U10 regression cases in [the flow review](./APP_FLOW_DEEP_RESEARCH.md).

## 2. Implement each pack

1. Read the selected task, its pack cases and affected source. List the actual inputs/outputs and side effects.
2. Create the declared test files and only the necessary production-used seams. Pure functions own decisions; adapters own storage/network/clock/ID generation. Test the functions the app/tool calls, not a duplicate model.
3. For a defect, add a regression that fails with the observed input before fixing the owner. Preserve the raw reproduction and record the failing-before/passing-after result.
4. Give every required case an executable identity: Node test name starts `U06-01`; Python method starts `test_U06_01_`. UBASE uses the catalog's exact existing test-name mapping. One case can contain parameterized/subtests, but every required case must execute.
5. Use synthetic fixed fixtures and literal independent expected values. Keep raw research observations immutable and separate from fixtures. A data-validation test proves consistency, not participant authenticity or source permission.
6. Implement behavior, run the owning pack plus activated affected consumers, then run relevant non-unit checks. Correct unexpected failures before declaring the task done.
7. Record case results, failed assertions, tested source/fixture hashes, tool versions and command logs. Never derive expected answers from the same implementation under test.
8. Update the tracker only when required cases and artifacts satisfy completion rules. Unknown or unavailable external evidence remains a separate gap.

### Fixed fixture rules

- Seed `20261113`; deterministic clocks, IDs, sorting and locale expectations. No network, sockets, external databases, ADB, real sleeps, user storage or live AI in unit packs.
- Use temporary directories/in-memory adapters; inject failures at read, queued write, commit, migration, timeout and cancellation boundaries.
- Money oracle: 20,000,000 base + 200,000 shipping + 300,000 mandatory fees − 500,000 confirmed eligible discount = 20,000,000 VND. Without confirmed eligibility the total is 20,500,000. Unknown shipping means complete total is null.
- Test exact ceiling and one dong below, absent/invalid/duplicate values, two versions arriving out of order and repeated actions. Hard constraints always precede preferences and rank.
- Validate full history references/date/version/amounts and invalid restoration; unknown real workload suitability stays unknown.
- Use deferred promises/fake clocks to control concurrency. Do not prove race safety by hoping a wall-clock delay triggers the race.

## 3. Selection and reporting contract — implement in R00

`research/prebuild/tools/run_unit_packs.py` is a **planned tool**, not available merely because this file exists.

~~~powershell
# After R00 implements the runner:
python research/prebuild/tools/run_unit_packs.py --task R06
python research/prebuild/tools/run_unit_packs.py --pack U06
python research/prebuild/tools/run_unit_packs.py --changed apps/adviser/src/ai.ts
python research/prebuild/tools/run_unit_packs.py --all
~~~

- `--task`: every required pack in the selected task must be implemented and executed.
- `--changed`: resolve catalog patterns and changed test-file ownership. Run existing/implemented packs and the current task's packs. Future consumers whose owner has not run are explicitly `not_run/deferred_owner`; they do not create backwards task dependencies. They become mandatory when their owner executes.
- Unknown executable paths require a declared owning pack before task completion. Document/artifact edits need structural validation; visual/native behavior also needs appropriate device checks.
- `--all`: report all 17 packs, including missing planned files. Exit 2 for incomplete execution. Never silently omit absent suites.
- Execute argument arrays, never concatenate a shell command from user/file values. Read structured actual unittest/Node reporter results. Check exit status, executed test count and required case IDs; file existence or exit 0 alone cannot pass.
- Exit 0 = every selected required case passed; exit 1 = actual failure, invalid selection/report, zero tests or skipped/missing required cases in an available suite; exit 2 = selected planned suite/tool unavailable. Preserve failed and not_run case records together when both occur; exit 1 takes precedence over 2.
- A conditional external integration/device/live check may be unavailable without invalidating a passing unit pack; report that gap separately. No automatic unit-to-gate conversion.

Write `research/prebuild/runs/<runId>/unit-packs/<invocationId>.json` with selection, command/tool versions, pack definition hashes, tested file/fixture hashes, per-case status, totals, logs and limitations. Record the whole manifest hash for provenance; freshness uses each consumed pack definition and source hashes so unrelated future cases do not invalidate prior packs.

R14 evaluates all results but can finish its own valid readiness report while earlier tasks are blocked. A passing R14 unit pack does not turn missing research or gate decisions into approval.

## 4. Commands available now

~~~powershell
python -m unittest discover -s research/prebuild/tools -p test_plan_contract.py -v
node --experimental-strip-types --test apps/adviser/src/domain.test.ts apps/adviser/src/picker.test.ts apps/adviser/src/ai.test.ts
~~~

The specification checker rejects missing task-pack links, undeclared planned test files, invalid command levels, dependency cycles, unsafe paths and malformed case IDs/assertions. It checks the actual repository manifests, not future runtime behavior.

Separate diagnostic:

~~~powershell
node --experimental-strip-types research/prebuild/flow-review/probe_current_flow.mjs
~~~

This replays six current-source failures with injected dependencies and saves observations/hashes. A successful diagnostic means those failures were reproduced. Archive the baseline when fixing behavior and use desired-behavior regression assertions; do not keep a defect for a green diagnostic.

## 5. Checks that unit tests cannot replace

| Check | Required evidence |
|---|---|
| HTTP integration `baseline_service` | Real localhost client/server boundary with injected provider; environment denial is not a pass |
| Spike integration `spike_tests` | API/repository/consumer round trip, saved history and evidence withdrawal |
| Type/build `baseline_types` | Actual TypeScript compiler result for changed app code |
| Android D01–D08 | Named build/device, actual Back/focus/keyboard/TalkBack/lifecycle and durable restart behavior |
| Live AI `ai_live` | Authorized configured calls, actual usage, quality and failure records |
| Research evidence | Real observations, rights evidence, independent judgments and accountable scoped decisions |

Unit case coverage is a specified behavioral minimum, not proof that every possible bug or user scenario is covered. Add cases for newly discovered changed behavior before closing its task.
