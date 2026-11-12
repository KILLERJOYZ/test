# Differentiation strategy: help people buy only what improves their work

Prepared 10 November 2026 as an extension to the Vietnam-first research package. These are product proposals and prioritization judgments, not claims of globally unique inventions or validated market demand.

## 1. Make the product promise more specific

Recommended promise: **Know what will work for you, whether you need to upgrade, and what the complete local purchase will cost.**

General AI shopping and basic needs-based product pickers already exist. Bestlaptop.deals publishes a laptop-use/budget picker, and Google has announced conversational shopping, price tracking, and assisted purchasing features. These sources establish feature overlap; they do not establish availability of every Google feature in Vietnam. [Bestlaptop.deals picker](https://www.bestlaptop.deals/laptop-picker), [Google shopping announcement](https://blog.google/products-and-platforms/products/shopping/agentic-checkout-holiday-ai-shopping/)

The opportunity is an integrated decision service with detailed workload evidence, current-device alternatives, exact variants, and Vietnam purchasing conditions. Validate its value against existing workflows before presenting the combination as a market first.

## 2. Flagship experience: will it work for my actual tasks?

Move from a broad occupation to a reusable, editable workload profile: application/version, project size, required peripherals, performance expectations, portability, budget, and expected ownership period.

Example: an embedded developer lists an IDE, two VMs, a debugger, a USB-to-serial device, and daily travel. The system should evaluate application and driver support, memory headroom, required ports, sustained performance, and travel compromises. A generic CPU ranking cannot answer the whole question.

For each task, show distinct evidence states:

- Verified supported configuration, with a source and date.
- Meets published requirements, with no matching workload measurement.
- Reported by users, with configuration context and a clearly separate confidence level.
- Incompatible, or insufficient information to decide.

Do not confuse “can launch” with satisfactory performance. Driver/peripheral support matters: Microsoft's Windows on Arm guidance explicitly distinguishes application compatibility from driver-dependent hardware/software operation. [Microsoft compatibility guidance](https://support.microsoft.com/en-au/windows/experience/platform-variants/windows-arm-based-pcs-faq)

A useful result explains one avoided mistake: a missing port, unsupported peripheral, insufficient upgrade capacity, or a tradeoff the user did not know to ask about. Measure this with task-based user testing.

**First version:** manually maintained rules for a few well-defined developer/student workloads. **Later:** a versioned graph linking applications, versions, peripherals, exact configurations, benchmarks, and evidence quality. Software support changes, so every relationship needs a revalidation policy.

## 3. Signature decision: keep, upgrade, repair, or replace

Ask what the person already owns and what feels limiting. Offer four routes when evidence supports them:

1. Keep the current device; the new workload may not require a purchase.
2. Upgrade a compatible component.
3. Repair or replace a worn component after proper diagnosis.
4. Buy a replacement and explain the improvement relevant to the workload.

Compare complete costs: parts, service, downtime where the user supplies an assumption, accessories, and verified trade-in terms. Do not diagnose failing hardware from a vague complaint or promise that a RAM/SSD upgrade fixes every slowdown. Confirm the exact model's upgrade support and the evidence for the actual bottleneck.

Start with manual device selection and a short questionnaire. An optional local Windows assessment could come later with user-controlled collection and clear limits. Do not upload an installed-application inventory or workplace files by default. Keep a manual path on both platforms.

This feature creates a trust test for the business model: the service must be willing to recommend no purchase, even when that produces no referral revenue. Measure successful lower-cost outcomes as well as conversions.

## 4. Vietnam buying assistant: check this exact offer before checkout

Let users paste a retailer link or manually enter a shop quotation. Later, optional screenshot/OCR ingestion can extract fields for confirmation. Treat all incoming text as untrusted evidence and allow users to correct OCR errors.

Return a purchase check covering:

- Exact model/part code and configuration.
- Whether that configuration was actually reviewed or tested.
- New/refurbished/used condition and seller identity.
- Import/official-channel and warranty statements, with their sources and unknowns.
- Eligible cash total, delivery, mandatory extras, and promotion conditions.
- Differences from the configuration in the user's shortlist.
- Comparable tracked offers and their last verification times.

For a shop's PC quote, validate components and basket-level prices through the compatibility engine. Do not label a shop fraudulent because a field is missing or a price is high; explain the observable discrepancy and which questions need confirmation.

**First version:** selected permitted retailer sources and structured manual input. **Later:** OCR, share-to-app flows, broader source coverage, and merchant confirmation. Checkout remains with the retailer initially.

This provides an entry point outside the recommendation funnel: a person who already selected a device can still use the app. Track how often it finds a material configuration, warranty, or price-condition mismatch, and manually audit those findings.

## 5. Interactive decisions: show what changes if I spend or compromise differently

Allow the user to change one meaningful assumption and see the consequence:

- Lower the budget: which requirements still pass, and which fail?
- Increase the budget: what additional benefit is actually evidenced?
- Remove occasional gaming: does a lighter or cheaper laptop become suitable?
- Require a particular peripheral: which otherwise attractive devices are excluded?
- Keep the current monitor/PSU/phone: what changes in the total purchase?

Calculate these alternatives from real candidate configurations and offers. Show a current quote delta, not a fabricated improvement percentage or predicted future deal. Explain why each excluded product lost, including the uncertain cases.

This is a candidate for a signature desktop comparison experience, with a compact Android version. Both should share the same scenario and constraint engine. Test whether users understand the tradeoff more quickly and make fewer unsupported assumptions than with a static specification table.

## 6. Longer-term distinction: optimize an entire setup

Treat the budget as a ceiling across a set of needs rather than an amount to spend on a single device. Compare a suitable laptop alone against alternatives such as a lighter laptop plus an existing desktop, or a desktop plus a modest phone, only when mobility and access requirements allow them.

Include existing equipment, displays, docks, chargers, assembly, shipping, software/license requirements, and local/cloud recurring costs where relevant. Show which assumptions make each setup valid.

This is substantially more complex than single-product ranking because basket discounts, compatibility, delivery, and shared resources interact. Start later with a few reviewed setup templates and constrained substitutions; expand the solver only after testing it against expert-built alternatives.

## 7. Ownership value without false precision

Add evidence about upgradeability, repair access, support dates, replacement-part availability, and current service quotes. Let users explore a three- or five-year ownership scenario, with assumptions they can edit.

Separate known expenses from uncertain future costs. Do not present a precise future failure probability, resale value, useful-life prediction, or software-support guarantee without supporting evidence. iFixit is a relevant repairability reference, but it warns that scoring rubrics change, so scores from different periods need context. Licensed reuse still requires checking the applicable terms. [iFixit laptop repairability](https://www.ifixit.com/repairability/laptop-repairability-scores)

**Early version:** verified upgrade/support facts. **Later:** locally sourced parts/service prices and transparent scenario ranges. Avoid making repairability a disguised durability score.

## 8. Build defensibility through outcomes and corrections

Ask consenting users focused follow-ups after purchase: does the exact configuration run the named application and workload, were the stated offer conditions accurate, and what important compromise was missed?

Separate owner reports from controlled measurements. Store configuration, application version, settings, date, verification tier, and sample size. Moderate manipulation, duplicate reports, selection bias, and unrepresentative results before aggregating them. Never claim a device is defective or a merchant unreliable from one report.

Use this evidence to improve workload rules and uncertainty, not just generate testimonials. Keep organic rankings independent of commissions and test that changing affiliate rates cannot change compatibility or suitability results.

The durable assets become an exact-variant catalog, workload/compatibility evidence, local offer observations, correction history, and consented outcomes. The AI provider and presentation layer should remain replaceable.

## 9. Recommended development sequence

This sequence reflects dependencies and product judgment, not numerical impact scores.

| Stage | Experiences | Why this order |
|---|---|---|
| First pilot | Workload fit, exact-offer checker, explanations of exclusions and unknowns | Builds on the catalog/rules already required; directly tests useful differentiation |
| Next | Keep/upgrade/replace and interactive budget alternatives | Reuses workload and product evidence; needs current-device and upgrade facts |
| Later | Complete setup optimization, ownership scenarios, structured owner evidence | Requires broader compatibility, service data, recurring costs, and moderation |

Begin with Vietnam laptop buyers who can describe concrete application requirements, such as students and working developers. The aim of serving everyone can remain the long-term direction while the first evidence set is narrow enough to verify well.

If only one feature can go beyond the original plan, prioritize **checking a specific retailer offer against the user's workload and exact variant**. It connects recommendation usefulness to the final buying decision and can be evaluated with a manageable catalog. Introduce keep/upgrade/replace as soon as reliable current-device evidence is available.

## 10. A small validation program

Collect a set of real buying questions and quotations, with consent and personal information removed. Compare the proposed experience against users' normal retailer/review workflow using fixed catalog and price snapshots.

Measure: material mismatches correctly detected, unsupported claims, hard-constraint violations, accepted cheaper/no-purchase alternatives, task completion time, understanding of tradeoffs, and confidence after seeing uncertainty. Track source maintenance and human-review time to expose operating cost.

Use blinded expert assessment for technical correctness and real users for comprehension and usefulness. User agreement alone does not validate compatibility; expert preference alone does not validate the experience. Commit to more development only when the combined feature measurably improves decisions at a sustainable data-maintenance cost.
