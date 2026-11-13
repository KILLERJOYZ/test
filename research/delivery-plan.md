# Delivery, research, and validation plan

Prepared 10 November 2026. This plan proposes work; none of the experiments, integrations, or application benchmarks has been completed by the research task.

## 1. Stage the product around evidence

### Stage 0: feasibility and data access

Prove both native design systems under React Native, and establish how Vietnam offers will be obtained and maintained.

Deliverables:

- Windows/Android vertical slice with real native controls, a shared profile, list, comparison, and evidence view.
- Compatible dependency/toolchain matrix and documented limitations.
- Source register with actual permitted use, quotations, coverage, refresh/storage policies, and ownership.
- Small manually checked catalog, for example 30–50 exact laptop variants across two or three maintainable sources.
- Variant matching and offer-total fixtures, including misleading promotions and incomplete totals.

Exit only when native controls pass basic interaction/accessibility tests and the pilot's data use is documented. A manually curated prototype is acceptable with honest timestamps; a live-price claim requires a working refresh path.

### Stage 1: laptop pilot

Serve a small number of well-defined groups: students/office work, software development, and one creative or engineering workload selected through interviews.

Include guided needs intake, editable AI extraction, three useful shortlist roles, exact variant details, evidence-linked advantages/disadvantages, comparable offers, side-by-side comparison, Vietnamese/English content, and local saved profiles. AI failure should fall back to rules and templates. Deliver on Windows and Android with shared contracts.

Do not make unlimited open chat, every retailer, historical prediction, and unrestricted custom PCs prerequisites for this pilot.

### Stage 2: trustworthy prices and phones

Expand only after laptop data quality and decision usefulness are established. Add a phone variant schema with network/SIM/firmware/warranty distinctions; apply the same eligibility and evidence framework with phone-specific workload criteria. Add alerts and price history only when contracts permit retention and the refresh service has proven reliability.

### Stage 3: PC configurations

Start with expert-reviewed builds and explicit compatible substitutions. Add CPU/BIOS, memory, physical/electrical, storage/lane, and basket-total rules. Only then enable automatic configuration search. Require all critical compatibility edges to be known before awarding a compatibility status.

### Stage 4: country expansion

Treat each country as a new data/retailer/support configuration with local currency, language, delivery, tax, variant, and warranty rules. Reuse domain and UI contracts; revalidate workloads and offers locally. Global reach is a rollout program, not a currency converter.

## 2. Illustrative pilot schedule

For an experienced team with React Native, Windows C++/WinRT, Android/Kotlin, backend/data, and design coverage, an **illustrative 10–14 week pilot** could allocate:

| Window | Outcome | Dependency |
|---|---|---|
| Weeks 1–2 | Interviews, native interoperability spike, data-rights discussions | Access to representative hardware and sources |
| Weeks 3–4 | Variant/offer model, admin correction, curated catalog, UI contracts | Feasibility decisions |
| Weeks 5–7 | Full laptop journey and deterministic ranker on both platforms | Reliable pilot data |
| Weeks 8–9 | AI extraction/explanation, failure fallback, offer refresh | Validated schemas and evidence |
| Weeks 10–12 | Blind evaluation, accessibility, performance, pricing audit | Release builds and representative users |
| Weeks 13–14 if needed | Fixes and limited pilot rollout | Quality and source-access gates |

This is a planning range, not a delivery commitment. Native interoperability problems, hiring, and licensing lead time can dominate it. A solo developer should expect a materially longer schedule or a smaller first release. Estimate again after Stage 0; phones and the PC solver are additional phases.

## 3. Prioritized backlog

| Priority | Work item | Acceptance condition |
|---|---|---|
| P0 | Native UI feasibility slice | WinUI and Expressive controls verified on both target release builds |
| P0 | Data rights and feed coverage | Source policy records and sustainable pilot access; no assumed rights |
| P0 | Variant identity and correction | Fixtures distinguish misleading names/configurations and flag uncertainty |
| P0 | Complete offer totals | Promotions, delivery, VAT inclusion, stock, and expiry cases pass |
| P0 | Needs schema and workload rules | Mandatory constraints remain explicit/editable and versioned |
| P0 | Deterministic recommender | Never silently exceeds budget or passes unknown required compatibility |
| P0 | Global components and theme adapters | Core screens use documented UI contracts across both platforms |
| P0 | Evidence and uncertainty UI | Every recommendation exposes meaningful sources and unknowns |
| P1 | Vietnamese/English AI intent extraction | Benchmark set meets target and corrections are supported |
| P1 | Grounded pros/cons | Numeric/product assertions resolve to records; failures use templates |
| P1 | Compare and local saved searches | Correct units, exact variants, offline/stale states |
| P1 | Performance/accessibility pilot | Defined journeys meet budgets or deviations are explicitly accepted |
| P1 | Feedback and admin tools | Wrong offers/variants can be reported, triaged, corrected, and audited |
| P2 | Price alerts/history | Contract permits retention; offers are freshly revalidated before alerts |
| P2 | Phone recommendations | Phone variant, connectivity, and support fixtures pass |
| P2 | Reviewed PC templates | Validated builds, unknown states, and budget totals are inspectable |
| P3 | Learned ranker and automatic PC search | Demonstrated gains against simple baselines with no constraint regression |
| P3 | Multi-country support | Separate market coverage and purchasing policies verified |

## 4. Planned research experiments

### A. Validate the buying problem

Interview approximately 12–18 people across the initial groups, including recent buyers and people actively buying. Ask them to describe actual applications, budgets, research steps, confusing offers, and post-purchase regrets. Observe several users using the reference sites and local retailer tools with the same buying task. Avoid leading them toward “AI” as the answer.

Measure completion time, unresolved questions, confidence, offer misunderstanding, and whether advice changes the shortlist. This is exploratory qualitative work, not a representative national market survey.

### B. Compare recommendation approaches

Create an initial offline set of about 100–150 Vietnamese/English profiles with fixed catalog/offer snapshots. Cover budgets, sparse input, conflicting preferences, application restrictions, discontinued/unavailable products, regional variants, and no-fit cases.

Compare:

1. Filters plus lowest eligible complete price.
2. Filters plus workload-weighted rules.
3. The proposed AI extraction and grounded explanation around the same checked ranker.

If studying an LLM-only baseline, keep it offline and record invalid products, invented prices, and unsupported claims; do not use it to generate live purchase offers. Have multiple independent technically competent reviewers assess suitability while blinded to the system variant. Resolve disagreements and report agreement; do not rely on the same model to judge itself.

Evaluate hard-constraint violations first, then top-three usefulness and ranking agreement, evidence correctness, no-fit behavior, explanation usefulness, latency, and cost. Use temporal holdout snapshots for learned models and ranking updates to limit leakage. Stratify by profile and budget so overall averages do not hide failures for lower-budget users.

### C. Audit product and offer identity

Manually check a stratified sample of pilot variants and offers against exact model codes, retailer terms, and permitted source evidence. Include near-identical names, multiple memory/display configurations, imported devices, student pricing, coupons that cannot stack, shipping unknowns, and different warranty conditions.

Record precision of accepted matches, abstention rate, total-price error, stock/expiry errors, and data freshness. Report denominators. Precision without coverage is insufficient: an app that verifies only a tiny minority must disclose that limitation.

### D. Test user experience and performance

Run identical journeys on both platforms: profile creation, filtering, shortlist, compare, evidence, buying options, and a failed/slow connection. Include large text, screen reader, reduced motion, Android Back, Windows keyboard navigation, resizable windows, and repeated navigation for leaks.

Record proposed performance metrics from [technical-blueprint.md](./technical-blueprint.md), p50/p95 where sample sizes support them, error rates, and conditions. For pilot user tasks, report sample sizes and qualitative observations; do not invent statistically significant improvements.

## 5. Proposed launch gates

These are initial quality targets and should be ratified after the feasibility phase:

- Zero known critical hard-constraint violations in the release evaluation set; disclose the number and coverage. This does not imply zero future errors.
- Every recommended purchasable offer has an exact accepted variant match or an explicit unresolved state that prevents a verified-price claim.
- Every numeric explanation claim and cited test result resolves to stored evidence/calculation inputs; invalid claims fall back to templates.
- Expired/unavailable/incomplete offers cannot win the verified-cheapest badge.
- A manual pricing audit meets an agreed accuracy tolerance; propose exact VND calculation correctness for fixed fixtures and investigate every live checkout discrepancy.
- Native interaction, accessibility, and performance gates pass on representative hardware; unsupported devices have a documented support policy.
- Provider failures and offline operation preserve useful browsing and honest freshness states.
- Source rights, model processing permissions, privacy defaults, app packaging, and support/correction workflows are documented for the pilot.

Do not optimize only click-through rate. Also track shortlist satisfaction, price discrepancies, report/correction rate, no-fit usefulness, decision time, returns/regret when users voluntarily provide it, and total model/data cost per useful session. Collect feedback with consent and avoid unnecessary personal history.

## 6. Main risks and concrete mitigations

| Risk | Consequence | Mitigation |
|---|---|---|
| Data feed or license unavailable | Incomplete catalog or blocked launch | Start small with permitted/manual records; keep adapters replaceable |
| Wrong variant match | Incorrect advice and false price comparison | Exact identifiers, conservative matching, manual review, abstention |
| Conditional/expired prices | Loss of trust | Complete totals, eligibility states, timestamps, revalidation |
| Native control interop gaps | Slow or inaccessible UI; schedule growth | Stage 0 vertical slice and dependency matrix before full build |
| AI hallucination or prompt injection | Unsupported recommendations | Typed retrieval, scoped tools, source checks, deterministic fallback |
| Weak workload evidence | Generic or misleading pros/cons | Vendor requirements, evidence gaps, owned/licensed tests, expert review |
| Affiliate incentives distort selection | Reduced trust | Separate sponsorship and organic ranking; test ranking invariance |
| Unlimited catalog/feature scope | Operational overload | Narrow launch groups and staged category rollout |
| PC rules miss multi-part interaction | Invalid or physically impossible build | Reviewed templates, multi-part rules, unknown-critical blocking |

## 7. Decisions still needed

The market and platforms are settled: Vietnam first; Windows and Android first. Remaining decisions concern team/budget, pilot user groups, the initial retailer agreements, catalog/evidence licenses, supported minimum hardware/OS, AI provider/data handling, and whether refurbished products belong in the first pilot.

Recommended next action: execute Stage 0 and end it with a working dual-platform feasibility slice, an audited starter catalog, and a revised estimate. Those deliverables are more informative than building a large chat screen before data and native UI behavior are proven.
