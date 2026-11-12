# Research: adaptive multiple-choice onboarding

Prepared 10 November 2026. Scope: Vietnam-first device adviser, mobile first with Windows adaptation. This is a proposed question protocol and UX design; no conversion, completion-time or recommendation-accuracy gain has been demonstrated.

## 1. Recommendation

Offer an **optional guided buying setup**, primarily multiple choice, when a user wants recommendations. Keep browsing, exact-model search, quotation checking and current-device help accessible without completing a universal profile.

Use a short common core, then targeted follow-ups and an editable review. A first hypothesis is roughly four to six core questions plus only the follow-ups that affect the decision. There is no research-backed universal ideal question count or promise that every user can finish in a fixed number of seconds.

The questionnaire should describe the **current buying decision**, not permanently label the person. A user may buy a laptop for work now and a phone for a parent later. Reuse previous answers only after making their scope and freshness clear.

## 2. What the research supports

| Source | Supported guidance | How it applies / limit |
|---|---|---|
| [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/) | Ask only information with a clear purpose, provide Back, allow valid uncertainty, and start with one question per page | Use a focused mobile screen and preserve answers; not a universal ban on grouping related simple fields |
| [NN/g progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) | Defer advanced or infrequent detail until relevant | Route applications, games, peripherals and technical options from the user's tasks |
| [GOV.UK radios](https://design-system.service.gov.uk/components/radios/) | One-answer semantics, explicit hints and no preselected answer | Use for category, condition and a required OS; avoid behavior inferred from a default |
| [GOV.UK checkboxes](https://design-system.service.gov.uk/components/checkboxes/) | Multiple-answer semantics and exclusive alternatives such as none | Use for actual uses and required features; handle unknown/no-preference without contradictory selections |
| [Pew question-writing guidance](https://www.pewresearch.org/writing-survey-questions/) | Wording, available answers and order influence answers; pretesting matters | Build answer options from user research, with other/unknown where valid; survey findings do not directly prove app conversion improvements |
| [GOV.UK check answers](https://design-system.service.gov.uk/patterns/check-answers/) | Review and correction before submission | Show the needs summary, budget scope, assumptions and edit actions |

NN/g's [onboarding tutorial guidance](https://www.nngroup.com/articles/onboarding-tutorials/) concerns instructional tutorials rather than recommendation questionnaires. It supports contextual help instead of a feature tour, but is not direct evidence against useful needs questions.

Progress indicators also require judgment. GOV.UK recommends improving question order/type/number first and testing whether a simple indicator helps. A branching questionnaire should not promise a false fixed total. Stage names such as Basics, Your tasks, Preferences and Review may be a useful initial design.

## 3. Routes before questions

Ask “What would you like help with?” using single choice, or carry the explicit choice forward from a home action:

- Find a suitable device → guided needs setup.
- Check a retailer offer → link/quotation and offer-specific questions.
- Improve a device I own → exact model and the current limitation.
- Browse without setup → catalog/search with optional refinement later.

Do not make users answer recommendation questions unrelated to their route. Creating an account, enabling notifications or granting location access is not a prerequisite for basic discovery.

## 4. Common discovery questions

| Question | Control and proposed choices | Effect |
|---|---|---|
| What are you choosing? | One: Laptop; Phone; Desktop PC; Help me decide | Choose catalog and follow-ups; uncertainty starts a clarification, not a default product type |
| What is the maximum total you want to spend? | Ascending exact ceiling presets; custom amount; help setting a budget | User-confirmed hard cap for an explicit purchase scope |
| What will you regularly use it for? | All relevant activities; Other; Not sure | Identify work/tasks and branch questions; do not infer needs from occupation alone |
| Which conditions would you consider? | New only; Used/refurbished only; Compare both; Not sure | Affects eligible offers; uncertainty is not permission to present used as equivalent |
| Which two tradeoffs matter most? | Choose up to two category-specific priorities; No strong preference | Soft ranking preference only; does not remove required tasks |

The route question plus these five areas form the proposed common core. Some optional areas can move after a preliminary shortlist if testing supports it. Critical compatibility or purchase-scope questions may still be needed before a confirmed-fit result.

### Budget design

Example laptop ceilings: VND 12m, 18m, 25m, 35m and 50m. Phone examples: VND 5m, 8m, 12m, 20m and 30m. These are illustrative UI presets to test, not current market-price bands or recommended spending levels. Always offer a custom exact ceiling.

Say **maximum total**, not “How much is your budget?” with ambiguous ranges. If a user selects a band during exploratory research, confirm an exact ceiling before enforcing affordability. Do not silently use the top of a range. For desktop PCs, confirm which equipment belongs in the total.

“Help me set a budget” means the budget is unknown; it does not mean unlimited spending. Show clearly labeled budget guidance or an exploratory preview. Keep monthly payment and total purchase price as separate inputs and outputs.

### Activities

Laptop: study/office, programming, engineering/CAD, photo/design, video editing, gaming, local AI, other, unknown.

Phone: everyday calls/apps, photography, video creation, gaming, outdoor/navigation, required work apps, reading/accessibility, other, unknown.

Desktop: office/study, programming, engineering, creative work, gaming, local AI, other, unknown.

These initial options need interviews and pretesting. Selecting all relevant activities is different from selecting the top two preferences. Do not cap actual needs at three merely to make the screen tidy.

### Priorities

Laptop: lower adequate cost, portability, battery away from outlets, sustained performance, screen/reading comfort, service, upgradeability.

Phone: lower adequate cost, camera results, battery between charges, comfortable size, gaming, published software support, service.

Desktop: lower adequate cost, task performance, noise, footprint, upgradeability, assembly/support.

The top-two limit is a proposed tradeoff exercise. Provide a way to refine more priorities later. Keep any marked must-have requirement separate from preference weights.

## 5. Conditional follow-ups

| Trigger | Follow-up | Proposed answer format |
|---|---|---|
| Programming / engineering / creative / local AI | Which applications or tools must work? | Searchable multi-select, Other with manual name, Not sure; version/backend only when relevant |
| User mentions VMs/emulators | How many run at the same time? | None; One; Two or three; Four or more; Not sure |
| Gaming | Which games matter? | Searchable titles plus Other and Not sure |
| Gaming target changes shortlist | What experience do you want? | Casual; Competitive responsiveness; Higher visuals; Custom target; Help choosing |
| Photo/video/CAD work | What projects do you usually handle? | Application-specific choices, examples and unknown; avoid one vague “heavy work” label |
| Laptop portability matters | How will you carry/use it away from a desk? | Category-appropriate frequency and weight/size choices with uncertainty |
| Required software/peripheral | Must it use a particular OS, port or accessory? | Explicit requirement controls; unknown cannot become a compatibility pass |
| Phone camera use | What do you capture? | All relevant: people, low light, distant subjects, moving video, documents/work; Not sure exclusive |
| Phone outdoor/battery use | How often can you charge? | Usually available; At end of day; Often away from charging; Varies/not sure |
| Accessibility/comfort needs | Which interaction requirements matter? | Non-diagnostic choices and Other; no required age or medical disclosure |
| Desktop PC | What must the total include? | Tower only; Tower plus monitor; Complete setup; Upgrades only; Custom scope; Help choosing |
| Existing PC equipment | What exact parts/peripherals will you keep? | None; Add models; Not sure; unresolved critical compatibility remains visible |

Ask all necessary critical follow-ups, even if that exceeds the initial count hypothesis. Show a provisional preview when useful, but do not label a device confirmed suitable while required app/peripheral support remains unresolved.

## 6. Questions to defer until the relevant moment

- **Purchase deadline:** when prioritizing stock, delivery or alerts.
- **City/delivery area:** before location-dependent offers, complete shipping totals or pickup claims.
- **Payment mode:** when comparing full payment versus installments; no bank login required.
- **Benefits eligibility:** when a real discount is available; do not infer student status from a study use case.
- **Brand/aesthetic preference:** after functional requirements, unless the user raises it.
- **Exact current-device specifications:** on the upgrade/reuse route.
- **Account:** when the user wants synchronization or another account-specific benefit.
- **Notification permission:** when a user explicitly creates an alert or reminder.

Do not ask salary, gender, full birth date, identity number, employer identity, exact GPS location or a complete installed-app inventory merely to recommend a device. Broad country context can be suggested visibly and corrected; shipping needs do not require location permission.

## 7. Answer semantics and recommendation rules

Store an answer's state, value, source and scope. Distinguish **answered**, **unknown**, **skipped**, and **not applicable**. An explicit “No additional requirements” is different from missing information. A “No strong preference” answer can produce neutral soft weights; it is not a compatibility finding.

Use stable option IDs instead of visible labels as rule keys. A question protocol should record why each answer is needed and which downstream behavior it affects. Do not map “student” directly to a RAM amount or “engineer” directly to a GPU brand. Retrieve application/vendor evidence and relevant workload measurements.

When a category changes, invalidate category-specific questions and derived results. When a task is deselected, clear or suspend dependent answers with an understandable notice. Carry compatible shared answers forward with review; never reuse a person's work profile for another recipient without confirmation.

Soft weights must not override budget, OS, application support, retained-part compatibility, or other hard constraints. Selecting “spend less” is an objective preference, not permission to omit a required task. Selecting “camera quality” does not establish a measured performance threshold.

A confirmed-fit result requires enough evidence to evaluate mandatory constraints. Unknown essential fields can trigger another question, an uncertain result or an abstention. They must not be silently filled by the model.

## 8. Review and mobile behavior

Show an editable summary before finalizing: category; exact budget and included items; all tasks; critical applications/accessories; condition; priorities; assumptions; unresolved requirements. Use “Show my options” when ready and explain outstanding qualifications in place.

Mobile defaults:

- One decision per screen; group related simple inputs only when testing supports it.
- Full-row labels for radio/checkbox controls and text stating the selection rule.
- Continue and Back; no surprise auto-advance on the first tap.
- Valid unknown/other options; optional questions clearly marked.
- Exclusive unknown/none/no-preference controls cannot coexist with contradictory specifics.
- Preserve state through Back, edits and interrupted sessions as appropriate.
- Label currency, purchase scope and optional fields explicitly.
- Do not place long answer lists in horizontal carousels.
- Do not use progress percentages as confidence scores or claim a fixed remaining count in a changing branch.
- Use native Material 3 Expressive controls and platform accessibility behavior in production.

Ask why a difficult question matters in one short sentence, such as “Your tools may need specific OS or driver support.” This is contextual help, not a tutorial screen explaining every feature.

## 9. Research and validation plan

1. Interview recent/current buyers to discover missing answer categories and confusing vocabulary. Include different technical experience, budgets, devices and payer/recipient relationships.
2. Run cognitive interviews: ask users to explain what a question and each chosen answer mean. Revise overlapping or leading choices.
3. Compare a concise adaptive flow, a longer questionnaire, and direct guided browsing using the same catalog/rules. Do not change recommendation quality between UI variants.
4. Measure first-use task completion, time to a useful shortlist, per-question abandonment, unknown/other rates, corrections, missed hard requirements, technical correctness and perceived effort.
5. Review question value: what new decision did an answer enable, and how often was the question necessary? Avoid interpreting correlated completion as a causal benefit without an appropriate experiment.
6. Choose sample sizes and success criteria before quantitative claims. A few usability sessions can reveal problems but cannot establish population conversion gains.

Track whether users who skip setup still succeed. High questionnaire completion is not success if users misunderstand their budget or receive unsuitable devices. Do not optimize for engagement by asking unnecessary questions.

## 10. Reusable implementation assets

[Question bank and protocol](./onboarding-question-bank.json) contains 28 proposed questions across core, conditional and later stages, with control types, options, triggers, and intended effects. This is a versioned design artifact, not a runtime-tested survey engine.

[Interactive routing concept](./onboarding-routing-concept.html) illustrates a small subset of device/task branches. Scripted checks passed for no initial selection, category-dependent tasks, combined follow-ups, dependent-task clearing and desktop budget scope. These checks verify demonstration behavior, not user comprehension, production app integration or recommendation correctness.

The initial production implementation can use a schema-driven question renderer with shared state and native platform controls. Keep branch/validation logic deterministic. AI may interpret optional free text or suggest a clarification, while typed constraints, user review and catalog evidence remain authoritative.
