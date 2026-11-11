# Business Requirements Document
## Vietnam-first AI device buying adviser

| Document control | Value |
|---|---|
| Version / date | 2.3 / 11 November 2026 |
| Status | Draft for stakeholder review; requirements proposed, not signed off |
| Initial market | Vietnam |
| Target clients | Android mobile and Windows desktop |
| Delivery direction | Native feasibility → interaction demo → AI demo → demo decision → production readiness → controlled pilot |
| Companion plan | [Implementation plan](./IMPLEMENTATION_PLAN.md) |
| Traceability | [Requirement and verification register](./project-traceability.json) |

Version 2.0 established detailed use cases, acceptance criteria and lifecycle rules. Version 2.1 explicitly expands U01 into the guided laptop picker and adds associated A06/A07 controls, based on [picker research and code-gap inspection](../../research/laptop-picker-research.md). Version 2.2 adds U19: a contextual chatbot invitation after sustained in-app/site product browsing or searching. These additions are planned work; existing browser verification does not establish their completion. The documented backlog now contains 37 parent journeys (19 user and 18 admin); U19 has not been added to the source spreadsheet. Native/AI stage gates remain unchanged.

Version 2.3 adds the admin necessity analysis in sections 8.1–8.6 and detailed A06 acceptance cases. It explains operational needs, minimum delivery scope, ownership and the full lifecycle of a needs/question/rule change. The 18 admin journeys remain intact; added analysis does not approve implementation or alter source-sheet priorities.

Reading guide: sections 1–6 explain the business and staged scope; sections 7–11 catalog requirements and rules, with admin necessity and needs-management analysis in section 8; sections 12–15 define governance and sources; sections 16–22 specify the behavior and evidence needed to assess readiness. Implementation mechanics are in the companion plan.

## 1. Purpose and decision requested

Define the business outcomes, complete customer/admin journeys, scope boundaries, business rules and acceptance evidence for an AI-assisted buying adviser. The immediate delivery objective is a demonstrable application. Production implementation follows a recorded demo decision; the demo is not a soft launch with fictional prices presented as purchasable offers.

Reviewers should agree the demo boundary and acceptance criteria first. No sign-off, supplier agreement, native integration result or software delivery is implied by this document. The next phase decision must explicitly identify scope, owner, capacity and unresolved conditions.

## 2. Business problem and opportunity

Purchasing a laptop, phone or desktop can require reconciling unfamiliar specifications, real application needs, similar model names, price conditions and seller policies. A lower advertised price may refer to a different configuration or depend on eligibility, delivery, trade-in or payment conditions. Generic recommendations can miss the buyer's actual tasks and constraints.

The opportunity is to help a person reach a defensible purchasing decision with an understandable shortlist, consequential advantages/disadvantages, comparable offers, evidence and visible uncertainty. The value hypothesis is fewer misunderstood requirements and offers, with less effort to reach a suitable shortlist. Interviews and pilot evaluation must establish whether this value occurs; the research to date has not demonstrated adoption, conversion, market size or willingness to pay.

GSMArena, PhoneArena and bestlaptop.deals inform specification discovery, structured comparison and needs-based selection. A budget/use-case picker alone is not a defensible distinction. The proposed differentiation is a continuous decision based on actual workloads, exact variants and local offer conditions, with explainable exclusions and editable requirements. See the [competitor research](../../research/project-research.md).

## 3. Objectives and success measures

| ID | Business objective | Evidence and measurement |
|---|---|---|
| OBJ-01 | Capture the needs of the current buying decision accurately | User confirms/corrects tasks, ceiling and required applications; measure missed mandatory requirements and correction causes |
| OBJ-02 | Help users choose among suitable exact configurations | Independently review suitability against a fixed reference set; record no-fit handling and errors by workload/budget |
| OBJ-03 | Make the cost and conditions understandable | Users identify payable total, conditional discounts and unknown costs; audit against source/checkout evidence |
| OBJ-04 | Make advice inspectable and correctable | Decisive claims resolve to evidence or explicit assumptions; track invalid claims and correction turnaround |
| OBJ-05 | Provide a usable Android/Windows experience | Complete the same decision on both clients; preserve state, accessibility and responsiveness |
| OBJ-06 | Operate a maintainable, financially bounded service | Track catalog coverage, freshness, source failures, staff effort and model/data cost per useful session |

Demo evaluation uses fictional data and verifies interaction/rule behavior. It cannot establish live-price accuracy or real hardware suitability. A proposed five-person exploratory demo study identifies problems; it does not justify population-level improvement claims. Production usefulness targets must be ratified after baseline research, with sample sizes and denominators reported.

## 4. Stakeholders and actors

| Actor | Responsibility / need |
|---|---|
| Product owner / sponsor | Approve scope, acceptance, funding and transition between stages; named person TBD |
| Buyer / recipient | Specify tasks and constraints, inspect tradeoffs, choose whether/where to buy |
| Family member / payer | Review a shared decision; collaborative approval is a later feature |
| Catalog editor / reviewer | Maintain exact variants, sources, offers and claims; approve publication within assigned authority |
| Recommendation reviewer | Maintain workload rules and evaluate ranking/AI changes |
| Support / operations admin | Resolve reports, monitor failures, maintain service and access controls |
| Engineering, design and QA | Implement, measure and provide acceptance evidence; one person may cover multiple roles |
| Retailer / data provider / future partner | Supply authorized data or services with documented scope and conditions |

Initial buyer segments are proposed: students/office work and mainstream software development, including bounded VM scenarios. High-end creative, engineering, gaming or local AI workloads require adequate evidence before being represented as supported. Occupation prompts clarification; it does not determine specifications by itself.

## 5. Confirmed direction and open choices

Confirmed by the conversation: Vietnam first; expand globally later; Android and Windows first; React Native; actual WinUI 3 approach on Windows and Material 3 Expressive on Android; reusable app-wide components; adaptive, responsive behavior; structured discovery plus contextual AI; needs-driven multiple-choice intake; complete user/admin journeys instead of fragmented features; demo before production.

Proposed sequencing: new laptops first, followed by phones and then PC builds when their data/rules are ready. This narrows the first release, not the long-term product vision. Team, budget, provider, minimum OS/device support, operating targets and supplier permissions remain open.

## 6. Release scope and phase definitions

| Stage | Purpose and included boundary | Exit / next decision |
|---|---|---|
| F | Prove compatible native hosts and essential controls on both clients | G1: native feasibility accepted |
| D0 | Complete a local laptop decision with synthetic catalog/offers and deterministic explanations | G2: interaction demo accepted |
| D1 | Add real server-backed needs interpretation and grounded explanations, retaining D0 fallback | G3: AI demo and demo review accepted |
| R | Authorize the production baseline, establish permitted sources and audit a small real catalog | G4: data/operating readiness accepted |
| P | Implement and run a controlled Vietnam laptop pilot with real users and offers | G5: pilot accepted for a defined wider release |
| E | Stage phones, tracking, used devices, ownership, upgrades and reviewed PC builds | Separate category/feature readiness decisions |
| L | Partner services, collaboration, monetization integrations and other countries | Separate business and operational readiness decisions |

Stage F is part of the demo work. G3 is a hard boundary before production engineering: approve both D0 and D1, or explicitly document acceptance of a D1 deferral. A missing provider does not make a scripted response an AI acceptance result. Source discussions and feasibility research may occur during the demo; live integrations and production deployment require the subsequent scope decision.

### 6.1 Demo boundary

One connected path: Discover → needs/review → results → variant detail → two-device comparison → sample buying options → saved decision. Use Vietnamese and VND, twelve fictional variants, eighteen fictional offers and three fictional sellers. Counts are proposed fixtures, not market coverage targets.

Include synthetic price/eligibility states, a no-fit case, unknown mandatory information, edits, Back/restart behavior and failure recovery. Label sample data on discovery, cards, detail, offers and shared/saved summaries. Use a fixed demo clock for reproducible freshness scenarios.

Purchase actions show a local sample offer summary. They must not imply purchase completion or forward a fictional quote to a real retailer. Demo administration consists of versioned fixture editing, validation, preview and reset through a documented local maintainer workflow; no full admin portal, production identity system or live ingestion service is needed.

D1 adds two bounded AI operations: propose typed needs fields from text; explain supplied facts about the current decision. Invalid output is rejected. A distinct status identifies live AI, deterministic fallback and unavailable AI.

### 6.2 Production pilot boundary

Eight core user journeys U01–U08, and the minimum internal workflows A01–A09 required to operate them. Partial demo coverage is not a production completion claim. Start with roughly 30–50 exact new-laptop variants from two or three maintainable sources, subject to coverage and access findings. Maintain a restricted admin surface, manual imports/corrections, publication states, freshness handling, bounded AI and real retailer handoff.

Exclude full account synchronization, unrestricted crawling/OCR, price prediction, in-app checkout, lending, fulfillment, universal stock coverage, arbitrary PC builds, public community and global release. These are separate future scopes, where appropriate. The early admin workflows can be simple audited forms and commands; their outcomes are required, not an elaborate dashboard.

## 7. User business requirements

The source backlog uses STT 1–18 for U01–U18. U19 is a user-requested documentation addition without a source spreadsheet row; existing STT values are unchanged. IDs below are stable references independent of spreadsheet row position. Each row describes a complete user outcome. Stage denotes earliest planned delivery, with explicitly limited demo coverage where applicable.

| ID / source STT | Complete journey and acceptance outcome | Demo coverage / production stage |
|---|---|---|
| U01 / 1 | From Discover, open the laptop picker, order primary uses, retain all mandatory tasks, enter a total ceiling, answer relevant follow-ups and confirm. Inspect task-level fit, refine results, explore explicit compromises and continue to detail, compare or save. | D0 synthetic picker; existing frontend partial, v2.1 additions pending; D1 text interpretation; P verified workload/catalog evidence |
| U02 / 2 | Open Find deals, search/filter supported products, inspect variant/price/seller/conditions and open, save or compare a result. | D0 bounded fixture browsing; P real sourced offers, no unsupported discount labels |
| U03 / 3 | Open a device, select an exact variant, inspect specs/pros/cons/evidence and report wrong information. Changed variant updates all related content. | D0 fixture detail/provenance; P evidence sources and report submission |
| U04 / 4 | Select variants, compare consistent criteria, adjust requirements and choose or reject an option. Mandatory requirements remain explicit. | D0 two-device comparison; P verified comparisons; E optional ownership-cost scenarios |
| U05 / 5 | Open buying options, inspect comparable totals and seller terms, then open the chosen retailer. Known conditions and unknown charges remain visible. | D0 simulated offer summary only; P verified retailer handoff |
| U06 / 6 | Enter a supported link or quotation, confirm extracted fields, inspect suitability/cost/uncertainty, then save, compare or visit the seller. | P manual quotation plus bounded supported-link intake; broad OCR deferred |
| U07 / 7 | Save a decision, reopen it with dated context, remove unwanted entries and share a useful brief. | D0 local persistence/revisit/delete; P summary sharing; E optional sync/offline visit pack |
| U08 / 8 | Start without signup, inspect settings/data, edit or delete stored information and control contextual permissions. | D0 guest/local deletion/settings; P privacy disclosure/export and relevant permissions |
| U09 / 9 | Track suitable configurations against a target and deadline, inspect observed history, receive a rechecked alert and change/stop tracking. | E after price observation, freshness and notification readiness |
| U10 / 10 | Enter available funds/contributions/timeframe, compare documented payment or saving scenarios and save an understood plan. | E; no money custody or credit approval |
| U11 / 11 | Find a used/refurbished offer, inspect condition/repair/lock evidence, compare net cost and complete an inspection checklist before deciding. | E; independent inspection referral requires L partner readiness |
| U12 / 12 | Identify an existing device and limitation, compare keep/repair/upgrade/replace options and choose a sourced next step. | E manual bounded advice; hardware scan/service integrations later |
| U13 / 13 | Specify whole-build scope and retained parts, inspect/change a reviewed PC configuration, verify compatibility and compare complete purchase baskets. | E reviewed templates first; automatic solver requires later validation |
| U14 / 14 | Confirm a purchase, save optional receipt/terms, complete receiving checks and use verified return/warranty/support reminders. | E; purchase is user-confirmed, not inferred from a link click |
| U15 / 15 | Create a family/team plan, collect needs and approvals, compare whole-budget options and agree a purchase. | L; optional group quotes require genuine terms and suppliers |
| U16 / 16 | Describe a device for resale/trade-in, compare current conditional quotes and prepare documented data migration and handover. | L; no guaranteed final valuation or certified erasure claim |
| U17 / 17 | Inspect relevant owner experience, submit a scoped question, obtain a disclosed expert opinion and optionally contribute structured experience. | L after moderation and expert operating processes |
| U18 / 18 | Specify temporary access needs, compare verified rental/loan/assistance terms with buying and reach the relevant provider. | L after local provider/program verification |
| U19 / not yet in sheet | While browsing listings, viewing product details or searching within the app/site, accumulate active foreground time in the current session. At the configured threshold, show a dismissible chatbot invitation asking about needs. If accepted, open contextual chat without losing the current page, search or selected products, clarify tasks/budget and offer grounded suggestions. | Planned; delivery stage, timing and repeat policy pending review. No current implementation or acceptance evidence. |

### 7.1 Needs intake rules

Use route-specific questions; browsing and quotation entry do not require the entire recommendation questionnaire. Start with category, exact total ceiling, all regular tasks, allowed condition and up to two soft priorities. In the picker, distinguish one to three ordered primary uses from additional mandatory tasks and from soft product preferences. Ordering must not remove any mandatory requirement. The initial four-to-six-core-question idea is a hypothesis, not a mandated wizard length. Ask extra critical questions whenever the decision requires them.

The picker is a guest-accessible U01 entry, not mandatory account onboarding. Its result refinements are optional views over the eligible set. Show active refinements and allow clearing them without deleting the confirmed profile. Prefer exact VND entry with optional budget shortcuts; a shortcut must expose its resulting ceiling and must not impose a minimum spend. Reordering uses or selecting another task never increases the confirmed ceiling automatically.

Each result distinguishes task fit, price completeness, evidence confidence and preference ranking. Any option violating a hard constraint belongs only in a separately labelled, user-requested exploration, with failure reasons and cost differences. It cannot be labelled suitable until the user changes the constraint and the rerun passes. Unresolved mandatory information remains unknown. The supported category/workload scope is explicit; unsupported specialist work does not receive a fabricated suitability verdict.

Represent answered, unknown, skipped and not applicable separately. An explicit no preference differs from missing data. No behavioral answer is preselected. Exclusive unknown/none options cannot coexist with contradictory specifics. Preserve Back/edit state; invalidate dependent answers/results when tasks or category change. Show assumptions and pending critical requirements in the review. Do not solicit salary, identity number, employer identity or precise location merely to recommend a machine.

### 7.2 U19 — Contextual chatbot invitation during browsing

Count eligible active time across product listings, product details and search within the current app/site session; internal navigation does not restart the count. Pause when the app is backgrounded, the tab is hidden or the user is idle. Do not count time outside the app/site or infer a need from elapsed time alone. Foreground/idle detection, session end/reset, threshold and cooldown values must be defined and reviewed before implementation; no numeric threshold is committed here.

The invitation asks whether the user wants help choosing a device. It must be dismissible, preserve focus and browsing state, and avoid repeated interruptions after dismissal according to a documented cooldown. Accepting opens chat in context and asks the user to confirm needs and budget; product views/searches are context, not confirmed requirements. Do not interrupt an existing chat or a critical input/confirmation step. The user can continue browsing without accepting.

Use only the minimum in-app session context with an appropriate disclosure; do not introduce cross-site tracking or send browsing history/private text to an AI provider merely because the timer expires. Provider transmission follows the AI notice and data rules in section 19. Live AI, simulated advice, fallback and unavailable states remain explicit. U19 adds a conversational entry to U01–U05, not permission to alter constraints or invent product/price claims. Website behavior refers to a supported browser surface and does not replace the required Android/Windows native clients.

## 8. Admin business requirements

The source backlog uses STT 19–36. Demo substitutes do not count as completed production admin features.

| ID / source STT | Admin entry, action and completion outcome | Planned stage |
|---|---|---|
| A01 / 19 | Personnel/access → invite or disable a staff member, assign a bounded role, verify effective access and revoke sessions; changes are audited and enforced by the server. | P minimum fixed roles; D0 maintainer access is local only |
| A02 / 20 | Sources/imports → register permitted use and mappings, import into staging, review errors/differences and accept valid records or retry without duplication. | D0 fixture validation analogue; R/P permitted manual import, automated feeds later |
| A03 / 21 | Catalog → create/edit exact variants, resolve duplicates, preview/review and publish or restore a prior revision with affected links identified. | D0 versioned fixture analogue; R/P catalog workflow |
| A04 / 22 | Sellers/offers → verify seller/policies, match variant, review price/fees/eligibility/stock/URL, then publish, correct or suspend an offer. | D0 fixture scenarios; R/P auditable offer management |
| A05 / 23 | Evidence → record provenance and tested configuration, resolve conflicts, review claim previews and publish or withdraw supported content. | D0 fixture provenance; R/P evidence review |
| A06 / 24 | Needs/rules → edit questions, branches and workload constraints, simulate profiles and publish a versioned valid protocol. | D0 source-controlled rules; P reviewer-operated publication |
| A07 / 25 | Recommendation quality → evaluate a candidate rules/prompt/model version against fixed cases, inspect regressions and release/roll back it. | D0 rules checks; D1 model checks; P release control |
| A08 / 26 | Reports → triage and assign an information error, verify evidence, correct/suspend or reject with reason and close the report with an appropriate response. | P linked to U03; demo records review findings locally |
| A09 / 27 | Operations → inspect failures, freshness, latency/cost and impact, apply bounded recovery/fallback, verify service recovery and record resolution. | D0/D1 diagnostic evidence; P operating workflow |
| A10 / 28 | Releases → review readiness and client/version targeting, enable a controlled rollout, inspect results and disable or revert configuration when necessary. | E operational UI; P still requires documented release/rollback procedure |
| A11 / 29 | Analytics → inspect aggregate journey/coverage/cost evidence, identify a problem, prioritize a change and compare its observed outcome. | E richer analytics; P minimum consent-aware operational measurement |
| A12 / 30 | Price alerts → review price coverage/candidates, verify offer validity and consent, send/monitor or stop a campaign and resolve failures. | E prerequisite for U09 |
| A13 / 31 | Data support → authenticate a request, review minimum necessary server data, resolve export/deletion/access issue and provide outcome/audit evidence. | E accounts; P basic process required for any server-held personal data |
| A14 / 32 | PC/upgrade review → maintain part constraints and reviewed builds, inspect conflicts/unknowns and publish or re-review affected configurations. | E prerequisite for U12/U13 scope |
| A15 / 33 | Partners → verify service coverage, terms/responsibility, approve listing, monitor problems and update/suspend a provider. | L prerequisite for related services |
| A16 / 34 | Community/expert review → inspect flagged/pending content and expert credentials/conflicts, decide moderation and support review of that decision. | L prerequisite for U17 |
| A17 / 35 | Commercial operations → approve labelled campaigns and allowed destinations, check ranking independence, reconcile actual partner reports and end campaigns. | L; disclosure and ranking independence apply from first commercial placement |
| A18 / 36 | Expansion → assess category/country data, currency/variants/support and full journey tests, authorize a limited rollout and reassess coverage. | E category readiness; L additional countries |

### 8.1 Why an admin function is needed

The service's promise depends on maintaining correct variants, usable offers and defensible workload advice as prices, software and available products change. Admin capability is needed wherever a person must resolve uncertainty, approve a consequential change, correct a public error or restore service. A dashboard is useful only when it supports one of those decisions. A report, script, versioned file or small internal form may satisfy the early need if its outcome is reviewable and recoverable.

This analysis uses the agreed user journeys and business rules; it is a proposed operating model, not evidence of staffing capacity or a separate market study. Necessity below refers to an operational outcome. It does not require a separate screen or a full portal for every ID.

| ID | Business need and consequence if absent | Minimum necessary outcome / timing |
|---|---|---|
| A01 | Restrict who can change advice, offers and public content. Without attributable access, accidental or unauthorized changes cannot be contained reliably. | Before privileged production operations: named staff, bounded roles, enforced revocation and an audit trail. Invitations and a role-builder UI can wait; fixed roles can satisfy the pilot. |
| A02 | Bring permitted product/offer records into a reviewable dataset. Without staging and validation, imports can create duplicates or publish incorrect data at scale. | D0 fixture validation; R/P source register, bounded manual import, errors and retry. Automated crawling, scheduling and many-source connectors are later capacity choices. |
| A03 | Keep exact purchasable configurations distinct and correct. Without this, a recommendation can point to a similar name with inadequate RAM, storage or another component. | R/P edit, identity checks, review, publication and correction/history. Begin with the small laptop catalog; mass enrichment and broad category tools can wait. |
| A04 | Maintain usable buying options and price conditions. Without this, the cheapest apparent result may be unavailable, conditional or a different configuration. | R/P verified seller/variant association, total completeness, timestamps, destination and suspension. Complex promotion stacking is deferred until evidence supports it. |
| A05 | Decide which statements the adviser can substantiate. Without evidence review, marketing claims or unrelated benchmark results can become misleading buying advice. | R/P assertion-level provenance, configuration context, unresolved conflicts and withdrawal impact. D0 uses explicitly synthetic provenance. |
| A06 | Translate actual work into the questions and constraints the picker uses. Without maintained needs rules, advice becomes generic, inconsistent or outdated. | D0 versioned questions/rules and simulation; P reviewed activation and rollback. A visual rule-authoring tool is optional; business validation is required. |
| A07 | Establish whether a rule/model change is safe to use. Without comparative evaluation, a more fluent answer may introduce budget, fit or claim regressions. | D0 deterministic regression evidence; D1 provider-output evaluation; P release decision and rollback. No custom model-training platform is required. |
| A08 | Correct errors buyers discover after publication. Without ownership and closure, reports accumulate while the same wrong recommendation remains visible. | P actionable report queue, assignment, evidence, correction/suspension or justified rejection and verified closure. A general CRM can wait. |
| A09 | Detect and contain broken sources, stale prices or AI failures. Without intervention and recovery evidence, silent degradation undermines every recommendation. | D0/D1 diagnostics and fallback; P freshness/failure/cost monitoring, owner and recovery procedure. A custom operations dashboard is optional. |
| A10 | Control which version or capability buyers receive. Without a release/revert process, an error can affect the whole supported audience. | P documented deployment/configuration approval and tested rollback; E richer targeting/rollout UI. The basic control is needed before the later dashboard. |
| A11 | Identify unmet needs and operational costs accurately. Without defined measurements, the team may optimize clicks while recommendations remain unsuitable. | Demo observations; P a small aggregate report with coverage, no-fit causes, correction effort and cost. E richer exploration and segmentation. |
| A12 | Send useful, consented price alerts. Without observation history and rechecking, an alert may advertise a stale or ineligible price. | Required when U09 is introduced, not for the first picker. Verify thresholds, recipients, offer validity, deduplication, stop and delivery outcome. |
| A13 | Resolve personal-data or access requests within the data actually held. Without a basic process, users cannot exercise the app's promised controls. | Local deletion in D0; before server-held personal data, provide verified request handling and actual export/delete outcomes. Account-support tooling follows accounts. |
| A14 | Establish that a build or upgrade is compatible as a whole. Without reviewed constraints, individually plausible parts can produce an unusable purchase. | Before U12/U13 supported advice: reviewed parts/build templates, critical-unknown handling and impact review. Unrestricted automatic PC solving is later. |
| A15 | Ensure referred services exist with understandable terms and responsibilities. Without this, a referral can imply support the app or provider cannot supply. | Before partner-dependent services: coverage/terms verification, named responsibility and suspension. Unneeded for a direct laptop shortlist. |
| A16 | Maintain useful community/expert advice and address conflicts or abuse. Without moderation, unsupported advice can appear authoritative. | Before U17: moderation, expert/conflict checks and review/dispute handling. Community operations do not belong in the first demo. |
| A17 | Preserve ranking trust and reconcile real commercial activity. Without controls, paid placement can masquerade as suitability and revenue reports may be inaccurate. | Disclosure and organic-ranking independence from the first commercial placement; reconciliation when commercial reporting exists. Full campaign tooling can follow. |
| A18 | Decide whether another category or country is sufficiently supported. Without readiness review, currency conversion can disguise missing variants, sellers or warranty coverage. | Before each expansion: category/country evidence, operating owner and complete journey checks. A global administration suite is unnecessary for Vietnam-first delivery. |

### 8.2 Minimum operating scope by delivery stage

**D0/D1 demo:** a maintainer edits synthetic fixtures and versioned questions/rules, validates them, previews the user result, runs fixed cases and records issues. Reuse A02–A07 concepts and A09 diagnostics in this limited environment. A local price workshop does not implement publication authority, production staff access or real-source review. A named owner records demo releases and restores a known-good version if needed.

**R/P laptop readiness and pilot:** provide the A01–A09 operating outcomes within the approved small catalog and supported workloads. Add the basic release control from A10, aggregate decision evidence from A11 and A13 handling wherever personal data is stored. These can be combined in a compact internal workspace with a review queue, catalog/offer/evidence records, needs-policy releases, reports and service status. Business boundaries remain distinct even when the interface is shared.

**E/L expansion:** add the richer A10/A11/A13 tooling and activate A12/A14–A18 only with the dependent customer service or category. A first commercial placement still needs A17 disclosure controls even if the full commercial module remains deferred. A later-feature label cannot waive an operating prerequisite of a feature introduced earlier.

The launch decision must consider operating capacity as well as software completion. Before G4, name who refreshes offers, reviews evidence/rules, handles reports and covers incidents; record available working hours and a backup. If the team cannot maintain the promised coverage, narrow supported sources, workloads or availability claims before increasing automation or catalog size.

### 8.3 A06 — Business analysis of needs, questions and workload rules

**Business objective:** help a buyer describe the work accurately and receive advice based on that confirmed work. A06 serves U01 and its contextual entry U19, with consequences for detail, comparison and saved decisions under U03/U04/U07. The rule owner maintains the interpretation protocol; the buyer remains the authority over their own needs and budget.

**Triggers:** a supported application changes requirements; buyers repeatedly misunderstand a question; reports reveal false-fit or unnecessary exclusions; a new supported workload is proposed; evidence is withdrawn; or a question/translation changes meaning. A new job label by itself is insufficient justification for a new hardware rule.

**Actors and authority:** a needs editor proposes a revision; an evidence reviewer checks the supporting assertions under A05; a recommendation reviewer assesses expected decisions under A07; an authorized publisher activates the approved bundle. A01 governs these permissions. One person may hold several responsibilities in a small team, but each decision and any lack of independent review is visible. Operations may disable an affected rule or revert to an approved version; it cannot declare an unevaluated replacement valid merely to restore coverage.

| Business information | Required meaning for the decision |
|---|---|
| Need/use-case definition | Stable ID, user-facing Vietnamese wording, supported category, examples, exclusions and owner; distinguish occupation from actual tasks |
| Workload context | Relevant application/platform/version, project size, concurrency or other consequential scale, with explicit unknown/not-applicable states |
| Question and answer | Stable field/option IDs, single/multiple selection, dependency and invalidation rules, when clarification is mandatory, and reviewed wording |
| Requirement mapping | Which confirmed answer produces a hard constraint, which influences a preference, and why; preserve all additional mandatory tasks |
| Supporting evidence | Assertion/source IDs, scope and dates; distinguish vendor minimum, reviewed practical requirement and synthetic demo assumption |
| Policy version | Question/branch/mapping/ranking versions, expected schema compatibility, release scope, reviewer decision and effective date |
| Simulation case | Invented buyer scenario, expected questions, explicit mandatory conditions, manually adjudicated result/unknown and candidate-versus-baseline difference |

Completion requires a usable, evaluated interpretation policy, not merely saving a question. The normal journey is:

1. Open Needs & rules from a report, evidence change or planned improvement. Identify the problem, affected workload, current version and expected buyer benefit.
2. Draft the change. Preview the Vietnamese question/answers, applicable branches, dependency invalidation, mandatory mappings and any ranking effect. Keep the total ceiling independent of task labels or budget shortcuts.
3. Attach applicable evidence or explicitly limit the change to synthetic demonstration. Unsupported cases lead to clarification or an unsupported-scope response; they do not receive an invented minimum configuration.
4. Simulate complete paths, including Back/edit, unknown answers, extra mandatory tasks and reordered primary uses. Inspect exactly which answers produce constraints and which evidence supports them.
5. Under A07, compare candidate and approved versions on the fixed cases. Review both false acceptance and unjustified exclusion, changed eligible variants, question burden and the explanation a buyer would see. A high match count is not proof of improvement.
6. Review affected scope: new decisions, ongoing drafts, cached results and historical saves. Approve or request correction with a reason; publish only a compatible, evaluated policy bundle.
7. Verify the active version in a fresh decision. Monitor reported errors and no-fit/clarification causes; retire or revert with a recorded reason when needed. Re-evaluate current recommendations when their governing inputs change while preserving the original dated record.

**Example:** an admin proposes changing the follow-up for coding plus virtual-machine work. The editor must distinguish the number/type of concurrent environments and uncertainty rather than assigning the same requirement to every programmer. A demonstration RAM threshold is labelled synthetic. Production advice needs reviewed workload evidence. If the buyer removes VM work, its dependent constraint stops applying on the next confirmed run. Reordering programming and study cannot remove a still-mandatory VM requirement or increase the budget.

**Boundary with user data:** policy publication changes interpretation rules for applicable runs. It does not authorize staff to edit a buyer's confirmed budget/tasks, open unrelated private chats or treat browsing time under U19 as a declared workload. An AI needs proposal is confirmed by the buyer under BR-07; A06 defines the allowed questions and mappings rather than silently applying model guesses.

### 8.4 Boundaries, exceptions and operating decisions

| Situation | Required admin outcome / responsible journey |
|---|---|
| Retailer price changed, but the workload rule is correct | A04 corrects/rechecks the offer; do not alter workload requirements to keep that device recommended. |
| Software requirement lacks evidence or conflicts with a test | A05 assesses the assertion; A06 withholds the unsupported rule/fit claim or requests clarification. |
| A correct rule is applied incorrectly, or AI contradicts it | A07 records the regression and blocks/reverts the candidate; A09 contains service impact. |
| A question text edit changes its interpretation | Treat as a policy revision with path and outcome review; do not bypass evaluation as a cosmetic translation fix. |
| New policy is incompatible with an older client or saved schema | Hold activation for that scope or use a supported approved bundle; disclose re-confirmation needs and preserve historic observations. |
| Urgent wrong-fit report affects published advice | A08 opens an attributable issue; authorized staff suspend the affected claim/capability, then A05–A07 validate a correction. Keep a reason and verify containment/recovery. |
| No candidate is eligible for a popular workload/budget | A11 distinguishes inadequate evidence, catalog coverage, true hard-constraint conflict and filter-empty. Neither A06 nor commercial staff may loosen the buyer's requirements without confirmation. |

### 8.5 How to establish that admin capability is sufficient

At G4, require a practical operating rehearsal: import a bounded source sample, correct a wrong variant/offer, withdraw evidence, revise and reject a bad needs policy, publish/revert an approved revision, resolve a report and handle a source outage. Record the responsible role, actual outcome, time spent, outstanding work and recovery evidence. The workflow can be modest; an unowned manual step is an unresolved readiness condition.

Use section 20 definitions and add admin workload context: actionable queue size/age, unresolved high-impact records, reviewer time per change, stale-offer backlog and policy regressions by supported workload. Every measure needs a time window and denominator. Proposed response targets and support hours remain G4 decisions; no SLA or staffing level is inferred from this analysis. Prefer user-impact and integrity measures over the number of admin screens or published records.

### 8.6 Decisions still required

Before production scope is accepted, record the named owners and backup, the reviewed initial workload list, who can approve each publication type, which assessments have independent review, evidence freshness/review triggers, handling of in-progress decisions during activation, and the operating capacity available to meet coverage/correction promises. Decide whether each pilot workflow is a reviewed file/script, a shared internal form or a dedicated UI only after its frequency and risk are understood. A06 also needs the reviewed application/scale taxonomy and fixed scenario set; the competitor's use-case menu does not establish this product's supported coverage.

## 9. Mandatory business rules

| ID | Rule |
|---|---|
| BR-01 | Match a purchasable offer to an exact accepted variant; family-name similarity is insufficient. |
| BR-02 | A confirmed total ceiling and mandatory task/OS/peripheral requirements are hard constraints; soft preferences and AI cannot override them. |
| BR-03 | A missing critical requirement/evidence produces clarification, unknown or abstention, not a compatibility pass. Unknown budget does not mean unlimited. |
| BR-04 | Compare totals on the same purchase scope, condition, location and eligibility basis. Include mandatory charges, avoid adding tax already included, and separate uncertain discounts/cashback/trade-in. |
| BR-05 | Expired, unavailable, mismatched or incomplete offers cannot win a verified-cheapest badge. Claims state the checked-store coverage rather than global cheapest. |
| BR-06 | Price and stock assertions carry observation/expiry context; saved data never becomes freshly verified solely because a screen reopened. |
| BR-07 | AI proposes interpretations/explanations using checked records. Model output cannot invent offers, prices, source IDs, URLs or eligibility verdicts. Material profile changes require user confirmation. |
| BR-08 | Explain strengths, limitations and exclusions for the user's actual tasks; performance measurements require exact tested configuration and method context. |
| BR-09 | Source access, retention and reuse must be documented before production publication. Structured markup or public visibility is not a permission grant. |
| BR-10 | Sponsorship and affiliate relationships are disclosed; commercial payments do not bypass eligibility or determine organic suitability ranking. |
| BR-11 | Navigation, sharing and saving preserve exact variant and needs context. Re-evaluate derived results after a confirmed profile/catalog/rule change. |
| BR-12 | Guest discovery remains usable; collect minimum necessary information and request optional permissions at the point of use. |
| BR-13 | Production publication distinguishes draft, in-review, published, suspended and archived states, with actor/reason/revision history and safe reversal. |
| BR-14 | Mandatory PC electrical/physical/firmware compatibility unknowns block a fully-compatible verdict. Reviewed builds precede unrestricted solving. |
| BR-15 | Demo/synthetic and production datasets/environments are visibly and technically separated. Fixtures cannot be published as production offers. |
| BR-16 | A retailer redirect is not proof of purchase. Payment scenarios, service referrals and data handover guidance carry only the capabilities actually provided. |

## 10. Information and integration requirements

| Entity | Minimum business meaning |
|---|---|
| NeedsProfile / Decision | Current recipient/tasks, answer states, ceiling and included equipment, hard constraints, soft priorities, confirmation/revision |
| ProductFamily / Variant | Shared name versus exact model code, configuration, category/region and publication state |
| Evidence / Claim | Source, permitted use, dates, exact measurement context, linked assertion and unresolved conflicts |
| Seller / Offer / PriceObservation | Seller/policy, matched variant/condition, destination, charges/eligibility, stock evidence, dates and total-completeness status |
| RecommendationRun | Confirmed profile revision, catalog snapshot, rule/model version, selected/excluded/unknown results and evidence links |
| SavedDecision | Profile, selected variants, dated offer/evidence references, local ownership and optional future sync state |
| Staff / Review / Correction | Role, assigned decision, publication revision, reason, timestamps and affected records |

Separate specifications, measurements, price observations and seller policy evidence. Store numbers in consistent units, money as integers with explicit currency rules, and format for the client locale. Production integration adapters must be replaceable without changing what a price or variant means.

Potential integrations include authorized manufacturer/specification sources, permitted retailer data, an AI provider, future notification delivery, optional analytics/crash reporting and OS sharing. None is contracted or configured by this BRD. PhoneArena's advertised licensed specification feed is a potential source, not proof of Vietnam offer coverage or acquired rights [S4].

## 11. Nonfunctional requirements and acceptance

All numerical budgets below are proposed targets, not measurements or vendor promises. The team must ratify supported hardware, sample size and test conditions before making release claims.

| ID | Requirement | Acceptance evidence |
|---|---|---|
| NFR-01 | Shared domain/feature contracts with native platform adaptation | Same fixtures produce same business results on Android/Windows; version/dependency matrix and native-control inspection |
| NFR-02 | WinUI 3 Windows approach and Material 3 Expressive Android | Demonstrated selected native controls, theme/input/focus/lifecycle behavior; styling alone does not establish compliance |
| NFR-03 | Adaptive and accessible journeys | Large text, screen reader, keyboard-only Windows, Android Back/IME, narrow/wide windows, text+icon statuses and reduced-motion behavior |
| NFR-04 | Responsive local interaction | Target p95 input acknowledgement <100 ms and cached useful content <300 ms; report sample size, conditions and actual distribution |
| NFR-05 | Bounded startup/render cost | Initial targets: interactive shell <2 s Android / <3 s Windows; smooth scrolling and no sustained growth across repeated navigation; release builds on named hardware |
| NFR-06 | Useful results independent of slow AI | Deterministic result stage remains available; explanation has explicit loading/timeout/fallback; online targets initially 1.5 s filtered results and 8 s complete AI explanation under documented conditions |
| NFR-07 | Secure privileged operations and minimal data exposure | Server-side roles, scoped access, secrets off clients, input/URL validation, redacted diagnostics and tested denial/revocation |
| NFR-08 | Recoverable data and operation | Local persistence/reset; production restoration rehearsal, validated rollback and source-outage handling; RPO/RTO set at G4 |
| NFR-09 | Observable and bounded operating cost | Timings, failures, coverage, freshness and provider usage recorded with minimal personal data; budget thresholds and action owner set at G4 |
| NFR-10 | Maintainable shared components and localization | Stable semantic contracts, consistent units/VND formatting, Vietnamese demo copy; no app-wide rerender per AI token; English expansion through externalized strings |

## 12. Acceptance strategy and decision gates

G0: agree the scoped demo, proposed acceptance baseline, named owners and target hardware. G1: prove essential native input/command/selection integration, state round-trip and release builds on both clients. G2: demonstrate the full D0 path, all mandatory fixture invariants, persistence and failure states. G3: demonstrate live bounded AI, invalid-output rejection and fallback, review exploratory usability findings, and record the sponsor's demo decision. D1 may only be deferred through an explicit scope decision.

G4: confirm permitted sources and retention, sufficient catalog coverage, offer/evidence audit, supported workloads, target hardware, operating capacity and updated budget. G5: review production tests, manual source/price audit, access/restore exercises, user task evidence, unresolved issues and support ownership before broader availability.

No known critical budget/variant/claim-integrity failure may remain unresolved in the agreed acceptance set. Report the set and limits; zero failures in it does not guarantee universal correctness. In a proposed five-person demo study, aim for at least four independently completing the core journey and correctly identifying sample data and uncertain prices; treat failure as a revision signal and never as statistically representative evidence.

## 13. Risks, assumptions and dependencies

| Risk / unresolved assumption | Response and accountable role |
|---|---|
| Native hosting gaps or dependency incompatibility | Front-load G1; engineering records viable boundaries before screen expansion; platform requirement changes need sponsor decision |
| Insufficient local product/offer evidence or unavailable source access | Data lead limits coverage honestly, negotiates/records access and audits a starter catalog before production |
| Wrong variant or conditional price wins ranking | Domain constraints, review/abstention, calculation fixtures and manual checkout-context audit |
| AI produces unsupported advice | Typed proposals, checked evidence IDs, deterministic decisions, validation and fallbacks; recommendation reviewer owns regressions |
| Full 37-journey documented backlog treated as demo scope | Product owner uses stage/coverage register and explicit change control; U19 delivery stage remains pending |
| Catalog refresh/correction work exceeds capacity | Measure staff effort and source lag at pilot; narrow sources/workloads before expansion |
| Commercial incentives erode trust | Separate sponsorship and organic suitability with reviewable controls |
| Solo or inexperienced native team delays delivery | Re-estimate after G1; effort figures are assumptions, not a launch date |

## 14. Governance and open decisions

The live spreadsheet's priority is a sequencing signal. Its unfilled “Chốt làm” column is not approval. A change request records the business reason, affected IDs, stage, data/native dependencies, effort/cost impact, test changes and decision owner. Demo approval does not automatically approve every expansion feature.

Before G1: name sponsor/technical owner, identify test devices and native toolchains. Before D1: select provider/access budget and data-handling settings. At G3: accept demo findings and production scope or require revision. Before G4: decide source agreements, supported variants/workloads/OS versions, freshness windows, retention, support ownership, RPO/RTO and quantified pilot targets. Monetization model, expansion order and partner services remain separate business decisions.

## 15. Sources and document precedence

- **S1:** [Live feature backlog, gid 0](https://docs.google.com/spreadsheets/d/12dppW4eD3ej3eNVrsff2c4afLkCRoGLh4WWpfufvVGA/edit?gid=0), read 11 November 2026. Tab title at read: “Liệt kê tính năng”; STT 1–36. Other tabs were not changed or treated as approved scope.
- **S2:** [Project scope](../../research/project-scope.md), [demo plan](../../research/demo-implementation-plan.md), [technical blueprint](../../research/technical-blueprint.md), [mobile UX](../../research/mobile-interface-strategy.md), [onboarding research](../../research/onboarding-questionnaire-research.md) and [question bank](../../research/onboarding-question-bank.json).
- **S3:** [Microsoft RNW architecture](https://microsoft.github.io/react-native-windows/docs/new-architecture/) and [Android Material 3/Expressive](https://developer.android.com/develop/ui/compose/designsystems/material3), checked 11 November 2026. They establish platform mechanisms, not completion of this project's integration.
- **S4:** [PhoneArena database licensing](https://www.phonearena.com/database), checked 11 November 2026. No license or retailer integration has been acquired.

Explicit user decisions take precedence. This BRD and companion implementation plan reconcile the latest scope for review; older research remains evidence/context rather than a separately committed backlog. If the live backlog changes, update stable-ID traceability and review material scope differences instead of silently replacing an approved baseline.

## 16. Detailed core user use cases

Acceptance IDs are stable and map to planned verification in the register. “Given/when/then” criteria describe required behavior, not tests already passed. Unless stated otherwise, demo cases use synthetic fixtures; production cases require published real records. Read each use case together with BR-01–16.

### 16.1 U01 — Receive a suitable shortlist

Actor: buyer or someone choosing for a recipient. Entry: Discover → Find a suitable laptop. Precondition: the chosen category is supported in the active dataset. Inputs: purchase scope, exact total ceiling or explicit unknown, tasks, relevant applications/scale, condition and priorities. Output: a confirmed profile and a versioned result, clarification or no-fit explanation.

Flow: choose the guided route; answer the necessary core questions; receive task-specific follow-ups; review tasks, hard constraints, preferences and unknowns; confirm; inspect a shortlist. Changing a task invalidates its dependent answers and derived recommendations. An exploratory preview with unresolved requirements is visually qualified and cannot be described as confirmed suitable.

- **AC-U01-01:** Given a coding task and a VM follow-up, when the task is removed, then dependent VM assumptions stop affecting the next confirmed run and the change is visible in review.
- **AC-U01-02:** Given an unknown ceiling or essential application requirement, when options are requested, then the system clarifies or labels an exploratory result; it does not assume unlimited funds or confirmed compatibility.
- **AC-U01-03:** Given no configuration passes all hard constraints, when the run completes, then the result identifies the decisive unmet requirements and offers voluntary edits without changing the stored constraints.
- **AC-U01-04:** Given a confirmed profile revision and a later edit, when an older run finishes, then it cannot replace the newer revision's result. Back and retry preserve the user's explicit answers.
- **AC-U01-05:** Given one to three primary uses, when the buyer reorders them by touch, keyboard or assistive controls, then the review preserves that order and the run records its ranking-policy version. An additional mandatory task is retained independently; order affects preference ranking only after every hard requirement passes.
- **AC-U01-06:** Given an exact VND ceiling, when a task, priority or budget shortcut changes, then any new ceiling is visible and explicitly confirmed before use. Task changes alone preserve the ceiling; no band floor excludes cheaper eligible options.
- **AC-U01-07:** Given eligible options and active screen/weight refinements, when refinements exclude all options, then results identify the filter cause and clearing filters restores the eligible set without changing tasks, ceiling or saved selections. A true no-fit result remains distinct from filter-empty, missing data and service failure.
- **AC-U01-08:** Given a request to explore compromises, then each exploratory item names unmet/unknown requirements and any known budget difference, stays outside the confirmed shortlist and cannot acquire a suitable badge through a ranking change. Only an explicit profile change followed by a passing rerun changes eligibility.
- **AC-U01-09:** Given a result and its ordered uses, when inspected, then the buyer can see per-use pass/fail/unknown evidence, decisive advantages and limitations, exact variant and dated offer context. Missing evidence is not converted into a numeric match percentage or supported specialist-work claim.
- **AC-U01-10:** Given a picker decision moving through detail, comparison and saving, then task order, additional requirements and confirmed profile revision persist. Reopening an older saved schema does not invent user-confirmed ordering; incompatible state is explained and retained for recovery or explicit reset.

### 16.2 U02 — Find an offer without completing setup

Actor: buyer who already knows some preferences or a model name. Entry: Discover → Find deals/search. Precondition: a supported catalog is available. Flow: enter a name or filters, inspect matching cards, change sort/filter, then open detail, save or select comparison. Search and filters operate on exact variants; a family result exposes the configuration choice before presenting an exact buying claim.

- **AC-U02-01:** Given no questionnaire profile, when a buyer searches a supported name, then usable catalog results appear without signup or unrelated questions.
- **AC-U02-02:** Given a filter/sort change during loading, when results return, then the visible set corresponds to the latest criteria and selected items are not silently replaced.
- **AC-U02-03:** Given a current offer without historical selling-price evidence, when its card renders, then it shows the observed price and conditions without an unsupported percentage-discount or urgency claim.
- **AC-U02-04:** Given zero matches or unavailable sources, when search finishes, then the screen distinguishes no matches, unavailable current offers and network failure, retaining the query and available cached context.

### 16.3 U03 — Inspect a configuration and its evidence

Actor: buyer. Entry: select a device from results, comparison or saved items. Flow: inspect exact identity and key facts, expand task relevance/specifications/evidence, change configuration, report a discrepancy if necessary. A manufacturer claim, measurement and owner report must not be presented as the same evidence type.

- **AC-U03-01:** Given similar family names with different RAM/display specifications, when the selected variant changes, then price, offers, advantages and disadvantages all refer to that variant; facts from the previous variant are not retained as current.
- **AC-U03-02:** Given a decisive numeric claim, when the buyer opens its evidence, then the source, date, exact tested configuration, units and relevant measurement context are available, or the claim is marked unsupported and withheld from verified advice.
- **AC-U03-03:** Given no profile or incomplete evidence, when detail renders, then general information and unknowns remain readable without a personalized suitability assertion that cannot be evaluated.
- **AC-U03-04:** In P, given a visible record, when the buyer submits an information error, then the report references that record/revision and is acknowledged without granting access to other users' reports. Demo review findings may be recorded locally instead.

### 16.4 U04 — Compare alternatives on a consistent basis

Actor: buyer. Entry: select comparison on two exact variants. Flow: inspect task-relevant differences, expand equal/secondary specifications, change requirements or replace one variant, then choose, save or return to results. Mobile defaults to a readable paired view; Windows may expose a wider comparison without changing the calculation rules.

- **AC-U04-01:** Given two variants with comparable values, when comparison opens, then units, purchase scope, price completeness and known/unknown evidence are consistent and visible; unsupported measurements are not converted into an invented winner.
- **AC-U04-02:** Given a mandatory requirement failure, when a soft priority changes, then the failed option remains ineligible for a confirmed recommendation and the cause stays visible.
- **AC-U04-03:** Given an item is removed or replaced, when the buyer navigates back and returns, then the remaining explicit selection and profile are preserved.
- **AC-U04-04:** Given a budget increase, when asked what improves, then the explanation names evidenced changes and relevant limits; it does not encourage spending to the ceiling or invent an improvement from missing data.

### 16.5 U05 — Choose a seller with an understood total

Actor: buyer. Entry: selected variant → Buying options. Inputs: delivery context and optional explicit eligibility where they affect the total. Flow: inspect sellers, expand charge/discount/policy details, compare the same scope and choose a destination. Output: a sample summary in D0 or a verified retailer handoff in P.

- **AC-U05-01:** Given known mandatory charges and an eligible immediate discount, when the total is displayed, then the arithmetic is reproducible from the charge breakdown and includes each charge once.
- **AC-U05-02:** Given unknown shipping or unconfirmed coupon eligibility, when offers are compared, then the unknown/conditional amount is separate; the offer cannot win a verified-lowest-total badge on an assumed charge or saving.
- **AC-U05-03:** Given an expired offer or suspended seller destination, when the buyer attempts the buying action, then the system blocks that current-offer claim and provides refreshed options or a clear unavailable state.
- **AC-U05-04:** Given demo mode, when the action is selected, then only a sample summary opens. In P, the approved exact destination opens and records a handoff event rather than a completed order.

### 16.6 U06 — Evaluate a quotation already found

Actor: buyer. Entry: Check an offer. Precondition: production-supported intake or manual entry, not the D0 path. Flow: enter link/text fields, inspect parsed facts and unknowns, confirm exact configuration and price conditions, supply relevant needs, then inspect suitability, questions for the seller and alternatives. Unsupported input retains a manual route.

- **AC-U06-01:** Given an unsupported link or failed parse, when intake completes, then it explains the limitation and offers editable manual fields without claiming that the seller or model was verified.
- **AC-U06-02:** Given extracted model, configuration or charges, when assessment is requested, then the user has an opportunity to confirm/correct them; ambiguous family identity remains unresolved until verified.
- **AC-U06-03:** Given a confirmed quote with missing mandatory fees or workload evidence, when assessment renders, then those gaps remain visible and the quote is not declared definitively cheaper or suitable.
- **AC-U06-04:** Given assessment results, when the buyer saves, compares or visits a seller, then the confirmed quotation revision and its provenance stay attached to the decision.

### 16.7 U07 — Preserve and share the reasoning

Actor: buyer. Entry: Save on an option or decision. Flow: name/save a decision locally, reopen it after navigation or restart, inspect changed/stale information, remove or share the selected brief. Persistence failure must not produce a false saved acknowledgement.

- **AC-U07-01:** Given a successful save, when the app restarts, then the confirmed profile, exact selected variants and dated offer context can be restored without depending on the AI provider.
- **AC-U07-02:** Given a changed or removed catalog record, when the decision reopens, then historical content is labelled and current availability is separate; the system never substitutes a different variant silently.
- **AC-U07-03:** In P, given a sharing request, when the brief is generated, then it contains the selected scope, reasons, limitations, source/time context and price uncertainty, excluding private free text unless explicitly included by the user.
- **AC-U07-04:** Given a delete request, when deletion succeeds, then the local decision no longer appears after restart. A storage error is actionable and does not destroy unrelated decisions.

### 16.8 U08 — Use the app with control over personal information

Actor: guest or future account holder. Entry: first launch or Settings & data. Flow: continue as guest, set available presentation preferences, inspect stored categories, export or delete within the current storage scope, and grant/reject optional permissions when a relevant feature is used.

- **AC-U08-01:** Given guest mode, when the user follows the core journey, then no account, notification permission or precise location is required.
- **AC-U08-02:** Given local-only decisions, when the user inspects storage and deletes them, then the interface accurately describes that local scope and does not claim deletion from a future server/account service.
- **AC-U08-03:** Given an optional permission is refused, when its related feature is used, then the app explains the consequence and preserves applicable manual or basic functionality.
- **AC-U08-04:** In P, given a valid export/delete request for server-held data, when processed through the supported ownership-verification route, then the user receives the actual outcome and retention limits; raw prompts and uploaded documents are not exposed to unrelated staff.

### 16.9 U19 — Receive contextual conversational help while browsing

Actor: guest or buyer browsing the supported app/site. Trigger: active eligible browsing/search time reaches a reviewed threshold in the current session. Outcome: accept contextual chat and confirm needs, or dismiss/ignore and continue browsing. Delivery stage and timer/session/cooldown parameters remain pending; these criteria do not authorize frontend implementation or live AI integration.

- **AC-U19-01:** Given listing/detail/search activity in one session, when internal navigation occurs, then eligible active time accumulates without restarting; hidden-tab, background and idle time does not advance it. Leaving/returning follows the documented pause/reset policy and cannot trigger an invitation while outside the active app/site.
- **AC-U19-02:** Given the configured threshold is reached and no chat or critical input/confirmation is active, then a dismissible invitation asks whether help is wanted without stealing focus or clearing browsing state. Dismissal suppresses repeated invitations for the reviewed cooldown; ignoring it leaves browsing usable.
- **AC-U19-03:** Given the invitation is accepted, then chat retains the current query, exact viewed variants and explicit selections, asks about tasks/budget and confirms inferred needs before applying changes. Browsing time or viewed products alone cannot establish requirements, increase the ceiling or override mandatory constraints.
- **AC-U19-04:** Given a timer-triggered invitation, then no browsing history/private text is automatically sent to an AI provider. Accepted chat follows the applicable notice/minimum-data rules, exposes live/simulated/fallback/unavailable mode accurately and permits continued browsing if AI is unavailable. Suggestions obey the existing variant, evidence and price rules.

## 17. Detailed admin controls and publication requirements

### 17.1 Minimum operating roles

Suggested roles are scoped bundles, not a requirement to hire six people. Multiple roles may be held by one person, but their effective rights must be explicit. Automated imports can stage records but cannot invent a review decision.

| Operation | Editor | Reviewer | Recommendation maintainer | Support | Operations | Access administrator |
|---|---|---|---|---|---|---|
| Stage/edit catalog, offers and evidence | Yes | Yes | Read | Limited read | Operational metadata | No default content privilege |
| Publish/reject content revisions | No | Yes | Only assigned rules/model releases | No | Emergency suspension only | No by default |
| Change workload/prompt/ranking version | Draft if assigned | Evidence review | Draft/evaluate; release within assigned authority | No | Roll back approved version | No by default |
| Resolve customer report | Supply evidence | Approve content correction | Assess recommendation issue | Assign/respond/close with reason | Recover service | No by default |
| Inspect private support data | No default | No default | Redacted evaluation only | Minimum necessary for assigned request | Redacted diagnostics | Access configuration, not unrestricted content |
| Suspend source/service and inspect restore | No | Suspend affected content | Disable AI feature within scope | No | Yes, audited | No by default |
| Grant/revoke staff roles | No | No | No | No | No unless separately assigned | Yes, audited |

Production must define a reviewer for each release. Prefer a different reviewer for high-impact price, rule and model changes. If staffing prevents separation, identify that exception and require a recorded preview/evaluation/reason; do not represent a single actor's actions as independent review.

### 17.2 Admin acceptance cases

| Criterion | Given / action / required result |
|---|---|
| **AC-A01-01** | Given a staff role lacks publication authority, attempting to publish through UI or API is denied and logged without changing the published revision. |
| **AC-A01-02** | Given access is revoked, subsequent privileged calls/refresh attempts fail; role assignment and revocation identify actor, target, scope and time. |
| **AC-A02-01** | Given a mapped source file with valid and invalid rows, import stages a reviewable result with row errors; rejected data does not silently enter the public catalog. |
| **AC-A02-02** | Given the same import is retried, accepted record identity is preserved without duplicate variants/offers; changed inputs appear as a new staged revision. |
| **AC-A03-01** | Given two similar names with different part numbers/configurations, review keeps them distinct unless evidence supports merging; affected offers and saved references are considered. |
| **AC-A03-02** | Given a reviewed content revision, publication makes that revision retrievable; an attempted overwrite from an older editor revision returns a conflict, and restoration preserves history. |
| **AC-A04-01** | Given unmatched variant, unclear mandatory fees, stale evidence or disallowed destination, the reviewer cannot publish the corresponding verified-fit/lowest-total/active-buying claim until its prerequisites hold. |
| **AC-A04-02** | Given an offer or seller is suspended, current result/offer delivery excludes the affected buying claim and cached clients label their old observation when refreshed. |
| **AC-A05-01** | Given a numeric claim or benchmark, a reviewer can trace it to the tested configuration, method, date and permitted evidence; unresolvable claims are held back. |
| **AC-A05-02** | Given evidence is withdrawn or contradicted, affected claims are identified for re-review and unsupported current advice is withheld without destroying the historical record. |
| **AC-A06-01** | Given an updated question/rule set, simulation verifies reachability, valid exclusive options and required clarification before a version can be activated. |
| **AC-A06-02** | Given a new rule version becomes active, new runs record it; historical runs remain interpretable with their original version and are not silently rewritten. |
| **AC-A07-01** | Given a candidate model/prompt/rule release, the fixed evaluation report identifies regressions and mandatory failures; an unresolved critical failure blocks normal release. |
| **AC-A07-02** | Given rollback or AI disabling, new advice uses the selected safe version/fallback and exposes its mode; authoritative price and eligibility calculations remain available. |
| **AC-A06-03** | Given a picker-policy candidate, simulation includes reordered uses, an additional mandatory task, unchanged budget after task edits, filter-empty and compromise cases. A06/A07 review blocks activation on a hard-constraint violation, records policy/question/fixture versions and permits rollback without rewriting historical decisions. |
| **AC-A06-04** | Given a new or changed workload mapping, the reviewer can identify the triggering answer, hard/soft meaning, applicable application/scale and supporting assertion. Missing/conflicting critical evidence prevents a supported-fit claim; synthetic demo assumptions remain explicit and cannot be activated as production evidence. |
| **AC-A06-05** | Given a question or branch revision, simulation detects unreachable questions, cycles, contradictory/exclusive answers and stale dependent constraints after a parent answer changes. It includes an unknown-answer path and an additional mandatory task; invalid paths or a critical expected-outcome regression block activation. |
| **AC-A06-06** | Given a reviewed policy candidate, activation checks the intended client/schema scope and records the compatible question/mapping/ranking bundle. Affected ongoing decisions are rerun or require re-confirmation before a current fit verdict; old saved observations and user-confirmed budget/tasks are not silently rewritten. |
| **AC-A06-07** | Given a proposed publication, rejection or rollback, the authorized actor records reason, candidate/baseline versions and evaluation outcome. A new decision demonstrably uses the selected approved version; an unapproved replacement or staff edit to unrelated private buyer needs is denied. |
| **AC-A08-01** | Given duplicate reports, support can relate them to the same record without leaking another reporter's personal information; a resolution identifies evidence and action/reason. |
| **AC-A08-02** | Given a validated correction, publication/suspension and report resolution are linked; notification only uses an available, appropriate user channel. |
| **AC-A09-01** | Given an import/model/source failure, operations can identify affected records/requests and apply bounded retry, suspension or fallback with an audit reason. |
| **AC-A09-02** | Given an intervention, recovery is checked against fresh observations and error state, not inferred from clicking retry; unresolved incidents retain owner and next action. |

### 17.3 Minimum criteria before expansion is scoped

These outcomes prevent future features being treated as simple switches. They do not authorize implementation now.

| Criterion | Parent requirements | Required business evidence before acceptance |
|---|---|---|
| **AC-EX-01** | U09, A12 | Same-variant observation history with coverage gaps, consented tracking, offer revalidation, deduplication/cooldown and usable stop controls |
| **AC-EX-02** | U10 | Documented payment terms and reproducible totals; saving/contribution assumptions editable; no credit-approval claim |
| **AC-EX-03** | U11 | Defined condition evidence, lock/repair unknowns, model-specific checks and honest new-versus-used cost basis |
| **AC-EX-04** | U12, A14 | Exact current device, diagnosed versus unverified limitation, permitted upgrade paths and sourced cost/compatibility |
| **AC-EX-05** | U13, A14 | Reviewed build, multi-part compatibility, critical unknown blocking and whole-basket costs/availability |
| **AC-EX-06** | U14 | User-confirmed purchase, source policy dates, corrected receipt fields and reminders that can be changed/stopped |
| **AC-EX-07** | U15 | Explicit workspace membership/roles, scoped sharing, concurrent revisions and attributable agreement/approval |
| **AC-EX-08** | U16 | Conditional versus final quote, documented inspection/fees, handover checklist and no certified-erasure assertion |
| **AC-EX-09** | U17, A16 | Moderation/review, owner evidence context, expert qualification/fees/conflicts and a path to dispute decisions |
| **AC-EX-10** | U18, A15 | Active service/program terms, coverage, eligibility/deposits/responsibility, verification dates and suspension process |
| **AC-EX-11** | A10, A11, A13 | Controlled release/revert, valid aggregate measurement, and an ownership-verified support/export/delete process where server data exists |
| **AC-EX-12** | A17, A18 | Sponsor labels/ranking independence and genuine partner reconciliation; category/country coverage and complete local buying tests before rollout |

## 18. Business state models and data quality policy

### 18.1 Decision and offer states are independent

Maintain separate answers to: Is the requirement understood? Is this configuration suitable? Is there a current offer? Is its complete total within the ceiling? A configuration can satisfy software needs while its offer has unknown shipping; that does not justify a verified-affordable label. An unsuitable device may be visible in an explicit comparison with its failure shown.

| Object | States and business transition |
|---|---|
| Needs profile | Draft → needs clarification or ready for review → confirmed revision; edits create a new draft/revision and stale derived results |
| Recommendation run | Requested → evaluating → results ready, needs clarification, no suitable configuration, no verified offer, or failed; completed results retain the inputs and versions |
| Variant fit | Pass, fail or unknown against mandatory constraints; preferences rank only eligible results and never erase a failed condition |
| Offer match | Unresolved, accepted or rejected; only accepted identity supports an exact purchasing comparison |
| Price basis | Complete comparable total, partial known subtotal or conditional scenario; each records scope/eligibility/location assumptions |
| Offer validity | Current, stale, expired, unavailable or suspended; observation age and explicit expiry/availability are tracked separately |
| Staff content | Draft → in review → published; rejection returns to draft; suspension removes current claims; archival ends active use; restoration is a new audited action |
| Customer report | New → triaged → assigned/in progress → awaiting evidence or resolved/rejected; reopening preserves prior decisions |

Saved decisions retain historical meaning when current data changes. A cached client cannot be guaranteed to learn of a suspension while offline; it must retain its observed-at context and refrain from asserting a newly verified offer. On reconnect, current publication/validity state is reconciled before a current-buying claim.

### 18.2 Price calculation example and policy

Illustrative arithmetic only: base VND 20,000,000 + mandatory delivery VND 200,000 + mandatory assembly VND 300,000 = VND 20,500,000. An immediate VND 500,000 discount reduces the total to VND 20,000,000 only if eligibility and stacking are confirmed. If shipping is unknown, show the known subtotal and unknown shipping; do not insert zero or compare the subtotal as a complete total. Optional insurance is shown separately until explicitly selected. A required cost already included in base price is not added again.

Freshness is source-specific. Before G4, the data owner proposes acceptable age/expiry rules based on actual access/update behavior and records the rule owner, fallback and recheck method. There is no blanket “live” promise. Expiry, source outage and stale observations have explicit UI and ranking treatment. Changing a freshness policy is versioned and evaluated against current catalog coverage.

### 18.3 Evidence conflicts and corrections

Prefer sources according to the assertion: manufacturer evidence for offered configuration/support, retailer terms for an offer, and appropriately documented tests for measured behavior. This is not an absolute rule that every manufacturer or seller claim overrides contradictory evidence. Store disagreement, identify which assertion cannot be resolved, and withhold the corresponding verified claim until reviewed.

Accepted corrections record old/new value, source, actor/reviewer, reason, time and affected variants/offers/rules. An import must not automatically overwrite a reviewed assertion with lower-confidence data. Large corrections or source withdrawal trigger impact assessment across current recommendations, offers and saved references. Product history and auditability do not require storing private customer prompts indefinitely.

## 19. AI authority, privacy and audit boundaries

The deterministic system owns confirmed constraints, monetary calculation, variant identity, offer eligibility and purchase destinations. AI owns a proposal or explanation only within an allowed set of fields/facts. A valid source ID is necessary but insufficient to prove that the attached sentence is true: claims must actually match the referenced evidence and calculation context.

The preferred demo explanation format is constrained claims selecting verified fact references and approved relation types, rendered with controlled wording. More open prose requires additional evaluation and claim checking before it is allowed to express numerical or compatibility conclusions. Unverifiable statements are removed or replaced by deterministic wording. A response that references real evidence but contradicts it still fails acceptance.

Private free-text needs can reveal workplace or personal information. Before transmission, show the applicable AI use notice and send only the fields needed for the request. Use invented prompts for scripted D1 review. Production provider settings, retention, diagnostic scope and deletion behavior are G4 decisions, not assumed properties of a vendor. Basic browsing remains independent of model consent and availability.

Demo storage is local and limited to decisions/preferences. Model credentials are server-held. Production separates public catalog data, internal operational records and personal decision/support data. Staff access is task-scoped; raw prompts/files do not become a broadly searchable admin resource. Export/share content uses explicit selection and preserves price/source caveats. Audit events identify privileged actions without copying unnecessary private content.

## 20. Measurement definitions and operating decisions

Define measurement before optimizing a dashboard. Use dataset/rule/model version, supported cohort, time window, sample size and missing observations when reporting each measure.

| Measure | Definition / denominator | Interpretation and decision |
|---|---|---|
| Mandatory-constraint violation rate | Incorrectly accepted items / evaluated items with independently adjudicated mandatory requirements | Release set must have no unresolved critical violation; unknown/unassessed cases reported separately |
| Needs capture error | Material incorrect/omitted confirmed fields / adjudicated relevant fields, with unknowns and user corrections tracked | Determines question/AI changes; do not count a guessed default as a correct answer |
| Complete-total discrepancy | Amount and cause of difference between the app's complete total and audit-time source/checkout under the same context | Fixtures require exact arithmetic; live changes distinguished from calculation/eligibility errors |
| Coverage | Supported test profiles with at least one verified eligible offer / all selected supported profiles | Report by workload/budget/source and no-fit cause; catalog record count alone is insufficient |
| Freshness coverage | Displayed active offers meeting their source-specific freshness rule / displayed active offers | Missing observations count explicitly; freshness rule and observation failures must be visible |
| Decision comprehension | Participants correctly explaining fit, price conditions, unknowns and next step / participants attempting the scenario | Exploratory feedback is qualitative at small sample sizes; use it to prioritize revisions |
| Useful-session cost | Attributable model, hosting/data and estimated operating effort / sessions meeting a defined useful-decision outcome | Define outcome before reporting; retailer clicks are not confirmed purchases |
| Correction turnaround | Time from actionable report to verified correction/resolution, with waiting states identified | Prioritize high-impact wrong-price/variant issues and measure staff workload |

Before G4, approve values and owners for catalog coverage target, supported budgets/workloads, source freshness windows, provider usage cap, support hours/escalation, personal-data retention, restore point/time objectives, and error/latency reporting. A field remaining TBD is an unresolved gate condition where required for safe operation; silently choosing a convenient default is not approval.

## 21. Severity, decision rights and release exceptions

- **S0 / stop:** exposed credentials/private data, unauthorized admin publication, or systemic integrity failure. Contain and suspend the affected capability; an emergency response is recorded.
- **S1 / release blocker:** a core journey cannot complete on a supported client, an incorrect exact-variant/affordability claim, a critical mandatory constraint passing incorrectly, or an unsupported AI buying assertion.
- **S2 / material issue:** important friction or partial degradation with a truthful, usable workaround and no integrity/access violation.
- **S3 / minor:** presentation or secondary-content defect without a misleading decision outcome.

No open S0/S1 issue is accepted as routine gate passage. A product scope change may remove the affected capability from the release only if it is explicit, the remaining journey stays coherent, and tests/copy are updated. S2 acceptance records owner, workaround, user impact, due date and rationale; it is never relabelled “passed.” Demo-only deferrals do not satisfy production requirements.

Sponsor owns scope/funding and gate decisions; technical lead owns integration/architecture evidence; data/recommendation reviewers own domain/evidence assessments; QA owns reproducibility and defect evidence; operations owns readiness/recovery evidence. Reviewers recommend, and the accountable decision owner records accept/revise/stop with date and required follow-up. A sole developer may hold several roles but should identify which assessments lack independent review.

## 22. Definition of requirements readiness and change impact

A requirement is ready for implementation when its actor, supported scope, trigger, confirmed inputs, outcome, exception behavior, business-rule references, data dependencies, acceptance IDs and accountable reviewer are identified. A requirement is ready for acceptance only when its actual evidence is attached and the relevant gate owner decides. Document completeness is not feature completion.

A scope change record includes: request and business need; affected U/A/BR/NFR and acceptance IDs; release stage and user/admin flow impact; source/privacy/native dependencies; delivery/operating cost estimate; migration or compatibility effects; verification changes; decision and owner/date. Re-run relevant regression and update the traceability register. Later-stage placeholders require a separate detailed readiness review before being promoted into current delivery.
