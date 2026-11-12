# Laptop picker research and project gap assessment

Reviewed 11 November 2026. Reference: [bestlaptop.deals Laptop Picker](https://www.bestlaptop.deals/laptop-picker). Project decision: expand U01 and its existing admin support; retain the 36-journey backlog.

## 1. What the reference provides

The public page presents ten use cases spanning general, study, software, creative, gaming and specialist work. Visitors choose up to three in importance order, set a budget and receive matches. Region selection and affiliate disclosure are visible.

Its publicly served client bundle additionally defines workload-dependent budget bands; weight, screen, CPU/GPU, brand and price refinements; ranked configuration cards with pros/cons and affiliate-offer fields; and explanations distinguishing full, partial and close matches. It contains URL-backed criteria, pagination, retry and empty-filter states, plus prompts to change priorities or budget.

Evidence boundary: initial content was fetched; additional behavior was identified in the [public client bundle](https://www.bestlaptop.deals/_next/static/immutable/chunks/1rli7xmjyvber.js). This was source inspection, not an interactive end-to-end test. Internal ranking, real recommendation accuracy, all region coverage and live transaction totals remain unverified. The findings do not establish use of generative AI. Asset URLs can change between deployments.

## 2. Why this matters for our buyers

A guided picker gives a buyer a concrete starting point without requiring CPU/GPU expertise or a lengthy conversation. The useful product hypothesis is that a short, editable decision flow helps people explain what they need and compare the consequences. Research has not yet established that this reduces purchase mistakes in Vietnam; measure comprehension and task completion before making that claim.

The appropriate integration is one complete journey: open “Tìm laptop phù hợp,” describe work and budget, review, receive justified candidates, refine, compare and save. Chat is optional assistance inside that journey. Browsing deals remains independently available under U02.

## 3. Current project evidence

Source inspection: [App.tsx](../apps/adviser/src/App.tsx), [domain.ts](../apps/adviser/src/domain.ts), [verification record](../apps/adviser/VERIFICATION.md). Live backlog: gid 0, “Liệt kê tính năng,” row 4 / STT 1; admin support rows 27–28 / STT 24–25.

| Capability | Current frontend evidence | Required addition |
|---|---|---|
| Guided needs intake | Four-step modal, four fixture task types, VM branch, exact VND ceiling, two soft preferences | Dedicated/re-enterable picker route with ordered primary uses and explicit additional mandatory work |
| Workload priority | Task membership affects eligibility; task array order does not affect `recommend()` | Accessible importance controls and a versioned, explainable ordering policy |
| Budget | Exact ceiling and complete sample-offer arithmetic | Optional shortcut chips that populate a visible exact ceiling; changing tasks must not silently change budget |
| Refinement | Fixture-name/RAM search and profile edits | Structured screen/weight filters, active-filter summary, clear-only-filters action and distinct empty-filter state |
| Match explanation | Reasons, limitations and unknown VM handling | Per-task evidence/status, explicit separation of exploratory near matches from confirmed eligible recommendations |
| Continuation | Detail, two-device comparison, sample offers and dated local saves | Preserve new picker state and versions across these actions and migrate older saved profiles |
| Operations | Fixture workshop and planned A06/A07 | Versioned picker policy, simulation and regression cases; production publication controls later |

Existing browser checks do not cover the new requirements. No frontend implementation was added during this research/documentation update. Native hosts, live AI and real retailer integrations remain pending.

## 4. Recommended product contract

1. Start as a guest. Display Vietnam/VND explicitly. Let buyers choose one to three primary uses and reorder them using accessible move controls. Additional mandatory tasks remain captured separately; a three-item UI limit must never discard a requirement.
2. Capture a hard total ceiling and what it includes. Shortcut amounts are optional input aids, not minimum-spend targets. Never automatically raise a ceiling after changing a use case.
3. Ask only relevant follow-ups. Job names are prompts, not proof of hardware requirements. Preserve unknown, skipped and not-applicable states separately.
4. Review the profile before running. On mobile use brief steps and a results filter sheet; on Windows use a wider editable summary beside results. Share state/contracts and adapt controls to the required native platforms.
5. Show up to three eligible options initially, with exact configuration, per-task fit, decisive advantages/limitations, complete comparable price where known, offer date and evidence mode. Fewer than three is a valid outcome.
6. Refine the eligible set without changing the underlying needs. If filters hide everything, offer to clear filters; if no device meets needs, explain unmet conditions. These are different states.
7. Let a buyer explicitly explore compromises. Put these outside the confirmed shortlist, state each failure/unknown and any additional cost, and require confirmation before changing requirements. Optional exploration must never manufacture an eligible verdict.
8. Continue to compare, save and inspect buying options using existing U03–U07. Preserve dated observations rather than implying a saved price is a renewed quote.

## 5. Delivery boundaries

**D0 extension:** ordered uses, exact-budget shortcuts, preserved additional hard tasks, per-task synthetic explanations, weight/screen refinement, filter/no-fit distinctions, explicit compromise exploration and saved-state migration. Use the existing 12-variant/18-offer fictional dataset; augment fields/scenarios within that boundary where feasible. Any additional fixture records require an explicit documented fixture-count change.

**D1:** AI may suggest typed profile edits or explain recorded facts. The buyer confirms changes; deterministic rules own eligibility, prices and result groups. No provider call is required to run the picker.

**P:** evidence-backed workload rules, permitted Vietnam offers, verified variant and warranty scope, source freshness, reviewer activation and rollback. CPU/GPU performance filters require comparable evidence and a reviewed taxonomy; brand filters require meaningful coverage. Do not treat all ten competitor use cases as supported launch scope.

**Later:** public shared-result links, multi-country data and wider workloads follow their own readiness decisions. Public links need explicit sharing and must exclude private free text by default; local saved decisions are sufficient for D0.

## 6. Evaluation and risks

Use the exploratory demo study to check whether participants can order their uses, explain a rejected option, identify the actual ceiling and recognize a compromise result. Record completion, corrections, abandoned steps and misunderstandings with attempted-session denominators. Small studies identify issues; they do not establish conversion uplift.

Core risks are mistaken workload assumptions, a third priority hiding an essential fourth task, thresholds changing silently, unfamiliar performance scores, over-budget upselling, and no-results states that obscure missing data. Acceptance criteria in BRD §16.1 and implementation §23 address these directly. Proposed ranking weights and budget chips are design assumptions requiring review, not copied or validated competitor algorithms.
