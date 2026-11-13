> Active runtime update, 14 November 2026: [Unified app contract](../../apps/adviser/UNIFIED_APP.md). This overrides earlier runtime, SDK, service port and selection-count descriptions where they conflict. Historical package/evidence statuses do not automatically certify 0.5.0.

# Demo-first implementation plan
## Vietnam-first AI device buying adviser

Version 3.4 — 13 November 2026 — Draft for review. Companion: [BRD](../../brd.md). [Traceability register](./project-traceability.json). This is an execution plan; implementation and acceptance claims require the linked evidence records.


**Current implementation direction (13 November):** the user requested the full Device Advisor system after reviewing missing attachment options. Section 26 records this authorized expansion: Phone, Tablet and PC (laptop/prebuilt desktop), exactly three ordered purposes and three ordered priorities, separate intake screens and the shared result surface. It supersedes INT-DEC-02/03's earlier bounded-demo policy for Demo 2. Original parent journey IDs, spreadsheet approvals and G0–G5 remain unchanged. Historical delivery notes below describe their dated builds; see §26 and the linked verification record for the current implementation.

Version 3.3 incorporates the [Android advisor integration research](./ANDROID_ADVISOR_INTEGRATION_RESEARCH.md) into the execution baseline. Section 25 defines the incremental offline catalog, TypeScript domain/session and optional Gemini Nano work, with package dependencies, estimates, verification and rollout conditions. Sections 6, 12, 15, 16 and 19 are reconciled with that architecture. Existing U/A/BR/NFR IDs and G0–G5 retain their meanings; this planning update does not accept a gate or approve the attachment's different selection counts/category scope.

Reading order for the next increment: current status in §4.1 → execution sequence in §12 → integration contract and backlog in §25. Sections 3–5 and 14 retain the original demo completion contract; reuse delivered work and address its remaining evidence gaps rather than restarting it.

Frontend follow-up, 13 November 2026: the [Material 3 Expressive frontend implementation plan](./FRONTEND_IMPLEMENTATION_PLAN.md) turns the current frontend audit into FE-00–15, with dependencies, estimates and acceptance cases. Its [animation specification](../design/FRONTEND_MOTION_SPEC.md) defines shared springs, per-interaction animation, reduced motion and native evidence. These are planned work for the active `AdviserApp.tsx`; they do not mark prior gaps or stage gates accepted.

Pre-build research companion v2.1, 13 November 2026: [Codex execution specification](./PREBUILD_RESEARCH_PLAN.md), [machine-readable task tracker](./PREBUILD_RESEARCH_TRACKER.json), [unit-test packs](./PREBUILD_TEST_PACKS.md) and [artifact/check contracts](../../research/prebuild/RESEARCH_TEMPLATES.md) define 15 executable tasks and 17 unit packs / 148 behavior cases through the G3/G4 review. [Deep app-flow research](./APP_FLOW_DEEP_RESEARCH.md) supplies state transitions and reproduced regression inputs. Artifact dependencies allow local work to continue while external evidence is pending. Automation completion, evidence sufficiency and actual gate decisions are separate; this specification does not mark gates accepted.

Implementation progress, 12 November 2026: an Expo Android demo and standalone release APK are implemented, with synthetic core journeys, local persistence/workshop, a bounded AI adapter and engineering checks. See the [current verification record](../../apps/adviser/VERIFICATION.md) and [run instructions](../../apps/adviser/README.md). Real-provider and physical-device evidence remain pending; stage gates are not automatically accepted. The older frontend progress note below is historical.

Version 3.2 adds Expo as the React Native framework for fast Android debugging. Expo Go supports the pure-JavaScript demo and Expo development/release builds provide the app-specific native verification path. Use `npx expo start --android` for quick iteration and `npx expo run:android` for an app-specific Android build. Expo Go evidence alone does not complete G1. SDK/dependency versions are pinned in the app lockfile.

Version 3.1 corrects the source to the user-supplied lowercase brd.md. Demo inclusion follows its urgency table: U01–U05 and A02/A03/A04/A06/A07 are core; U07/U08/A09 are additional demo scope already implemented; U06/U09/U12/U13 and later items remain future or excluded. U19 from the superseded workspace BRD is outside this baseline. Native Android feasibility and the confirmed React Native/HTML-CSS boundary still apply. The historical 4–6 hour hackathon framing is a prioritization context, not a measured implementation estimate.

Version 3.0 applies Android-only React Native delivery and HTML/CSS design previews. Android feasibility, Expressive review and Android package/device evidence replace former dual-platform work. brd.md §11.1 and plan §24 define design acceptance. Historical effort ranges need re-estimation.

Historical version 2.1 added the U01 laptop-picker contract in §23. Its synthetic behavior is now implemented in the Android demo; current coverage and outstanding acceptance are recorded in §4.1 and the verification record. The [earlier gap assessment](../../research/laptop-picker-research.md) remains historical context.

Historical version 2.0 added work-package completion contracts, state/API boundaries, native checks, failure handling and release procedures. Current commands, endpoints and artifacts are identified in the app README and §4.1; other paths and contracts remain proposed unless evidence is linked.

Frontend progress note, 11 November 2026: a [browser-reviewable React Native Web prototype](../../apps/adviser/README.md) now demonstrates a subset of the D0 interaction. Its [verification record](../../apps/adviser/VERIFICATION.md) is frontend evidence only. It has no native app hosts or real AI provider integration and does not pass G1/G2/G3. Script names in this plan remain proposed unless explicitly documented in that prototype's README.

## 1. Delivery contract

Build and review a native demo before committing to production implementation. The demo proves a coherent interaction and feasible platform boundaries. A subsequent data-readiness stage proves whether the intended real buying claims can be supported. Production acceptance requires both; one does not substitute for the other.

Android is the only app delivery platform. Implement screens with React Native and TypeScript using Android-backed components; HTML/CSS is for design previews only, as confirmed by the user on 12 November 2026. Initial content is Vietnamese laptop selection with VND totals. Apply Material 3 Expressive through the app design system. Native feasibility concerns the installed React Native Android app; app screens do not require a WebView or a Kotlin/Compose rewrite.

The minimum demo path is: Discover → guided needs/review → shortlist → exact variant detail → two-device comparison → sample offers → saved decision. The existing [HTML concept](../../research/mobile-adviser-concept.html) is an interaction reference, not a native codebase or completion evidence.

## 2. Stage gates and required evidence

| Gate | Decision | Evidence required | Decision owner |
|---|---|---|---|
| G0 | Start the scoped demo | Named sponsor/technical owner, scope and scenario, target devices, proposed acceptance baseline, versioned plan | Product owner with technical lead |
| G1 | Native approach is viable | Installed React Native Android release build, budget/task/command controls, state-event round trip, Expressive component spike, lifecycle/focus/Back/IME/window checks, dependency matrix and limitations | Technical lead; sponsor decides any requirement change |
| G2 | D0 interaction demo is ready | Full local journey, fixture invariants, save/restart/delete, visible sample labels, installation/run instructions and known issues | QA/design recommend; product owner accepts |
| G3 | Demo supports a production decision | D1 real provider interaction, output rejection/fallback, exploratory usability findings, revised estimate and a recorded accept/revise/stop decision | Product owner / sponsor |
| G4 | Real-data implementation is ready to proceed | Confirmed source usage/retention, audited starter coverage, workload evidence, operating owners, approved production scope/capacity and acceptance thresholds | Product owner, data lead, technical lead |
| G5 | Pilot is ready for a defined wider release | Production test/audit results, actual device measurements, restore/rollback and support readiness, pilot findings and unresolved issue decision | Product owner / sponsor |

G3 requires D0 and D1 unless a D1 deferral is explicitly recorded. With no model access, D0 may be delivered and reviewed, while D1 remains pending. Provider absence must not be hidden behind a scripted response. G3 does not approve all 36 source-backlog journeys. G4 authorizes the bounded production pilot, not global rollout.

## 3. First executable slice

This is the original native-feasibility completion contract. The app now exceeds this initial screen slice; use §4.1 to identify remaining evidence and §12 for the next work. The slice contains an exact VND ceiling input, multiple task choices and a command to show the resulting typed profile, with displayed values/events verified in the installed Android app.

1. Inventory the local Node/package manager, JDK, Android SDK/Gradle, emulator, physical Android device access, signing setup and build capabilities without assuming they exist.
2. Select compatible React Native, Android toolchain and component-library versions. Initialize an Android host from a supported template, build/install the release variant and commit the lockfile/version matrix.
3. Build budget input, task selection and result/action components using React Native and Expressive tokens. Verify Android-backed control usage, events, sizing, TalkBack semantics and required Expressive behavior. Identify any small custom Android adapter needed; Compose hosting is not the default UI architecture.
4. Exercise budget edits, multiple task selection, keyboard/Back, theme and repeated mount/unmount. Record failures before adding screens.

Completion is G1. If an Android component cannot provide required behavior reliably, adjust the component boundary and investigate with a bounded spike; do not spend the full demo budget rebuilding a general widget library. Any switch to a separate front end or styling-only implementation requires a visible scope/estimate decision.

## 4. Demo backlog

Role names below represent responsibilities rather than assumed staff headcount. One developer can cover several roles; parallel work only occurs when capacity exists.

| ID | Work and tangible output | Dependencies | Owner | Acceptance / gate |
|---|---|---|---|---|
| PREP-01 | Freeze one scenario, identify test hardware and agree D0/D1 acceptance; capture current risks and unsupported capabilities | None | Product + design + lead | G0 record; no unowned prerequisite |
| DEMO-01 | Create a pinned React Native Android host and reproducible build instructions | PREP-01 | Native lead | Android release build installs/runs; versions and supported architectures recorded |
| DEMO-02 | Implement Android component/theme feasibility and typed state round trip | DEMO-01 | Native lead | T-D01 and initial T-D07; G1 |
| DEMO-03 | Define domain schema, versioned fixtures, frozen clock and validation/reset workflow | PREP-01; finalize UI contracts after 02 | Domain/data developer | Fixture validation; required scenario matrix covered |
| DEMO-04 | Implement pure eligibility, money, offer selection, ranking, explanations and exclusions | DEMO-03 | Domain developer + reviewer | T-D02–04; no critical invariant failures |
| DEMO-05 | Implement Android app shell, guided picker with ordered uses/review, result refinement, local search and profile edits | DEMO-02, 04 | Client + design | U01/U02 limited demo path; T-D03/05; picker contract §23 |
| DEMO-06 | Add variant detail/provenance, paired comparison, sample offers and contextual explanation surface | DEMO-05 | Client | U03–05 simulated/data-limited coverage; T-D04/05/07 |
| DEMO-07 | Add local saved decision, restore/delete, visible data mode and scenario reset | DEMO-06 | Client | T-D06 and no real purchase implication |
| DEMO-08 | Finish failure states, accessibility, release measurements and installation packages | DEMO-05–07 | QA/native/client | T-D01–08; G2 evidence and issue register |
| DEMO-09 | Implement small server-side needs/explanation AI adapter with validation and bounded cost | DEMO-03/04, provider access and settings | Backend/AI developer | T-D09; credentials remain server-side |
| DEMO-10 | Connect AI proposed edits and grounded explanation, run invalid-output/failure scenarios | DEMO-06, 09 | Client/AI + reviewer | T-D09; recorded live versus fallback result |
| REVIEW-01 | Run the scripted demo and exploratory buyer sessions; reconcile findings, cost and production proposal | DEMO-08; DEMO-10 unless an explicit D1 deferral is accepted | Product + design + QA | T-D10 and G3 decision |

DEMO-03/04 can proceed while native feasibility is investigated. DEMO-09 can begin after its inputs stabilize, but final D1 integration depends on the client flow. Do not build all screens before G1. Do not start live retailer ingestion, public accounts or a production admin portal to unblock a fixture demo.

### 4.1 Current delivery baseline and remaining work

Status basis: source/research review at commit `828c5f8`, the [Android verification record](../../apps/adviser/VERIFICATION.md), and the 12 November research baseline checks. Package contracts above remain acceptance obligations; an implemented subset does not imply gate acceptance.

| Existing package | Reusable implementation/evidence | Remaining acceptance or integration work |
|---|---|---|
| PREP-01 / DEMO-01/02 | Expo SDK 54 / RN 0.81.5 host, release APK, emulator control/interaction evidence and Expressive tokens | Named owners, complete physical-device/accessibility matrix and G1 decision; Nano requires its own dependency spike |
| DEMO-03/04 | 12 synthetic variants, 18 offers, integer totals, eligibility, deterministic ranking and evidence templates | Extract snapshot-based contracts; replace synthetic capability assumptions only with reviewed evidence |
| DEMO-05/06/07 | Ordered-use picker, review/refinement, detail, comparison, sample offers, saved-decision migration/recovery | Extend provenance, draft restoration, catalog-version invalidation and new storage contracts |
| DEMO-08 | Recorded release/emulator smoke evidence and automated checks | Physical-phone/TalkBack, full performance protocol, applicable configuration transitions and G2 decision |
| DEMO-09/10 | Bounded server adapter, reviewed proposals, fact validation, stale-response checks and fallback | Real-provider D1 evidence; local Nano integration is separate planned work |
| REVIEW-01 / REAL-* / PILOT-01 | Research and separate crawler/embedder tooling | Exploratory buyer sessions, stage decisions, reviewed production data, operations and pilot evidence |

Research baseline: TypeScript passed; 18 app tests and one controlled-provider HTTP test passed. This revision changes planning documents only; those are prior recorded results, not new runtime checks. Existing crawler records are staging inputs, not approved app offers. No Nano, SQLite catalog sync, Phone/Tablet journey or live-provider acceptance is claimed.

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
  android/
  src/
    app/              # routes and Android app shell
    domain/           # typed entities, validation, money, eligibility, ranking
    data/             # repository contracts, fixtures, local persistence
    features/         # needs, results, detail, compare, saved
    ui/               # React Native components, tokens and state contracts
    native/           # optional Android adapter specs and host integration
    localization/     # Vietnamese copy and locale formatting
    demo/             # fixture scenarios, fixed clock, reset and mode notice
design-previews/      # HTML/CSS screen studies; no app runtime dependency
services/demo-ai/      # D1 only
docs/decisions/
```

No independently published packages, database or job queue is needed for D0. Extract modules when reuse warrants it. Verify navigation/storage/list/animation library compatibility with the chosen React Native Android version. Keep HTML/CSS previews separate; share token values and state examples where useful, without DOM or CSS runtime dependencies in app screens.

### 6.2 Shared contracts

- NeedsProfile: answer states, scope, ceiling, tasks, constraints, priorities and revision.
- CatalogVariant: exact identity, typed fields and assertion provenance.
- OfferObservation: variant/seller/condition, charge inputs, eligibility, freshness and complete/partial total state.
- RecommendationRun: profile revision, dataset/rules versions, eligible IDs, reasons, exclusions and unknowns.
- SavedDecision: stable references plus sufficient dated display context for restore.
- CatalogRepository, DecisionStore and Clock interfaces: fixture/local adapters first, API/current-time adapters later.
- AdviserService: proposed profile edits and grounded explanations only; validation/fallback applies to every Android app flow.

Recommendation math remains pure TypeScript for local and any server reuse. For the integration in §25, publication/review authority belongs to the reviewed backend/export process; the app evaluates an immutable approved local snapshot with compatible rule/scoring versions. A server can revalidate current offers when connected, but local browsing, eligibility, totals and explanations remain usable offline with honest freshness. If the server also evaluates, it must use the same versioned contracts/policy and replay tests. Do not merge conclusions from different snapshots into one run.

### 6.3 Reusable UI boundaries

AppShell, BudgetField, ChoiceGroup, NeedsSummary, ProductSummary/RecommendationCard, PriceSummary/OfferList, CompareSelection/ComparisonView, EvidenceView, ExplanationPanel and FeedbackState are the initial inventory. Share meaning, state and event contracts; adapt shell/navigation, density, focus, dialogs and controls to Android window size/input. Avoid unnecessary custom native composition hosts and global state updates for every explanation token.

### 6.4 D1 AI service

The existing `services/demo-ai` implements POST /demo/needs/interpret, POST /demo/advice/explain and GET /health; see its [run instructions](../../services/demo-ai/README.md). Controlled-provider tests cover the service boundary; real-provider D1 remains pending. Requests identify the profile revision and supplied facts; responses propose fields or allowed claims. Section 25 adds an app-owned provider interface and local Nano adapter, preserving user review and shared validation.

The service holds keys, constrains payloads and usage, applies timeout/cancellation and validates output. No arbitrary web browsing, seller URL generation or automatic constraint relaxation is permitted. Imported/user text is data, not an instruction to change policy. Reject unsupported facts and use a deterministic explanation with an honest status. Logging records error/timing/version metadata with minimal prompt content. Provider settings and retention are decided before using personal input.

## 7. Demo administration boundary

Provide a documented local workflow: edit a versioned fixture file → run validation → preview its effect in the demo → reset or restore the prior fixture revision. Include visible synthetic-source information and rule versions. This supplies evidence for limited A02–A07 behavior without pretending to be a production admin application.

Keep a local review/findings log for A08 and diagnostic output for A09. Production requires authenticated server-enforced roles, persisted review/audit state and source/offer correction operations. A developer editing JSON is not a substitute for those production outcomes.

## 8. Verification register

The IDs below define verification obligations. Completed subsets and limitations are recorded in §4.1 and the Android verification record; they do not mark the entire register passed. Section 25.7 adds planned T-INT checks. Store results with build commit, dependency/data/rule/model versions, device/OS, environment, sample size, observed outcome and open defect links.

| ID | Verification and evidence |
|---|---|
| T-D01 | React Native Android release build/install, value-event round-trip and Expressive component spike |
| T-D02 | Exact budget/integer-money boundaries, mandatory charges, eligibility and non-stacking calculation cases |
| T-D03 | Questionnaire branching, answer-state semantics, dependency clearing, hard constraints, unknowns and no-fit behavior |
| T-D04 | Variant identity, assertion provenance, offer validity and total-completeness presentation |
| T-D05 | Full selection/detail/comparison flow, profile revision invalidation and navigation state |
| T-D06 | Local save, restart/restore, delete and reset scopes |
| T-D07 | TalkBack, external keyboard, text/display scaling, theme/contrast, reduced motion, Back/IME and adaptive Android windows; AC-UX01–05 |
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

The G3 decision pack contains the Android install artifact and build/configuration records, the scripted scenario, D0/D1 verification results, native integration decisions, observed usability issues, remaining technical/data risks, measured effort/cost and a revised production proposal. Record one outcome: accept bounded production readiness; revise/retest named gaps; or stop/pivot with reasons.

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

Section 25 decomposes parts of REAL-02/03/04 into incremental integration packages; these are not a second production backlog or permission to bypass G3/G4. Contract, fixture-import and native feasibility experiments can precede production readiness. Publishing real catalog bundles or running a real-data pilot requires the applicable source/operating readiness and stage decision. U06 quotation parsing and other REAL-03 outcomes are outside the bounded advisor increment and remain separately staged.

For U06, use explicit user-confirmed quotation fields and an allowlisted set of supported retailer parsers where feasible. Unsupported links fall back to manual entry. Any server fetcher needs bounded destinations, response sizes, redirects and parsing behavior; broad arbitrary URL/OCR ingestion is not baseline scope.

Production AI uses real evidence with the same typed boundaries. Evaluate filters alone, workload rules and AI-assisted intake/explanation against fixed snapshots. An initial proposed 100–150 profile set should include sparse/conflicting input, budget segments, misleading variants and no-fit cases. Technical reviewers judge suitability independently; report disagreements and evidence gaps. Do not use model fluency or affiliate clicks as the sole quality measure.

### 9.2 Expansion ordering

After G5, review demand, cost and dependency readiness before selecting E/L scope. Phones and tablets reuse buying journeys but need category-specific variants, evidence, accessory totals and rules; see §25.9. A deliberate scope revision may resequence this expansion. Alerts need accumulated price observations and revalidation. Used devices need condition evidence. Ownership needs verified policies. Reviewed PC templates need A14 rules and physical/electrical/firmware checks before unrestricted generation. Partner services, community, shared procurement, commercial reporting and new countries require their own operating readiness. This is a dependency order, not a promised release calendar.

## 10. Capacity, estimate and cost controls

Current incremental estimate: §25.5 totals **21–35 focused developer-days** for the bounded laptop integration with Nano, subject to its feasibility gate. It excludes framework migration, editorial/licensing work, unavailable hardware, review/recruitment waits and category expansion. It overlaps the decomposed REAL work and must not be added again to those packages. Re-estimate after LUA-INT-04/06; no calendar release date is committed.

The Android-only revision removes desktop build/adapter/test work and adds explicit Expressive component validation. Earlier multi-platform estimates do not establish effort for this baseline; re-estimate after Android G1.

Earlier sizing hypothesis: D0 including the native feasibility slice might take 15–25 focused engineering days for someone already competent in React Native and Android integration; D1 might add 3–5. Version 2.0's detailed acceptance work has not been estimated task by task, so these figures are historical planning context, not the execution budget. They exclude unresolved platform blockers, participant recruitment/review waits and source negotiations. Do not schedule a release against them.

After DEMO-02, replace that range with a task-based estimate reflecting actual integration results, available specialists, QA/design effort and device access. Do not divide effort by headcount mechanically. The earlier illustrative 10–14 week pilot timeline is historical context, not an approved baseline. Estimate production after G3/G4 evidence; no dependable total project price or release date exists yet.

Track native/client engineering, design/research, backend/AI, data review/operations, verification, hardware, signing/distribution, model usage, source licenses and hosting separately. Set a D1 usage ceiling and timeout behavior before enabling the provider. At G4, set monthly operating caps and a named response owner for source or model cost overruns.

## 11. Handover and change control

Demo handover: repository/lockfile, native dependency matrix and decisions, Android review APK and release AAB where required by the selected distribution channel with prerequisites/signing notes, fixture schema/data and local maintenance procedure, domain/flow checks and results, scenario script, performance observations, AI mode/configuration instructions, known issues and the G3 decision pack. A recording is useful supporting evidence but does not replace runnable builds.

Production handover adds permitted-source records, API/data contracts, restricted admin workflows, publication/correction history, refresh/freshness policies, restore/rollback evidence, support and incident runbooks, environment/secret instructions, acceptance results and pilot findings.

Every material scope change names affected U/A/BR/NFR IDs, stage, revised dependencies, effort/cost impact, tests and decision. Do not change the spreadsheet's “Chốt làm” values or describe requirements as approved merely because this plan exists. The [traceability register](./project-traceability.json) is a review aid and must be updated with the decision record when the baseline changes.

## 12. Immediate execution order

Continue from the existing Android demo:

1. Start LUA-INT-01: reconcile the scope/versions, name reviewers and physical targets, record the remaining G1/G2/D1 evidence, and freeze a fixture regression baseline.
2. After that baseline, start LUA-INT-02/03 for explicit catalog/session/provider contracts and LUA-INT-06 for a bounded native Nano feasibility experiment. These can proceed independently when capacity exists. Do not recreate the host or rerank products during contract extraction.
3. Build LUA-INT-04/05 using synthetic bundles first; prepare permitted real catalog review under REAL-01. Address existing demo evidence gaps and REVIEW-01 alongside these bounded experiments; retain the G3/G4 production boundary.
4. If native feasibility passes, connect LUA-INT-07 and evaluate under LUA-INT-08. If it fails, continue the core and record Nano as deferred; any framework upgrade becomes separately estimated work.
5. LUA-INT-09 packages the evaluated scope, rollback and gate decision. A core-only delivery must state that Nano is deferred. A local Nano result does not complete server-provider D1; a D1 deferral or replacement requires a recorded G3 decision.

Section 25 is the detailed execution contract for this increment. The inherited D0/D1 and REAL package obligations remain applicable to their respective milestones.

Reference mechanisms: [React Native components](https://reactnative.dev/docs/intro-react-native-components), [Fabric components](https://reactnative.dev/docs/fabric-native-components-introduction), [Building with M3 Expressive](https://m3.material.io/blog/building-with-m3-expressive), [Material motion](https://m3.material.io/styles/motion) and [Android Material guidance](https://developer.android.com/develop/ui/compose/designsystems/material3). Compose documentation supplies design/native reference context, not a requirement to implement Compose screens. Verify React Native Android component/toolchain compatibility during DEMO-01/02.

## 13. Work readiness and completion contracts

Before starting any package, identify inputs, owner, supported platform/data mode, linked requirements/acceptance cases, dependencies and evidence destination. If an assumption affects the user-visible outcome, record it rather than implementing an implicit default. An unavailable provider or device is a named dependency, not a successful stubbed check.

A package is done only when its declared output is reviewable, linked tests/manual checks have actual results, the Android app builds, defects have severity/owner, and setup/limitations are documented. A checked-in component or screenshot alone does not finish the complete journey. These are implementation policies to adopt when building; this document revision runs documentation checks only.

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
| DEMO-01 | Inventory SDKs; select compatible versions; initialize the React Native Android host; add lockfile and environment example without secrets; define development/release commands; build/install on Android targets | Fresh setup instructions, actual build logs, native SDK/version/architecture matrix and launch evidence |
| DEMO-02 | Define budget/task native specs; implement the Android component layer; connect value/change/submit events; handle focus, size, theme and disposal; exercise mount/reopen | Typed values round-trip in the installed Android app; keyboard/Back and accessible labels work; native control identity recorded; G1 issues resolved or scope decision recorded |
| DEMO-03 | Define runtime schemas and IDs; create synthetic dataset and provenance; implement fixed clock; validate referential integrity; provide scenario reset and controlled fixture-edit/preview process | Invalid records and cross-variant offers rejected; twelve/eighteen/three fixture counts validated; no live retailer destinations; dataset/rules versions shown |
| DEMO-04 | Implement integer-money calculation; resolve eligibility/known totals; apply hard constraints; rank soft preferences; generate structured reasons and exclusions; add stable tie-breaking | Domain checks cover exact-ceiling, conditional/partial totals, unknowns, expired offers and no-fit; results deterministic for identical input versions |
| DEMO-05 | Build the Android app shell; implement route-specific picker/review, ordered uses, profile revisions, result cards/refinement, bounded search and async cancellation | AC-U01-01–04 and AC-U02-01–04 demonstrated within the fixture boundary with supporting DEMO-03/04/06/07 work; stale results cannot overwrite current input |
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

Ranking responses identify their input versions. Accept a response only if decision/session, request ID, confirmed profile revision, catalog, taxonomy/question, rule and scoring versions match the active run. Explanation caches also include locale, provider/base model, prompt/schema and question context. Abort where supported; even if transport/native cancellation fails, ignore late output. Never use last-arriving-response order as the source of truth.

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

For D0, repository/service calls can be in-process. For D1, the thin AI server is an actual network boundary. Document how a physical Android device and emulator reach the development service; use narrow controlled access and appropriate transport. Do not embed a developer machine's address as a production endpoint or broadly expose the service merely to make a demo work.

## 16. AI implementation and evaluation details

### 16.1 Needs interpretation contract

Request: minimal relevant text plus supported field definitions and current confirmed profile revision. Response: a proposed patch containing only allowed fields, explicit unknowns and a concise reason for each material interpretation. Reject arbitrary field paths, unsupported option IDs and invalid amounts. No patch can set a server privilege, offer, product identity, price or accepted compatibility verdict.

The client displays the proposed changes next to the existing values. Apply only after user confirmation; rejection leaves the confirmed profile intact. A clarification response should identify the missing decision rather than fabricate a value. A new profile edit invalidates an outstanding interpretation proposal; the user may re-run it using the current state.

The integration introduces a versioned partial-edit contract: allowlisted typed `SET` and explicit `CLEAR`, with omission meaning unchanged, user-text evidence and base revision. Keep target budget distinct from hard ceiling. Validate each native/server proposal through the same TypeScript boundary; Kotlin structured output is not business approval. Migrate the existing complete `NeedsPatch` through an explicit adapter until both ends support the new contract.

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

For local mode, Nano readiness includes supported device/model, foreground state and the task's language-quality gate. Failure returns to the form/parser/templates. Server mode requires explicit selection and send; never escalate a failed local request to cloud automatically. Keep Nano out of background catalog workers. Section 25.6 defines capability, cancellation and native-build evidence, and §25.7 defines the larger held-out evaluation.

## 17. Native integration and shared-component acceptance

| Component group | Shared responsibility | Platform evidence before calling it ready |
|---|---|---|
| BudgetField / ChoiceGroup | Typed amount, selection semantics, field errors and change/submit events | Actual native control group, locale input, screen-reader labels, focus and repeated update behavior |
| AppShell / navigation | Same destination and decision state | Android keyboard/focus/window resizing, Back/IME/insets; no lost context after reopening a view |
| Cards / offers / evidence | Exact identity, meaningful status, actions and source context | Readable compact/wide layouts, large text, accessible action names, no color-only eligibility |
| Comparison | Stable pair and normalized criteria | Narrow-screen readable sections; desktop column alignment; replacing one selection does not lose the other |
| Explanation surface | Current context, loading/mode/error and user confirmation | Correct modal/pane focus, keyboard avoidance, dismissal/reopen and lifecycle disposal |

Choose control-group boundaries during DEMO-02 based on ownership/lifecycle behavior, not a target percentage of shared JSX. Document which controls are genuinely native and which content uses shared primitives. Inspect code and behavior; screenshots alone cannot establish native identity or accessible semantics.

Create a compatibility record with exact React Native, Android SDK/JDK/Gradle, component and animation-library versions, architecture, OS/device and each dependency's required feature. Status is tested, blocked, not tested or rejected, with evidence. Pick minimum supported OS/hardware after the spike; do not infer broad support from one developer machine or an emulator.

## 18. Test execution, evidence and release procedures

### 18.1 Test layers and integration timing

Domain checks run without a device and use manually reasoned expected values for important cases. Add useful boundary/property checks where appropriate: raising a soft priority cannot make an invalid variant pass; unknown costs cannot produce a complete total; an expired offer cannot win a valid-lowest badge. Do not merely copy implementation formulas into a test and call that independent verification.

Repository/schema checks exercise invalid IDs, import retry, saved-schema compatibility and corrupted local records. Component/flow checks cover confirmation, selection and outdated response rejection. Native/device checks cover actual control/input/accessibility behavior and release packaging. AI contract checks include both controlled invalid output and at least one real provider-backed request. Manual buyer sessions address comprehension rather than code coverage.

Use the current app commands `npm run check`, `npm test`, `npm run test:service`, `npm run export:android` and `npm run build:android` as documented in the [app README](../../apps/adviser/README.md); choose checks appropriate to each change. Proposed catalog, migration and device/evaluation commands must be added by the owning integration package before being listed as runnable. Record unavailable CI/device checks explicitly. Documentation-only revisions require reference/traceability validation, not a new APK or repeated model benchmark.

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

At G1, name representative Android devices and their OS/RAM/display/power state. At DEMO-08, use release builds, the same fixture/version, a defined list-scroll path, cold and warm launches, and offline/provider-timeout scenarios. Collect at least 30 samples per timing case for an initial distribution; this is a provisional collection floor, not proof of precise tail behavior. Report all samples, median, range and failures; any p95 estimate includes count and methodological limits and may require a larger run.

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

Replace fixture globals with versioned repository contracts and an approved local catalog snapshot under §25. The publisher owns reviewed facts, offers and policies; the app computes reproducible local advice against those versions. Add authenticated bundle delivery and connected current-offer revalidation without blocking offline discovery. Add real destination mapping, source dates, privacy notices and sharing; bounded quotation intake remains a separate REAL-03 outcome. Handle current/history distinctions and unsupported links explicitly. Validate each redirect/fetch against approved destinations and bound response size/redirect behavior; source text and model output cannot select arbitrary server requests.

### 19.4 REAL-04 / PILOT-01 — operations and evaluation

Define source refresh/failure actions, model budgets/fallback, incident severity/owner, restore objectives and support hours. Rehearse representative source outage, wrong-variant publication, invalid AI claim and data-restore scenarios. These controls do not require a large operations team, but require a named person and feasible process.

Pilot review uses adjudicated requirement/offer examples and buyer task evidence. Separate calculation error, genuine source change, incorrect match, unsupported workload evidence and UI misunderstanding. Record denominators, abstentions and missing data. A learned ranker or greater AI autonomy requires evidence of benefit without hard-constraint regressions; it is not a default next task after the demo.

## 20. Capacity planning and decision log

At G1, estimate the remaining subtasks with optimistic/most-likely/pessimistic effort, assumptions and independent waiting time. A weighted estimate `(O + 4M + P) / 6` may help compare uncertainty; it is a planning technique, not a validated forecast. Keep native specialist, client, domain/backend, design, data review and QA work visible even when one person performs them. Publish a range and critical dependencies rather than a single unqualified date.

Use a limited work-in-progress queue: finish a reviewable vertical increment before expanding adjacent screens. A native dependency problem, missing provider access or unavailable test device gets an owner, next experiment and decision checkpoint. Escalate to a scope/integration decision before consuming the remaining demo budget on an unresolved approach. Avoid substituting a different platform/control system silently.

Decision log fields: ID, date, owner, question, options/evidence, decision or pending state, affected requirement/work-package IDs, reversibility, cost/risk implications and revisit condition. Required early records cover native hosting boundary, shared-library compatibility, demo versus production modes, persisted schema, explanation format, AI provider settings and target device matrix.

## 21. Reproducible demo review script

Use the same prepared synthetic dataset and a clean scenario reset on the Android test matrix. The scenario price/ceiling is an example, not a market recommendation.

1. Open Discover; reviewer identifies the sample-data label and starts without signup.
2. Select study/coding, enter VND 22 million as an exact total ceiling, answer a VM branch and inspect the review. Change an answer and confirm what is hard versus preferred.
3. Request options; reviewer explains one included reason, one limitation and an excluded alternative. Set an impossible ceiling and inspect no-fit without an automatic relaxation, then restore it.
4. Open a precise variant, inspect fixture provenance, change a configuration and verify corresponding specs/offers change.
5. Select two options, inspect the decisive differences, remove/replace one and return without losing the active profile.
6. Open sample offers; identify a complete total, a conditional discount and unknown shipping. Select the sample action and confirm it does not claim a real checkout.
7. Save the decision, restart, reopen and delete it; demonstrate the expected response to a simulated persistence failure separately.
8. At D1, use a synthetic natural-language request, review proposed edits, confirm a change and ask for an explanation. Trigger timeout/invalid output; identify the fallback mode and unchanged authoritative product facts.
9. Repeat the core path with Android TalkBack/external-keyboard input and Back/large-text/reduced-motion checks. Record any untested accessibility/device combination.
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

This section defines the U01 and A06/A07 picker contract without adding parent features. It follows the [reference research](../../research/laptop-picker-research.md). Ordered uses, structured refinement, comparison and save behavior now exist in the synthetic Android demo; see §4.1 for evidence limits. Section 25 extends these contracts for replaceable catalogs, durable sessions and optional local AI.

### 23.1 Work sequence and ownership

| Existing package | Concrete picker work | Completion evidence |
|---|---|---|
| PREP-01 | Product/design confirms supported use cases, additional-task capture, shortcut amounts and ranking interpretation; record estimate delta | Scope note explicitly lists unsupported work; no automatic support for all competitor categories |
| DEMO-03 | Domain/data owner versions profile, picker policy and fixtures; adds numeric screen size and task-level synthetic evidence; migration/reset rules | Validated schema and reproducible ordered-use, extra-task, filter-empty and compromise scenarios |
| DEMO-04 | Domain developer implements pure eligibility, task evidence, ranking and refinement selectors | T-D03 boundary cases and AC-U01-01–04; changing preference order cannot waive mandatory requirements |
| DEMO-05 | Client/design adds picker entry, accessible use ordering, budget shortcuts, relevant branches, review and result filters | T-D05 flow; state retained on Back/edit and errors; native controls remain subject to G1 |
| DEMO-06/07 | Client connects per-task explanations and exploratory details to existing compare/save; persists and migrates picker context | AC-U07-01/02, dated saved snapshot, unsupported schema recovery |
| DEMO-08 | QA checks compact/wide layouts, large text, focus/Back, order announcement, stale results and release responsiveness | Existing T-D05/06/07 plus new acceptance evidence; no unmeasured performance claim |
| DEMO-09/10 | AI developer accepts typed proposed edits, validates task IDs/order and confirms changes | Existing T-D09; model cannot change price, silently raise budget or override hard fit |
| REAL-02/03 | Data/reviewer/client replaces synthetic rules with permitted evidence, production publication and source conditions | AC-A06-01/02, T-P03/05, provenance and rollback record |

Keep existing package dependencies and stage gates. Additions change effort and must be included in the post-G1 estimate; no new delivery date or budget is committed here. D0 uses source-controlled policy and a local simulation harness, not a new production admin portal.

### 23.2 State and domain changes

The current `Needs` already extends `Profile` with `primaryUseOrder` (one to three IDs), `additionalRequiredTaskIds`, `useOrderConfirmed`, `revision` and `budgetScope`. Reuse these fields and the existing VM answer; version any additions for field origins, category/intake/question policy, budget target versus ceiling and other typed follow-ups under §25. Do not reinterpret the legacy `tasks` array as confirmed importance. Product preferences remain separate from primary-use order. All primary and additional tasks contribute mandatory constraints.

Store result refinements separately: `screenMinInches`, `screenMaxInches`, `maxWeightKg`, and `sortMode`. A refinement changes the displayed eligible subset; it does not rewrite the needs profile or delete compared/saved items. Mark a selected item outside the current view appropriately. Store draft versus applied filters; cancelling the mobile sheet discards its draft. A revision/token on every result prevents an old run from replacing new criteria.

Add structured numeric fixture attributes instead of parsing display strings such as a screen label. For an explicit screen/weight filter, unknown attributes cannot claim to satisfy it. Show the missing-data cause and allow the buyer to remove the filter. Units are inches and kilograms; VND amounts use the existing safe-integer money path.

Recommendation output should contain profile/dataset/policy versions, all mandatory checks, task-level evidence IDs, eligible IDs, filtered-visible IDs, exclusion causes and separately requested exploratory IDs. Distinguish `eligible`, `filterEmpty`, `noEligible`, `needsClarification`, `unsupported` and `serviceError`. Existing cached data may remain visible with its dated status.

Migration from local schema v1 preserves the budget, tasks, preferences, saved IDs and observations. Set order as unconfirmed and ask on the next picker run; do not claim a historic ordering existed. Do not overwrite the original payload until validation and persistence succeed. Retain the existing denied-storage and corrupt-payload behavior.

### 23.3 Ranking and compromise policy

Apply exact-variant, valid-offer, total-budget and all mandatory-work checks first. Rank only eligible variants. The implemented fixture experiment uses per-task illustrative quality and importance weights 3:2:1 (normalized for one/two uses), followed by product preferences, payable total and stable variant ID. Preserve it during extraction. A replacement production policy requires reviewed evidence and before/after replay. The attachment's alternative coefficients remain candidates for evaluation, not validated improvements or hardware measurements.

Do not use array order accidentally, treat missing evidence as zero performance, or display a synthetic score as measured hardware quality. An unknown mandatory requirement leads to clarification; an unknown optional preference is displayed and handled consistently by the versioned policy. Add fixture pairs whose task tradeoffs make a priority-order change meaningful while both remain eligible.

Exploration runs only after an explicit user action. It may show excluded options with each failure and known budget delta, but must not inject them into the confirmed shortlist or change the saved profile. An “apply this change” action shows the exact requirement/budget edit, requests confirmation, increments the profile revision and reruns all checks. New fit claims require the new run to pass.

### 23.4 UI and reusable components

Use a common `PickerState` and domain selectors with `RankedUseCaseSelector`, `BudgetField`, `NeedsReview`, `ActiveFilterSummary`, `TaskFitSummary` and existing product/offer/comparison components. Keep these inside U01 and its supporting journeys, not as independent user features.

On Android, use short steps, visible progress and an applied-filter summary above results; advanced refinements open in an accessible sheet. On expanded Android windows, use an input/review pane next to results where readable. Provide move-earlier/later buttons and announced rank; drag may be optional, never the only reorder mechanism. Focus moves predictably after removal, filter application and no-results messages. A quick route is available without signup, and no unsupported destination appears functional.

### 23.5 Verification and review script

1. Start as a guest; choose two supported primary uses, add another mandatory task and confirm an exact ceiling.
2. Reorder primary uses. Verify a designed tradeoff pair reranks as documented, while the mandatory task and ceiling are unchanged.
3. Use a budget shortcut, inspect its exact amount, edit it manually and confirm; verify a cheaper eligible device is not excluded by a shortcut floor.
4. Apply screen/weight filters that remove all visible candidates. Clear only refinements and verify the prior eligible set and confirmed profile return.
5. Run true no-fit and unknown-evidence cases. Check distinct explanations and absence of unsupported suitable badges.
6. Request compromise exploration. Verify each failure, separation from confirmed results and explicit confirmation before a proposed requirement edit takes effect.
7. Compare and save; reopen a v2 decision and migrate a v1 fixture. Verify task context, original observations and truthful unknown ordering.
8. Simulate a bad policy revision under A06/A07, record blocked activation, then restore the prior version. Historical decisions remain interpretable.

Map these to AC-U01-01–04 and AC-A06-01/02 in the traceability register. Run focused domain and flow checks when implemented; do not count today's documentation validation or previous 26 browser assertions as passing these cases. During exploratory buyer review, record whether participants understand priority versus requirement, hard ceiling, filter-empty and compromise labels.


## 24. React Native Android and Material 3 Expressive delivery contract — v3.0

### 24.1 Runtime and preview boundary

Use TypeScript/TSX React Native screens, Android-backed controls and a reusable app design-system layer. React Native styles implement app presentation; HTML/CSS implements browser design previews. Preview CSS variables can mirror the same token source. There is no separately supported web/desktop release or WebView product UI. Add small Android native modules only for actual integration needs and verify them at G1.

The existing browser prototype is interaction/reference evidence. Review domain logic for reuse and verify it against fixtures in the Android app. Passing browser checks cannot satisfy Android device acceptance.

### 24.2 Design work and component evidence

Follow [Building with M3 Expressive](https://m3.material.io/blog/building-with-m3-expressive), supported by [Material motion](https://m3.material.io/styles/motion) and [Android Material guidance](https://developer.android.com/develop/ui/compose/designsystems/material3). Color, type, shape, motion and component emphasis guide attention and make actions legible. The mappings below are project design decisions evaluated under brd.md §11.1.

| Package | Design/Android deliverable | Evidence |
|---|---|---|
| PREP-01 | Expressive screen/state inventory and token/component checklist; named Android devices and reviewer. | Discovery, picker/review, results, detail, comparison, offers, saved and failure-state coverage. |
| DEMO-01/02 | Pin Android tooling; inspect Material/component/animation library candidates; implement one budget/task/result screen. | Installed release APK; component/version/API coverage marked tested/blocked/not tested; Expressive support verified separately from generic Material 3 support. |
| DEMO-03/04 | Supply typed synthetic task-fit and complete/partial-price states. | Domain invariants independent of theme/motion. |
| DEMO-05/06 | Implement theme, reusable components and scoped journeys; map HTML/CSS studies to app states. | AC-UX01/02/05, device/build-specific screenshots and interaction observations; compact/expanded layouts with visible caveats. |
| DEMO-07/08 | Check saved states, themes, scaling, TalkBack, touch targets, Back/IME, reduced motion and recreation. | AC-UX03–05 and T-D06/07/08 on Android; measured responsiveness and limitations. |

Use one token source for semantic colors, typography, shapes, spacing and motion roles, mapped to React Native styles and preview CSS variables. Provide light/dark themes, dynamic color where supported and a fallback palette. Record font licenses and verify Vietnamese glyphs. Keep fit/price statuses understandable without color. Motion supports state changes and respects reduced/disabled animation; it does not delay a user's decision.

Keep a component matrix for budget input, ordered-use choices, primary actions, cards, filters, navigation, comparison, loading/progress, dialogs and chat. For each, record library/version, Expressive behavior, accessible states, custom work and test evidence. Choose libraries at G1; this plan does not assert untested package compatibility. Use the Expressive scheme and suitable spring-based motion where supported, with an accessible no-motion equivalent. G1 must record any adaptation required by the React Native stack.

Apply the article’s design tactics to this product: contrasting shapes distinguish the primary action; semantic color and emphasized type focus the budget and task summary; containers group reasons and price conditions; motion clarifies state changes; flexible components adapt to Android window size. Limit combined “hero” treatment to one or two important moments, such as confirming needs and revealing the shortlist. Keep offer tables and evidence readable. This mapping is a project proposal to review under AC-UX01–05, not a prescribed Google layout or proof of usability improvement.

### 24.3 Android feasibility and review protocol

Install the React Native release build on at least one named physical Android phone; use an emulator for additional OS/window configurations. Demonstrate exact VND input, task selection/reordering, typed state-event updates and a result action. Check Android Back, IME, edge-to-edge insets, TalkBack, font/display scaling, rotation/recreation, foreground/background return and reduced/disabled animation. Verify focus and state after closing sheets/dialogs. Record supported OS/architectures and missing device coverage at G1; repeat applicable checks across the full D0 journey at G2.

Map AC-UX01–05 to T-D01/T-D05/T-D07/T-D08 in the evidence manifest. Previews support layout/state review; acceptance uses installed React Native Android behavior. Existing money, variant, evidence and AI invariants still apply. No feasibility, design or release check is passed by this planning revision.

## 25. Offline advisor and optional on-device AI integration — v3.3

### 25.1 Outcome, scope and decision register

Recommendation-engine integration: the Device Advisor deterministic contracts now drive the real-reference flow, including hard checks, full-cost uncertainty, weighted utility intervals, evidence reasons, diverse eligible shortlists and reviewed compromise proposals. See [module implementation and evidence](../../apps/adviser/RECOMMENDATION_MODULE.md). This is the laptop recommendation core; missing catalog evidence, Nano and broader category scope are not marked complete.

Real-reference demo progress: Demo 2 now reads 70 collected source listings from a normalized on-device SQLite catalog with separate source/offer/fact tables. Reference recommendations, details, paired comparison and dated saved decisions use these records. See [reference demo evidence and boundaries](../../apps/adviser/REAL_REFERENCE_DEMO.md). Missing charges, stock and workload evidence remain unknown; authenticated live sync, Nano and production acceptance remain pending.

Demo 2 progress: a selectable React Native integration demo now exercises explicit fixture snapshot evaluation, persisted catalog activation/rollback, confirmed deterministic budget proposals and exact detail/comparison. See [Demo 2 implementation record](../../apps/adviser/DEMO_2.md). This is a bounded prototype using AsyncStorage and embedded synthetic bundles; SQLite, native Nano, authenticated synchronization and full package acceptance remain pending. The planned statuses below describe complete package obligations.

Deliver one complete incremental journey: **Explorer/direct search → laptop needs/review → local shortlist → exact detail/paired comparison → offers → save/reopen/share**, using a bundled versioned catalog. Optional Nano extraction proposes needs edits within the same journey. The form, rules and evidence templates complete it with no network or model. Real-price claims require approved sources and valid observations; offline historical prices do not establish current stock or affordability.

This section adopts the architecture and staged work from the [integration research](./ANDROID_ADVISOR_INTEGRATION_RESEARCH.md), based on the supplied `Android_Device_Advisor_Integration_Plan (8).md`. The research contains the repository audit and dated official-source findings. This section owns execution order/status; the research remains its rationale. The following package tables preserve the original complete acceptance obligations. Their current implemented subsets and verification are recorded in §26; unperformed quality/device/production checks remain pending.

| Decision ID | Working decision / unresolved choice | Owner and resolution point |
|---|---|---|
| INT-DEC-01 | Keep Expo/React Native screens and TypeScript eligibility/totals/ranking; add a Kotlin local Expo module for SDK access only | Technical lead records in LUA-INT-01 |
| INT-DEC-02 | Superseded for Demo 2 by the user's full-system instruction: exactly three ordered purposes and three ordered priorities; legacy Demo 1 remains its own historical journey | Implemented in the new versioned profile; see §26 for verification and data boundaries |
| INT-DEC-03 | Expanded to Phone, Tablet, laptop and prebuilt desktop intake under the full-system instruction | All category entry points implemented; source coverage and model/device quality acceptance remain separate |
| INT-DEC-04 | Investigate Nano in an internal API 26+ build; decide production minimum OS or maintained core/Nano build variants | Native lead + product after LUA-INT-06; evaluate audience and release-maintenance cost |
| INT-DEC-05 | Test a compatible Kotlin/KSP/Expo matrix; any broader framework upgrade is separately estimated | Native lead at LUA-INT-06; record pass, further experiment or defer |
| INT-DEC-06 | Form/templates always available; local mode never silently sends to server. Existing server mode stays explicit | Client/AI owner implements in LUA-INT-07; verify T-INT-05 |
| INT-DEC-07 | Local Nano evidence does not replace existing server-provider D1 automatically | Product owner at REVIEW-01/G3 records original D1 evidence, explicit deferral or revised gate scope |
| INT-DEC-08 | Approved immutable catalog snapshots, Expo SQLite repository, separate user-data ownership; start refresh in foreground | Data/client owners confirm compatibility and migration strategy in LUA-INT-04/05 |

These decisions describe implementation policy or open product choices, not new approvals. No new parent U/A journeys, source priorities or spreadsheet approval values are introduced. The nine integration packages refine existing work; G0–G5 still control product readiness and release.

### 25.2 Ownership, modules and code touchpoints

| Boundary / current location | Implementation work | Completion invariant |
|---|---|---|
| `src/domain.ts`, `src/picker.ts` | Extract typed catalog input, money/eligibility/ranking/reason functions into `src/advisor/domain/`; keep fixture adapter | Existing fixture outcomes and stable order survive extraction; no direct fixture-global dependency in production evaluation |
| `src/AndroidApp.tsx` | Extract session reducer/review, request lifecycle and persistence orchestration into `src/advisor/session/`; reuse screens/tokens | Draft, confirmed profile, filters, comparison and saved snapshots have explicit ownership |
| `src/ai.ts`, `services/demo-ai` | Add `src/advisor/ai/` provider interface, legacy server adapter, deterministic path and native adapter | Same allowlists, revision checks and fact rendering for every provider |
| `src/advisor/contracts/`, `config/` (new) | Version profile/patch/run/capability contracts, category/intake taxonomy, question predicates and applicable priorities | Missing/unknown/not-applicable are explicit; configuration uses supported enums/operators rather than executable downloaded code |
| `modules/advisor-ai/` (new) | Kotlin availability/download/extraction/cancel bridge, typed JS wrapper and unsupported web/Expo Go path | No model-driven price, catalog mutation, compatibility verdict or navigation |
| `src/advisor/data/`, `tools/catalog/` (new) | Fixture and SQLite adapters, staging validator, reviewed snapshot exporter/importer | One immutable snapshot/policy set per run; failed import cannot change the active catalog |
| Expo configuration / `plugins/` where needed | Reproducible native dependency and manifest settings | Regeneration retains the module/configuration; no durable changes hidden in ignored generated Android files |

Logical folders need not become independent packages. Move responsibilities only when their implementation lands. Keep the existing `Store.version: 2` migration lineage; the attachment's example schema version does not reset it. Existing `validOffers()` is intentionally bound to 18 fixture offers: retain it for workshop validation and create a separate reviewed-catalog validator. Preserve fixture ID isolation from production identities/URLs.

Data authority is explicit: the publisher reviews facts/offers/policies; the installed app reads its approved local snapshot and evaluates the TypeScript core; connected revalidation may update current observations. Qdrant can later discover candidates/evidence, but retrieved IDs/revisions must be checked against published data. Neither vector similarity nor the crawler's default n-gram hash embedder supplies a suitability verdict. No remote search service is needed to finish the first offline slice.

### 25.3 Profile, purchase and session contracts

Implement these additions through versioned adapters/migrations:

- **Needs:** category/subtype, taxonomy/intake/question versions, ordered purposes, separate mandatory workloads, applicable soft priorities, typed hard constraints and field origin/confirmation. A persona triggers relevant questions; it does not imply RAM, OS or budget. `Strength` stays `UNRATED` until an evidence rubric exists.
- **Budget:** optional preferred band/target plus independently confirmed `hardMaxTotalVnd`, currency and purchase scope. Existing exact `budget` migrates to its established ceiling meaning. An unspecified ceiling remains unknown; the preferred band's lower bound never requires spending more. If the attachment's tiers are enabled, version their `[min, max)` boundaries and test them.
- **Patch:** base revision/request/session, allowlisted typed `SET`/`CLEAR`, source text and clarification codes. Omission keeps the current value; explicit `CLEAR` may make the profile incomplete. Review material edits before committing, and reject stale or contradictory proposals. Do not invent choices to meet a count.
- **PurchaseCandidate:** exact variant + valid offer + required accessories/upgrades. Each hard check returns pass/fail/unknown with a reason/evidence reference. Unknown required accessory cost or compatibility cannot yield a confirmed within-budget/compatible result.
- **RecommendationRun:** profile revision, snapshot, taxonomy/question, rule/scoring versions, eligible/unknown/excluded candidates and rendered reason references. Filters affect the visible subset, not the confirmed profile. Fewer than three eligible variants is valid.
- **Persistence:** separate durable draft from confirmed profile and dated saved decisions. Commit complete user edits, preserve original payloads during migration, isolate corrupt records and support scoped deletion. Process death restores committed state without resending a prompt or reopening an offer.

Changing profile/category/policy/catalog invalidates dependent results and in-flight requests. Preserve independent answers; explain which dependent choices require reconfirmation. Ranking-policy changes get a separate reviewed replay after extraction; missing evidence does not become invented utility, and overlapping uncertainty intervals do not establish a definitive winner.

### 25.4 Catalog and synchronization delivery

Use the existing crawler files as staging input. The research observed 70 retailer records, separate from the app's synthetic catalog; do not interpret that count as approved unique variants. A02/A03/A04 work resolves exact manufacturer/region/configuration identity, typed units, sources, permission/retention status, offer charges, discount eligibility, condition, stock and observation timestamps before publication. A06/A07 work reviews questions/rules and their effect on fixed cases. A09 keeps the valid snapshot/core usable during failures.

Start with synthetic bundles that exercise the complete importer. A real bundled starter catalog is released only after the source/data gate. Use the existing REAL-01 coverage hypothesis (30–50 exact laptop variants, 2–3 maintainable sources) as a review input; the attachment's 100–300 multi-category SKU goal is a later sizing hypothesis, not a new minimum or a reason to fill gaps with generated data.

Implementation sequence:

1. Create versioned schemas for variant, offer/price observation, fact/source, taxonomy/questions, rules and snapshot manifest. Include dataset mode, market, app/schema compatibility, bytes, digest and trusted-origin/signature metadata. Validate cross-record references and known policy operators.
2. Add the Expo SDK-compatible SQLite adapter. Import a bundled snapshot on first use so the core works on a first offline launch. Keep settings/saved decisions in the existing store initially; introduce separate transactional session storage only with a justified, tested migration.
3. Implement proposed `/advisor/v1/manifest`, `/advisor/v1/catalogs/{version}/bundle` and `/advisor/v1/policies/{version}` delivery or equivalent authenticated static paths. These catalog endpoints do not currently exist; specify their deployment/ownership before connecting a production client.
4. Download with size/time bounds, validate authenticity and content, import into versioned staging tables, then activate the entire snapshot in one transaction. Keep the prior version; never replace an open database file underneath a connection. Interrupted/invalid imports leave active catalog and user history intact.
5. Capture active versions at run start. Re-evaluate or mark results outdated after activation; retain dated saved observations and withdrawn-item context. Garbage-collect only snapshots no active run needs. Unsupported future schemas remain recoverable.
6. Deliver user-triggered/foreground refresh first. Add SDK-compatible Expo BackgroundTask only when justified; refresh is best effort and never performs Nano inference. Report observed/expiry context rather than treating background scheduling as a freshness guarantee.

A snapshot signature establishes origin, not factual correctness. Offline stale prices remain reference observations; connected purchase handoff revalidates available offer context and uses reviewed destinations. Keep export/recovery/delete scopes and Android backup behavior documented before claiming device-exclusive storage. Catalog/rule rollback and user-schema migration require separate recovery procedures.

### 25.5 Work packages, dependencies and estimates

Status for every row: **planned; not executed**. Roles are responsibilities, not assumed staff count. Estimates are focused developer-days for someone familiar with this repository and are incremental to the delivered demo.

| ID | Output and owner | Dependencies / readiness | Done when | Effort |
|---|---|---|---|---|
| LUA-INT-01 | Baseline, scope/decision register, target matrix and evidence gaps; product + technical lead | Current demo/research | INT-DEC records have working policy, owner and resolution point; existing fixture baseline and G1/G2/D1 gaps are recorded | 1–2 |
| LUA-INT-02 | Explicit domain/catalog/provider contracts and fixture adapter; domain/client | 01 | Evaluation and AI validation receive the same snapshot; existing regression outcomes preserved; T-INT-01 | 2–3 |
| LUA-INT-03 | Partial patches, field origins, session reducer and draft restore; client/domain | 02 | v1/v2 migration/recovery, confirmation and stale-result rejection pass; T-INT-02 | 2–3 |
| LUA-INT-04 | Catalog schema, staging validation, reviewed export contract and bundled laptop dataset; data/domain | 02; data reviewer; G4 before real publication | Synthetic failure fixtures pass; real records satisfy source/identity/cost/evidence review before activation; T-INT-03 | 3–5 |
| LUA-INT-05 | SQLite, versioned import, foreground refresh and rollback; client/data | 03/04 | First launch offline, atomic activation, failure recovery and historical context pass; T-INT-04 | 3–5 |
| LUA-INT-06 | Native Nano feasibility report and reproducible version matrix; native lead | 01; supported physical phone | Development/release build and physical capability/download/extraction evidence, or a documented no-go/defer decision; T-INT-05 feasibility subset | 2–4 |
| LUA-INT-07 | Nano/provider router, extraction/review, cancellation and fallback; native/client/AI | 03 + successful 06; labelled Vietnamese cases | Validated proposals only; explicit routing; lifecycle/quota/late-output cases pass; T-INT-02/05 | 3–5 |
| LUA-INT-08 | Independent evaluation, release/device/accessibility and performance evidence; QA + data/AI reviewers | 05; 07 for Nano-enabled scope | T-INT-06/07 and applicable T-D/T-P results recorded; core and Nano outcomes assessed separately | 4–6 |
| LUA-INT-09 | Evaluated release scope, feature flags, rollback and decision pack; product + QA/operations | 08; relevant G3/G4 before pilot | T-INT-08 and applicable G2/G3/G4/G5 decision records identify coverage, issues, deferrals and rollout owner | 1–2 |

Total with the planned Nano path: **21–35 developer-days**. Excludes broader Expo/RN migration, data editorial/licensing work, hardware acquisition, waiting/recruitment, expanded categories and LiteRT-LM. Work can overlap only where dependencies and real capacity allow; do not divide the total mechanically by team size. Re-estimate after 04/06 and before committing a release date.

Core critical path: 01 → 02 → 03/04 → 05 → 08 → 09. Nano path: 01 → 06, then 03 + successful 06 → 07 → 08. If 06 fails, 07 stays deferred; 08/09 can evaluate and deliver an explicitly core-only scope. A completed feasibility investigation with a no-go result is not successful Nano integration. Full integration completion still requires the enabled Nano path to meet its acceptance scope or a recorded scope change.

| Existing work / requirement | Integration decomposition |
|---|---|
| DEMO-03/04/05; U01/U02; A06/A07 | 02/03 extract and extend needs/evaluation without restarting synthetic journeys |
| DEMO-06/07; U03/U04/U05/U07/U08 | 03/04/05 preserve exact identity, comparison, offers, saved observations and user control |
| DEMO-09/10; U01; BR-07 | 06/07 add local capability and shared validation; original live-server D1 remains separately evidenced |
| REAL-01/02; A02/A03/A04/A06/A07 | 04 prepares reviewed source/catalog/policy publication; full production roles/audit remain required |
| REAL-03/04; A09; BR-06/11/13/15 | 05/08/09 deliver local production adapters, freshness, failure handling and rollback |
| DEMO-08/REVIEW-01/PILOT-01; NFR and AC-UX | 01/08/09 carry forward device, comprehension, performance and gate obligations |

### 25.6 Native AI feasibility and operational contract

The 12 November research found Prompt API minimum API 26 and ML Kit GenAI's Kotlin 2.3+ requirement, compared with the app's recorded minimum API 24 and installed RN catalog's Kotlin 2.1.20 declaration. Installed Expo KSP mappings do not include Kotlin 2.3. These are compatibility risks to test, not a resolved build matrix. Structured output is optional and separately capability-checked. Official-source links and sample-version discrepancies are preserved in the research §5.

LUA-INT-06 must record resolved Expo/RN/AGP/Gradle/JDK/Kotlin/KSP/Prompt/schema versions, min/target SDK, merged manifest, ABIs, relevant native page-size support, release shrinking behavior and physical firmware/AICore/base-model identifiers. Test a bounded override only through reproducible configuration; a KSP lookup override alone does not establish compiler/plugin compatibility. An SDK guard alone does not resolve a library manifest minimum. Keep any framework migration outside the original estimate until scoped.

The native module exposes app-owned readiness, download, extraction and cancellation operations. Readiness distinguishes checking, ready, needs-download/downloading, unsupported/not-ready, temporarily busy, quota, invalid output and cancelled states. Native SDK types stay behind the bridge. Provide an optional-loading/unsupported implementation for Expo Go and web previews. A custom development/release build is required for native evidence.

Use one foreground request at a time. Count/bound prompt input and output, apply timeout/cancellation, avoid generation on each keystroke, and recheck readiness after download. Interrupted download never removes catalog/session data. Background, close or profile/session change invalidates the request even if SDK computation cannot stop immediately. Retry transient errors only within the recorded budget; quota/failure falls back to useful form/templates. Do not automatically download another model or transmit a prompt to cloud.

Verify explicit Vietnamese amounts, approximate targets, negation and corrections against independent labels/parser checks. A model's language availability and valid JSON do not establish correct extraction. The renderer owns facts, prices, verdicts and URLs; the model may select only valid reason IDs. Delay free-form factual explanations and optional ReasonPlan generation until separately evaluated.

### 25.7 Integration verification and quality gates

T-INT IDs are planned verification groups, not existing test commands or new parent business requirements. Preserve existing acceptance IDs. Each result records input/expected outcome, versions, build/device, observed failures and reviewer. Add meaningful checks with the implementation that introduces the behavior.

| ID | Required evidence | Traceability |
|---|---|---|
| T-INT-01 | Explicit snapshot parity, deterministic ordering, one-dong/tier boundaries, unknown required cost/OS, no hard failure overridden by score, distinct filter-empty/no-fit | U01–U05; BR-01–05/08/11; T-D02–05; attachment AT-03/04/05/07/14 |
| T-INT-02 | Typed SET/CLEAR/omission, confirmation, v1/v2 migration, corrupt-record recovery, process-death draft restore, race across profile/session/catalog/rules | U01/U07/U08; BR-07/11/12; T-D03/05/06/09; AT-08/13 |
| T-INT-03 | Exact variant/provenance/units, offer completeness, source status, policy enums, synthetic separation, malicious text treated as data | A02/A03/A04/A06/A07; BR-01/04/09/13/15; T-P02–05; AT-04/07/10/11 |
| T-INT-04 | First-install offline, old/unknown schema, wrong signature/hash, interrupted download/import, full disk, atomic activation/rollback, historical freshness | U02/U05/U07/U08/A09; BR-06/11/12; T-D06/08, T-P06/08; AT-01/12/13 |
| T-INT-05 | Native build/physical ready-downloadable-unsupported states, capability recheck, explicit server routing, foreground/quota/timeout/cancel/late result and model-version changes | U01/A09; BR-07/12; T-D01/08/09; AT-08/09/15 |
| T-INT-06 | Independently labelled Vietnamese extraction and reviewed ranking pairs; raw/accepted accuracy, coverage, abstention, critical errors by category/model/prompt | A06/A07; BR-02/03/07/08; T-P05; AT-06/10/14/15 |
| T-INT-07 | Complete release journey, compact/expanded Android, TalkBack/large text/Back/IME/recreation, cold/warm timing and resource limitations | U01–U05/U07/U08; AC-UX01–05; T-D01/05/07/08; AT-01/09 |
| T-INT-08 | Disable AI without disabling core, bad catalog/policy rollback, compatible app/data recovery, scoped deletion/backup review, handover and recorded scope decision | A09; BR-06/11/12/13/15; T-P06–08; AT-12/13/15 |

AT-02 category-change invalidation and AT-06 unrated/applicability behavior also belong to §25.9 expansion. AT-01 across all three device groups can pass only after that expansion; the laptop check is deliberately partial. The same distinction applies to all-category quality coverage.

Start with a small labelled native smoke set, then build separate development/validation/held-out sets. The attachment proposes 500 situations split 300/100/100; budget annotation/review separately and keep held-out examples out of prompt tuning. Report language/negation/money failures and useful coverage; universal abstention is not a successful model.

Proposed targets carried from the research: 99% raw exact match for explicit money, task/priority F1 ≥0.95, ≥80% agreement on 100 reviewed ranking pairs, local filtering/ranking p95 ≤200 ms on 5,000 loaded SKUs, and warm extraction p95 ≤5 s on enabled devices. These require reviewer-ratified devices, sample sizes and methodology before acceptance; report counts/uncertainty rather than treating a small set as population reliability. Cold start, I/O, app memory and observable AICore/accelerator costs are reported separately. Critical hard-constraint, amount, stale-commit and unsupported-claim failures block the affected capability regardless of average metrics.

### 25.8 Release, rollback and handover

Separate controls for core availability, Nano extraction, optional reason organization, explicit server mode, catalog refresh and later local-model support. Keep compatible policy locally available. A remote kill switch takes effect only after contact; local repeated-failure handling must preserve the form while offline.

Before enabling Nano, require LUA-INT-06/07 evidence and T-INT-05/06/07 on the release configuration. Before real catalog publication/pilot, require G3/G4, reviewed source/offer/policy coverage and T-INT-03/04/08. Progress from internal fixtures to controlled approved data and bounded pilot; expansion beyond pilot requires the existing G5 decision. No planning row or successful APK build accepts a gate.

On bad catalog/policy import, retain or reactivate a compatible prior snapshot. On extraction regression, disable that provider/task and retain form/templates. On incompatible user migration, stop the affected rollout and preserve recoverable records rather than clearing user data. Record owner, affected versions, action, retest and reopen conditions.

Handover includes source/lockfiles, resolved native matrix, dataset/policy schemas and validation report, permitted-source/publication records, migration/import/rollback results, labelled evaluation and device reports, artifact checksum/install instructions, scope/unsupported capabilities, provider/data settings and applicable gate decisions. Track known/unperformed checks distinctly from failures and passes.

### 25.9 Expansion milestones and first execution increment

The bounded laptop delivery is partial against the supplied full-category plan. Complete these separate milestones before claiming its complete scope; estimate them after taxonomy, source and device readiness, outside the 21–35 day range:

| Milestone | Entry dependency and concrete work | Exit evidence / parent journey |
|---|---|---|
| Phone and Tablet advisor | Deliberate category scope decision, stable core/repository contracts, reviewed category data; configure personas/workloads, applicable OS/form factors, accessory totals, comparison rows and category-change migration | All-category offline journey, AT-01/02/04/06/11/14, category-specific quality/device evidence; extends U01–U05 with A02–A07 |
| Prebuilt desktop / PC scope | Define subtype/purchase scope; remove inapplicable battery/mobility scoring, include required peripherals and evidenced OS/software constraints | Complete-cost and applicability cases; U01–U05. Component solving requires the separate U13/A14 reviewed-compatibility milestone |
| Optional AI reason organization | Stable evidence renderer, passed extraction/runtime gates, independently reviewed reason ordering | Only allowed reason/tradeoff IDs accepted; no new facts or values; U01/U03/U04 and A07 |
| Optional LiteRT-LM | Demonstrated need beyond Nano coverage, supported/licensed model artifacts, download/integrity/space and device budget | Same extraction gates plus cold/warm memory/thermal/cancellation evidence; explicit model download/delete and deterministic fallback |

First execution increment: complete LUA-INT-01, extract one fixture-backed evaluator/AI-validator path under LUA-INT-02, and run the bounded native experiment under LUA-INT-06. The reviewable outcome is the existing laptop journey with explicit snapshot/provider boundaries plus a native feasibility report. Next connect confirmed profile → bundled snapshot → results/detail/compare/save, then optional extraction through the same review. Keep every increment usable when Nano or real-data readiness is delayed.

## 26. Full Device Advisor implementation — 13 November 2026

The user explicitly requested the full system after identifying missing integration-plan options. This increment extends the existing parent journeys and makes the attachment taxonomy available in the app. The current implementation record is [DEVICE_ADVISOR_SYSTEM.md](../../apps/adviser/DEVICE_ADVISOR_SYSTEM.md); the [verification manifest](../../apps/adviser/verification/device-system-build.json) records exact build and native results. Earlier dated demo notes remain historical.

### 26.1 Delivered integration

| Workstream / existing trace | Current implementation | Evidence / practical limit |
|---|---|---|
| U01/U02; LUA-INT-02/03 | Phone, Tablet, laptop/prebuilt desktop; all 19 purposes and ten priorities; exactly three/three ordered choices; versioned session, revision and confirmed/draft ownership | Taxonomy, count, reorder, dependent invalidation and restoration tests; no inferred conversion from old profiles |
| U01; AT-01/02/03/06 | Six separate intake screens, one adaptive question screen per selected purpose, UNKNOWN answer, conditional OS/form factor, exact price bands, desired target vs hard ceiling, accessories/condition/warranty/RAM, complete review | Three-category component journeys; first launch and completed intake share `ReferenceExplorer` |
| U01–U05; LUA-INT-03/05 | Pure deterministic eligibility, safe integer total cost, mandatory category/condition/OS/form/warranty/RAM/workload checks, weighted intervals, coverage, evidence reasons, category-specific reference results | Missing facts remain UNKNOWN. Desktop battery/mobility and hard OS/form do not receive soft scoring weight. Strength remains UNRATED; upgrade/repair stay distinct |
| U03/U04/U07/U08 | Real reference detail, source URLs, comparison, dated saved snapshots, export/delete and corrupt-record retention | Historical saved decisions retain their original observation context; native profile and catalog databases are separate |
| A02–A07/A09; LUA-INT-04/05 | 75 real observations from six sources; normalized SQLite source/listing/offer/fact/meta tables; local signed catalog publisher; pinned RSA signature, SHA256/size/schema/source validation, atomic activation and previous-snapshot rollback | Real HTTP/crypto/SQLite test rejects tampering, bad hashes/duplicates/unsafe sources; injected write failure preserves the active snapshot. Publisher is local test infrastructure |
| U01/A09; LUA-INT-06/07 | Local Expo Kotlin module using actual ML Kit Prompt API; capability, model preparation, foreground/cancel/timeout handling; optional bounded text proposal with independent parser agreement and review | Supported physical Nano ready/download/inference and Vietnamese quality evidence remain required. Core forms and template explanations work without Nano |
| NFR/DEMO-08; LUA-INT-08/09 | Domain/component/catalog checks, database exporter verification, reproducible build configuration and CI workflow | CI is configured, not claimed as remotely executed; observed emulator and build results are in the verification manifest |

Source: the supplied integration plan §§2–14, together with the user's subsequent separate-screen/shared-results/full-options instructions. Stable purpose IDs distinguish similarly named Phone/Tablet/PC personas. The taxonomy preserves all category-specific OS/form choices. PC budget boundaries use 16/32/62/92 million VND; Phone/Tablet use 8/16/24/32 million; the last tier has no upper bound. A band is a preference and never raises the hard ceiling automatically.

### 26.2 Native/build policy

This internal full-system APK adopts API 26 minimum, Kotlin 2.3.21, KSP 2.3.11, Prompt 1.0.0-beta5 and coroutines 1.11.0. Expo SDK 54/RN 0.81.5 remain the host. Durable Expo plugins set the Kotlin catalog and root buildscript dependency, explicit KSP2 version, build memory budget and narrowly scoped localhost cleartext exceptions. Native source dependencies are not patched, metadata checks and release lint remain enabled. See the implementation record for build commands and the exact successful/failed checks.

The local publisher's private key lives in ignored development storage; only its public pin is app source. Regenerating the signing identity requires preparing trust and rebuilding the APK. Production signing custody, key rotation and operated HTTPS publication require an operational design before a public release.

### 26.3 Remaining implementation/acceptance backlog

1. Expand reviewed, permitted product/offer evidence for every category: exact Vietnamese configurations, complete payable totals, stock, warranty, software compatibility and independently measured priority utilities. Current manufacturer records intentionally lack unverified prices and purchase availability; no ranking score repairs a mandatory unknown.
2. Extend text intake beyond explicit category/ceiling only after typed patch/provenance/conflict handling and independent Vietnamese labels are available. Current free-text clarification is retained and reviewed but does not establish software compatibility automatically. The form implements the complete taxonomy now.
3. Run Nano download/ready/generation/cancellation on supported physical hardware/AICore. Complete held-out Vietnamese extraction and ranking-pair evaluation; report raw output accuracy and useful accepted coverage independently. Keep Nano opt-in until these pass.
4. Complete physical TalkBack, large text, compact/expanded/foldable/recreation, full-disk/interrupted update, 5,000-SKU performance and resource tests. Emulator smoke checks and component mocks cover narrower software behavior.
5. Review provisional dimension anchors, target/band preference policy and Strength rubric before calibrated recommendation claims. Current target/band values are captured for review; hard affordability uses the explicit ceiling.
6. Establish editorial/source authorization, production catalog hosting, publishing custody, reviewer workflows, scoped policy rollback and incident ownership before real-source pilot operation. Optional LiteRT-LM, cloud routing, AI reason organization and component-by-component PC assembly remain separate milestones.

This increment supersedes the earlier Demo 2 scope restriction. It does not alter existing source approval cells, create new parent journeys, accept G0–G5, or claim the full production/evaluation backlog is complete.

13 November verification result for §26: 55 domain tests, three full-category component journeys with restoration/corrupt-draft checks, 18 legacy flow checks, and ten real HTTP/RSA/SQLite integration checks passed. Android release lint/build, APK signature and 16 KB ZIP alignment passed. The final installed APK retained the confirmed profile and saved history, upgraded its bundled catalog, completed native signed activation/rollback, opened a real reference and saved its dated decision. The emulator reported AICore unsupported; no supported physical Nano generation or production gate acceptance is claimed. Exact hashes, native matrix and observed boundaries are in the [verification manifest](../../apps/adviser/verification/device-system-build.json).
