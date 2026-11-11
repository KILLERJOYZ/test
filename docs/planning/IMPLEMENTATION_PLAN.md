# Demo-first implementation plan
## Vietnam-first AI device buying adviser

Version 2.2 — 11 November 2026 — Draft for review. Companion: [BRD](./BRD.md). [Traceability register](./project-traceability.json). This is an execution plan, not a record of completed builds or tests.

Version 2.2 records the requested U19 contextual chatbot invitation in BRD sections 7.2/16.9 and the traceability register. Delivery stage, active-time/idle/session policy, threshold, cooldown and verification/package assignments remain pending review. U19 is not implemented, is not implicitly added to D0/D1 or the production pilot, and does not change existing native/live-AI gates.

Version 2.1 adds the explicit U01 laptop-picker delivery contract in section 23, including ordered uses, refinement, compromise handling and A06/A07 simulation. These are pending extensions to the existing browser frontend and to the future native demo. See the [research and implementation gap assessment](../../research/laptop-picker-research.md).

Version 2.0 adds work-package completion contracts, state/API boundaries, native control checks, failure handling, evidence procedures, release/rollback operations and the demo script. Read sections 1–5 for scope and sequence, 6–12 for architecture and stages, and 13–22 for execution detail. Proposed script names, endpoints and evidence paths below are to be created during implementation; none is asserted to exist yet.

Frontend progress note, 11 November 2026: a [browser-reviewable React Native Web prototype](../../apps/adviser/README.md) now demonstrates a subset of the D0 interaction. Its [verification record](../../apps/adviser/VERIFICATION.md) is frontend evidence only. It has no native app hosts or real AI provider integration and does not pass G1/G2/G3. Script names in this plan remain proposed unless explicitly documented in that prototype's README.

## 1. Delivery contract

Build and review a native demo before committing to production implementation. The demo proves a coherent interaction and feasible platform boundaries. A subsequent data-readiness stage proves whether the intended real buying claims can be supported. Production acceptance requires both; one does not substitute for the other.

Initial clients remain Android and Windows. Initial content remains Vietnamese laptop selection with VND totals. React Native shares domain/feature contracts; the Windows and Android shells adapt to WinUI 3 and Material 3 Expressive respectively. Do not replace the native requirement with an HTML prototype without an explicit product decision.

The minimum demo path is: Discover → guided needs/review → shortlist → exact variant detail → two-device comparison → sample offers → saved decision. The existing [HTML concept](../../research/mobile-adviser-concept.html) is an interaction reference, not a native codebase or completion evidence.

## 2. Stage gates and required evidence

| Gate | Decision | Evidence required | Decision owner |
|---|---|---|---|
| G0 | Start the scoped demo | Named sponsor/technical owner, scope and scenario, target devices, proposed acceptance baseline, versioned plan | Product owner with technical lead |
| G1 | Native approach is viable | Android/Windows release builds, native budget/task/command controls, state-event round trip, lifecycle/focus/Back/resizing checks, dependency matrix and limitations | Technical lead; sponsor decides any requirement change |
| G2 | D0 interaction demo is ready | Full local journey, fixture invariants, save/restart/delete, visible sample labels, installation/run instructions and known issues | QA/design recommend; product owner accepts |
| G3 | Demo supports a production decision | D1 real provider interaction, output rejection/fallback, exploratory usability findings, revised estimate and a recorded accept/revise/stop decision | Product owner / sponsor |
| G4 | Real-data implementation is ready to proceed | Confirmed source usage/retention, audited starter coverage, workload evidence, operating owners, approved production scope/capacity and acceptance thresholds | Product owner, data lead, technical lead |
| G5 | Pilot is ready for a defined wider release | Production test/audit results, actual device measurements, restore/rollback and support readiness, pilot findings and unresolved issue decision | Product owner / sponsor |

G3 requires D0 and D1 unless a D1 deferral is explicitly recorded. With no model access, D0 may be delivered and reviewed, while D1 remains pending. Provider absence must not be hidden behind a scripted response. G3 does not approve all 37 documented backlog journeys. G4 authorizes the bounded production pilot, not global rollout.

## 3. First executable slice

The first implementation work is a single native screen on each platform containing an exact VND ceiling input, multiple task choices and a command to show the resulting typed profile. Use the same TypeScript domain contract and display the same values on both clients.

1. Inventory the local Node/package manager, JDK/Android SDK, Visual Studio C++/Windows SDK, test devices and build capabilities without assuming they exist.
2. Select a compatible React Native/RNW Fabric pair and the native SDK/library versions. Initialize from supported templates, compile both hosts and commit the lockfile/version matrix.
3. Expose a small WinUI 3 control group and a Compose Material 3 Expressive group through supported native boundaries. Verify actual control usage, event delivery, sizing and accessible semantics.
4. Exercise budget edits, multiple task selection, keyboard/Back, theme and repeated mount/unmount. Record failures before adding screens.

Completion is G1. If a native control cannot be hosted reliably, adjust the boundary and investigate with a bounded spike; do not spend the full demo budget rebuilding a general widget library. Any switch to a separate front end or styling-only implementation requires a visible scope/estimate decision.

## 4. Demo backlog

Role names below represent responsibilities rather than assumed staff headcount. One developer can cover several roles; parallel work only occurs when capacity exists.

| ID | Work and tangible output | Dependencies | Owner | Acceptance / gate |
|---|---|---|---|---|
| PREP-01 | Freeze one scenario, identify test hardware and agree D0/D1 acceptance; capture current risks and unsupported capabilities | None | Product + design + lead | G0 record; no unowned prerequisite |
| DEMO-01 | Create pinned Android/Windows hosts and reproducible build instructions | PREP-01 | Native lead | Both hosts run; versions and supported architecture recorded |
| DEMO-02 | Implement essential native control adapters and shared state round trip | DEMO-01 | Native lead | T-D01 and initial T-D07; G1 |
| DEMO-03 | Define domain schema, versioned fixtures, frozen clock and validation/reset workflow | PREP-01; finalize UI contracts after 02 | Domain/data developer | Fixture validation; required scenario matrix covered |
| DEMO-04 | Implement pure eligibility, money, offer selection, ranking, explanations and exclusions | DEMO-03 | Domain developer + reviewer | T-D02–04; no critical invariant failures |
| DEMO-05 | Implement app shells, guided picker with ordered uses/review, result refinement, local search and profile edits | DEMO-02, 04 | Client + design | U01/U02 limited demo path; T-D03/05; picker contract §23 |
| DEMO-06 | Add variant detail/provenance, paired comparison, sample offers and contextual explanation surface | DEMO-05 | Client | U03–05 simulated/data-limited coverage; T-D04/05/07 |
| DEMO-07 | Add local saved decision, restore/delete, visible data mode and scenario reset | DEMO-06 | Client | T-D06 and no real purchase implication |
| DEMO-08 | Finish failure states, accessibility, release measurements and installation packages | DEMO-05–07 | QA/native/client | T-D01–08; G2 evidence and issue register |
| DEMO-09 | Implement small server-side needs/explanation AI adapter with validation and bounded cost | DEMO-03/04, provider access and settings | Backend/AI developer | T-D09; credentials remain server-side |
| DEMO-10 | Connect AI proposed edits and grounded explanation, run invalid-output/failure scenarios | DEMO-06, 09 | Client/AI + reviewer | T-D09; recorded live versus fallback result |
| REVIEW-01 | Run the scripted demo and exploratory buyer sessions; reconcile findings, cost and production proposal | DEMO-08; DEMO-10 unless an explicit D1 deferral is accepted | Product + design + QA | T-D10 and G3 decision |

DEMO-03/04 can proceed while native feasibility is investigated. DEMO-09 can begin after its inputs stabilize, but final D1 integration depends on the client flow. Do not build all screens before G1. Do not start live retailer ingestion, public accounts or a production admin portal to unblock a fixture demo.

## 5. Demo design and fixture specification

### 5.1 Interaction details

- Discover exposes guided choice and bounded sample-name browsing. Do not expose nonfunctional phone, PC, current-device or quotation features as working destinations.
- Needs flow begins with a confirmed exact ceiling and explicit purchase scope, actual tasks and soft priorities. Use relevant branches from the [question bank](../../research/onboarding-question-bank.json); no mandatory 28-question wizard. Preserve unanswered/unknown states and dependent-answer invalidation.
- Results show fewer than three items when only fewer qualify. Explain meaningful strengths, limitations and disqualifications without arbitrary match percentages. An edited budget must not leave an old eligible badge on an invalid selection.
- Detail binds every fact and offer to the exact fixture variant. Comparison uses consistent units and visible unknowns, with two products at compact widths.
- Buying options show charges, completeness, conditions and timestamp. The action opens a local sample summary; it does not connect fictional prices to a live seller.
- Saved decision stores the confirmed profile, selected IDs and dated observations. Reopening restores the decision, not a newly verified quote. Deletion and reset have distinct scopes.

### 5.2 Scenario data

Use twelve synthetic variants, eighteen synthetic offers and three synthetic sellers. Keep real brands, copyrighted review text, made-up benchmark numbers and actual retailer logos out of fictional records. Use generic illustrations or permitted assets. Store all records with explicit synthetic provenance and a dataset version.

| Scenario | Required data and expected behavior |
|---|---|
| Budget boundary | One valid exact-ceiling total and one above it; no silent ceiling increase |
| Configuration identity | Similar family names with different RAM/storage; no shared-offer mix-up |
| Total completeness | Mandatory charges known versus shipping unknown; only comparable complete totals qualify for lowest-total badge |
| Conditional discount | Benefit/card/other condition remains separate until explicitly eligible; avoid double-counting |
| Offer validity | Expired, unavailable and stale observations are visible/excluded as appropriate |
| Workload uncertainty | A critical capability unknown; no confirmed-fit verdict |
| No fit | A profile with no eligible device; return reasons and user-controlled edits |
| Profile revision | Adding a VM requirement changes eligibility and invalidates the old run |
| AI failure | Timeout, invalid field/ID, contradictory proposed edit and unsupported claim; deterministic fallback preserves the confirmed profile |
| Persistence | Save, restart, reopen, delete and reset without transferring one decision's needs to another |

Fixture workload assumptions demonstrate software behavior, not hardware buying advice. A frozen clock makes freshness tests repeatable. Production must use an actual time source and real observation/expiry policies, with sample mode excluded from production publication.

## 6. Architecture and contracts

### 6.1 Minimal demo layout

```text
apps/adviser/
  android/  windows/
  src/
    app/              # routes, Android/Windows shells
    domain/           # typed entities, validation, money, eligibility, ranking
    data/             # repository contracts, fixtures, local persistence
    features/         # needs, results, detail, compare, saved
    ui/               # public semantic contracts and platform-specific files
    native/           # component specs and host integration
    localization/     # Vietnamese copy and locale formatting
    demo/             # fixture scenarios, fixed clock, reset and mode notice
services/demo-ai/      # D1 only
docs/decisions/
```

No independently published packages, database or job queue is needed for D0. Extract modules only when actual sharing warrants it. Adopt third-party navigation/storage/list libraries only after verifying the selected RNW architecture supports the required behavior.

### 6.2 Shared contracts

- NeedsProfile: answer states, scope, ceiling, tasks, constraints, priorities and revision.
- CatalogVariant: exact identity, typed fields and assertion provenance.
- OfferObservation: variant/seller/condition, charge inputs, eligibility, freshness and complete/partial total state.
- RecommendationRun: profile revision, dataset/rules versions, eligible IDs, reasons, exclusions and unknowns.
- SavedDecision: stable references plus sufficient dated display context for restore.
- CatalogRepository, DecisionStore and Clock interfaces: fixture/local adapters first, API/current-time adapters later.
- AdviserService: proposed profile edits and grounded explanations only; validation/fallback applies equally to both clients.

Recommendation math is pure shared TypeScript in the demo. Production moves authoritative evaluation and price resolution behind a typed service while preserving fixtures/contract tests. Avoid simultaneously authoritative client/server calculations with different versions.

### 6.3 Reusable UI boundaries

AppShell, BudgetField, ChoiceGroup, NeedsSummary, ProductSummary/RecommendationCard, PriceSummary/OfferList, CompareSelection/ComparisonView, EvidenceView, ExplanationPanel and FeedbackState are the initial inventory. Share meaning, state and event contracts; adapt shell/navigation, density, focus, dialogs and controls per platform. Avoid per-label native composition hosts and global state updates for every explanation token.

### 6.4 D1 AI service

Define POST /demo/needs/interpret and POST /demo/advice/explain as proposed endpoint contracts. Their existence is not implied by this plan. Requests identify the decision/profile revision and supplied facts. Responses contain typed proposed fields or claims referencing allowed fixture IDs. The client confirms material edits before creating a new run.

The service holds keys, constrains payloads and usage, applies timeout/cancellation and validates output. No arbitrary web browsing, seller URL generation or automatic constraint relaxation is permitted. Imported/user text is data, not an instruction to change policy. Reject unsupported facts and use a deterministic explanation with an honest status. Logging records error/timing/version metadata with minimal prompt content. Provider settings and retention are decided before using personal input.

## 7. Demo administration boundary

Provide a documented local workflow: edit a versioned fixture file → run validation → preview its effect in the demo → reset or restore the prior fixture revision. Include visible synthetic-source information and rule versions. This supplies evidence for limited A02–A07 behavior without pretending to be a production admin application.

Keep a local review/findings log for A08 and diagnostic output for A09. Production requires authenticated server-enforced roles, persisted review/audit state and source/offer correction operations. A developer editing JSON is not a substitute for those production outcomes.

## 8. Verification register

All tests below are planned. Store results with build commit, package/dependency versions, dataset/rules/model versions, platform/device/OS, environment, sample size, observed outcome and open defect links.

| ID | Verification and evidence |
|---|---|
| T-D01 | Native host/release-build and value-event round-trip on both clients |
| T-D02 | Exact budget/integer-money boundaries, mandatory charges, eligibility and non-stacking calculation cases |
| T-D03 | Questionnaire branching, answer-state semantics, dependency clearing, hard constraints, unknowns and no-fit behavior |
| T-D04 | Variant identity, assertion provenance, offer validity and total-completeness presentation |
| T-D05 | Full selection/detail/comparison flow, profile revision invalidation and navigation state |
| T-D06 | Local save, restart/restore, delete and reset scopes |
| T-D07 | Keyboard, screen reader, text scaling, theme/contrast, Android Back/IME and adaptive windows |
| T-D08 | Offline/failure recovery, repeated native lifecycle operations, release performance and memory observations |
| T-D09 | Real AI request, proposed-edit review, invalid IDs/claims, timeout/cancellation, fallback and client secret inspection |
| T-D10 | Reproducible demo script and exploratory comprehension/task sessions |
| T-R01 | Source permission/retention record, catalog/workload coverage and named operating owner |
| T-R02 | Independent sample audit of exact variants, prices/fees/policies and evidence publication |
| T-P01 | Real-data U01–U08 journeys, including manual/supported-link quotation checking and shareable decision |
| T-P02 | Real seller destination, comparable total, eligibility/freshness handling and no false purchase event |
| T-P03 | Server-enforced staff access, denial/revocation, publication states and audit/reversal |
| T-P04 | User report → triage → source verification → correction/suspension → resolution |
| T-P05 | Production retrieval/ranking/AI regression against fixed snapshots and independent expert review |
| T-P06 | Data minimization/requests, secrets/access boundaries, backup/restore and incident handling |
| T-P07 | Production-like device/server latency, error/cost telemetry and operating thresholds |
| T-P08 | Provider/source outage, stale cache, expired/missing totals and rollback recovery |
| T-X01 | Future phone/category readiness, used-device and upgrade evidence, and reviewed PC compatibility/basket scenarios |
| T-X02 | Future history/alerts/payment/ownership scenarios and consent/policy validity |
| T-X03 | Future family/team collaboration, approvals and provider service journeys |
| T-X04 | Future owner/expert moderation and commercial disclosure/reconciliation |
| T-X05 | Future category/country coverage, locale/variant/policy and release readiness |

T-X groups are expansion planning placeholders; refine their cases and criteria before authorizing that scope. They are not implemented test suites.

Require no unresolved critical fixture failures at G2 and no critical AI integrity failure at G3. Measure release startup, cached content and local input against the BRD's provisional budgets on named hardware. Report actual distributions and sample sizes rather than claiming a p95 from a few runs. Set production freshness windows and response/error targets from real source behavior at G4.

At REVIEW-01, use approximately five exploratory participants with different technical confidence. Ask them to complete the path, explain an exclusion, identify sample data and an incomplete price, and reopen their saved choice. Proposed signal: four of five complete and comprehend these without coaching, with all serious problems reviewed. This is a redesign trigger, not proof of market-wide conversion or recommendation accuracy.

## 9. Demo review and transition to production

The G3 decision pack contains both platform artifacts, the scripted scenario, D0/D1 verification results, native integration decisions, observed usability issues, remaining technical/data risks, measured effort/cost and a revised production proposal. Record one outcome: accept bounded production readiness; revise/retest named gaps; or stop/pivot with reasons.

Do not carry artificial hardware assumptions, fixed clocks, sample discounts or permissive local access into production. Keep fixture mode useful for regression tests, but exclude it from production import/publication and label it explicitly in internal preview environments.

### 9.1 Real-data and production work packages

| ID | Work and deliverable | Dependency | Acceptance |
|---|---|---|---|
| REAL-01 | Establish permitted sources/retention and audited coverage across proposed 30–50 exact variants, 2–3 maintainable sources; confirm workload evidence and operating owner | G3; source research may begin earlier | T-R01/02 and G4; expand or narrow counts based on coverage |
| REAL-02 | Build typed API, durable catalog/offer/evidence/review storage, restricted staff roles, import staging, publication history and correction/monitoring workflows | G4 | A01–A09 minimum outcomes, T-P03/04/06/08 |
| REAL-03 | Replace fixture repositories with real adapters; complete U01–U08, supported quotation intake, retailer redirects and sharing | REAL-02; stable API contracts | T-P01/02/05; no false completeness/live claims |
| REAL-04 | Harden refresh/freshness, source/AI fallbacks, diagnostic privacy, restore and release packaging; define support routines | REAL-02/03 | T-P06–08 and operating runbooks |
| PILOT-01 | Run bounded user pilot, audit offers, compare recommendation approaches and review defects/cost/coverage | REAL-04 | G5 review with measured evidence and residual issue decisions |

Build a modular service and straightforward database/search first. Add ingestion workers only for permitted feeds actually used; do not introduce distributed infrastructure solely to match the long-term diagram. Minimum staff screens can be simple forms, review queues and revision views. Decide the internal admin UI shell at G3; it is not part of the native consumer-demo requirement.

For U06, use explicit user-confirmed quotation fields and an allowlisted set of supported retailer parsers where feasible. Unsupported links fall back to manual entry. Any server fetcher needs bounded destinations, response sizes, redirects and parsing behavior; broad arbitrary URL/OCR ingestion is not baseline scope.

Production AI uses real evidence with the same typed boundaries. Evaluate filters alone, workload rules and AI-assisted intake/explanation against fixed snapshots. An initial proposed 100–150 profile set should include sparse/conflicting input, budget segments, misleading variants and no-fit cases. Technical reviewers judge suitability independently; report disagreements and evidence gaps. Do not use model fluency or affiliate clicks as the sole quality measure.

### 9.2 Expansion ordering

After G5, review demand, cost and dependency readiness before selecting E/L scope. Phones reuse buying journeys but require phone-specific variants/workload evidence. Alerts need accumulated price observations and revalidation. Used devices need condition evidence. Ownership needs verified policies. Reviewed PC templates need A14 rules and physical/electrical/firmware checks before unrestricted generation. Partner services, community, shared procurement, commercial reporting and new countries require their own operating readiness. This is a dependency order, not a promised release calendar.

## 10. Capacity, estimate and cost controls

Earlier sizing hypothesis: D0 including the native feasibility slice might take 15–25 focused engineering days for someone already competent in React Native and the native stacks; D1 might add 3–5. Version 2.0's detailed acceptance work has not been estimated task by task, so these figures are historical planning context, not the execution budget. They exclude unresolved platform blockers, participant recruitment/review waits and source negotiations. Do not schedule a release against them.

After DEMO-02, replace that range with a task-based estimate reflecting actual integration results, available specialists, QA/design effort and device access. Do not divide effort by headcount mechanically. The earlier illustrative 10–14 week pilot timeline is historical context, not an approved baseline. Estimate production after G3/G4 evidence; no dependable total project price or release date exists yet.

Track native/client engineering, design/research, backend/AI, data review/operations, verification, hardware, signing/distribution, model usage, source licenses and hosting separately. Set a D1 usage ceiling and timeout behavior before enabling the provider. At G4, set monthly operating caps and a named response owner for source or model cost overruns.

## 11. Handover and change control

Demo handover: repository/lockfile, native dependency matrix and decisions, Android install artifact and Windows package/run artifact with prerequisites/signing notes, fixture schema/data and local maintenance procedure, domain/flow checks and results, scenario script, performance observations, AI mode/configuration instructions, known issues and the G3 decision pack. A recording is useful supporting evidence but does not replace runnable builds.

Production handover adds permitted-source records, API/data contracts, restricted admin workflows, publication/correction history, refresh/freshness policies, restore/rollback evidence, support and incident runbooks, environment/secret instructions, acceptance results and pilot findings.

Every material scope change names affected U/A/BR/NFR IDs, stage, revised dependencies, effort/cost impact, tests and decision. Do not change the spreadsheet's “Chốt làm” values or describe requirements as approved merely because this plan exists. The [traceability register](./project-traceability.json) is a review aid and must be updated with the decision record when the baseline changes.

## 12. Immediate execution order

Start PREP-01, DEMO-01 and the bounded DEMO-02 native slice. Define DEMO-03 fixtures/contracts while the slice is explored. Review G1 before continuing with DEMO-05/06. Finish D0 and the planned D1 checkpoint, conduct REVIEW-01, and record G3 before beginning REAL-02/03 production engineering. If the sponsor explicitly defers D1, REVIEW-01 records that decision and the missing AI evidence; the D1 packages remain pending rather than completed.

Reference mechanisms: [RNW architecture](https://microsoft.github.io/react-native-windows/docs/new-architecture/), [Fabric components](https://reactnative.dev/docs/fabric-native-components-introduction), [Compose/View lifecycle](https://developer.android.com/develop/ui/compose/migrate/interoperability-apis/compose-in-views), [Material 3 Expressive](https://developer.android.com/develop/ui/compose/designsystems/material3). Verify exact library/toolchain compatibility during DEMO-01; no version pair has been proven by writing this plan.

## 13. Work readiness and completion contracts

Before starting any package, identify inputs, owner, supported platform/data mode, linked requirements/acceptance cases, dependencies and evidence destination. If an assumption affects the user-visible outcome, record it rather than implementing an implicit default. An unavailable provider or device is a named dependency, not a successful stubbed check.

A package is done only when its declared output is reviewable, linked tests/manual checks have actual results, relevant clients build, defects have severity/owner, and setup/limitations are documented. A checked-in component or screenshot alone does not finish the complete journey. These are implementation policies to adopt when building; this document revision runs documentation checks only.

Recommended build increments have outcomes rather than fixed dates:

1. Foundation: PREP-01 and DEMO-01/02; obtain G1 before screen expansion.
2. Deterministic decision: DEMO-03/04 plus the minimum DEMO-05 path.
3. Complete interaction: DEMO-06/07 and failure/accessibility work, then DEMO-08/G2.
4. Bounded AI: DEMO-09/10; contract preparation may overlap earlier increments after the schema is stable.
5. Review: REVIEW-01/G3; authorize a bounded next stage or revise named gaps.

## 14. Detailed demo work breakdown

| Package | Concrete subtasks and output | Completion evidence |
|---|---|---|
| PREP-01 | Record scope, selected scenario and supported devices; assign reviewer roles; list provider/device/toolchain dependencies; draft gate record and known issue log | Product owner can state what D0/D1 demonstrate and what remains simulated; G0 inputs are named |
| DEMO-01 | Inventory SDKs; select compatible versions; initialize Fabric hosts; add lockfile and environment example without secrets; define development/release commands; build/install on both targets | Fresh setup instructions, actual build logs, native SDK/version/architecture matrix and launch evidence |
| DEMO-02 | Define budget/task native specs; implement Android and Windows hosts; bridge value/change/submit events; handle focus, size, theme and disposal; exercise mount/reopen | Same typed values round-trip on both platforms; keyboard/Back and accessible labels work; native control identity recorded; G1 issues resolved or scope decision recorded |
| DEMO-03 | Define runtime schemas and IDs; create synthetic dataset and provenance; implement fixed clock; validate referential integrity; provide scenario reset and controlled fixture-edit/preview process | Invalid records and cross-variant offers rejected; twelve/eighteen/three fixture counts validated; no live retailer destinations; dataset/rules versions shown |
| DEMO-04 | Implement integer-money calculation; resolve eligibility/known totals; apply hard constraints; rank soft preferences; generate structured reasons and exclusions; add stable tie-breaking | Domain checks cover exact-ceiling, conditional/partial totals, unknowns, expired offers and no-fit; results deterministic for identical input versions |
| DEMO-05 | Build platform shells; implement route-specific picker/review, ordered uses, profile revisions, result cards/refinement, bounded search and async cancellation | AC-U01-01–10 and AC-U02-01–04 demonstrated within the fixture boundary with supporting DEMO-03/04/06/07 work; stale results cannot overwrite current input |
| DEMO-06 | Bind detail/offer content to variant IDs; build paired comparison; expose evidence/unknowns; implement sample-offer action and explanation surface | AC-U03-01–03, AC-U04-01–04 and AC-U05-01–04 in sample mode; no real transaction or fictitious retailer handoff |
| DEMO-07 | Define saved schema/version; add save acknowledgement and error path; restore after restart; delete individual/all local records as explicit actions; preserve mode/date labels | AC-U07-01/02/04 and AC-U08-01/02; failed write does not say saved, corrupt record does not erase healthy records; permission-refusal checks apply when a feature actually requests that permission |
| DEMO-08 | Add named failure scenarios; verify input/accessibility/adaptive behavior; collect release startup/render/memory observations; create reproducible install artifacts and limitations record | G2 evidence, T-D01–08 and no unresolved S0/S1 in scoped D0; platform gaps are visible rather than masked by desktop HTML |
| DEMO-09 | Implement proposed AI endpoints; hold credentials server-side; add request/response schemas, budgets/timeouts and fact bundle; validate claim semantics and redact diagnostic fields | T-D09 service cases including unauthorized field/claim, invalid ID, contradictory fact and provider failure; cost/mode/version records |
| DEMO-10 | Connect confirmation UI for proposed edits; attach request/profile revision; render allowed claims/fallback; handle cancel/timeout; show live AI versus fallback | No automatic constraint change; late AI output discarded; valid evidence IDs with contradictory wording still rejected; real provider demonstration recorded |
| REVIEW-01 | Rehearse/reset the scenario; run buyer sessions; record task evidence and misunderstandings; review native/domain/AI issues, estimate and data feasibility; prepare decision | G3 record names accepted coverage, open issues, any explicit D1 deferral and next-stage scope/capacity; no automatic production go-ahead |

The listed acceptance ranges are references to the individual BRD criteria, not new requirements. Automated and manual verification may share a fixture, but reviewers must judge user-visible meaning as well as implementation output.

## 15. State, data and service contracts

### 15.1 Canonical state and invalidation

Use a stable decision ID plus separate profile revision, dataset version and rules version. Draft edits do not mutate an accepted historical run. A confirmed change generates a new revision and marks old derived results outdated. Search query state, comparison selection and saved snapshots have explicit ownership; avoid one mutable root object for every screen.

Ranking responses identify their input versions. Accept a response only if its decision/profile revision still matches the active request. Abort where supported; even if transport cancellation fails, ignore late output. Never use last-arriving-response order as the source of truth.

Distinguish three concepts in code and UI: mandatory fit, current offer validity and price completeness/affordability. Return structured reasons for pass/fail/unknown and no-fit/no-current-offer. A successful fetch returning zero qualifying offers differs from a network failure. Render an old saved comparison with historical labels while a current refresh is pending.

### 15.2 Schema and repository contract requirements

| Boundary | Required invariant / failure behavior |
|---|---|
| Needs schema | Stable option IDs; typed ceiling and scope; explicit answer states; exclusive choices validated; unsupported combinations return field errors |
| Variant schema | Exact ID and configuration fields; assertions reference provenance; duplicate family names do not imply identity |
| Offer schema | Accepted variant ID, seller/condition, charge inputs, eligibility and time context; no negative or unsafe numeric values; conditional savings separate |
| Money calculation | Integer VND with safe integer/overflow checks and named charge components; required included fees not added twice; missing is not zero |
| Ranking result | Input versions, eligibility reasons, offer completeness and tie-break identity; no arbitrary match score presented as probability |
| Repository | Same result semantics for fixture and future API adapters; distinguish not found, temporarily unavailable, invalid data and unsupported mode |
| Saved schema | Explicit version, current versus historical references, successful persistence acknowledgement and scoped deletion |
| Fixture validator | Reject broken references, invalid rule versions, absent sample provenance and real purchase URLs; report actionable record/field errors |

Use synthetic capability rules for study/coding/VM cases and label their assumptions in the evidence view. Do not present demo RAM/capability thresholds as application vendor guidance. The fixture validator must establish scenario coverage in addition to record count; twelve arbitrary laptops are insufficient.

Local persistence writes should be recoverable and versioned. A failed write preserves the existing valid decision. On reading an unknown/newer schema, avoid destructive reset: offer a clear unsupported-record message and preserve/export where feasible. A corrupt record is isolated from healthy records. Define migration tests before changing the saved schema; deletion/reset must also cover cached private profile data in the stated scope.

### 15.3 Minimum request envelope

Proposed service envelopes contain request ID, decision ID, profile revision, schema version, dataset/rule version and input payload. Responses repeat the relevant versions and have an explicit success/clarification/error mode. Errors have a stable code, useful safe message and retryability; raw provider errors or secrets do not enter the view.

For D0, repository/service calls can be in-process. For D1, the thin AI server is an actual network boundary. Document how a physical Android device, emulator and Windows client reach the development service; use narrow controlled access and appropriate transport. Do not embed a developer machine's address as a production endpoint or broadly expose the service merely to make a demo work.

## 16. AI implementation and evaluation details

### 16.1 Needs interpretation contract

Request: minimal relevant text plus supported field definitions and current confirmed profile revision. Response: a proposed patch containing only allowed fields, explicit unknowns and a concise reason for each material interpretation. Reject arbitrary field paths, unsupported option IDs and invalid amounts. No patch can set a server privilege, offer, product identity, price or accepted compatibility verdict.

The client displays the proposed changes next to the existing values. Apply only after user confirmation; rejection leaves the confirmed profile intact. A clarification response should identify the missing decision rather than fabricate a value. A new profile edit invalidates an outstanding interpretation proposal; the user may re-run it using the current state.

### 16.2 Explanation contract

Build a fact bundle from the deterministic run: selected/excluded variants, requirement checks, approved spec assertions, total breakdowns, unknowns and calculation references. Include only the scope needed for the question. The model selects allowed claim types, subjects and supporting fact references; controlled rendering owns numerical values, eligibility labels and links.

Example response shape, conceptual rather than an implemented API:

```ts
type AdviceProposal = {
  requestId: string;
  decisionId: string;
  profileRevision: number;
  claims: Array<{
    subjectVariantId: string;
    kind: 'advantage' | 'limitation' | 'unknown' | 'exclusion';
    relation: string; // validated allowlist of supported relation types
    factIds: string[];
    wordingKey: string; // server-owned template compatible with the facts
  }>;
};
```

Validation checks subject ownership, referenced fact availability, allowed relationship, compatible template, known versus unknown meaning and current input versions. A real fact ID attached to a false comparison fails. For the demo, prefer constrained rendering rather than pretending that a source-reference check verifies unrestricted prose. Later natural-language expansion needs its own accuracy evaluation.

### 16.3 Failure, cost and privacy behavior

Configure request size, output size, timeout, per-session/provider usage budget and concurrency limits before enabling a provider. Values are implementation decisions recorded at D1 readiness. Use bounded retry only for transient failures; avoid retry storms or duplicate paid requests after user edits. The response path identifies cancellation, timeout, provider unavailable, invalid output or valid live output.

Provider failure or failed validation produces a deterministic explanation tied to the current run. Show its mode and preserve product data; do not invent a completed AI answer. Service credentials and raw authorization headers remain outside clients, examples and logs. Use synthetic scenario prompts for scripted acceptance. Personal input transmission and provider retention settings require a defined notice/configuration before real-user use.

Evaluate a small fixed set covering: clear Vietnamese request, ambiguous budget, contradictory requirements, unsupported application, attempts to override facts, invented product/source IDs, contradictory claims with valid IDs, late responses and timeout. Record the provider/model/prompt/schema versions, observed result and cost without publishing private prompts. Keep these checks separate from eventual production hardware-suitability evaluation.

## 17. Native integration and shared-component acceptance

| Component group | Shared responsibility | Platform evidence before calling it ready |
|---|---|---|
| BudgetField / ChoiceGroup | Typed amount, selection semantics, field errors and change/submit events | Actual native control group, locale input, screen-reader labels, focus and repeated update behavior |
| AppShell / navigation | Same destination and decision state | Windows keyboard/focus/window resizing; Android Back/IME/insets; no lost context after reopening a view |
| Cards / offers / evidence | Exact identity, meaningful status, actions and source context | Readable compact/wide layouts, large text, accessible action names, no color-only eligibility |
| Comparison | Stable pair and normalized criteria | Narrow-screen readable sections; desktop column alignment; replacing one selection does not lose the other |
| Explanation surface | Current context, loading/mode/error and user confirmation | Correct modal/pane focus, keyboard avoidance, dismissal/reopen and lifecycle disposal |

Choose control-group boundaries during DEMO-02 based on ownership/lifecycle behavior, not a target percentage of shared JSX. Document which controls are genuinely native and which content uses shared primitives. Inspect code and behavior; screenshots alone cannot establish native identity or accessible semantics.

Create a compatibility record with exact RN/RNW, native SDK/compiler/JDK/Gradle/Compose versions, architecture, OS/device and each dependency's required feature. Status is tested, blocked, not tested or rejected, with evidence. Pick minimum supported OS/hardware after the spike; do not infer broad support from one developer machine or an emulator.

## 18. Test execution, evidence and release procedures

### 18.1 Test layers and integration timing

Domain checks run without a device and use manually reasoned expected values for important cases. Add useful boundary/property checks where appropriate: raising a soft priority cannot make an invalid variant pass; unknown costs cannot produce a complete total; an expired offer cannot win a valid-lowest badge. Do not merely copy implementation formulas into a test and call that independent verification.

Repository/schema checks exercise invalid IDs, import retry, saved-schema compatibility and corrupted local records. Component/flow checks cover confirmation, selection and outdated response rejection. Native/device checks cover actual control/input/accessibility behavior and release packaging. AI contract checks include both controlled invalid output and at least one real provider-backed request. Manual buyer sessions address comprehension rather than code coverage.

Use an appropriate Windows runner to build RNW and a configured Android toolchain for Android; record unavailable CI/device checks explicitly. Define prospective scripts such as `check:types`, `check:fixtures`, `check:domain`, `build:android`, `build:windows` and `verify:demo` during implementation. They are not commands that can be run in the current research-only repository yet.

### 18.2 Evidence bundle

Store each evaluated build under a stable evidence/run ID with:

- Build commit, dependency versions, fixture/rule/schema versions and AI configuration identifier.
- Test IDs and linked BRD acceptance IDs, expected/actual result, platform/device/OS and reviewer/date.
- Logs/traces or screenshots sufficient to reproduce a failure, with secrets/private content removed.
- Measured timings, sample count, cold/warm/network conditions and failed/timeout observations.
- Defects with BRD severity, impact, owner, proposed action and retest status.
- Artifact checksums, installation prerequisites and the decision record for the relevant gate.

Use an example future layout `evidence/<run-id>/{manifest,results,artifacts,observations,decision}`; select concrete file formats in implementation. Never mark an absent device check as passed because a cross-build succeeded.

### 18.3 Proposed performance protocol

At G1, name a representative Android device and Windows laptop and their OS/RAM/display/power state. At DEMO-08, use release builds, the same fixture/version, a defined list-scroll path, cold and warm launches, and offline/provider-timeout scenarios. Collect at least 30 samples per timing case for an initial distribution; this is a provisional collection floor, not proof of precise tail behavior. Report all samples, median, range and failures; any p95 estimate includes count and methodological limits and may require a larger run.

Exercise repeated open/close/back cycles and inspect memory/resource trends after settling. A universal memory ceiling is not invented before the native spike. Investigate sustained growth, long UI stalls and regressions relative to the same device baseline. Reconcile observations with NFR-04–06; record accepted limitations rather than silently changing a target after measurement.

### 18.4 Release and rollback checklist

Before G2/G3: install on named targets, reset to a known dataset, run the scripted path, confirm sample/fallback labels, verify persistence/delete and package prerequisites, check client bundles for secrets and record open issues. Use the BRD S0–S3 policy to decide readiness.

Before P: also confirm source/policy state, server roles, retention/logging settings, allowed seller destinations, feature/data mode, backup/restore rehearsal and operator ownership. Record the last known good application/configuration/rule/catalog revisions and their schema compatibility. Reverting rules/config does not automatically roll back an incompatible database migration or already distributed client.

When regression occurs: stop affected publication/feature, retain evidence, select a compatible approved prior revision, verify authoritative results and current offers, then reopen traffic or publish a bounded user notice. Retest the specific defect plus relevant integration scenarios; do not rerun unrelated long suites without a reason.

## 19. Production data and admin implementation detail

### 19.1 REAL-01 — source and coverage readiness

Create a source register containing identity/contact, permitted content, storage/reuse/AI-processing terms where relevant, update path, expected lag/limits, ownership and fallback. Audit actual pilot variants/offers against their exact IDs and policy context. Sample across selected workloads and budget ceilings, near-identical variants, promotions and incomplete costs. Record coverage gaps and unsupported scenarios as findings rather than filling them with generated content.

G4 requires agreed supported cohorts, evidence rules, stale/expiry policies, ownership and pilot thresholds. Proposed record/source counts remain sizing inputs; a sufficiently large but irrelevant catalog fails coverage readiness. If sources are unavailable, narrow or revise the pilot proposal explicitly.

### 19.2 REAL-02 — authoritative data and staff operations

Implement durable source, assertion, variant, seller, offer-observation, review and audit records. Use staged imports and stable record identity. Validate then review; keep invalid rows actionable without partially publishing a supposedly atomic revision. Prevent repeated jobs from creating duplicates. Use revision checks for concurrent edits and distinguish a correction from destructive history replacement.

Publish only when required identity/evidence/claim prerequisites hold. Suspending an offer/source updates current eligibility and invalidates affected current caches/runs as appropriate; offline clients still show historical context. Rule/model release uses an evaluation record and authorized actor. Access revocation applies at the server boundary, not only by hiding UI buttons.

Build simple staff entry points matching A01–A09: access, staged imports, catalog review, seller/offer review, evidence, rules, quality runs, reports and operational failures. A report resolution links to the resulting revision/suspension. Audit records capture actor/action/record/revision/reason/time and avoid unnecessary private request bodies.

### 19.3 REAL-03 — consumer production adapters

Replace local catalog/ranking authority with versioned API contracts while preserving UI semantics. Add real destination mapping, source dates, privacy notices, bounded quotation intake and sharing. Handle current/history distinctions and unsupported links explicitly. Validate each redirect/fetch against approved destinations and bound response size/redirect behavior; do not allow source text or the model to decide an arbitrary server request.

### 19.4 REAL-04 / PILOT-01 — operations and evaluation

Define source refresh/failure actions, model budgets/fallback, incident severity/owner, restore objectives and support hours. Rehearse representative source outage, wrong-variant publication, invalid AI claim and data-restore scenarios. These controls do not require a large operations team, but require a named person and feasible process.

Pilot review uses adjudicated requirement/offer examples and buyer task evidence. Separate calculation error, genuine source change, incorrect match, unsupported workload evidence and UI misunderstanding. Record denominators, abstentions and missing data. A learned ranker or greater AI autonomy requires evidence of benefit without hard-constraint regressions; it is not a default next task after the demo.

## 20. Capacity planning and decision log

At G1, estimate the remaining subtasks with optimistic/most-likely/pessimistic effort, assumptions and independent waiting time. A weighted estimate `(O + 4M + P) / 6` may help compare uncertainty; it is a planning technique, not a validated forecast. Keep native specialist, client, domain/backend, design, data review and QA work visible even when one person performs them. Publish a range and critical dependencies rather than a single unqualified date.

Use a limited work-in-progress queue: finish a reviewable vertical increment before expanding adjacent screens. A native dependency problem, missing provider access or unavailable test device gets an owner, next experiment and decision checkpoint. Escalate to a scope/integration decision before consuming the remaining demo budget on an unresolved approach. Avoid substituting a different platform/control system silently.

Decision log fields: ID, date, owner, question, options/evidence, decision or pending state, affected requirement/work-package IDs, reversibility, cost/risk implications and revisit condition. Required early records cover native hosting boundary, shared-library compatibility, demo versus production modes, persisted schema, explanation format, AI provider settings and target device matrix.

## 21. Reproducible demo review script

Use the same prepared synthetic dataset and a clean scenario reset on both platforms. The scenario price/ceiling is an example, not a market recommendation.

1. Open Discover; reviewer identifies the sample-data label and starts without signup.
2. Select study/coding, enter VND 22 million as an exact total ceiling, answer a VM branch and inspect the review. Change an answer and confirm what is hard versus preferred.
3. Request options; reviewer explains one included reason, one limitation and an excluded alternative. Set an impossible ceiling and inspect no-fit without an automatic relaxation, then restore it.
4. Open a precise variant, inspect fixture provenance, change a configuration and verify corresponding specs/offers change.
5. Select two options, inspect the decisive differences, remove/replace one and return without losing the active profile.
6. Open sample offers; identify a complete total, a conditional discount and unknown shipping. Select the sample action and confirm it does not claim a real checkout.
7. Save the decision, restart, reopen and delete it; demonstrate the expected response to a simulated persistence failure separately.
8. At D1, use a synthetic natural-language request, review proposed edits, confirm a change and ask for an explanation. Trigger timeout/invalid output; identify the fallback mode and unchanged authoritative product facts.
9. Repeat the core path with keyboard-only Windows input and an Android Back/large-text check. Record any untested accessibility/device combination.
10. Summarize observed issues and decide accept/revise/stop using the gate record. Do not interpret the rehearsal as a live-price or national-market validation.

## 22. Required planning and delivery records

| Record | Minimum fields / completion rule |
|---|---|
| Work item | Package/subtask, owner, linked U/A/BR/NFR and acceptance IDs, dependencies, implementation status, evidence and reviewer |
| Defect | Reproduction, expected/actual behavior, environment/versions, BRD severity, affected decision outcome, owner and retest |
| Gate decision | Evidence manifest, scope tested/unavailable, open issues, accept/revise/stop, accountable owner/date and explicit conditions/deferrals |
| Source/publication review | Record identity, previous/candidate revision, evidence/rights, conflicts, action/reason, reviewer and effective time |
| Model/rule evaluation | Input snapshot/set, candidate/baseline versions, invariant failures, output validity, reviewer findings, cost and release decision |
| Handover | Build/install instructions, artifact identity/checksum, supported matrix, modes/configuration, restore/reset, limitations and next owner |

Maintain these records with the simplest reviewable mechanism suitable for the team. No project management service, provider or deployment system is selected by this plan. The traceability register records planned coverage and must not be used as an automated claim that implementation or testing has completed.

## 23. Guided laptop picker implementation contract — v2.1

This section expands U01 and A06/A07, not the number of parent features. It follows the [reference research](../../research/laptop-picker-research.md). Ordered primary uses, structured refinement and the new acceptance cases are not yet implemented or verified in the browser demo. Existing task selection, exact budget, sample ranking, comparison and save behavior can be reused.

### 23.1 Work sequence and ownership

| Existing package | Concrete picker work | Completion evidence |
|---|---|---|
| PREP-01 | Product/design confirms supported use cases, additional-task capture, shortcut amounts and ranking interpretation; record estimate delta | Scope note explicitly lists unsupported work; no automatic support for all competitor categories |
| DEMO-03 | Domain/data owner versions profile, picker policy and fixtures; adds numeric screen size and task-level synthetic evidence; migration/reset rules | Validated schema and reproducible ordered-use, extra-task, filter-empty and compromise scenarios |
| DEMO-04 | Domain developer implements pure eligibility, task evidence, ranking and refinement selectors | T-D03 boundary cases and AC-U01-05–09; changing preference order cannot waive mandatory requirements |
| DEMO-05 | Client/design adds picker entry, accessible use ordering, budget shortcuts, relevant branches, review and result filters | T-D05 flow; state retained on Back/edit and errors; native controls remain subject to G1 |
| DEMO-06/07 | Client connects per-task explanations and exploratory details to existing compare/save; persists and migrates picker context | AC-U01-09/10, dated saved snapshot, unsupported schema recovery |
| DEMO-08 | QA checks compact/wide layouts, large text, focus/Back, order announcement, stale results and release responsiveness | Existing T-D05/06/07 plus new acceptance evidence; no unmeasured performance claim |
| DEMO-09/10 | AI developer accepts typed proposed edits, validates task IDs/order and confirms changes | Existing T-D09; model cannot change price, silently raise budget or override hard fit |
| REAL-02/03 | Data/reviewer/client replaces synthetic rules with permitted evidence, production publication and source conditions | AC-A06-03, T-P03/05, provenance and rollback record |

Keep existing package dependencies and stage gates. Additions change effort and must be included in the post-G1 estimate; no new delivery date or budget is committed here. D0 uses source-controlled policy and a local simulation harness, not a new production admin portal.

### 23.2 State and domain changes

Extend the current `Profile` through a versioned migration rather than interpreting its existing `tasks` array as user-confirmed importance. Proposed fields: `primaryUseOrder` (one to three unique supported IDs), `additionalRequiredTaskIds`, `useOrderConfirmed`, existing exact `budget`, `budgetScope`, typed follow-up answers, `profileRevision` and `questionVersion`. Existing product preferences remain separate from primary-use order. All primary and additional tasks contribute mandatory constraints.

Store result refinements separately: `screenMinInches`, `screenMaxInches`, `maxWeightKg`, and `sortMode`. A refinement changes the displayed eligible subset; it does not rewrite the needs profile or delete compared/saved items. Mark a selected item outside the current view appropriately. Store draft versus applied filters; cancelling the mobile sheet discards its draft. A revision/token on every result prevents an old run from replacing new criteria.

Add structured numeric fixture attributes instead of parsing display strings such as a screen label. For an explicit screen/weight filter, unknown attributes cannot claim to satisfy it. Show the missing-data cause and allow the buyer to remove the filter. Units are inches and kilograms; VND amounts use the existing safe-integer money path.

Recommendation output should contain profile/dataset/policy versions, all mandatory checks, task-level evidence IDs, eligible IDs, filtered-visible IDs, exclusion causes and separately requested exploratory IDs. Distinguish `eligible`, `filterEmpty`, `noEligible`, `needsClarification`, `unsupported` and `serviceError`. Existing cached data may remain visible with its dated status.

Migration from local schema v1 preserves the budget, tasks, preferences, saved IDs and observations. Set order as unconfirmed and ask on the next picker run; do not claim a historic ordering existed. Do not overwrite the original payload until validation and persistence succeed. Retain the existing denied-storage and corrupt-payload behavior.

### 23.3 Ranking and compromise policy

Apply exact-variant, valid-offer, total-budget and all mandatory-work checks first. Rank only eligible variants. For the fixture experiment, a proposed policy uses normalized, documented per-task preference quality and importance weights 3:2:1 (normalize for one/two uses), followed by explicit product preferences, payable total and stable variant ID. Product/technical review must approve this policy and its evidence mapping before implementation. It is an experimental design choice, not the competitor's verified algorithm or a real performance measurement.

Do not use array order accidentally, treat missing evidence as zero performance, or display a synthetic score as measured hardware quality. An unknown mandatory requirement leads to clarification; an unknown optional preference is displayed and handled consistently by the versioned policy. Add fixture pairs whose task tradeoffs make a priority-order change meaningful while both remain eligible.

Exploration runs only after an explicit user action. It may show excluded options with each failure and known budget delta, but must not inject them into the confirmed shortlist or change the saved profile. An “apply this change” action shows the exact requirement/budget edit, requests confirmation, increments the profile revision and reruns all checks. New fit claims require the new run to pass.

### 23.4 UI and reusable components

Use a common `PickerState` and domain selectors with `RankedUseCaseSelector`, `BudgetField`, `NeedsReview`, `ActiveFilterSummary`, `TaskFitSummary` and existing product/offer/comparison components. Keep these inside U01 and its supporting journeys, not as independent user features.

On Android, use short steps, visible progress and an applied-filter summary above results; advanced refinements open in an accessible sheet. On Windows, use a resizable input/review pane next to results. Provide move-earlier/later buttons and announced rank; drag may be optional, never the only reorder mechanism. Focus moves predictably after removal, filter application and no-results messages. A quick route is available without signup, and no unsupported destination appears functional.

### 23.5 Verification and review script

1. Start as a guest; choose two supported primary uses, add another mandatory task and confirm an exact ceiling.
2. Reorder primary uses. Verify a designed tradeoff pair reranks as documented, while the mandatory task and ceiling are unchanged.
3. Use a budget shortcut, inspect its exact amount, edit it manually and confirm; verify a cheaper eligible device is not excluded by a shortcut floor.
4. Apply screen/weight filters that remove all visible candidates. Clear only refinements and verify the prior eligible set and confirmed profile return.
5. Run true no-fit and unknown-evidence cases. Check distinct explanations and absence of unsupported suitable badges.
6. Request compromise exploration. Verify each failure, separation from confirmed results and explicit confirmation before a proposed requirement edit takes effect.
7. Compare and save; reopen a v2 decision and migrate a v1 fixture. Verify task context, original observations and truthful unknown ordering.
8. Simulate a bad policy revision under A06/A07, record blocked activation, then restore the prior version. Historical decisions remain interpretable.

Map these to AC-U01-05–10 and AC-A06-03 in the traceability register. Run focused domain and flow checks when implemented; do not count today's documentation validation or previous 26 browser assertions as passing these cases. During exploratory buyer review, record whether participants understand priority versus requirement, hard ceiling, filter-empty and compromise labels.

