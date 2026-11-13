# Lựa app flow — current demo and proposed full application

Reviewed 13 November 2026 (Asia/Saigon), against `agent-a/api` at `d2f26ee`. Companion: [repository research](./REPOSITORY_RESEARCH_2026-11-13.md).

Deeper source review: [state ownership, 23 transitions, eight findings and regression contracts](./APP_FLOW_DEEP_RESEARCH.md). Six controlled probes reproduce current persistence/restore/explanation issues. The diagrams below summarize routes; they do not certify the reliability of every transition.

These diagrams distinguish inspected implementation from proposed production behavior. They do not change the requirements baseline or record stage-gate approval. The selected baseline is [root brd.md](../../brd.md), version 3.2: Android only, Expo/React Native, Vietnamese/VND, with HTML/CSS previews. Laptop-first production scope remains a proposal to confirm before implementation.

## 1. Current demo: the flow that exists

All products, prices, sellers and capability rules in this diagram are fictional. The current runtime is [AndroidApp.tsx](../../apps/adviser/src/AndroidApp.tsx), registered by [index.js](../../apps/adviser/index.js).

```mermaid
flowchart TD
    START([Launch Android app]) --> RESTORE{Local data readable?}
    RESTORE -->|Yes or first launch| HOME[For you / Cho bạn]
    RESTORE -->|Corrupt or unsupported| RECOVER[Preserve original data<br/>Recovery notice and export/reset actions]
    RECOVER --> HOME
    HOME --> PICK1[Picker 1: order 1–3 main uses<br/>Add mandatory tasks]
    PICK1 --> PICK2[Picker 2: exact VND ceiling<br/>VM clarification and up to 2 preferences]
    PICK2 --> PICK3[Picker 3: review and confirm]
    PICK3 --> CHECK{Profile valid and confirmed?}
    CHECK -->|No| PICK1
    CHECK -->|Yes and persistence succeeds| EVAL[Check fixture rules and complete offers<br/>Rank eligible configurations]
    EVAL --> RESULT{Result state}
    RESULT -->|Eligible| LIST[First 3 recommendations<br/>Show more, filters, sort]
    RESULT -->|Filter empty| CLEAR[Clear screen/weight filters<br/>Keep confirmed needs]
    CLEAR --> EVAL
    RESULT -->|No eligible option| NOFIT[Show reasons<br/>Keep hard budget and tasks]
    RESULT -->|Needs clarification| PICK1
    NOFIT -->|Edit needs explicitly| PICK1
    NOFIT -->|Explore tradeoffs| TRADE[Excluded options labelled<br/>Not part of suitable shortlist]
    TRADE -->|Choose to change requirements| PICK1
    HOME --> SEARCH[Explore / Khám phá<br/>Local name, RAM or SSD search]
    SEARCH --> DETAIL[Exact configuration detail<br/>Fixture evidence and limitations]
    LIST --> DETAIL
    LIST --> COMPARE[Select up to 2 configurations<br/>Compare / So sánh]
    SEARCH --> COMPARE
    COMPARE --> DETAIL
    DETAIL --> VARIANT[Choose another exact variant]
    VARIANT --> DETAIL
    DETAIL --> OFFERS[Offer breakdown<br/>Known, conditional and missing costs]
    OFFERS --> SAMPLE[Sample offer summary<br/>No retailer redirect or purchase]
    DETAIL --> SAVE[Save decision<br/>Requires confirmed needs]
    COMPARE --> SAVE
    SAVE --> ACK[Persistence succeeds<br/>Stay on current surface and acknowledge]
    ACK -->|User opens Saved tab| SAVED[Saved / Đã lưu<br/>Local dated snapshot]
    SAVED -->|Reopen and recalculate fixtures| HOME
    SAVED --> SHARE[Native share or delete]
    HOME --> SETTINGS[Settings / Cài đặt<br/>Theme, local data, recovery, AI URL]
    SETTINGS --> WORKSHOP[Demo-only fixture workshop<br/>Validation, rollback and fault injection]
    LIST --> AI[Optional contextual AI sheet<br/>Explain or propose needs changes]
    DETAIL --> AI
    AI -->|Validated proposal, user reviews| PICK3
    AI -->|Checked claims or labelled fallback| ANSWER[Answer within AI sheet]
    ANSWER -->|Close| ORIGIN[Underlying tab<br/>Detail sheet is not restored today]
```

The five actual bottom tabs are **For you, Explore, Compare, Saved and Settings**. Picker, filters, detail, contextual AI and sample offers are sheets. A recovery notice does not establish successful recovery; blocked writes require the explicit recovery/reset action.

Current limitations: an initial storage read error does not block later writes; concurrent whole-store writes and delete/reset can lose or restore data unexpectedly. Corrupt-byte export also has a gap. The detailed review supplies source evidence and required fixes; recovery arrows describe intended user routes, not proven data safety. Android modal Back follows each sheet's handler; chat opened from detail currently closes to the tab beneath it.

`picker.ts:evaluate` returns `needsClarification`, `noEligible`, `filterEmpty` or `eligible`. `domain.ts:fit` currently combines workload, offer availability and budget failures into one eligibility result. Search is local substring matching, independent of the Python/Qdrant search.

## 2. Proposed full application: the buyer's decision flow

This is the proposed laptop-first production journey. The interaction path is reusable; audited data, current offer checks, server contracts and failure states still need implementation. **Dashed connections mark future scope or optional behavior; they do not mean implemented integration.**

```mermaid
flowchart TD
    START([Open Lựa as a guest]) --> ENTRY{What do you want to do?}
    ENTRY -->|Help me choose| INTAKE[Main tasks and required apps<br/>Budget scope and hard ceiling<br/>Hard constraints and soft preferences]
    ENTRY -->|Browse a known device| BROWSE[Search and filter catalog<br/>No mandatory onboarding]
    ENTRY -->|Continue a decision| HISTORY[Open saved decision<br/>Show original dated snapshot]
    ENTRY -. Future U06 .-> QUOTE[Supported link or manual quotation<br/>User confirms extracted fields]
    INTAKE --> REVIEW[Review and confirm needs]
    REVIEW --> READY{Critical needs clear?}
    READY -->|No| CLARIFY[Ask only necessary follow-up questions]
    CLARIFY --> REVIEW
    READY -->|Yes| RUN[Evaluate supported exact variants<br/>Check evidence, offers and total cost]
    RUN --> OUTCOME{Evaluation outcome}
    OUTCOME -->|Suitable and affordable| LIST[Explainable shortlist<br/>Reasons, limitations and evidence]
    OUTCOME -->|Missing critical evidence| UNKNOWN[Explain what is unknown<br/>No unsupported suitability claim]
    OUTCOME -->|No suitable variant| NOFIT[Explain failed requirements<br/>Offer explicit compromise exploration]
    OUTCOME -->|No verified affordable offer| NOOFFER[Separate device fit from buying readiness<br/>Show incomplete, stale or over-budget offers]
    OUTCOME -->|Service failure| FAILURE[Retry or show dated cached information<br/>No fresh-price claim]
    UNKNOWN -->|Clarify needs if relevant| INTAKE
    NOFIT -->|User chooses to revise needs| INTAKE
    NOOFFER -->|Recheck offers| RUN
    FAILURE -->|Retry| RUN
    LIST --> FILTER{Refinement hides every result?}
    FILTER -->|Yes| CLEAR[Clear refinements<br/>Preserve hard constraints]
    CLEAR --> LIST
    FILTER -->|No| DETAIL[Exact variant detail<br/>Specs, fit, evidence and limitations]
    BROWSE --> DETAIL
    DETAIL -->|Assess against my needs| INTAKE
    DETAIL --> COMPARE[Compare 2 exact variants<br/>Same needs and price basis]
    COMPARE --> DETAIL
    DETAIL --> OFFERS[Buying options<br/>Delivery context, fees, discounts and policy]
    OFFERS --> VALID{Identity, destination and offer<br/>valid for the displayed claim?}
    VALID -->|No| NOOFFER
    VALID -->|Yes| HANDOFF[Open approved retailer destination<br/>Retailer handles checkout]
    LIST --> SAVE[Save or share decision<br/>Keep needs, variants, evidence and date]
    DETAIL --> SAVE
    COMPARE --> SAVE
    SAVE --> HISTORY
    HISTORY --> REFRESH[Fetch current records separately<br/>Keep historical values intact]
    REFRESH --> DETAIL
    QUOTE -. Same assessment rules .-> RUN
    LIST -. Optional assistance .-> AI[Contextual AI<br/>Checked explanation or proposed edit]
    AI -. Material edit needs confirmation .-> REVIEW
```

Production rules for this flow:

- Browsing is useful before a profile exists. A suitability claim requires confirmed needs. A confirmed profile is required to save a *decision* in the demo; standalone bookmarking without a profile is a separate scope decision.
- New laptops are the proposed first category. Phones, used devices and PC builds need their own evidence and acceptance, even when they later reuse these screens.
- A low listing price is not a verified payable total. Unknown shipping stays unknown; unconfirmed coupons remain conditional; same-family variants remain distinct.
- No suitable variant, no verified affordable offer, refinement hides results, and service failure need different recovery actions.
- Editing a draft does not change the active confirmed decision. Confirmation creates a new profile revision and invalidates affected results. Ignore late responses from previous runs.
- Historical snapshots preserve their date and original identity. Removed or suspended variants do not silently become another device.
- The buying destination is a retailer handoff, not an order confirmation. Offer caveats remain visible; the app must not record a purchase from a click.
- U06 is urgency 3 in the active hackathon baseline, although the later production plan discusses U01–U08. This diagram exposes the dependency without silently adding quotation intake to the first production build.

## 3. Optional AI: a bounded branch of the decision

Current demo contracts implement much of this boundary with fictional records. Real evidence, production monitoring and a live-provider acceptance run remain future work.

```mermaid
flowchart TD
    ACTION[User explicitly sends a question<br/>AI notice and current decision context] --> KIND{Request type}
    KIND -->|Interpret needs| PROPOSE[Model proposes allowed profile fields]
    PROPOSE --> PATCH{Schema and revision valid?}
    PATCH -->|Yes| REVIEW[Show editable proposal to user]
    REVIEW -->|Confirm| APPLY[New profile revision<br/>Deterministic reevaluation]
    REVIEW -->|Cancel| KEEP[Keep confirmed decision]
    KIND -->|Explain| FACTS[Supply allowed facts and claims<br/>From current evaluated records]
    FACTS --> CLAIMS[Model selects supported claims]
    CLAIMS --> VALIDATE{IDs, semantics and revision valid?}
    VALIDATE -->|Yes| RENDER[Render checked explanation]
    VALIDATE -->|No| FALLBACK[Labelled deterministic fallback]
    PATCH -->|No| FALLBACK
    PROPOSE -->|Timeout or provider unavailable| FALLBACK
    CLAIMS -->|Timeout or provider unavailable| FALLBACK
    FALLBACK --> KEEP
```

AI cannot author an authoritative product identity, price, retailer URL or eligibility verdict. Matching a real evidence ID is insufficient when the claim contradicts that evidence. The demo service exposes `/demo/needs/interpret` and `/demo/advice/explain`; the separate `main` spike exposes `/api/advise` and is **not** a replacement URL for those contracts.

## 4. Existing components and their actual connections

These are separate implementations. No edge connects the crawler or Qdrant to the Android catalog today. The `main` group was inspected through Git, without merging or running it.

```mermaid
flowchart LR
    subgraph CURRENT[Current Android demo]
        APP[Expo Android screens] --> RULES[TypeScript fixture eligibility and ranking]
        FIX[12 fictional variants<br/>18 offers / 3 sellers] --> RULES
        APP <--> LOCAL[(AsyncStorage<br/>Needs, decisions and settings)]
        APP --> NODE[Node demo AI service<br/>Default port 8787]
        NODE -. Optional configured call .-> PROVIDER[AI provider]
    end
    subgraph PIPELINE[Separate crawler and embedding tools]
        CRAWL[4 retailer crawler adapters] --> JSON[Normalized JSON snapshots]
        JSON --> EMB[Python ingestion<br/>Local hash or provider embeddings]
        EMB --> Q[(Qdrant laptops collection)]
        CLI[Python search CLI] --> Q
    end
    subgraph MAIN[Separate local main branch spike]
        IMPORT[Draft crawl import] --> PG[(PostgreSQL draft catalog<br/>Offers, observations and evidence)]
        PG --> SYNC[Evidence sync]
        SYNC --> EQ[(Qdrant lua_evidence)]
        PY[Python advise API<br/>Default port 8787] --> PG
        PY --> EQ
        PY -. Optional checked explanation .-> EXPLAIN[Configured explainer]
    end
```

The two servers share default port 8787 and have incompatible endpoints. Reconcile contracts and deployment ownership before treating them as one backend. The Python spike's listing-price filter does not implement the full Android workload/total-cost policy.

## 5. Proposed production data and administration flow

This follows the BRD publication and correction lifecycle. PostgreSQL/Qdrant have prototype precedent, but production runtime/framework and deployment are still choices. Qdrant is a derived evidence index, not the authority for payable totals or eligibility.

```mermaid
flowchart TD
    SOURCE[Permitted sources or reviewed manual import] --> STAGE[Import staging<br/>Keep provenance and raw observations]
    STAGE --> NORMALIZE[Normalize units and money<br/>Resolve exact variant identity]
    NORMALIZE --> QUALITY{Required fields and evidence adequate?}
    QUALITY -->|No| HOLD[Quarantine or request correction<br/>Do not publish verified claims]
    HOLD --> STAGE
    QUALITY -->|Yes| REVIEW[Authorized staff review<br/>Scope, conditions, freshness and rights]
    REVIEW -->|Reject| HOLD
    REVIEW -->|Approve revision| DB[(Published catalog, offers and evidence<br/>Authoritative relational store)]
    DB --> INDEX[Versioned evidence indexing<br/>Propagate updates and withdrawals]
    INDEX --> VECTOR[(Optional vector search)]
    APP[Android application] --> API[Typed application API]
    API --> DB
    API --> ENGINE[Confirmed-needs checks<br/>Eligibility, totals and ranking]
    DB --> ENGINE
    ENGINE --> RESULT[Versioned result and reason codes]
    RESULT --> APP
    RESULT --> AI[Optional constrained explanation]
    VECTOR --> AI
    AI --> CHECK[Validate claims and response versions]
    CHECK --> APP
    APP --> REPORT[Report a data or advice issue]
    REPORT --> TRIAGE[Support triage and impact review]
    TRIAGE --> REVIEW
    DB --> REFRESH[Refresh jobs and freshness monitoring]
    REFRESH --> STAGE
    REFRESH -->|Expired or withdrawn| SUSPEND[Suspend current buying claims<br/>Retain history and audit reason]
    SUSPEND --> DB
```

Minimum staff capabilities: source/import review; exact-variant, offer and evidence editing; publication/suspension; rule/prompt evaluation and rollback; issue resolution; health/freshness monitoring; and access control. The local demo workshop does not satisfy production staff permissions or audit history.

## 6. Screen and state contract for the first production slice

| Surface | Responsibility | Important alternate states | Existing basis |
|---|---|---|---|
| For you / Explorer entry | Start needs or continue a decision | Guest, unconfirmed, restored history | Home and Search exist; consolidation is a design decision |
| Guided needs | Ordered uses, ceiling/scope, workload questions, preferences | Draft, invalid amount, unanswered critical need, cancel | Three-step picker; four fixture task types |
| Results | Versioned eligible shortlist and exclusions | Clarification, no fit, no offer, filter empty, service failure | Four-state fixture evaluator; production states need separation |
| Variant detail | Exact configuration, evidence and task verdicts | Missing/conflicting evidence, removed variant | Fixture detail and variant switching |
| Comparison | Two variants under one needs/price context | Empty/one selection, unsuitable option, incomparable price | Two-item comparison |
| Buying options | Accepted match, total, conditions, observed time | Partial total, conditional saving, stale/unavailable/suspended | Fictional breakdown; real refresh/redirect missing |
| Saved decisions | Original local snapshot and current reevaluation | Old schema, deleted variant, write failure, corrupt record | Versioned persistence and recovery |
| Settings and data | Theme, local data controls, service disclosure | Permission refused, recovery required | Local controls; separate workshop from consumer release |
| Contextual adviser | Explanation or needs proposal | Loading, invalid/stale response, timeout, fallback | Bounded client/server contracts |
| Staff operations | Review/publish/correct with scoped authority | Invalid import, conflict, denied access, rollback | Proposed; fixture editor is only a precursor |

## 7. Invariants for implementation and acceptance

1. Mandatory needs pass before ranking. Preference, vector similarity and AI cannot override budget or a failed task.
2. Carry exact variant identity through search, comparison, offers, saving and sharing.
3. Record decision ID, profile revision, catalog version, rules version and request/run identity. The demo has some version fields, not the complete production envelope.
4. Keep fit, offer validity and total completeness separate. Missing critical evidence is unknown.
5. Keep draft, confirmed and historical state separate. Outdated responses cannot replace active results.
6. Persist successfully before acknowledging a save; preserve recoverable old data on failure.
7. Keep browsing and deterministic decisions useful without AI. Source failure does not establish an empty catalog or a newly verified cached price.
8. Separate synthetic fixtures, crawled draft data and reviewed production records technically and visibly.

See the [research report](./REPOSITORY_RESEARCH_2026-11-13.md) for evidence, gaps and the proposed build sequence.
