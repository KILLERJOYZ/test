# Project scope research and recommended release boundary

Prepared 10 November 2026. This is a proposed scope based on the project decisions, the consolidated 18 user journeys, and primary technical/data sources. It is not a validated demand study, supplier agreement, implementation result, or delivery commitment.

## 1. Product definition

Build a Vietnam-first buying decision assistant that helps a person turn real tasks, constraints, and a total spending ceiling into a defensible shortlist, compare exact configurations and available offers, and continue to a retailer with the relevant costs and conditions understood.

The longer-term product covers laptops, phones, and PC configurations. Android and Windows are the initial platform targets. React Native shares domain logic and feature contracts; Windows must use the requested WinUI 3 approach, and Android must follow Material 3 Expressive. Actual native integration is a feasibility deliverable, not an assumed property of React Native.

The first release should answer one complete question: **Which supported laptop configuration should I consider for my tasks and budget, what are its meaningful compromises, and where can I buy it among the stores checked?**

The 18 consolidated journeys describe the product roadmap. They should not all become first-release commitments.

## 2. Recommended market and audience boundary

- Market: Vietnam, Vietnamese interface and VND totals. Local delivery and warranty terms matter. International architecture can be prepared without launching other countries.
- Initial products: new laptops with exact, identifiable configurations and maintainable local offers. Add phones as a separate category rollout; add PC builds after compatibility data and rules are ready.
- Initial users: students and office users, plus mainstream software development. Treat unusually demanding gaming, engineering, local AI, and production media workflows as supported only where adequate evidence exists.
- Buying situations: normal replacement or first purchase. Urgent delivery, used machines, gifts, and organizational procurement can introduce requirements beyond the first catalog's coverage.

These audience boundaries are recommendations to validate through interviews. Occupation is a shortcut to follow-up questions, not proof that every person in that occupation needs the same machine.

## 3. First release: eight complete user journeys

| Journey | First-release completion condition | Explicit boundary |
|---|---|---|
| Receive recommendations for my needs | Enter/edit needs, confirm the profile, receive a shortlist, inspect reasons, and revise constraints | Supported tasks and catalog only; critical missing information remains visible |
| Find a deal and seller | Search/browse, filter, inspect offer cards, open a product or save it | A deal means an observed offer; a discount claim requires historical evidence |
| Understand a specific device | Select the exact variant, read relevant specifications and sourced pros/cons, inspect evidence, report an error | No invented measurements or assumption that similarly named configurations are identical |
| Compare and choose | Compare exact variants against the same needs, price basis, and evidence context, then choose one | Long-term ownership cost modelling is a later extension |
| Choose where to buy | Compare checked sellers, known payable totals, warranty/return conditions, and open the selected retailer page | Retailer handles checkout, payment, fulfillment, and returns |
| Check an existing offer | Paste a supported link or enter a quotation, confirm extracted fields, inspect suitability and price conditions | Manual entry remains available; OCR and universal URL extraction are later extensions |
| Save and share a decision | Save locally, revisit with freshness labels, and share a useful summary | Cloud accounts, live collaboration, and cross-device synchronization are later extensions |
| Control personal data | Use guest mode, inspect/edit/delete local profiles and history, and choose relevant settings | Accounts are not a dependency for the basic adviser |

These journeys form one connected decision: a saved product must preserve the variant, needs context, offer reference, and observation time. The adviser should not lose this state when the user switches between chat, filters, detail, and comparison.

The first experience should provide structured choices with contextual AI help. Do not make users repeatedly explain their budget and tasks in a free-form conversation. The needs questionnaire belongs inside the recommendation journey; browse and offer-check entry points should remain usable without completing every questionnaire branch.

## 4. AI scope and recommendation responsibility

Use AI to interpret Vietnamese/English descriptions, ask relevant follow-up questions, turn text into an editable typed profile, and explain checked facts in language appropriate to the user. Use deterministic logic for prices, hard eligibility, required compatibility, and explicit budget limits.

A practical first pipeline is: interpret confirmed needs; retrieve supported configurations; apply hard constraints; score softer preferences; select useful alternatives; generate evidence-grounded explanations. Google's recommendation overview describes candidate generation, scoring, and re-ranking as separate stages. Applying a constraint-first pipeline here is our engineering recommendation, not a claim that Google prescribes this specific laptop design.[1]

Do not train a proprietary recommendation model simply to make the project appear more AI-based. Start with explainable workload rules and evaluate whether AI actually improves requirement capture and understanding. A learned ranker becomes justified when there is sufficient consented feedback and a measurable improvement over simpler baselines.

The app must still return useful catalog/price information when the model times out. A missing benchmark, unverified seller condition, or unknown mandatory requirement should remain unknown rather than become a confident generated answer.

## 5. Data and operational scope

Start with a proposed **30–50 exact laptop configurations across two or three maintainable retailer sources**. This is a manageable research fixture to audit, not a claim of adequate national coverage. Choose records to cover the pilot tasks and budgets; expand if coverage tests expose important gaps.

Maintain distinct records for a product family, an exact configuration, a seller offer, and a dated price observation. For each purchasable offer, record the source, configuration identity, condition, price, known mandatory extras, relevant discount conditions, delivery context, stock evidence, warranty/return source, and last successful verification.

Present “lowest verified total among checked stores” only when totals are comparable and sufficiently complete. If shipping or eligibility is unknown, show that uncertainty and avoid awarding a verified-cheapest label. Avoid double-counting tax already included in the displayed price.

Specifications, benchmark evidence, reviews, and retail offers are separate datasets. PhoneArena advertises commercial phone-specification licensing through an XML feed; that is a possible future source, not proof of Vietnam price coverage or unrestricted rights to reuse its reviews.[2] CellphoneS maintains a separate warranty/return policy page, illustrating why offer comparison also requires policy data rather than a single price field.[3]

Minimum internal operations are in scope even though they are not separate customer features:

- Import and review product/offer records, including a manual correction path.
- Resolve or reject uncertain configuration matches.
- Track freshness, failed refreshes, expired offers, and source changes.
- Triage customer error reports and publish corrected records.
- Inspect retrieval and explanation failures without retaining unnecessary personal information.

Source access, retention, permitted reuse, refresh mechanisms, and operating ownership remain unresolved until confirmed with the actual providers. No data contract has been obtained by this research.

## 6. Platform and shared-component scope

Share needs schemas, money calculations, constraint/ranking rules, data access contracts, saved-decision models, localization keys, and feature behavior where practical. Reusable components should have common responsibilities—such as budget input, product summary, evidence reference, freshness state, and comparison selection—while allowing platform-specific controls and layouts.

Microsoft documents the architectural difference between the newer Composition-based Windows implementation and the older XAML-based implementation. Its React Native Windows releases include XAML hosting support, but release-specific compatibility and the intended controls must be demonstrated.[4][5]

Android documents Material 3 Expressive support in Jetpack Compose. This establishes a native implementation path; it does not establish that a chosen JavaScript component library implements the same system or that a Compose bridge is effortless.[6]

Before full implementation, demonstrate a narrow vertical slice on both release builds: needs input, a virtualized results list, product detail, comparison, and an evidence/adviser panel. Exercise keyboard input and window resizing on Windows, Android Back and keyboard behavior, screen readers, large text, focus, and state retention.

Keep both platforms in the agreed target. Android can lead interaction design and exploratory testing while the Windows slice is proven early. A shared codebase does not justify assuming identical engineering effort or zero native maintenance.

## 7. Later release boundaries

**Expansion after the core journey is trustworthy:** phones with region/SIM/network/firmware distinctions; tracked prices and notifications once observation coverage exists; repayment planning from documented terms; used-device workflows with condition and inspection evidence; receipt/warranty management; and bounded repair/upgrade advice.

**PC configuration phase:** begin with reviewed builds and approved substitutions. Then support user changes with CPU/board/BIOS, memory, electrical, and physical checks, followed by complete basket pricing. An unrestricted automatic solver must wait until critical compatibility constraints and real purchasable offers are available.

**Partner- and scale-dependent phase:** family/team collaboration, group procurement, independent inspections, expert services, repair marketplaces, trade-in integrations, renting/borrowing directories, and additional countries.

The six “Làm sau” journeys in the spreadsheet are not necessarily one release. Category readiness, data dependencies, and user research should determine their sequence. Phones are an expansion of existing buying journeys rather than an extra isolated feature row.

## 8. Explicit exclusions from the first release

Exclude in-app checkout, payment custody, lending or credit approval, fulfillment, nationwide retailer completeness, unrestricted product scraping, price prediction, universal link/OCR import, unverified refurbished recommendations, arbitrary PC generation, global launch, public owner communities, and a custom foundation model.

These exclusions keep the first product a buying adviser and retailer referral journey. Expanding into transactions or services adds operational responsibilities that should be scoped separately.

## 9. Research and release gates

First interview a proposed 12–18 recent or active buyers across the pilot groups, observing their actual purchase tasks. Establish which confusing decisions they need help resolving and which data they distrust. This is exploratory research, not a representative national demand estimate.

Create an initial evaluation set of roughly 100–150 varied needs profiles against fixed catalog/offer snapshots. Include incomplete profiles, no-fit cases, misleading model names, conditional discounts, expired prices, and restrictive applications. Compare filters alone, workload rules, and AI-assisted intake/explanation on the same underlying catalog.

Release only when the evaluated journeys preserve hard constraints, critical claims resolve to evidence, no-fit outcomes are understandable, offer totals and variants survive a manual audit, and both platform release builds remain usable when AI or the network fails. Report evaluation sample size and exceptions; passing a fixed set does not guarantee future correctness.

Measure useful decisions, price/configuration discrepancies, successful requirement capture, unresolved requirements, correction turnaround, response latency, and cost per useful session. Click-through and model answer fluency alone do not establish recommendation quality.

## 10. Delivery and cost estimation boundary

The earlier 10–14 week illustration in delivery-plan.md should not be treated as a commitment. Team capacity, WinUI/Expressive integration, source access, catalog maintenance, and evaluation work remain unproven.

Estimate after the feasibility slice and starter catalog exist. The estimate must cover product/design research, React Native and native integration, backend/data ingestion, content verification, AI integration/evaluation, packaging, support, and ongoing refresh/correction work. Software delivery and source/licensing costs are separate budget items; model usage is only one operating expense.

The next decision package should contain a tested native UI approach, maintainable pilot sources, coverage audit, agreed supported workloads, a complete example buying journey, and a revised capacity-based estimate. If a dependency fails, narrow the catalog/workloads or revise the integration approach explicitly before expanding features.

## Primary sources checked

1. Google Developers, recommendation stages: https://developers.google.com/machine-learning/recommendation/overview/types
2. PhoneArena, commercial specification database: https://www.phonearena.com/database
3. CellphoneS, warranty and returns policy: https://cellphones.com.vn/chinh-sach-bao-hanh
4. Microsoft, React Native Windows architecture: https://microsoft.github.io/react-native-windows/docs/new-architecture/
5. Microsoft, React Native Windows release history and XAML hosting: https://github.com/microsoft/react-native-windows/releases
6. Android Developers, Material 3 and Expressive in Compose: https://developer.android.com/develop/ui/compose/designsystems/material3

Research limitation: no supplier negotiations, production data integration, native interoperability build, buyer interviews, or release evaluation was performed for this scope analysis. Product boundaries and proposed study sizes are recommendations for this project rather than findings established by the linked sources.
