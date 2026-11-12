# First demo implementation plan

Status: proposed implementation plan, 10 November 2026. No native application has been built by this planning task.

## 1. Milestone and purpose

Deliver a runnable React Native laptop adviser demo for Android and Windows. Demonstrate one complete decision: describe needs → confirm requirements → receive a shortlist → inspect a device → compare two devices → review buying options → save and revisit the decision.

Prove three things: users can understand the decision, the same domain logic works on both platforms, and the requested native UI integrations are viable. The demo does not validate market demand, real-world product suitability, retailer coverage, or live price accuracy.

Two checkpoints keep dependencies explicit:

- **D0: native interaction demo.** Complete the journey on both platforms using deterministic fixture data and rule-generated explanations. No model credentials or network are needed. Any simulated adviser response is explicitly labelled.
- **D1: AI-assisted demo.** Add a small server-side AI integration for needs interpretation and grounded follow-up explanations. Both platforms keep working if the provider fails. D0 can be shown independently, but must not be described as a completed live AI integration.

Do not implement all eight first-release journeys from project-scope.md in this milestone. Search, the questionnaire, comparison, offers, and saving are bounded parts of this one journey. Full offer import, accounts, administrative operations, and real data ingestion belong to the next milestone.

## 2. Demonstration scenario

Use Vietnamese UI and VND. Example: a student needs office/study applications, coding, and occasional virtual machines, with a self-entered total ceiling of VND 22 million and a preference for portability.

The demonstrator completes these actions:

1. Launch without signing in and select “Tìm máy phù hợp”.
2. Set the budget, select study/coding, answer the relevant workload follow-up, and review the interpreted needs.
3. Receive eligible sample configurations with meaningful reasons and limitations.
4. Change the VM requirement or budget and observe the shortlist change without silently weakening a hard constraint.
5. Open an exact configuration, view its evidence/unknowns, select a second device, and compare them.
6. Review sample seller totals and an example of conditional pricing or missing shipping.
7. Save the decision, close/reopen the application, and revisit its profile and selections.
8. At D1, enter a natural-language need, review the AI's proposed fields, and ask why one selected device was excluded or preferred.

Also demonstrate a no-fit result and an AI/network failure. A demo that only supports the happy path will conceal important product behavior.

## 3. Screens and interaction boundaries

| Surface | User action | System response | Completion condition |
|---|---|---|---|
| Discover | Start guided selection, search sample names, resume a decision | Clear entry points and visible sample-data notice | A relevant route opens without signup |
| Guided needs and review | Set an exact ceiling, select tasks, answer relevant questions, review/edit | Conditional follow-ups and an editable needs summary | A validated profile is confirmed |
| Results | Inspect reasons, change requirements, save/select comparison | Eligibility recalculates and stale responses cannot overwrite newer choices | User has a defensible shortlist or an explicit no-fit outcome |
| Device detail | Inspect the exact variant, limitations, fixture provenance, buying options | Configuration-specific content; unknown facts remain unknown | User can select this variant or return with state preserved |
| Compare | Compare two variants and remove/replace one | Equal units, task-relevant differences, budget and missing-data states | User chooses a device or returns to refine needs |
| Buying options | Inspect sellers and price conditions | Itemized totals, conditions, timestamp, incomplete-total state | User understands the sample offer and can save it |
| Saved decision | Reopen or delete the saved decision | Restored profile, variants and dated offer snapshot | Decision survives a restart or is deleted as requested |

Contextual explanations use a temporary surface on compact Android and a side pane or dialog on Windows. A separate full chatbot destination is unnecessary. Buying options can be a detail subview rather than an extra primary navigation destination.

Demo purchase actions open a local offer summary explaining that no transaction occurs. Do not send fictitious prices to real retailer pages. The real retailer redirect contract will be introduced with verified offers in the next milestone.

## 4. Fixture data and rules

Create **12 fictional laptop variants and 18 fictional offers across three fictional sellers**. These are proposed fixture counts, chosen for scenario coverage. Keep names and illustrations visibly synthetic and identify prices/specifications as demonstration data. Do not attach fabricated claims to real brands or invent benchmark measurements.

Include:

- Similar names with different RAM/storage to exercise variant identity.
- Lightweight and heavier choices; study, coding and VM capability assumptions.
- A device below the ceiling and an otherwise suitable device above it.
- An offer with complete charges, one with unknown shipping, one expired offer, and an eligibility-dependent discount.
- A mandatory capability with missing information.
- A sample unavailable offer and a profile with no eligible device.

All fixture rules are demonstration assumptions, not validated hardware recommendations. Each assertion records a fixture ID and provenance type. Offer timestamps use a frozen demo clock for reproducibility, with an explicit stale scenario.

Implement a pure TypeScript pipeline: validate confirmed needs → apply hard constraints → compute comparable totals → rank soft preferences → return reasons, exclusions and unknowns. Use integer VND amounts. An incomplete total cannot win a verified-lowest-total label. Never pad the shortlist to a fixed number or show an unexplained match percentage.

For now, run the shared pipeline locally behind a repository/service interface. Introduce a network adapter later without rewriting screen behavior. No database, ingestion worker, search service, or production admin console is required for D0.

## 5. Platform feasibility before feature development

Choose a mutually compatible React Native/RNW Fabric pair and native dependencies at implementation time. Pin the versions and lockfile only after compiling both applications. Do not use independently selected latest versions or historical initialization flags.

**Windows:** demonstrate actual WinUI 3 input, command and selection controls through a supported hosting boundary. Verify native-to-JavaScript value events, focus, keyboard navigation, theme changes and resizing. RNW's newer rendering architecture is not proof that every React control is WinUI 3.[1]

**Android:** demonstrate a small coherent Compose Material 3 Expressive control group exposed through Fabric. Verify sizing, event delivery, keyboard behavior, Back, lifecycle/disposal and accessibility. Fabric provides a native component mechanism, and Android documents Compose/View interoperability; neither guarantees the combined adapter is already complete.[2][3][4]

Use narrow native boundaries, not a separate composition for each text label. The shared content layer can use appropriate React Native primitives. Build only the controls the demo needs.

**Gate:** both hosts can edit the same typed budget/task state and display the resulting selection in a release build. If either host fails this gate, document the concrete limitation and resolve the integration decision before building all screens. A styled imitation must not be reported as satisfying the native-control requirement.

## 6. Shared structure and components

Keep the initial structure small; logical boundaries need not become independently published packages:

```text
apps/adviser/
  android/
  windows/
  src/
    app/                 # routes and platform shells
    domain/              # needs, variants, offers, money, ranking
    data/                # fixture repository and persistence adapters
    features/            # needs, results, details, compare, saved
    ui/                  # shared component contracts and platform files
    native/              # codegen specs and native adapter integration
    localization/        # Vietnamese strings, currency and units
    demo/                # fixtures, scenario reset, frozen demo clock
services/demo-ai/         # introduced at D1 only
docs/decisions/
```

Implement these reusable responsibilities as features need them:

- AppShell: navigation and state restoration, with platform-specific presentation.
- BudgetField and ChoiceGroup: validated values, labels, unknown/skip semantics and native controls.
- NeedsSummary: readable requirements with edit actions.
- ProductSummary/RecommendationCard: exact variant, meaningful reason, price state, save/compare actions.
- PriceSummary/OfferList: charges, conditions, total completeness and observation time.
- CompareSelection and ComparisonView: persistent selection and normalized differences.
- EvidenceView and ExplanationPanel: fixture provenance, unknowns and contextual advice.
- FeedbackState: loading, empty, no-fit, offline and error presentation.

Avoid building a general UI framework. Platform checks belong mainly in adapters. Draft questionnaire state, confirmed decision state, comparison selections and local settings have separate ownership. Keep explanation updates from rerendering the entire result list.

## 7. AI checkpoint D1

Add a minimal server with two capabilities: interpret a short needs description into proposed profile fields, and explain a selected comparison using a supplied bundle of checked fixture facts.

The server holds provider credentials, validates requests/responses, limits input size, applies a timeout and prevents arbitrary browsing/tool use. The model returns references to known fixture IDs; it does not create product cards, prices, purchase URLs or compatibility verdicts.

The client displays proposed profile changes before applying them. Budget and mandatory-requirement changes require explicit confirmation. An unsupported claim or invalid ID is rejected; the client uses a deterministic explanation instead. Show which mode produced the response so a scripted fallback cannot be mistaken for a successful model call.

If no provider/access budget is available, finish D0 and record D1 as pending. Do not embed keys in the app or block local recommendation behavior on provider availability.

## 8. Implementation backlog and dependencies

| ID | Work package | Depends on | Deliverable and acceptance |
|---|---|---|---|
| DEMO-01 | Confirm toolchains and native hosting | None | Both app hosts compile and run; version matrix and commands recorded |
| DEMO-02 | Prove platform control adapters | 01 | Budget/task edits round-trip correctly; keyboard/Back/focus and lifecycle work |
| DEMO-03 | Define fixtures and shared contracts | None; finalize against 02 | Typed fixture catalog, offer states, needs schema and reproducible scenarios |
| DEMO-04 | Implement eligibility, totals and ranking | 03 | Deterministic results with reasons, no-fit, exclusions and unknowns |
| DEMO-05 | Build shell, needs flow and result list | 02, 04 | Complete editable intake-to-shortlist flow on both platforms |
| DEMO-06 | Add detail, comparison and buying options | 05 | Exact variant state survives navigation; two-device comparison and offer totals work |
| DEMO-07 | Add local saved decisions and reset | 06 | Decision survives restart, can be deleted, and scenario reset clears local demo state |
| DEMO-08 | Complete accessibility, failure and packaging pass | 05–07 | Reproducible install/run artifacts and D0 acceptance record |
| DEMO-09 | Implement server-side AI adapter | 03, 04 and provider access | Validated interpretation/explanation endpoints with timeout and fallback |
| DEMO-10 | Connect contextual AI and evaluate | 06, 09 | Proposed edits are reviewable; invalid claims rejected; D1 demonstration recorded |

Implement the first working vertical slice before polishing every screen. Domain/fixture work can proceed independently of the platform spike; screen construction depends on its result.

## 9. Validation and completion checklist

Meaningful domain checks: exact budget boundaries, integer totals, unknown mandatory fields, non-stackable discounts, expired offers, variant identity, stable ranking and no-fit behavior. These checks verify fixture logic; they do not validate real product advice.

User-flow checks on both platforms:

- Change the budget after selecting products: eligibility updates and invalid selections are explained.
- Go Back, resize/rotate, and restart: the appropriate profile/selection persists without duplication.
- Use keyboard-only Windows navigation, Narrator/TalkBack and larger text: primary actions and price conditions remain accessible.
- Disconnect the network: D0 stays useful and D1 reports fallback honestly.
- Send malformed or unsupported AI output: no invalid product, price or hidden profile edit reaches the view.
- Repeatedly open/close native explanation and input surfaces: no crash, lost focus or continuing background composition.

Measure startup, local recalculation, list scrolling and memory behavior in release builds on named devices. Use the blueprint's budgets as provisional targets, then report actual measurements and deviations. Do not publish a p95 claim from a handful of runs.

Try the journey with a small exploratory group, for example five participants who vary in technical confidence. Ask them to identify why a machine is unsuitable, the complete versus conditional price, and what is saved. Record observed confusion; this does not establish population-level usability.

D0 is complete when both installable builds finish the scenario, critical domain checks pass, saved state restores, sample data is clearly labelled, and known limitations are documented. D1 additionally requires a real provider-backed interaction, rejected invalid output, and a demonstrated failure fallback.

## 10. Effort and deliverables

For one developer already comfortable with React Native and the relevant native stacks, provisionally allow **15–25 focused engineering days for D0**, plus **3–5 for D1**, excluding unresolved toolchain/hosting blockers and review turnaround. These are initial task-sizing assumptions, not a researched industry benchmark or delivery promise. Re-estimate after DEMO-02; unfamiliar native work can materially extend the duration.

Expected handover: source and dependency lockfile; Android APK and Windows install/run artifact; toolchain setup; fixture schema and dataset; rule and flow checks; short reproducible demonstration script; native-integration decision record; performance observations; and an explicit limitations list. Record packaging/signing requirements and install instructions instead of assuming a Windows package runs on every machine.

The next milestone replaces selected fixtures with a small permitted, audited catalog and real retailer offers. It introduces refresh/correction operations before making live-price claims. It then assesses actual recommendation usefulness against baseline filters.

## 11. Sources and existing project inputs

- [Project scope](./project-scope.md), [technical blueprint](./technical-blueprint.md), [mobile interface strategy](./mobile-interface-strategy.md), and [questionnaire research](./onboarding-questionnaire-research.md). Reuse the relevant branches of the [question bank](./onboarding-question-bank.json); do not turn all 28 questions into a mandatory wizard.
- [Existing HTML concept](./mobile-adviser-concept.html): reference for interaction intent and terminology; it does not prove native feasibility.
- [1] Microsoft: https://microsoft.github.io/react-native-windows/docs/new-architecture/
- [2] React Native Fabric components: https://reactnative.dev/docs/fabric-native-components-introduction
- [3] Android Compose/View interoperability: https://developer.android.com/develop/ui/compose/migrate/interoperability-apis/compose-in-views
- [4] Android Material 3 Expressive: https://developer.android.com/develop/ui/compose/designsystems/material3

Official sources establish the underlying mechanisms. Native adapter design, task sizes, fixture counts and demonstration scope are project-specific proposals requiring implementation and validation.
