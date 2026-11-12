# Reading notes — feature workbook, attached BRD and implementation plan

> Historical source review. A later user decision on 12 November 2026 supersedes the platform requirements described below: the active workspace BRD and implementation plan are now v3.0, Android-only React Native with HTML/CSS design previews and Material 3 Expressive. This note preserves what the original attachments and sheet said at reading time.

Reviewed on 12 November 2026 (Asia/Saigon). This is a source review and reconciliation note, not an implementation audit, approval record or revised requirements baseline.

The product direction is coherent: help a buyer in Vietnam choose an exact laptop configuration for confirmed tasks and a hard total budget, understand evidence and price conditions, compare alternatives and continue a purchasing decision. The supplied sources are **not a synchronized execution baseline**. The attached BRD mixes a short hackathon feature selection with the older native-demo and production acceptance framework. The implementation plan incorporates later picker and chatbot changes that the attached BRD does not contain.

**Sources and reading coverage**

| Source | What I read | Identity and limitation |
|---|---|---|
| [Linked workbook: general information](https://docs.google.com/spreadsheets/d/12dppW4eD3ej3eNVrsff2c4afLkCRoGLh4WWpfufvVGA/edit?gid=1525013457#gid=1525013457) | `Trang tính2`, populated content in A1:D7; inspected A1:Z50 and cell notes | The user-linked gid is general project discussion, not the 36-row feature inventory. |
| [Detailed feature inventory](https://docs.google.com/spreadsheets/d/12dppW4eD3ej3eNVrsff2c4afLkCRoGLh4WWpfufvVGA/edit?gid=0#gid=0) | All 36 populated feature descriptions, priorities and approval cells, plus the F3 explanatory note | Header row 3; U01–U18 on rows 4–21; A01–A18 on rows 22–39. A40:O65 returned no values. |
| Workbook tab `Trang tính3`, gid 1122241330 | A1:J45 | No values returned in the inspected range; no requirements inferred from this tab. |
| [Attached brd.md](C:/Users/luken/.t3/userdata/attachments/c2c007ca-aee8-4df3-ab3f-2ccb2d9101d4-6fbd1764-c943-4393-a2f9-20508d43299a-md.md) | All 409 lines, including every requirement, rule, detailed acceptance case and governance section | Header: version 2.0, 11 November 2026, draft and not signed off. Section numbering skips §6. |
| [Attached IMPLEMENTATION_PLAN.md](C:/Users/luken/.t3/userdata/attachments/c2c007ca-aee8-4df3-ab3f-2ccb2d9101d4-210ecdaf-2236-4f31-bdd1-fa40002f0482-md.md) | All 508 lines, §§1–23, including picker extension, proposed APIs, validation, release and handover procedures | Header: version 2.2, 11 November 2026, draft. Describes work to perform, not completed delivery. |
| [Workspace BRD](C:/Users/luken/test/docs/planning/BRD.md) | Targeted version and missing-reference checks only | Version 2.3; differs from the attached BRD. Contains §6, U19 and picker criteria missing from the attachment. It was not substituted for the requested attachment. |
| [Workspace implementation plan](C:/Users/luken/test/docs/planning/IMPLEMENTATION_PLAN.md) | File identity check | SHA-256 matches the attached implementation plan exactly. |

Workbook columns: A = STT; B = feature name; F = description; M = priority; O = `Chốt làm`. O4:O39 has no displayed approval values. Priority indicates proposed sequence, not approval. The F3 note explicitly groups subordinate functions into complete journeys and identifies native UI, accessibility, responsive behavior, weak connectivity, exact variants, source dates, commercial disclosure and personal-data control as cross-cutting requirements.

The source attachments were unchanged. SHA-256 fingerprints:

- Attached BRD: `F39EDF46F9816B694D61294FF53391D698A2814B59740277DA6027D09687DB1F`.
- Attached implementation plan: `A5C7B6707AE2F074D4EDEBBA079D422D064813C2B1B5DCD201488F7C4E22A034`.
- Workspace BRD: `37A43F35A2D0D0538306BE95428FE9324CEB0B97962C24DD80D55A54A832E1FB`.

References below use **BRD** for the attachment and **Plan** for the attached implementation plan unless explicitly marked otherwise. Linked research, the traceability register, external technical documentation and prototype verification records were not fully reviewed in this task. References to their existence or results are attributed to the supplied documents.

**What the linked general-information tab says**

- Goal: find laptops meeting users' requirements and identify inexpensive purchasing deals.
- Users: people finding products/deals; admins maintaining products and user accounts.
- Stack discussion: React Native frontend; TypeScript backend, database choice, online/offline storage and hosting are still written as questions. A phone demo with Tailscale is floated if hosting is not completed.
- AI direction: `LangGraph + ChatGPT API` is explicitly written in D6. This is a workbook direction; the attachments do not select LangGraph or specify its graph, state, tools or execution boundaries.
- Data ideas: retailer collection from TGDĐ/Phong Vũ and similar sources, review content from ReLab, daily new-laptop discovery and refreshing prices when a product is selected. These are ideas/questions, not verified integrations or agreed refresh contracts. The provocative wording about taking review content supplies no reuse authorization; BR-09 separately requires documented source access, retention and reuse before production publication.

The main feature sheet is materially more developed than these short notes. It describes exact identity, comparable cost, evidence review, controlled publication and distinct demo/production behavior. Generic product CRUD alone does not cover those operating outcomes.

**Product purpose, audience and outcomes — BRD §§1–5**

The adviser should help people make a defensible purchasing decision despite unfamiliar specifications, similar model names, workload differences and misleading headline prices. Its proposed differentiation is the continuous link between actual work, exact variants, local offer conditions, explanations and editable needs. A budget picker by itself is not the differentiation.

Initial market is Vietnam, with Vietnamese laptop selection and VND amounts. Android and Windows are the intended initial clients. React Native shares suitable domain and feature contracts; Windows requires an actual WinUI 3 approach and Android requires Material 3 Expressive. New laptops first, phones later and PC builds after compatibility readiness are proposed sequencing. Student/office use and mainstream development, including bounded VM cases, are proposed initial workload segments. Specialist creative, engineering, gaming and local-AI support requires sufficient evidence.

The six objectives are: capture needs accurately; shortlist suitable exact configurations; explain total cost and conditions; make claims inspectable/correctable; support usable Android/Windows journeys; and keep data operations and service costs maintainable. None of the research or fictional demo proves adoption, conversion, market size, willingness to pay, live-price accuracy or real hardware suitability.

Actors include the buyer/recipient, family payer, product sponsor, catalog editor/reviewer, recommendation reviewer, support/operations, engineering/design/QA and eventual data/retailer partners. Roles are responsibilities rather than an assumed team size. Named owners, capacity, funding and several platform/data choices remain open.

**Complete user-feature inventory and attached-BRD urgency**

Sheet priorities below preserve the actual wording. BRD urgency has a separate hackathon meaning: **1** = core first; **2** = add after core if time remains; **3** = future; **0** = omit from the hackathon. It must not be mechanically equated with the sheet's three labels.

| ID; sheet row | Journey and expected outcome | Sheet priority | Attached BRD urgency |
|---|---|---|---|
| U01; 4 | Guest laptop picker: order 1–3 primary uses, add mandatory tasks, set exact total ceiling and up to two soft priorities, answer relevant branches, review/confirm, inspect up to three initial exact variants with more available, refine and continue to detail/compare/save. | Làm trước tiên | 1 |
| U02; 5 | Search deals directly without mandatory questionnaire; filter/sort supported variants and inspect price, seller, stock, conditions and observation time. No unsupported discount or urgency claims. | Làm trước tiên | 1 |
| U03; 6 | Inspect exact configuration, change variant and update all dependent specifications/offers/claims; inspect suitability, evidence and unknowns; report incorrect information. | Làm trước tiên | 1, grouped with U05 |
| U04; 7 | Compare exact variants on the same scope and units; mobile starts with two; retain selection while changing priorities or one product; explain meaningful evidenced differences. | Làm trước tiên | 1 |
| U05; 8 | Compare sellers for one configuration, known mandatory charges and eligible discounts; inspect policy/source context and hand off to the correct seller in production. | Làm trước tiên | 1, grouped with U03 |
| U06; 9 | Check a pasted quote/link or manually entered offer; confirm extracted fields and ambiguity; assess fit/cost/gaps, then save/compare/visit seller. OCR is later. | Làm trước tiên | 3 |
| U07; 10 | Save a decision with exact variant, needs and dated price context; reopen, identify changes/staleness, delete and share a scoped summary. Cross-device sync is later. | Làm trước tiên | 2 |
| U08; 11 | Start without an account; manage display settings and local information; request permissions at relevant actions; support appropriate inspect/export/delete controls. Account sync is optional later. | Làm trước tiên | 2 |
| U09; 12 | Track suitable configurations against a target total, deadline and chosen notification channel; show observation history/gaps; revalidate alerts and allow pause/stop. | Làm sau | 3 |
| U10; 13 | Plan cash, contributions, savings or evidenced installment costs; show payment schedule and total, with editable assumptions and no credit-approval promise. | Làm sau | 0 |
| U11; 14 | Assess used/open-box/refurbished offers using condition, repair/battery/lock evidence, comparable costs and a model-specific inspection checklist. | Làm sau | 0 |
| U12; 15 | Compare keeping, repairing, upgrading or replacing the current device from exact configuration, symptoms, tasks and sourced options; distinguish diagnosis from uncertainty. | Làm sau | 3, grouped with U13 |
| U13; 16 | Build a complete PC with task/budget scope, existing parts, compatibility and basket costs; start with reviewed templates before unrestricted generation. | Làm sau | 3, grouped with U12 |
| U14; 17 | User confirms purchase; maintain receipt/policy context, receiving checks and editable warranty/return reminders. Retailer clicks do not establish ownership. | Làm sau | 0 |
| U15; 18 | Shared family/group buying plan with roles, requirements, conflicts, comments and attributable approval; later bulk quotation only with real partner terms. | Còn thời gian thì làm | 0 |
| U16; 19 | Resale/trade-in comparison with conditional versus final quotes, fees and handover checklist; no automatic certification of device erasure. | Còn thời gian thì làm | 0 |
| U17; 20 | Configuration-specific owner experience and optional expert questions; disclose evidence limits, qualifications, fees and conflicts; support moderation. | Còn thời gian thì làm | 0 |
| U18; 21 | Find verified rental, borrowing or assistance programs with eligibility, deposit, duration and responsibility; compare with buying. | Còn thời gian thì làm | 0 |

U01 refinements must distinguish filters removing all visible results from no configuration satisfying mandatory requirements. Clearing filters preserves the needs profile. Compromise exploration is user-requested, clearly separated and cannot silently relax budget or tasks. Unknown evidence must not become a suitability pass.

**Complete admin-feature inventory and operating purpose**

Admin identifiers are derived from stable requirement mappings, not the sheet row: A01 corresponds to STT 19, A18 to STT 36.

| ID; sheet row | Operating journey and why it is needed | Sheet priority | Attached BRD urgency |
|---|---|---|---|
| A01; 22 | Assign, change and revoke staff access; enforce rights server-side and retain history so content publication has accountable authority. | Làm trước tiên | 0 |
| A02; 23 | Register sources/rights, stage imports, inspect errors/changes, fix mappings and retry without duplicates; prevents uncontrolled data entering recommendations. | Làm trước tiên | 1 |
| A03; 24 | Maintain exact variants, units and provenance; distinguish near-duplicates; preview, publish, suspend and restore revisions. | Làm trước tiên | 1 |
| A04; 25 | Maintain sellers, exact offer mappings, fees, conditions, stock/expiry and destinations; verify suspect prices and suspend unsupported buying claims. | Làm trước tiên | 1 |
| A05; 26 | Review assertion sources, tested configurations, dates/methods and conflicts; keeps advertising claims, independent measurements and uncertainty distinct. | Làm trước tiên | 3 |
| A06; 27 | Maintain questions, branches, ordered uses, mandatory tasks and evidence-backed mappings; simulate changes and version/rollback policy. The buyer still controls personal needs and budget. | Làm trước tiên | 1 |
| A07; 28 | Evaluate candidate ranking/rules/prompts/models against fixed cases and a baseline; block serious regressions, record release decisions and support fallback/rollback. | Làm trước tiên | 1 |
| A08; 29 | Triage and resolve information reports; link evidence, correction/suspension and outcome without exposing other users' private reports. | Làm trước tiên | 3 |
| A09; 30 | Diagnose source/model/client failures, freshness and cost issues; apply bounded recovery and verify actual restoration. | Làm trước tiên | 2 |
| A10; 31 | Control demo/pilot/production releases and feature exposure; monitor/revert. Remote configuration does not replace package building, signing and distribution. | Làm sau | 0 |
| A11; 32 | Analyze permitted aggregate behavior, missed needs, no-fit reasons, comprehension, corrections and useful-session cost; record sample sizes and limits. | Làm sau | 3 |
| A12; 33 | Maintain price history and alert eligibility/frequency, revalidate before sending, deduplicate and stop incorrect campaigns; depends on U09 and consent. | Làm sau | 3 |
| A13; 34 | Handle verified account/support/export/delete requests with minimal necessary access and an accurate outcome; conditional on server-held personal data. | Làm sau | 0 |
| A14; 35 | Review PC templates and upgrade paths, including BIOS/power/space requirements; re-review affected builds when components or firmware change. | Làm sau | 3 |
| A15; 36 | Verify service partners/programs, locations, fees, terms and responsibilities; update or suspend services that cease to be supportable. | Còn thời gian thì làm | 0 |
| A16; 37 | Moderate owner/expert content, qualifications, commercial interests and disputes; prevent subjective experience being presented as measurement. | Còn thời gian thì làm | 0 |
| A17; 38 | Maintain sponsored placements and approved affiliate destinations with disclosure and real reconciliation; keep organic suitability independent. | Còn thời gian thì làm | 0 |
| A18; 39 | Assess category/country readiness across catalog, offers, policy, language and full journeys before staged expansion. | Còn thời gian thì làm | 0 |

Example of role separation: a buyer chooses a tracked laptop and target price under U09; the system checks qualifying observations; A12 maintains freshness, erroneous-price handling, delivery exceptions and stop controls. A12 does not choose the buyer's budget or guarantee a reserved price. Similarly, A06 defines the needs interpretation rules, A05 reviews evidence, A07 checks candidate recommendation releases, and A09 handles service recovery.

The hackathon BRD groups these into seven rows. That grouping reduces immediate delivery scope but does not erase the underlying production obligations. For the fixture demo, reviewed version-controlled files, validation, simulation and rollback can supply limited admin behavior. A production admin portal and server roles belong to later work in the plan.

**Business rules and data meaning — BRD §§9–10, 18–19**

| Rule | What must remain true |
|---|---|
| BR-01 | Exact accepted variant identity is required; matching family names is insufficient. |
| BR-02 | Confirmed total ceiling and mandatory task/OS/peripheral requirements are hard constraints. |
| BR-03 | Missing critical requirements/evidence produce clarification, unknown or abstention; unknown budget is not unlimited. |
| BR-04 | Compare the same purchase scope, condition, location and eligibility; count mandatory charges once and separate uncertain benefits. |
| BR-05 | Expired, unavailable, mismatched or incomplete offers cannot win verified-cheapest status; state checked-store coverage. |
| BR-06 | Price/stock claims retain observation and expiry context; reopening saved data does not refresh it. |
| BR-07 | AI can propose interpretations/explanations; it cannot invent offers, prices, IDs, URLs or verdicts. Material profile edits require confirmation. |
| BR-08 | Explain actual task strengths, limitations and exclusions; measurements require tested-configuration/method context. |
| BR-09 | Document source access, retention and reuse before production publication. |
| BR-10 | Disclose sponsorship/affiliate relationships and preserve independent organic suitability. |
| BR-11 | Preserve variant/needs context across navigation, sharing and saving; invalidate derived results after confirmed changes. |
| BR-12 | Guest discovery works; minimize collection and request optional permissions when needed. |
| BR-13 | Production content has draft/review/published/suspended/archived states and attributable revision/reversal history. |
| BR-14 | Unknown mandatory electrical, physical or firmware PC compatibility blocks a fully-compatible verdict. |
| BR-15 | Separate synthetic/demo and production datasets and environments visibly and technically. |
| BR-16 | Seller redirect is not proof of purchase; only claim payment/referral/handover capabilities actually provided. |

Core entities: NeedsProfile/Decision; ProductFamily versus exact Variant; Evidence/Claim; Seller/Offer/PriceObservation; RecommendationRun; SavedDecision; Staff/Review/Correction. Specification, measurement, price and seller-policy evidence are different records/meanings. Money uses integers and explicit currency rules; physical values use consistent units.

Four questions stay independent: whether needs are understood; whether the configuration meets them; whether a current offer exists; and whether its complete payable total is within budget. A suitable device with unknown shipping does not establish verified affordability. An unsuitable product can remain visible in an explicitly qualified comparison.

The BRD's arithmetic example is illustrative: VND 20,000,000 base + 200,000 delivery + 300,000 assembly = 20,500,000. A confirmed eligible immediate 500,000 discount can reduce this to 20,000,000. Unknown shipping remains unknown. Optional insurance stays separate until selected; a fee already included is not added twice. These are calculation examples, not current market prices.

Needs move from draft through clarification/review to a confirmed revision. Runs preserve their input versions and may end in results, clarification, no suitable configuration, no verified offer or failure. Fit is pass/fail/unknown. Offer identity, price completeness and offer validity have separate states. Reports retain triage, ownership, waiting and resolution history. Offline clients retain dated observations and reconcile current publication state on reconnect.

Evidence conflicts require review of the particular assertion, not an unconditional preference for any source category. Corrections record previous/new values, evidence, actor/reviewer, reason, time and affected records. Lower-confidence imports must not automatically overwrite reviewed assertions.

AI receives the minimum relevant facts. A real source ID alone does not prove a sentence is true. The preferred demo response selects allowed facts, relation types and controlled wording; incompatible or unsupported claims are rejected. Private free text, raw prompts and uploaded documents are not general admin-search material. Provider transmission, notice, retention and diagnostics need explicit configuration.

**Detailed acceptance coverage — BRD §§16–17, 20–22**

The attached BRD defines **62 distinct acceptance IDs**: 32 for U01–U08 (four each), 18 for A01–A09 (two each), and 12 expansion criteria. These are written expectations, not passed tests.

- U01: clear dependent answers after task removal; preserve unknowns; explain true no-fit without relaxing requirements; reject outdated asynchronous results.
- U02: direct guest search; latest filters win; no unsupported discount labels; distinguish no matches, no current offers and network failure.
- U03: all facts follow the selected exact variant; numerical claims resolve to measurement context; general detail works without a profile; production reports reference the affected record/revision.
- U04: comparable units/cost/unknowns; soft preferences never repair mandatory failures; selection survives navigation; budget-change explanations need evidence.
- U05: reproducible total; conditional/unknown charges remain separate; expired/suspended offers lose current buying claims; demo action opens only a sample summary.
- U06: unsupported parsing has manual fallback; user confirms extracted facts; missing fees/evidence prevent definitive conclusions; quote provenance survives downstream actions.
- U07: restore independently of AI; keep historical versus current data distinct; sharing excludes private text unless selected; deletion and storage errors respect scope.
- U08: no mandatory account/notification/location for core discovery; accurate local-storage claims; appropriate permission-refusal fallback; verified server export/delete only in the supported production scope.
- A01–A09: server denial/revocation, staged idempotent import, exact identity/concurrent revision checks, publication prerequisites/suspension, evidence withdrawal, question/rule simulation and history, regression gates/rollback, privacy-preserving report resolution, and observed recovery.
- Expansion cases cover alerts; financial terms; used-device evidence; repairs/upgrades; complete PC compatibility; ownership reminders; collaboration; trade-in; moderated expertise; verified services; release/analytics/data rights; and commercial/category/country readiness.

Production roles distinguish editors, reviewers, recommendation maintainers, support, operations and access administrators. A role granting access does not automatically grant content publication or unrestricted private-data access. Where independent review is infeasible, the exception and actual reviewer arrangement must be recorded honestly.

Severity: S0 requires containment/suspension; S1 blocks release for broken core journeys or serious variant, affordability, constraint or AI-claim errors; S2 is material degradation with a truthful workaround; S3 is minor. Open S0/S1 cannot be treated as routine gate passage. Removing a capability requires an explicit coherent scope change and updated tests/copy.

Measures include adjudicated mandatory-constraint violations, needs-capture error, complete-total discrepancy, supported-profile coverage, freshness coverage, decision comprehension, useful-session cost and correction turnaround. Each needs a denominator, cohort, version, time window and missing/unknown cases. Clicks do not equal purchases. A five-person exploratory study and proposed four-of-five completion signal guide revision; they do not establish population-level effects.

**Nonfunctional expectations — BRD §11 and Plan §§17–18**

Business results must agree across Android/Windows for identical fixture inputs. Native identity and lifecycle/input behavior require code and device evidence, not screenshots alone. Adaptive layouts, text scaling, screen readers, keyboard-only Windows, Android Back/IME, contrast and non-color-only status are required checks. Vietnamese copy and VND formatting are initial requirements; strings should support later localization.

Provisional targets are input acknowledgement p95 under 100 ms; cached useful content under 300 ms; interactive shell under 2 seconds on Android and 3 seconds on Windows; filtered online results around 1.5 seconds and complete AI explanation around 8 seconds under documented conditions. These are not measurements. The plan proposes release-build observations on named hardware, at least 30 samples per timing case as an initial floor, and reporting samples/median/range/failures with any tail estimate qualified. Repeated navigation should be checked for sustained resource growth; no universal memory ceiling is invented.

Secrets remain server-side; privileged operations require server enforcement and revocation checks. Local persistence and production recovery have different obligations. Production freshness, retention, RPO/RTO, operational budgets, escalation owners and thresholds remain gate decisions. Slow/unavailable AI must not remove deterministic results.

**Delivery stages and dependencies — Plan §§1–14**

The minimum native demo path is Discover → guided needs and review → shortlist → exact detail → two-device comparison → sample offers → saved decision. D0 is deterministic and fictional. D1 adds real bounded provider-backed interpretation/explanation. Production uses permitted real data and operational controls after separate review.

| Gate | Required outcome |
|---|---|
| G0 | Named owners, selected scenario/scope, devices and acceptance baseline. |
| G1 | Release builds on Android and Windows; actual native budget/task/command controls, TypeScript state round-trip, lifecycle/focus/Back/resizing checks and dependency matrix. |
| G2 | Full D0 path, fixture invariants, persistence, failure states, visible sample labels and install/run evidence. |
| G3 | D1 real-provider behavior and invalid-output/fallback evidence, exploratory review, revised estimate and recorded accept/revise/stop. D1 deferral must be explicit. |
| G4 | Permitted sources/retention, audited coverage, workload evidence, operating owners, production scope/capacity and acceptance thresholds. |
| G5 | Production test/audit evidence, device measurements, restore/rollback/support readiness and pilot findings before wider availability. |

The first native slice contains only exact VND input, multiple task choices and a command displaying the shared typed profile. Inventory toolchains/devices, select compatible RN/RNW Fabric/native versions, build both hosts and verify events/lifecycle before broad screen expansion. Styling-only or browser substitution requires a product decision under the existing plan.

| Package | Deliverable and dependency meaning |
|---|---|
| PREP-01 | Freeze scenario, scope, owners, devices and dependencies; establish G0. |
| DEMO-01/02 | Reproducible native hosts and essential adapters/state round-trip; establish G1. |
| DEMO-03 | Runtime schemas, versioned synthetic data, fixed clock, validation and reset. Can develop while feasibility is investigated. |
| DEMO-04 | Pure deterministic money, hard eligibility, offer selection, ranking and explanations; depends on fixture contracts. |
| DEMO-05 | Platform shells, guided review, ordered uses, result refinements, search, revisions and cancellation; follows native feasibility/domain work. |
| DEMO-06 | Exact detail, evidence, paired comparison, sample offers and explanation surface. |
| DEMO-07 | Local save/restart/restore/delete and visible mode/reset behavior. |
| DEMO-08 | Failure/accessibility/device performance checks, packages and G2 evidence. |
| DEMO-09/10 | Small server AI adapter followed by client integration, confirmed proposed edits, validation, fallback and real-provider evidence. |
| REVIEW-01 | Reproducible demo and buyer review, issue/cost/estimate reconciliation and G3 decision. |
| REAL-01 | Permitted sources and audited catalog/workload coverage; G4 readiness. |
| REAL-02 | Authoritative API/storage, staged import, staff roles, publication/correction/audit and operating controls. |
| REAL-03 | Real consumer adapters, U01–U08 production paths, bounded quotation intake, retailer handoff and sharing. |
| REAL-04 / PILOT-01 | Freshness, resilience, privacy, restore, packaging and support; then bounded evaluation and G5. |

D0 specifies **12 synthetic variants, 18 offers and 3 sellers**. Required scenarios include exact-ceiling/over-budget totals, similar names/different configurations, incomplete shipping, conditional discounts, expired/unavailable/stale offers, unknown critical capability, true no-fit, profile revisions, AI failures and persistence/reset. Record count without scenario coverage is insufficient. Fictional records have synthetic provenance and no real purchase URLs; their capability thresholds do not establish hardware guidance.

D0 needs no database, queue or separately published packages under this plan. Initial domain calculations are pure shared TypeScript. Repository and clock interfaces permit later real adapters. Production moves authoritative evaluation and price resolution behind a typed service, avoiding inconsistent simultaneous client/server authority. Neither attachment selects PostgreSQL or Qdrant; introducing them would be an additional architectural decision, not compliance with a named requirement in these attachments.

The earlier 15–25 focused engineering days for D0 and another 3–5 for D1 are explicitly historical sizing context, not a committed budget. The earlier 10–14 week pilot timeline is also historical. Re-estimate after G1 using tasks, evidence, staff capacity and waiting dependencies. Proposed 30–50 real variants, 2–3 sources and 100–150 evaluation profiles are planning inputs, not demonstrated coverage or completed evaluation.

**State, persistence and AI contracts — Plan §§6, 15–16**

The proposed layout separates app/platform shells, domain, data/repositories, features, semantic UI contracts, native integration, localization and demo tools, with `services/demo-ai` for D1. Initial shared component meanings include BudgetField, ChoiceGroup, NeedsSummary, ProductSummary/RecommendationCard, PriceSummary/OfferList, comparison, evidence, explanation and feedback states.

Use stable decision ID plus profile revision, schema version, dataset version and rules version. A confirmed edit creates a new revision and stales derived results; late responses cannot overwrite newer inputs even if cancellation fails. Search/filter state, comparison selection and saved snapshots have distinct ownership.

Validate IDs, safe integer VND values, charge semantics, evidence references, answer states and supported options. Repository failures distinguish absent record, temporary outage, invalid data and unsupported mode. Failed persistence preserves prior valid data and must not report success. Corrupt/newer-schema records should be isolated and preserved for recovery rather than triggering destructive reset of unrelated decisions.

Proposed endpoints are `POST /demo/needs/interpret` and `POST /demo/advice/explain`; the document does not establish that they exist. Requests carry decision/profile/version context. Interpretation returns allowed proposed fields and unknowns; no privilege, product identity, price or compatibility verdict may be patched. The client presents material changes and applies them only after confirmation.

Explanation consumes a deterministic fact bundle. Proposed claims contain subject variant, kind (advantage/limitation/unknown/exclusion), allowed relation, fact IDs and a controlled wording key. Validation checks semantic compatibility, ownership and current versions. Correct IDs attached to a contradictory sentence still fail. Timeouts, cancellation, invalid output and provider absence have explicit modes and deterministic fallback. Set request/output/concurrency/usage bounds; prevent duplicate paid retries; log minimal diagnostic/version/cost information.

**Guided-picker extension — Plan §23 and sheet U01/A06/A07**

The extension stays inside existing parent journeys. It adds `primaryUseOrder` with one to three unique supported IDs, `additionalRequiredTaskIds`, `useOrderConfirmed`, budget scope, typed follow-ups, revision and question version. All primary and additional tasks contribute mandatory constraints. Existing task-array order cannot be retroactively treated as confirmed user priority.

Store refinements separately: numeric minimum/maximum screen inches, maximum kilograms and sort mode. Keep draft versus applied filters; cancelling the mobile sheet discards only draft filters. Unknown attributes cannot satisfy an explicit filter. Preserve selected/saved products outside the visible filtered subset with appropriate labels.

Output states include `eligible`, `filterEmpty`, `noEligible`, `needsClarification`, `unsupported` and `serviceError`, with input versions, checks, evidence IDs, eligible/visible/exploratory IDs and causes. Migration preserves v1 budget/tasks/preferences/saved IDs/observations; order remains unconfirmed until the buyer confirms it. Do not overwrite the original payload until validation and persistence succeed.

Ranking first applies exact identity, valid offers, total ceiling and all mandatory requirements. Only eligible variants are ranked. Proposed experimental importance weights are 3:2:1, normalized for fewer uses, then explicit product preferences, payable total and stable variant ID. This policy is pending product/technical review; it is neither a measured performance score nor a verified competitor algorithm. Missing evidence must not be silently treated as zero performance.

Compromises appear only after a user action and name each unmet/unknown requirement and known budget delta. They stay outside the confirmed shortlist. Applying a suggested change shows the exact edit, obtains confirmation, increments revision and reruns every check.

UI additions include ranked use selection, needs review, active filter summary and per-task fit. Android uses short steps and an accessible refinement sheet; Windows can use a resizable needs/review pane beside results. Reordering requires accessible move-earlier/later controls; drag cannot be the only method.

The eight review scenarios cover ordered uses plus another mandatory task; meaningful reranking without changing hard requirements; exact budget shortcut/manual edit; filter-empty recovery; genuine no-fit/unknown evidence; explicit compromise; compare/save/schema migration; and blocked bad-policy activation followed by rollback. Existing browser assertions do not prove these additions pass.

**Verification and handover — Plan §§8, 18, 21–22**

Verification groups: T-D01–10 cover native builds, money, intake/eligibility, identity/evidence, flows/revisions, persistence, accessibility, resilience/performance, AI and demo comprehension. T-R01/02 cover sources/coverage and audits. T-P01–08 cover real journeys, seller handoff, access/publication, corrections, recommendation regression, privacy/recovery, telemetry and outages. T-X01–05 are future expansion placeholders requiring detailed cases before acceptance.

Each evidence bundle identifies build commit, dependencies, fixture/rule/schema/model versions, actual device/OS, acceptance/test IDs, expected and actual results, reviewer/date, logs, timing sample counts, defects and artifact checksums. Absent device checks cannot pass on the basis of cross-building. Proposed script names are not evidence that executable commands exist.

The reproducible demo uses a synthetic VND 22 million study/coding/VM scenario, explores no-fit, inspects exact variants and provenance, compares two options, identifies complete/conditional/incomplete prices, opens the sample action, saves/restarts/deletes, demonstrates AI validation/fallback and repeats relevant native input/accessibility checks. This verifies software behavior, not market prices.

Handover includes runnable packages, lockfile/version matrix, setup/prerequisites, fixture maintenance/reset, verification results, performance observations, AI modes/configuration, issues and gate decisions. Production adds source permissions, API/data contracts, restricted admin workflows, publication history, refresh policies, restore evidence and operating runbooks. Rollback must account for schema compatibility; reversing a rule flag does not reverse a database migration or distributed app package.

**Source conflicts and missing decisions**

| Finding | Evidence | Consequence and recommended reconciliation |
|---|---|---|
| Two incompatible immediate delivery descriptions | BRD §§7–8 describe a 4–6 hour hackathon; BRD §§11–12 and Plan §§1–4 retain native proof, D0/D1 and formal gates. | Define whether the next deliverable is a bounded hackathon prototype or the full native-demo baseline. Do not claim the broad plan is achievable in the hackathon window merely because both occur in the same BRD. |
| Attachment BRD is not the workspace BRD | Attachment header v2.0 and distinct hash; workspace header v2.3. Plan attachment matches workspace plan. | Record which BRD revision is the governing candidate. Preserve the supplied hackathon edits when reconciling; do not silently replace them with the workspace file. |
| Missing release-scope definitions | Attached BRD jumps from §5 to §7, while later text still uses P and staged/demo terminology. | Restore or replace the missing phase definitions, with an explicit hackathon-to-demo/production mapping. |
| U19 is referenced but absent from requested BRD and feature inventory | Plan opening refers to BRD §§7.2/16.9 and 37 journeys; attachment and live inventory contain 18 user + 18 admin journeys. Targeted workspace check finds U19 there. | Treat U19 as a plan-referenced later addition, not an attached-BRD requirement. Reconcile traceability and select its delivery stage. Timing, idle/session policy, threshold, cooldown and package/test assignments remain pending in the plan. |
| Seven referenced picker criteria are undefined in attached BRD | Plan §§14/23 reference AC-U01-05–10 and AC-A06-03. Attachment defines only U01-01–04 and A06-01–02. Workspace BRD contains the missing criteria. | Align BRD/plan/register versions before claiming acceptance coverage. The picker prose is clear enough to discuss, but its formal links are broken in the supplied pair. |
| Sheet priority differs from hackathon urgency | Sheet marks U06–U08 and A01/A05/A08/A09 as first; attached BRD moves them to 3/2/0 as recorded above. | Keep separate source-priority and release-inclusion fields. This may be intentional narrowing, but no filled approval cells establish agreement. |
| Save/guest behavior is optional in one view and integral in another | BRD table labels U07/U08 urgency 2; BR-12 preserves guest discovery; Plan minimum D0 path and G2 include save/restore/delete. | Distinguish foundational guest access from optional settings, and decide whether save remains required in the selected demo. Update gates if narrowed. |
| Seller links versus synthetic data | BRD §7 merged U03/U05 mentions purchase-page links; AC-U05-04 and Plan require sample-only demo actions. | Separate real-offer mode from synthetic demo mode. A fictional price must not lead to a live purchase as if it were a verified offer. |
| Sharing has different stage implications | BRD hackathon U07 includes summary sharing; AC-U07-03 scopes it to production; Plan DEMO-07 emphasizes local persistence. | Specify whether hackathon/D0 sharing is included and with what dated/sample context; do not infer completion from generic save support. |
| Link checking has different breadth | Workbook first-release U06 supports links/manual input; BRD summary implies extraction; detailed U06/Plan require supported parsing plus manual fallback and exclude it from D0. | Name supported input types/domains and stage; do not promise arbitrary URL/OCR extraction. |
| AI technology direction is not an implementation contract | General sheet says LangGraph + ChatGPT API; Plan leaves provider choice/settings pending and describes only a bounded service. | Decide provider/model/access settings and whether LangGraph serves a concrete need. Preserve deterministic authority regardless of orchestration choice. |
| Database/hosting choices remain open | General sheet asks DB online/offline and host questions; Plan says no DB/queue needed for D0 and specifies no PostgreSQL/Qdrant. | Select persistence, retrieval and hosting for the chosen stage with explicit contracts. Do not infer a database commitment from previous discussion or generic AI terminology. |
| Crawling ideas exceed current fixture scope | General sheet suggests daily new products/on-selection price updates; Plan prohibits using live ingestion to unblock D0 and requires source readiness before production. | Resolve permitted sources, refresh triggers, caching, observation time, failures and review publication before enabling live claims. |
| Navigation names differ | Hackathon table uses Explorer; detailed BRD/Plan use Discover/home routes. | Agree navigation labels and map both to the same journeys; avoid accidentally implementing duplicate entry flows. |
| Admin summary can conceal mandatory checks | Hackathon A06/A07 says apply new configuration; full requirements demand simulation/versioning/regression rejection. A09 fallback is urgency 2, while AI fallback is a D1 integrity requirement. | Keep validation and truthful fallback inside any enabled AI/rule capability. Reducing portal scope does not remove domain safeguards. |
| Prototype status wording is uneven | Plan opening reports a browser React Native Web subset; §18.1 still refers to a research-only repository without proposed scripts. | Treat the opening as an attributed status note and verify actual code/scripts separately before implementation claims. This review did not run or audit the app. |
| Open operational and approval decisions | BRD/Plan leave owners, devices, provider settings, supported cohorts, freshness, retention, restore objectives and capacity unresolved; approval column remains blank. | Attach decisions to a chosen stage and accountable owner. Proposed targets and document completeness are not acceptance evidence. |

**Working understanding for the next task**

I will preserve complete buyer/admin journeys and stable IDs, keep exact-variant and total-budget integrity central, distinguish mandatory requirements from preference ordering and filters, and treat AI as a constrained proposer/explainer. I will distinguish fictional interaction evidence, real-data readiness, native delivery and actual acceptance results.

The unresolved baseline choice is now concrete: the attached BRD's hackathon subset, the plan's full native D0/D1 sequence, and later workspace-only requirements need an explicit reconciliation before they can function as one delivery contract. This review records that gap without choosing a new scope, changing priorities, implementing features or marking any gate passed.
