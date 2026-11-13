# Lựa repository research before full-app implementation

Audit date: 13 November 2026, Asia/Saigon. Workspace: `E:\test`. Current branch: `agent-a/api`. Inspected commit: `d2f26ee62e50d661e30bc2aa271ae061f9e4e823`. Local `main`: `bd03eeeb0a1dfa3d0ac1e61a2705fdda5cb71436`.

**Conclusion:** this repository contains a substantial Android interaction demo, product/requirements research, retailer collection and embedding tools, and a separate backend retrieval spike on local `main`. It does not yet contain one integrated production adviser. The next step is to reconcile scope and contracts, validate a small real catalog, and connect one complete buying journey to that reviewed data.

Follow-up on 13 November: [deep app-flow research](./APP_FLOW_DEEP_RESEARCH.md) traces 23 transitions and records eight findings, with six controlled reproductions involving persistence, restoration and explanation context. The original 18 tests still pass, so their passing status does not establish coverage of those newly identified behaviors. [Test-pack contracts](./PREBUILD_TEST_PACKS.md) add the required regression cases to the Codex plan.

Start with the [app flow diagrams](./APP_FLOW.md). This report explains the evidence behind them.

## 1. Scope and evidence method

Inspected current tracked files, relevant local Git history/branch divergence, the selected BRD and companion plan, research indexes and relevant design/architecture sections, Android entry points/screens/domain/persistence/AI contracts, tests, crawler normalization/storage, dataset contents, embedding/storage/search code, and the separate branch's retrieval schema/API/agent flow. Inspected the saved confirmed-results screenshot and Android verification manifest. Re-ran the existing app tests, HTTP contract test and TypeScript check, and verified the APK hash.

The initial working tree was clean. No branches were merged, no remote refs were fetched, and no production code or requirements were changed for this audit. Local remote-tracking refs are a snapshot, not proof of GitHub's newest state. The crawler, databases, emulator, APK build, live AI and external market/source research were not rerun. Statements about prior Android testing are attributed to stored evidence, not presented as a new device test.

This is repository research, not a fresh market study or legal/source-permission assessment. No buyer interviews, adoption results or production acceptance are inferred from design documents. Large bundled T3 investigation files were classified through their location/history and app entry/dependency paths; they were not exhaustively audited as product code.

## 2. Which documents govern the app?

| Document / record | Finding | Use going forward |
|---|---|---|
| [Root brd.md](../../brd.md), v3.2 | Selected requirements attachment plus Android/React Native/Expo amendments; draft for review | Primary requirements baseline |
| [Implementation plan](./IMPLEMENTATION_PLAN.md), v3.2 | Current top note records demo implementation; later sections retain staged production work and historical notes | Delivery/dependency reference; not proof of acceptance |
| [Traceability register](./project-traceability.json) | 36 parent journeys, 67 criteria, 17 work packages; `U19InScope=false`; `nativeGateAccepted=false`; live AI false | Requirement-to-evidence index, read with verification limitations |
| [Uppercase BRD](./BRD.md), v2.3 | Older Android + Windows scope and U19 contextual invitation | Historical reference, not selected baseline |
| [Archived workspace BRD](./archive/BRD-workspace-v3.0-superseded.md) | Explicit superseded copy | Historical only |
| [Research README](../../research/README.md) and early scope/blueprint | Still describe Windows, a browser-only prototype, 37 journeys and 77 criteria | Useful research context, stale implementation summary |
| [Android README](../../apps/adviser/README.md) and [verification](../../apps/adviser/VERIFICATION.md) | Explain actual entry point, fixtures, supported demo journeys and evidence limits | Current implementation orientation |

The documents contain multiple generations of planning. Do not reintroduce Windows, U19 or the historical 72-capability inventory because they appear in older files. The current code uses contextual assistance, but that does not make the superseded standalone U19 requirement part of the baseline.

The 4–6 hour hackathon framing is a priority convention, not a credible production estimate. Earlier day/week estimates also remain assumptions. The active baseline puts U01–U05 in core demo scope, U07/U08 in additional demo scope, and U06/U09/U12/U13 in future scope. The production plan later mentions U01–U08: decide U06 explicitly before estimating the first production release.

## 3. What has been done, chronologically

Dates below are commit dates; dates written inside research files sometimes predate when they were committed.

| Date | Evidence | Work present |
|---|---|---|
| 7 Nov | `406e4bf` | Repository/license initialization |
| 11 Nov | `fb291fd` | Four retailer crawlers, normalization and stored data snapshots |
| 11 Nov | `f5e550a` | Python embeddings, Qdrant ingestion and CLI search |
| 11–12 Nov | `aa7b409`, `9bc511a`, `f7ec267` | BRD and scope revisions; later app documents identify `f7ec267` as upstream base |
| 12 Nov | `828c5f8` | Expo Android adviser demo, domain/ranking/AI contracts, persistence, verification and build tooling |
| 12 Nov | `d053f99` | Research package added to this branch, additional evidence captures and separate T3 investigation bundles |
| 12 Nov | `a7aeeaa`, `8db848a`, `d2f26ee` | Android installation documentation and checked-in APK |
| 12 Nov, separate branch | `bd03eee` on local `main` | PostgreSQL/Qdrant retrieval spike, search/agent/API tests and NotebookLM guide |

At inspection, `HEAD...main` has five commits unique to the current branch and one unique to `main`. The backend spike is existing work in Git, but its files are not in the current working tree. It was inspected with `git show`; neither its tests nor its runtime were executed in this audit.

## 4. Implemented components and practical limits

| Component | Inspected implementation | Limit before production |
|---|---|---|
| Android client | Expo SDK 54 / RN 0.81.5; five bottom tabs; three-step needs picker; detail/filters/AI sheets; Vietnamese interface; light/dark; native Back/share | Current app is a demo with substantial state and screen logic in one `AndroidApp.tsx`; no production catalog repository adapter |
| Needs and ranking | 1–3 ordered main uses, extra mandatory tasks, exact integer VND ceiling, VM clarification, up to 2 preferences; hard checks before ranking | Four fixture task types and illustrative capability quality; no measured hardware/workload model |
| Result states | Clarification, no eligible result, filter empty and eligible; first three recommendations then more; explicit excluded tradeoffs | Separate production fit, offer validity, affordability, source failure and evidence unknown states need modeling |
| Search/detail/compare | Name/RAM/SSD substring search; exact fixture variants; two-device comparison; cost breakdown and limitations | Search does not call Qdrant; no production specifications, retailer refresh or actual buying redirect |
| Persistence | AsyncStorage, v2 schema, v1 migration, saved snapshots, delete/share, recovery/export and write-failure behavior | Local only; current catalog IDs are hardcoded; removal/suspension/version reconciliation with a real server remains needed |
| AI client and Node service | Reviewed needs patch, allowed claims, contradiction rejection, revision checks, bounded requests/timeouts/concurrency, labelled fallback | Live-provider acceptance unverified; rules/prices come from demo inputs; no production service authorization, durable usage control or real evidence catalog |
| Local workshop | Fixture price editing, validation, rollback, invalid-candidate simulation, fault injection | Does not provide staff roles, publication approvals, production audit trail or a general admin portal |
| Crawlers | Puppeteer/Cheerio adapters for CellphoneS, Thế Giới Di Động, Điện Máy Xanh and FPT Shop; JSON normalization | Snapshot collection, not reviewed production publication or documented source rights |
| Embedding/search | Python ingestion, UUID point identity, payload filters, Qdrant search; offline hash plus optional providers | Independent CLI tooling; no app integration, retrieval-quality acceptance or authoritative suitability checks |
| Backend spike on `main` | PostgreSQL catalog/offer/price/evidence tables; evidence sync to Qdrant; keyword/price lookup; checked optional explanation; local API/page | Draft crawl data and listing prices, different API, not merged, not a full recommendation service |
| Research | Competitor/source register, needs protocol, feature inventory, mobile concepts, delivery plan and diagrams | Proposed strategy; no evidence of completed buyer research, supplier agreements or production demand validation |

Primary implementation pointers:

- [Current app entry](../../apps/adviser/index.js), [screens](../../apps/adviser/src/AndroidApp.tsx), [web preview entry](../../apps/adviser/src/main.web.tsx). `App.tsx`/`qa.web.tsx` are retained historical browser code, not the current app entry.
- [Domain and fixtures](../../apps/adviser/src/domain.ts): `total`, `bestOffer`, `fit`. [Picker](../../apps/adviser/src/picker.ts): `validateNeeds`, `rank`, `evaluate`, `restore`.
- [AI client](../../apps/adviser/src/ai.ts), [Node server](../../services/demo-ai/server.mjs), [service test](../../services/demo-ai/server.test.mjs).
- [Crawler schema](../../crawler/src/models/laptopSchema.js), [storage](../../crawler/src/utils/storage.js), [ingestion](../../embedder/ingest.py), [embeddings](../../embedder/embeddings.py), [search](../../embedder/search.py).
- Separate Git source: [retrieval spike at inspected commit](https://github.com/KILLERJOYZ/test/tree/bd03eeeb0a1dfa3d0ac1e61a2705fdda5cb71436/spikes/brd-retrieval). This link identifies the locally inspected Git content; no live deployment was verified.

## 5. Data audit: reusable collection work, not a production catalog

The [combined snapshot](../../data/all_laptops_normalized.json) contains **70 retailer records** observed on 11 November 2026. These are source listings, not 70 reviewed canonical variants. Its IDs have no duplicates within this file, but source-based IDs do not establish cross-store variant equivalence.

| Source | Records | Condition recorded | Missing SKU | Missing CPU | Missing RAM |
|---|---:|---|---:|---:|---:|
| CellphoneS | 25 | New | 21 | 21 | 17 |
| Thế Giới Di Động | 15 | New | 12 | 7 | 0 |
| Điện Máy Xanh | 15 | Used | 0 | 0 | 0 |
| FPT Shop | 15 | New | 12 | 8 | 9 |
| **Total** | **70** | **55 new / 15 used** | **45** | **36** | **26** |

Counts measure absent/null/empty fields, not the correctness of populated values. No missing current-price values were found, but that does not establish price validity, included fees, eligibility, stock or exact-variant matching. The per-store and alternate combined files overlap; do not sum them as independent inventory. The embedder prefers `all_laptops_normalized.json` when ingesting the directory.

Key issues:

1. **Stock is partly inferred.** `createNormalizedLaptop` uses `currentPrice ? 'in_stock' : 'unknown'` when availability is absent. The Điện Máy Xanh list scraper also sets `in_stock` explicitly. All 70 rows have that label; it is not independent stock verification.
2. **Mixed condition.** Fifteen rows are used devices, outside the proposed new-laptop first-release boundary. Preserve condition and filter intentionally before a pilot catalog is selected.
3. **Identity is source-specific.** The crawler hashes source plus SKU/URL/name. It does not establish an accepted mapping between an offer and a canonical cross-retailer configuration.
4. **Listing price is not complete cost.** The schema has current/original price, promotions and notes, but lacks the full verified shipping/fees/eligibility/freshness contract used in the BRD.
5. **Capabilities are not measured.** Populated seller specs still need typed normalization, provenance review and supported-workload evidence. The demo's RAM/level thresholds cannot be promoted into hardware guidance.
6. **Embeddings are not an eligibility model.** Default local embeddings are 384-dimensional n-gram feature hashing. This is useful for plumbing experiments, not evidence that Vietnamese semantic retrieval or recommendation quality is adequate.
7. **Index lifecycle needs ownership.** Current ingestion upserts records and supports collection recreation; it does not establish a production withdrawal/refresh/publication lifecycle. Provider fallback can also change embedding space: collection dimension checking alone is not sufficient to prove model compatibility.

The separate `main` spike already makes a useful distinction: draft crawl records, listing-price-only observations, demo-only permitted-use labels and a relational source of truth with a derived evidence index. Reuse that boundary after reconciling contracts; do not treat a demo-only label as acquired production permission.

## 6. Integration gaps that determine the full-app design

| Gap | Evidence | Required decision/change |
|---|---|---|
| Disconnected client and real data | App imports `PRODUCTS`/`OFFERS`; no crawler/catalog API fetch in current screens | Introduce fixture/API repositories with identical result semantics |
| Two backend prototypes | Node routes `/demo/needs/interpret`, `/demo/advice/explain`; Python route `/api/advise`; both default to 8787 | Select production API ownership/runtime and one public contract; isolate local ports |
| Different price meanings | Android calculates complete fixture total; Python spike filters listing amount | Define price completeness and common eligibility semantics before connecting responses |
| Different recommendation depth | Android has task checks/order; spike uses text/budget search plus evidence | Keep retrieval distinct from full workload eligibility and ranking |
| Simplified no-fit state | `domain.ts:fit` collects task, missing-offer and budget reasons into one result | Separate suitable/unknown/failed device state from offer and price state |
| Limited version context | Profile revision checks and snapshot dataset/policy fields exist | Carry stable decision/run IDs and profile/catalog/rule versions end to end |
| No real publication authority | Demo workshop mutates local fixtures; spike rows are draft | Add import review, permissions, audit, suspension and rollback |
| Stale documentation entry points | Older research README/platform/counts differ from active baseline | Reconcile summaries before task generation; preserve history rather than treating it as current scope |
| Prototype scale assumptions | Screens use in-memory arrays and broad component state | Separate feature state and service boundaries; add pagination and measured performance work with real catalog size |

Preserve the existing TypeScript domain tests and contract behavior when choosing a backend. If production uses Python, a shared schema plus identical behavioral fixtures is needed to prevent separate implementations of budget and eligibility rules from drifting. Framework selection alone will not solve the integration gaps.

## 7. Verification performed for this audit

| Check | 13 November result | What it establishes |
|---|---|---|
| Existing domain/picker/AI unit tests | **18 passed** | Inspected fixture/domain behaviors still pass |
| Existing HTTP service integration test | **1 passed** | Controlled-provider HTTP contract/rejection/fallback behavior |
| `npm run check` in `apps/adviser` | **Passed** | Current TypeScript sources type-check with installed dependencies |
| APK SHA-256 and size | **Match stored manifest** | Checked-in artifact is the recorded artifact; not a new runtime acceptance |
| Combined JSON inspection | **70 records; findings above** | Snapshot structure/completeness, not retailer truth |

Commands used:

```powershell
node --experimental-strip-types --test apps/adviser/src/domain.test.ts apps/adviser/src/picker.test.ts apps/adviser/src/ai.test.ts services/demo-ai/server.test.mjs
# HTTP test was then rerun separately with loopback access:
node --experimental-strip-types --test services/demo-ai/server.test.mjs
# From apps/adviser:
npm run check
Get-FileHash -Algorithm SHA256 -LiteralPath artifacts/lua-adviser-demo.apk
```

The first HTTP attempt hit sandbox `EACCES` connecting to its temporary localhost server. A permitted rerun outside that restriction passed. It used an injected test provider, not a live AI call. The initial combined command therefore returned 18 passes/1 environment failure; the subsequent service run resolved that verification limitation.

APK: 34,375,792 bytes; SHA-256 `a41961f3c8b4558fbcafe0bde1d8928b2274d06704c527d8cdfe586a53a8035f`.

Stored [Android verification](../../apps/adviser/VERIFICATION.md) and [manifest](../../apps/adviser/verification/android-demo-manifest.json) report a standalone Expo APK, ARM64/x86-64 packaging, emulator journey checks, font-scaling fixes and prior build/export/doctor checks. They explicitly leave physical-phone testing, TalkBack/switch access, complete performance distributions, buyer study, live-provider validation and production data readiness pending. The release artifact uses a debug signing key. These are practical release limitations, not failures of this research task.

Passing code checks is not G1/G2/G3/G4/G5 approval. The traceability register explicitly keeps native-gate acceptance false.

## 8. Proposed build sequence after flow review

| Sequence | Work | Concrete exit evidence |
|---|---|---|
| 1 | Reconcile the first production scope and contracts | Android/new-laptop scope, U06 decision, supported workloads, one API/schema and named owners; record backend-spike reuse decision |
| 2 | Finish or explicitly defer outstanding demo acceptance | Live bounded AI decision, Android accessibility/device checks, exploratory user findings and recorded demo outcome |
| 3 | Prepare a small reviewed catalog | Permitted sources, exact variants, condition, complete/partial offer totals, freshness policy and supported-workload evidence; proposal in plan is 30–50 variants/2–3 sources, not a mandatory quota |
| 4 | Build authoritative storage and minimum staff workflow | Idempotent staged import, review/publish/suspend, version history, denied access and rollback verified |
| 5 | Connect one complete Android journey | Guest → needs → shortlist → exact variant → compare → reviewed offers → retailer handoff → saved decision reopened with dated history |
| 6 | Harden failures and release operation | Source outage, no verified offer, stale catalog, offline cache, late AI, corrupt persistence and withdrawn evidence handled honestly |
| 7 | Run a bounded pilot | Independent suitability/offer audits, user completion/comprehension evidence, measured performance/cost and support ownership |

This ordering follows the existing demo-to-production plan. It is a proposal for subsequent implementation, not an authorization to begin development in this research task. There is no reliable release date until capacity, source access and acceptance work are assigned.

## 9. Decisions to settle before assigning the full-app backlog

1. **First release:** new laptops only is the current planning recommendation. Confirm supported workload groups and whether U06 quotation intake belongs in the first production release or a later one.
2. **Navigation:** preserve the current five-tab structure initially, or intentionally consolidate For you and Explore to match BRD terminology. Keep contextual AI attached to a decision; a standalone chat-first product is not implied.
3. **Backend ownership:** choose the production runtime and decide how to reuse the `main` PostgreSQL/Qdrant spike while retaining the demo's stricter price/task contracts.
4. **Data operation:** assign source approval, exact-variant review, price freshness, corrections and supported-workload evidence ownership. Set coverage by what can be maintained, not crawler row count.
5. **AI acceptance:** choose provider/configuration/budget and run controlled live-provider checks, or explicitly defer that gate. Preserve the deterministic path in either case.
6. **Release evidence:** identify real Android devices, accessibility/performance criteria, distribution/signing and pilot support owner.

Later roadmap: phone-specific data/rules; price alerts with observation history; used-device assessment; upgrades and reviewed PC builds; then broader services. Login/cloud sync, in-app payment, unrestricted URL/OCR intake, arbitrary PC solving, commercial partnerships and international expansion are not necessary to complete the first buying-adviser journey.

The reusable foundation is the decision flow and its integrity rules. The largest remaining work is trustworthy data and coherent integration, followed by production operations and evidence of user usefulness.
