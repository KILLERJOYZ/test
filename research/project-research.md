# Research and product strategy: an AI device adviser for Vietnam

Research date: 10 November 2026. Confirmed scope: Vietnam first, then global expansion; Windows desktop and Android first; React Native with native WinUI 3 on Windows and Material 3 Expressive on Android.

## 1. Recommended direction

Build a **needs-to-purchase decision system** for laptops, phones, and eventually custom desktop PCs. Its promise should be: explain which products meet this person's actual work, which tradeoffs matter, and which verified local offer provides the best eligible total price.

The strongest opportunity is the combination of workload understanding, exact product variants, transparent evidence, and Vietnam-specific purchasing conditions. A conversational interface alone is an easily copied feature. The harder and more defensible assets are a maintained product catalog, workload rules, compatibility knowledge, and trustworthy offer history.

Start with laptops for students and working professionals. Add phones after validating the shared catalog and offer infrastructure. Start PCs with reviewed configurations; introduce unrestricted part substitution only after a compatibility engine is tested. Design all three product types now, while delivering them in stages.

These recommendations are design judgments based on the reference sites and the requested scope. Market demand, willingness to pay, conversion, and operating costs still require experiments.

## 2. Research method and evidence boundaries

Reviewed first-party public pages for the three named sites, their publicly described tools and methodologies, PhoneArena licensing and terms, Microsoft and React Native documentation, Google Material/Android documentation, and selected Vietnam retailer policies. Sources are linked inline and indexed in [sources.md](./sources.md).

This was document research, not a logged-in usability study or an automated test of every interactive feature. Bestlaptop.deals' public picker questions and product-page labels were readable; its matching algorithm, price-history accuracy, and actual user outcomes were not tested. Parts of GSMArena returned a payment/access response or redirected to an inaccessible Tollbit page; its accessible FAQ and terms support the findings below. Missing evidence is recorded as unverified, not proof that a feature is absent.

No traffic, revenue, market-size, conversion, or competitor-accuracy figures are independently established here. No public page establishes a right to copy a whole catalog, photographs, editorial reviews, or test data into this project.

## 3. What the three sites teach us

### GSMArena: specifications and self-directed discovery

**Observed:** GSMArena describes a phone-information service with a Phone Finder, feature keyword search, coverage guidance, and manufacturer-led specification collection. Its FAQ acknowledges occasional use of less reliable secondary sources and possible catalog corrections. [GSMArena FAQ](https://www.gsmarena.com/m/faq.php3)

**Strength:** a useful reference pattern for consistent specification categories, filters, terminology, and drill-down discovery.

**Project implication:** adopt a structured catalog and field-level provenance. Add a translation layer from ordinary requests such as “easy to hold, clear calls, and a battery that lasts through work” to relevant criteria. Check country/model identifiers rather than transferring a global specification to every local listing.

**Commercial observation:** its terms describe referral commissions through price-comparison links and separation from editorial selection. [GSMArena terms](https://www.gsmarena.com/m/terms.php3)

**Limitation of this research:** the main finder and comparison pages were not fully accessible. A current detailed interaction audit remains open. Treat the site as a research reference; no reusable production feed or license was verified.

### Bestlaptop.deals: the closest direct competitor for the laptop journey

**Observed:** its picker asks for up to three ordered use cases and a budget. Options include programming, engineering, creative work, music, gaming, and AI/data science. It discloses affiliate relationships. This directly overlaps the proposed needs-based laptop journey. [Laptop Picker](https://www.bestlaptop.deals/laptop-picker)

Its deals page exposes use-case and specification filters. [Deal filters](https://www.bestlaptop.deals/recommendations/Crazy-Deals) A reviewed product page shows pros/cons, configuration options, test-data/review links, availability labels, and a price-history entry point. The history data itself was not validated. [Example product page](https://www.bestlaptop.deals/products/lenovo-yoga-7i-2-in-1-16-2025)

**Strength:** it connects intended use, reviewed products, and purchasing offers in one journey. Its public about page emphasizes practical product use by reviewers. [About the team](https://www.bestlaptop.deals/about)

**Project implication:** “pick a job and budget” is insufficient differentiation. Ask about exact applications, project size, portability, operating-system restrictions, existing equipment, and purchasing conditions. Make each explanation specific to those answers.

**Limits:** a region selector was visible, but Vietnam coverage and feed access were not established. Do not assume US recommendations or dollar prices describe Vietnam availability. Public product pages do not establish the accuracy of the internal matching or deal-classification methods.

### PhoneArena: explicit measurement and a possible licensed input

**Observed:** PhoneArena documents a weighted review score across twelve categories, and explicitly excludes price from that score. [Rating methodology](https://www.phonearena.com/howdowerate) It offers specification and size-comparison entry points. [Comparison tool](https://www.phonearena.com/phones/compare)

Its battery and display pages describe measurement procedures, which demonstrates the value of recording test conditions instead of relying on specification-based guesses. [Battery methodology](https://www.phonearena.com/howdowerate/battery), [Display methodology](https://www.phonearena.com/howdowerate/display)

**Strength:** a useful pattern for separating measured product behavior from editorial explanation and purchase value.

**Project implication:** preserve three independent concepts: product quality, suitability for a person, and value at today's eligible local price. A higher general review score need not mean a better purchase for a constrained budget.

**Data opportunity:** PhoneArena advertises commercial specification licensing through an XML feed. Pricing, Vietnam variant coverage, redistribution, historical storage, AI use, and whether reviews or measurements are included require a quote and contract; none was obtained. [Database licensing](https://www.phonearena.com/database)

**Data constraint:** its public terms prohibit automated scraping/indexing. Use the licensing route for production access. [Terms of use](https://www.phonearena.com/terms_of_use)

## 4. Competitive opportunity and differentiation

| Observed pattern | Benefit to adopt | Proposed improvement |
|---|---|---|
| GSMArena's structured finder | Detailed discovery and specifications | Translate everyday needs into constraints; expose exact Vietnam variant evidence |
| Bestlaptop.deals' picker | Simple needs and budget onboarding | Capture applications, workload scale, mobility, purchase eligibility, and local support |
| Bestlaptop.deals' product/deal presentation | Connect tradeoffs to buying choices | Validate complete local totals and attach conditions to every discount |
| PhoneArena's explicit methods | Make evidence inspectable | Use personal priorities without mixing incompatible measurements |
| PhoneArena's separate quality score | Preserve a clear meaning for quality | Add separate suitability and local-offer value views |

The reviewed pages do not establish a unified Vietnam service spanning phone variants, laptops, and validated custom PC configurations. This is an opportunity hypothesis, not a claim that no competitor offers it. Before investment, expand the competitive audit to local retailers' advisers, Vietnamese technology communities, and PC-building tools, and run real buying tasks against them.

Suggested positioning: **“Tell us what you do. See what fits, what you give up, and the best verified price from the stores we track.”** Display retailer coverage and last-check time alongside that claim.

## 5. Understand needs through tasks rather than occupation alone

Use a guided form with an optional conversation. Every extracted preference should remain visible and editable. Users must be able to finish without writing a prompt or creating an account.

| Profile starting point | Follow-up that changes the recommendation | Signals to evaluate |
|---|---|---|
| Student / office worker | Course tools, browser load, video meetings, travel | Application support, keyboard, screen, battery evidence, weight, warranty |
| Software developer | IDE, containers/VMs, emulator count, builds, drivers | RAM needs, sustained CPU, upgradeability, OS/architecture support, ports |
| Engineer / architect | Exact CAD/CAE/BIM application and project size | Vendor requirements, GPU/driver support, memory, display, sustained thermals |
| Photo/video creator | Codec, resolution, application, external display | Measured display behavior, media acceleration, memory, storage, application support |
| Gamer | Named games, resolution, target settings, noise tolerance | Relevant measured performance, GPU power/VRAM, cooling, monitor requirements |
| Local AI practitioner | Framework, model size, precision, local vs cloud | Framework/backend support, usable memory/VRAM, storage, cooling, total ownership cost |
| Phone user working outdoors | Mapping, calls, photos, gloves, charging access | Connectivity variant, measured visibility/battery, protection evidence, ergonomics |
| Older / accessibility-focused user | Text size, dexterity, hearing, assistance needs | Readability, reachable controls, software accessibility, support and reliability |

These are proposed questions and criteria, not hardware minimums. Maintain versioned requirements for each application and workload, sourced from its vendor and validated where possible. Ask rather than inferring needs or ability from age or job title.

Capture: country/city or delivery area; device type; comfortable budget and hard ceiling; primary/secondary activities; applications and versions; operating system; expected ownership period; portability; required ports/features; warranty preference; new/refurbished preference; existing components/peripherals; purchase timing; and conditional-discount eligibility.

If a request implies a non-Windows product, distinguish the app's operating platform from the products it can recommend. A Windows/Android adviser can recommend another ecosystem's laptop when it satisfies the user's requirements. Do not recommend it when a required application or peripheral is unsupported.

## 6. Define a trustworthy Vietnam price

Use separate records for **product family → exact variant → seller offer → price observation**. A common marketing name is insufficient identity. A laptop may differ in CPU, GPU power configuration, panel, memory, storage, OS, and warranty. A phone may differ in model code, storage, SIM/eSIM, network support, firmware/region, and warranty eligibility.

The initial procurement candidate list can include CellphoneS, FPT Shop, Thế Giới Di Động, Phong Vũ, GearVN, and authorized manufacturer channels. These are candidates for research and permission discussions, not confirmed integrations or endorsements. Begin with two or three sources whose data rights and variant matching can actually be maintained. Add marketplaces only when seller identity, condition, warranty, and offer terms are normalized.

CellphoneS publishes eligibility-based student/teacher offers, while GearVN describes trade-in values that require inspection. These are concrete reasons to distinguish an ordinary price from an individual conditional offer. [Student/teacher offers](https://cellphones.com.vn/uu-dai-sinh-vien-hoc-sinh), [GearVN trade-in process](https://gearvn.com/pages/thu-cu-doi-moi)

For a cash purchase:

```text
payable total = item price + delivery + required fees
              + applicable tax not already included
              + required accessories/assembly not included
              - confirmed, eligible, stackable immediate discounts
```

Do not add VAT twice. Do not deduct uncertain trade-in value, future cashback, reward points, or a “free gift” from the cash total. Present these separately. If shipping or a mandatory fee is unknown, label the total incomplete and withhold a verified-cheapest badge.

For financing, compare the entire payable amount including mandatory fees and required insurance, with explicit assumptions. Avoid ranking a monthly payment against a cash purchase. For trade-in, show an estimated exchange scenario separately until valuation is confirmed.

| Price state | User-visible behavior |
|---|---|
| Exact variant, in stock, complete total, fresh observation | Eligible for verified price comparison |
| Member/student/payment condition | Show condition; apply only after user confirms eligibility |
| Trade-in valuation pending | Separate scenario, excluded from ordinary cheapest calculation |
| Shipping/tax/variant unknown | Incomplete quote; no verified-cheapest badge |
| Expired observation or unavailable item | Historical/last-seen display; exclude from buy-now ranking |

Say **“lowest verified total among the stores checked”**, with a coverage count and timestamp. Do not claim a global minimum. Recheck an offer when users open buying options; if refreshing fails, show its actual last verification time.

Deal quality should compare the same variant and condition with its observed price history, not simply the retailer's struck-through price. Separate lowest observed price from a statistically meaningful trend; a sparse history cannot justify a forecast. Historical collection must be permitted by each source's contract.

## 7. Recommendation design: AI with a verifiable decision path

Use this pipeline:

1. Interpret the natural-language request into a typed, editable needs profile.
2. Ask a targeted question when uncertainty affects eligibility, such as an unspecified CAD application.
3. Retrieve exact candidate variants and their available offers.
4. Apply hard constraints: budget, region, required application/features, condition, and known compatibility.
5. Compute workload-specific suitability from structured evidence.
6. Compare offer totals and rank eligible candidates according to the requested objective.
7. Diversify the shortlist where there are meaningful alternatives.
8. Generate advantages, disadvantages, and alternatives from the selected evidence records.
9. Validate every generated product identifier, number, source link, and hard-constraint claim.

This extends the familiar candidate-generation, scoring, and re-ranking structure with explicit eligibility and evidence checks. [Google recommendation-system overview](https://developers.google.com/machine-learning/recommendation/overview/types)

**Use AI for:** Vietnamese/English intent extraction, follow-up questions, terminology explanations, evidence-grounded summaries, and explanations of rule-computed tradeoffs.

**Use code and data for:** money, exact SKU matching, stock and expiration rules, required-feature checks, PC compatibility, eligibility, ranking calculations, source verification, and final purchase links.

Start with a knowledge/content-based model because new users and new products will have little interaction history. Add a learned ranker only when high-quality feedback demonstrates an improvement over the rules baseline. A collaborative signal may help discovery later, but should never override explicit restrictions.

### Keep ranking objectives understandable

Offer three explicit modes:

- **Lowest price that meets my needs:** minimize complete payable cost among products that satisfy minimum requirements.
- **Best overall fit within budget:** prioritize personal suitability, then offer quality and cost.
- **Best value:** find useful gains relative to cost, with clear diminishing returns and an option to spend less.

A starting suitability model is:

```text
S(product, user) = sum(weight[k] * utility[k](product, workload))
                  - evidence uncertainty penalty
```

Weights are nonnegative and sum to one. Utilities are versioned, workload-specific, and saturate when extra capability no longer helps. Validate weights with user research and expert judgments. This is an initial hypothesis, not a calibrated scientific measure.

Hard requirements are gates, not weighted bonuses. A cheaper unsupported laptop cannot compensate for a mandatory application it cannot run. Unknown required compatibility should trigger a question, evidence request, or an explicitly uncertain result rather than a pass.

Do not blindly divide a general review score by price, average incompatible benchmark scales, or treat a GPU name as whole-laptop performance. Store benchmark version, workload, conditions, configuration, and date. Keep measurements from different protocols separate unless a validated calibration exists.

**Missing evidence:** distinguish “not supported,” “not tested,” and “unknown.” Apply conservative penalties and disclose the coverage. If nothing fits, show which requirements conflict and let the user choose what to relax. Do not silently exceed budget.

### Recommendation presentation

Each result should include exact variant, selected merchant offer, total and conditions, last verification, why it suits the user's tasks, two or three relevant advantages, consequential disadvantages, evidence, uncertainty, and one useful alternative. “Cheaper” and “better for travel” are clearer labels than unexplained percentages.

For example, an illustrative developer result could explain: “The verified memory configuration fits your stated container workload; the chassis is heavier than your preference; battery performance for this exact configuration is untested.” Product-specific numbers would require actual catalog evidence. This example is a content pattern, not a reviewed purchasing recommendation.

Show evidence coverage separately from suitability. A label such as “82% match” must not appear to be a probability unless it has been calibrated against outcomes.

### Grounding and model operations

Retrieve only documents and fields that the project has permission to process. Treat retailer/review text as untrusted content, not instructions. Model tool access should be read-only and scoped to approved catalog queries. Validate output with a runtime schema and refuse invented product IDs, offers, prices, or URLs.

Return structured results before the optional explanation finishes. Use a deterministic explanation template if the model times out. Version the prompt, model, rules, catalog snapshot, and offer observations so a result can be reproduced. Cache only with keys covering the user profile, market, locale, snapshot, and policy versions; invalidate price-sensitive results when offers change.

## 8. Custom PCs need their own solver

A custom PC is a constrained assembly, not a list of independently popular parts. Model complete builds and valid substitutions. Initial compatibility checks should include:

- CPU socket and motherboard CPU/BIOS support, including board revision and minimum BIOS.
- Memory generation, capacity, slots, and documented configurations; absence from a QVL is not automatically incompatibility.
- Motherboard/case form factor and actual clearances for GPU, cooler, radiator, memory, and power connectors.
- PSU electrical capacity, connector requirements, vendor guidance, and transient demand; do not sum TDP and call that a complete PSU check.
- Cooler mounting support and thermal evidence; fan/radiator placement interactions.
- Storage interface and slot availability, shared lanes, disabled ports, and required expansion cards.
- Display outputs, monitor compatibility, networking, peripherals, operating system, assembly, and delivery costs.

Use manufacturer compatibility/support documents as authoritative evidence. Give every edge a compatible/incompatible/unknown status and source. Check physical interactions across multiple components, not only pairwise socket matches.

Generate candidate builds using reviewed templates, then run bounded search over allowed substitutions under a total budget. Optimize workload fit and total offer cost. Compare a single-store build against a multi-store build with shipping, assembly, stock, and warranty consequences. Recompute shipping and discounts at basket level; summing per-item cheapest listings is insufficient.

Never label an incomplete or unknown-critical build fully compatible. Offer prebuilt PCs or reviewed configurations when insufficient data prevents a reliable custom solution. Bottleneck percentages should not be invented; use workload-specific evidence or describe uncertainty.

## 9. Data sourcing and operating model

Use manufacturer documentation for exact specifications and support, contracted feeds for permitted catalog enrichment, retailer/affiliate feeds for offers, and licensed/owned tests for measured behavior. Lenovo's PSREF illustrates the distinction between platform options and model configurations; specifications can vary by model and region. [PSREF product reference](https://psref.lenovo.com/product/), [PSREF search](https://psref.lenovo.com/search/)

PhoneArena is a potential specification partner, not a verified source for every data type. Bestlaptop.deals and GSMArena remain research references unless a suitable agreement is established. Availability of an affiliate scheme does not itself grant product-feed, image, review, or AI-processing rights. CellphoneS' public YouTube Affiliate announcement is channel-specific, rather than evidence of a general app API. [CellphoneS announcement](https://cellphones.com.vn/sforum/cellphones-trien-khai-youtube-affiliate)

For every source, record permitted fields, use/channel restrictions, attribution, image rights, caching, history retention, refresh limits, redistribution, AI processing, termination handling, and commercial cost. Obtain the actual terms before building a production dependency. Do not build around undocumented retailer endpoints.

Begin with editor-reviewed imports if feeds are unavailable. Show the true timestamp and coverage; do not describe manual observations as live. Include an administration interface for resolving variant matches, conflicting evidence, duplicate listings, and broken offers. Data operations are part of the product, not a one-time import.

For later expansion, investigate country-specific integrations rather than assuming one global marketplace feed. eBay describes regional/item offer information through its Browse API; Amazon currently documents a Creators API and access prerequisites. Neither is a substitute for Vietnam coverage or a confirmed integration. [eBay Browse API](https://developer.ebay.com/api-docs/buy/static/api-browse.html), [Amazon Creators API](https://affiliate-program.amazon.com/creatorsapi/docs/)

## 10. Business design and feasibility

Possible revenue streams are affiliate referrals, optional advanced alerts/saved workflows, and B2B purchasing assistance. Start with the core adviser available without payment. Test whether users will pay for history, monitoring, multi-device budgets, or team procurement before committing to a subscription.

Keep organic ranking independent of commission. Include non-affiliate merchants when their data can be maintained. Label sponsored placements separately and never let them bypass required compatibility or price disclosure. PhoneArena's published separation of advertising and editorial functions is a relevant transparency pattern. [Ethics statement](https://www.phonearena.com/ethics-statement)

Track per-session unit economics:

```text
expected contribution = attributable purchase rate * net referral revenue
                        + allocated paid-plan revenue
                        - inference - data/feed allocation - infrastructure
                        - notification/support allocation
```

There is no validated financial forecast in this research. Main cost drivers are data access, editorial verification, native UI interoperability, inference usage, and ongoing retailer breakage. Measure them during the pilot. Avoid financing the service through opaque ranking changes.

The immediate go/no-go questions are whether trustworthy Vietnam offers can be maintained, whether native UI integration meets the experience budget, and whether users make better decisions than with simple filters and existing advice. The [delivery plan](./delivery-plan.md) turns these into measurable experiments.
