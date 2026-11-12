# Mobile interface strategy

Prepared 10 November 2026. Recommendation: a structured discovery and comparison interface with contextual AI assistance. This is a design proposal to test, not a demonstrated usability or conversion improvement.

## 1. Choice

If the implementation must begin with one of the user's two options, choose the ecommerce-style foundation: searchable products, clear prices, filters, comparison, saved decisions and visible navigation. Shape it around purchasing decisions rather than a retailer's sales feed. Layer conversational input and explanation onto that foundation.

Chat is valuable when people cannot express technical requirements or have a follow-up question. Persistent structured views are valuable when they need to inspect, edit, compare, revisit and share a costly decision. Both routes must operate on the same saved profile, shortlist, offer observations and evidence.

Do not create two competing apps inside one shell or require users to switch between a separate chatbot history and catalog state. Maintain one decision object. Chat proposes edits; the user can inspect changes, confirm material constraint changes and undo them. User constraints are never silently relaxed.

## 2. Why the distinction matters

| Task | Chat alone | Catalog alone | Proposed treatment |
|---|---|---|---|
| Describe an unfamiliar need | Flexible language, but an empty prompt can be demanding | Requires the user to know relevant filters | Guided entry with optional natural language |
| Edit a budget or required feature | Can require another message and interpretation | Explicit controls are efficient | Direct editable controls plus conversational edits |
| Compare several expensive products | Details can be scattered through messages | Supports scanning but specifications can overwhelm | Persistent shortlist with task-relevant differences |
| Understand a tradeoff | Supports follow-up explanation | Labels alone may be insufficient | Contextual explanation beside the relevant fact |
| Revisit and share a decision | Transcript is often a poor summary | Saved products can omit the reasoning | Saved decision brief with requirements, evidence and timestamps |
| Check a price or merchant offer | Fluent text can obscure missing fields | Structured offers show conditions clearly | Typed offer view with AI explaining verified fields |

These are design judgments, not measured scores. Baymard's research identifies problems with comparison discoverability, inconsistent specification formatting and unexplained technical labels. It supports careful structured comparison, but does not prove this hybrid is universally superior. [Comparison-tool research](https://baymard.com/ecommerce-design-examples/39-comparison-tool), [Comparison selection patterns](https://baymard.com/research-articles/provide-comparison-features)

## 3. Mobile information architecture

Recommended initial destinations:

1. **Discover:** guided needs entry, search, exact product discovery, and resume a current decision.
2. **Compare:** selected products and task-relevant differences, accessible through a visible selection tray as well as navigation.
3. **Saved:** saved buying decisions and optional alerts.

Add **My devices** when ownership features are real. Keep account, language and appearance settings in a secondary menu. Do not expose 72 backlog items as destinations. Compare can be a contextual workspace rather than a destination if user testing finds that clearer; preserve discoverability and selected items either way.

Three home entry points should cover different buyer states: **Find something for my needs**, **Check an offer**, and **Improve a device I own**. Browse/search must be directly accessible to people who already know a model. No required signup, income disclosure or chat interaction for the basic journey.

## 4. Main journey

### Entry

Use a concise task question and optional search/message field. Show a few understandable activity choices and a budget control. Start with a short example the user can edit. Offer a guided route for users who do not want to type. A specific-model search should go directly to the product; a retailer link should go to an offer check, with the interpretation made visible.

### Guided needs

Capture the highest-impact constraints first: category, budget, tasks and purchase urgency. Ask targeted follow-ups only when they change eligibility or ranking. Show an editable summary and allow skip/unknown where appropriate. Do not enforce an arbitrary long wizard or an exact count of questions.

### Shortlist

Start with a small useful set, for example up to three distinct options. This is a UI hypothesis, not an algorithmic rule requiring three results. Show fewer when evidence or eligibility permits fewer, and preserve access to the wider catalog.

Each card should contain exact configuration, complete/partial total status, one clear role such as best task fit or lower cost, one consequential advantage, one disadvantage, and explicit save/compare actions. Never substitute unexplained match percentages for reasons.

### Comparison

Default to two products on a narrow phone. Group by the user's tasks and decisive differences rather than exposing a giant desktop matrix. Keep required features and prices easy to find. Allow all specifications and equal values to be revealed. Distinguish unsupported from untested and unknown.

Maintain a visible selected-item reminder, and accessible controls to remove or replace products. Baymard's published research supports persistent compare selection and reminders, rather than interactions discoverable only through hover. [Comparison UX](https://baymard.com/research-articles/provide-comparison-features)

### Contextual adviser

Use an explicit button such as “Ask about this option” or “Explain this difference.” Open a sheet for short help or a dedicated screen for a longer conversation and keyboard use. Preserve the profile and selected products. Avoid a floating chat control that obscures prices, comparison controls or buying actions.

Treat changes from chat as typed proposals. “Cheaper” is usually an objective change; “lower the memory requirement” changes a constraint and should be reviewed. Offer an undo. Only structured, validated catalog results can appear as purchasable cards.

### Offer review

Show seller, exact variant, condition, warranty, delivery, eligibility, total completeness and last verification. Mark unknown costs in place. Use “View buying options” or “Open retailer,” because the adviser initially does not operate its own checkout. State that the user is leaving the app. Reverify where permitted and preserve the previous observation when refreshing fails.

## 5. Creative implementations worth testing

1. **A living needs summary:** editable chips/fields stay connected to the shortlist and explanations. Any conversational change has a visible structured effect.
2. **A buying decision brief:** save the budget, tasks, shortlist, exclusions, evidence and offer snapshot as one object instead of merely bookmarking products or a transcript.
3. **Budget consequences:** explain which useful capabilities change at a different budget; never encourage spending to the ceiling or invent performance gains.
4. **An offer-check entry:** paste a supported retailer link or confirm extracted quotation fields and receive a structured difference check.
5. **Two-product task comparison:** “for travel,” “for your application,” and “for support” sections explain what the raw specifications mean.
6. **A lower-cost alternative in the same decision:** keep/upgrade/replacement options can share the budget and tasks once data supports them.
7. **In-store continuity:** save a lightweight checklist and shortlist for an offline visit, then continue on Windows through optional sharing/sync.
8. **An explicit counterargument:** a visible “When I would not choose this” explanation anchored to the user's priorities and evidence.

These are product interaction ideas. Avoid swipe-to-discard decisions as the only way to evaluate an expensive product, fabricated urgency, hidden sponsored ranking and autoplay decorative motion.

## 6. Material 3 Expressive and Windows adaptation

Android should use clear hierarchy, semantic color, expressive emphasis for the main task, accessible touch targets and purposeful motion. Use sheets for temporary decisions and full screens for complex comparison or lengthy conversation. Preserve Android Back and state restoration.

Adapt navigation and panes to available window size. Google's navigation guidance supports a navigation bar on compact layouts and a rail on larger layouts. This is Compose platform guidance; the exact React Native adapters still require implementation and validation. [Android adaptive navigation](https://developer.android.com/develop/ui/compose/layouts/adaptive/build-adaptive-navigation)

On Windows, retain the same decision data and terminology while using a navigation pane, persistent filters, wider comparison and an optional adviser side pane. Do not stretch phone cards into a desktop layout or turn desktop operation into a transcript-only flow.

Shared components should include NeedsSummary, BudgetInput, RecommendationCard, CompareSelectionTray, TradeoffSection, OfferSummary, EvidencePanel, AdviserContext and DecisionBrief. Domain and API state own the canonical profile/shortlist; platform adapters own appearance and interaction. Do not stream model tokens through the entire product list's state.

## 7. Prototype and validation

The accompanying HTML concept uses fictional configurations and prices. It demonstrates guided profile editing, budget filtering, a shortlist, comparison, saving and contextual advice. It is not a React Native build, native Material conformance test, real model integration or live shopping feed.

[Open the interactive concept](./mobile-adviser-concept.html). The concept was rendered at mobile and desktop widths. Scripted interaction checks passed for budget eligibility, no-fit behavior, workload filtering, comparison, saving, contextual advice and selection persistence. This verifies those demonstration interactions, not native app usability, accessibility or recommendation accuracy.

Test the proposed interface against a chat-first and a conventional catalog prototype using the same product data, offers and recommendation rules. Include novice and experienced buyers and tasks such as changing a budget, identifying a disqualifying requirement, comparing a warranty, resuming a decision and finding an expired-price warning.

Measure task correctness, price/condition comprehension, time to a defensible shortlist, unnecessary interactions, backtracking, accessibility, perceived effort and recovery from wrong AI interpretation. Preference alone cannot validate correctness. Iterate rather than claiming a universal interface winner from a small study.
