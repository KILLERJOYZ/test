# Frontend implementation plan — Material 3 Expressive

Version 1.0 · 13 November 2026 · Planning baseline. The [implementation and verification report](../design/FRONTEND_IMPLEMENTATION_STATUS.md) records the delivered frontend, APK, emulator checks and remaining physical-device acceptance.

Objective: resolve the [frontend audit](../design/FRONTEND_DESIGN_AUDIT_2026-11-13.md), establish one accessible Material 3 Expressive component system, and deliver the complete current adviser journey with purposeful animation on Android and equivalent HTML/CSS previews.

Authoritative requirements: lowercase [brd.md](../../brd.md), especially AC-UX01–05. This is the frontend workstream under the [overall delivery plan](IMPLEMENTATION_PLAN.md), not a new production scope or stage-gate approval. The [research guide](../design/MATERIAL_3_EXPRESSIVE_RESEARCH.md), [animation specification](../design/FRONTEND_MOTION_SPEC.md) and [component implementation context](../design/FRONTEND_IMPLEMENTATION_CONTEXT.json) accompany it.

## 1. Starting point and implementation decisions

Both current entry points use `apps/adviser/src/AdviserApp.tsx`. Retain that runtime while extracting focused modules. Existing `AndroidApp.tsx`, historical flow diagrams and synthetic-data screenshots describe an older implementation; do not use them as current behavior or replace the newer adviser with them. Work from the present working tree and preserve unrelated changes.

The current application uses Expo SDK 54, React Native 0.81.5, React 19.1, the New Architecture, AsyncStorage, an imported listing catalog and a Gemini Nano native bridge. Reanimated is not installed. The previous audit's production build and 57 tests passed; this is baseline evidence only. The browser development server, preview navigation, accessibility and native device coverage need work.

Decisions for this workstream:

1. Retain React Native/TypeScript and the green product identity. Share semantic tokens and component state contracts with the HTML/CSS preview. Android remains the delivery platform.
2. Use custom accessible React Native primitives with documented M3 role mappings. A library's Material label does not supply Expressive behavior automatically.
3. Adopt the SDK-compatible Reanimated 4.1.x/Worklets combination through a platform adapter, after the phase 0 build spike. Rebuild the app-specific Android host; Expo Go does not validate the local AI integration.
4. Implement motion in primitives and each screen slice, with preference handling from the beginning. Two hero interactions: needs confirmation and comparison assembly. Repeated evidence and price surfaces remain calm.
5. Use explicit confirmation with Cancel for both individual and bulk history deletion. This closes UX-02 without introducing a new undo/persistence protocol.
6. Retain the current requirements fields, catalog identity rules, draft/confirmed boundary and historical snapshots. Styling and animation must not introduce price interpolation, inferred suitability, silent requirement changes or a new recommendation algorithm.

## 2. Delivery sequence, dependencies and estimates

Estimates are planning ranges for one engineer familiar with the repository: **17–26 engineering days**, with design/QA review throughout. They are not measured commitments or a revival of the original hackathon estimate. Device access, source-conflict resolution and participant recruitment can add elapsed time. Re-estimate after the first Android slice.

| Phase | Work packages | Estimate | Exit evidence |
|---|---|---:|---|
| 0 — Baseline and animated slice | FE-00, FE-01 | 1–2 days | Current build/state inventory; one native animated budget/task/result slice and equivalent preview; dependency decision recorded |
| 1 — Correct blocking interactions | FE-02, FE-03, FE-04 | 2–3 days | Visible modal errors/saves; safe deletion; accessible choices and essential contrast |
| 2 — Shared Expressive foundation | FE-05, FE-06, FE-07 | 3–5 days | One token system; reusable stateful components; persistent adaptive shell and motion-preference behavior |
| 3 — Needs, discovery and results | FE-08, FE-09 | 3–4 days | Confirmed needs, honest result states, direct empty-state recovery and accessible list behavior |
| 4 — Detail and comparison | FE-10, FE-11 | 3–4 days | Structured facts, conflict disclosure, two-item comparison, animated selection tray and stable identities |
| 5 — Saved, settings and AI | FE-12, FE-13 | 2–3 days | Safe saved/history journey; meaningful settings/AI state feedback; complete loading and error states |
| 6 — Acceptance and release evidence | FE-14, FE-15 | 3–5 days | Native accessibility, adaptation, lifecycle and motion/performance evidence; audit findings re-evaluated |

Run phases in order. FE-04's data contract can be resolved alongside the UI foundation, but FE-10/11 cannot be accepted with contradictory attributes still presented as authoritative. Feedback and accessibility fixes precede broad screen restyling. Hardware must be identified in phase 0; absent hardware does not prevent source/preview work, but leaves native exit criteria open.

## 3. Proposed code boundaries

Paths below are proposed deliverables, not existing modules. Extract incrementally while keeping the present entry points valid.

```text
apps/adviser/src/
  AdviserApp.tsx                    # composition and current entry component
  app/
    AdviserShell.tsx                # safe areas, app bar, content, navigation
    useAdviserController.ts         # coordinates existing store/client/AI contracts
    overlay-state.ts               # origin, draft, active dialog and return focus
  ui/
    tokens.ts                      # color/type/spacing/shape/elevation/state/motion
    ThemeProvider.tsx              # light/dark, optional supported dynamic scheme
    primitives/                    # ActionButton, Choice, Field, Card, Status
    overlays/                      # modal host, confirmation and local feedback
    navigation/                    # labelled icon destinations and compare tray
    motion/
      config.ts                    # Material spring inputs and adapter conversion
      useMotionPreferences.ts      # initial state, events, resume and cleanup
      AnimatedSurface.tsx          # native Reanimated implementation
      AnimatedSurface.web.tsx      # preview CSS implementation, same state contract
  features/
    needs/ results/ detail/ compare/ saved/ settings/ ai/
  presentation/
    listing-evidence.ts            # truthful display model and unresolved attributes
```

Reuse `adviser-store.ts`, `adviser-client.ts`, `catalog.ts` and `local-ai.ts` as behavior contracts. Centralize state transitions before splitting screens so requests, revisions and persistence are not duplicated in components. Avoid changing storage schema unless the evidence contract requires it; any change must include migration and historical-record tests.

Migrate token consumers together. `design-tokens.ts`, generated CSS and the old UI may use a compatibility export during extraction; remove competing sources only after all affected imports are accounted for. The token generator must not silently recolor the old UI during partial migration.

## 4. Work packages and acceptance

### FE-00 — Freeze the current frontend baseline

**Owner:** client engineer; design/QA reviewer. **Dependency:** none.

- Record current entry points, source revision/hashes, package versions, current catalog mode and test/build outcomes.
- Create a state inventory: first use, confirmed needs, editing draft, result states, comparison 0/1/2 selections, detail, historical detail, saves, restore failure, connection and AI states.
- Identify a named physical Android phone for release/performance/TalkBack checks and an emulator for window/OS cases. Record unavailable coverage with an owner.
- Add a lightweight development-only component/state preview. Keep fixture controls and diagnostic copy out of the normal app flow.

**Done when:** baseline is reproducible, state inventory is reviewable, and each audit finding has a task and an acceptance case below.

### FE-01 — Prove the animation and preview toolchain

**Owner:** client/native engineer. **Dependency:** FE-00.

- Resolve Reanimated and Worklets through the current Expo SDK; expected metadata is `~4.1.1` and `0.5.1`. Record exact installed versions/lockfile and compatibility. Do not install an arbitrary newest release: current newer Reanimated minors have different RN requirements. [Compatibility](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/)
- Verify the installed Expo Babel preset's worklets behavior and native build. Repair Vite's safe-area/codegen resolution and isolate platform-specific Back handling. The preview adapter prevents native worklets from leaking into its runtime.
- Implement one budget field, selected task control, confirmation action and a results summary using the shared motion interface. Exercise press/release, interrupted selection, successful persistence, failure and reduced motion.
- Validate debug iteration, an app-specific release APK, production preview and standalone HTML. Record unsupported adaptations before expanding.

**Done when:** native and web demonstrations show the same logical states and both operate with motion disabled. If the selected dependency fails, continue FE-02–04 with static feedback while the adapter issue remains open; record/re-estimate the blocker. Completion of the animation scope still requires the chosen adapter to pass.

### FE-02 — Make feedback local, persistent and actionable

**Audit:** UX-01. **Dependency:** FE-00.

Replace the single background `notice` channel with field errors and feedback owned by the active surface. Validate budget using existing domain boundaries; announce errors and focus the first invalid field. A save must show pending/committed/failure on the originating detail or comparison view. Prevent duplicate pending actions and retain the draft on write failure. Success feedback appears only after persistence succeeds.

**Acceptance:** zero, empty, decimal, nonnumeric and over-limit budgets are explained within the form; exact supported boundaries still work. Failed persistence supports retry without closing the modal. Closing and reopening preserves committed needs and returns focus appropriately. AN-05/06 motion must never hide or postpone feedback.

### FE-03 — Confirm destructive history actions

**Audit:** UX-02. **Dependency:** FE-02.

Show the selected decision identity/date for a single deletion and the affected count for bulk deletion. Default focus goes to Cancel; confirmation is explicit. Serialize the mutation through the existing store and retain the record on failure. Keep reset/recovery semantics separate from normal history deletion.

**Acceptance:** Cancel leaves storage unchanged; confirmed deletion persists across restart; failure retains data and visible recovery; repeated taps do not cause extra writes. AN-04 dialog behavior is available with and without motion.

### FE-04 — Agree the conflict-to-UI evidence contract

**Audit:** DATA-01. **Owners:** data/domain and client responsibilities, which may be one engineer. **Dependency:** FE-00.

Define an attribute state such as `known`, `unknown` or `conflicting`, with provenance tied to listing ID, raw hash and catalog revision. Keep the raw value available for inspection. Resolve contradictory extraction upstream or expose the specific attribute as unresolved consistently in cards, filters, comparison, history and AI inputs. The presentation layer must not silently choose a title value or merely hide a contradiction while eligibility/AI still trusts it.

**Acceptance:** the two audited records have reviewed evidence or explicit unresolved attributes; no contradicted value becomes proof that a hard constraint is met. Price/source history remains unchanged. Version/migration handling is recorded if schema changes are required. This is a focused dependency, not a general crawler rewrite.

### FE-05 — Implement the shared theme and token system

**Audit:** M3-01, UX-04. **Dependency:** FE-01; contrast corrections can start in FE-02.

Define semantic surface/container, foreground, primary, secondary, tertiary, essential outline, decorative divider, focus and error roles; typography roles; spacing; elevation; shape states; and the six motion roles in the animation spec. Generate preview CSS from these values. Retain the green brand identity and system font initially; verify Vietnamese glyphs and tabular VND alignment before considering a new font.

Provide light/dark schemes, system preference changes and a documented fallback. A dynamic-color adapter may supply a verified supported scheme; apply it only after validating its role pairs. Unsupported devices use the fallback. Device theme work must include an explicit supported/unsupported record rather than silently passing the dynamic-color criterion.

**Acceptance:** normal text ≥4.5:1; essential input/focus cues ≥3:1 against actual adjacent colors; inactive/decorative exceptions handled correctly. Current screens and preview consume the same documented tokens. Animated role transitions preserve readable contrast at intermediate frames.

### FE-06 — Build accessible, animated primitives and overlays

**Audit:** UX-03, M3-02. **Dependencies:** FE-01, FE-02, FE-05.

Implement ActionButton, IconButton, RadioChoiceGroup, TaskCheckbox, TextField, ListingCard, EvidenceStatus, LoadingIndicator, SurfaceDialog and ConfirmationDialog. Specify default, pressed, focused, selected, disabled, loading, invalid and unknown states as applicable. Use labels, icons and semantics together; reserve a stationary effective hit area of at least 48×48 dp.

The overlay controller tracks origin, pending draft, accessibility focus and return target. Avoid double animations from native `Modal` plus custom transforms. Keep alerts and saved acknowledgements visible within the active overlay. Implement AN-01–04, AN-06 and AN-09 in these components rather than adding animation independently to screens.

**Acceptance:** radio/task selection can be understood with color removed; TalkBack announces label/group/state; keyboard focus is visible; modal Back/Escape/close returns to the right origin without mutating a draft. Rapid press reversal leaves the visual state correct and the target reachable.

### FE-07 — Restore persistent navigation and adaptive layout

**Audit:** PREVIEW-01, M3-03. **Dependencies:** FE-05, FE-06.

Build a bounded safe-area shell with an independent scrolling content area and reachable navigation. Preserve five labelled destinations, add meaningful icons and selected indicators, and expose the selected/current state on both platforms. Use compact bottom navigation; wider windows can use a rail when height/space permits. Provide per-destination headings and deliberate focus behavior.

**Acceptance:** navigation remains reachable before/after the full 70-listing data set at 320/390/600/840/1024 preview widths. Test native transitions around 599/600 and 839/840 dp, compact-height landscape, IME and edge-to-edge insets. Switching tabs preserves intended query/selection/context; AN-07 never replays a full list entrance.

### FE-08 — Implement needs capture and confirmation hierarchy

**Audit:** UX-01/03, M3-03. **Dependencies:** FE-02, FE-06, FE-07.

Group budget, mandatory specifications and tasks into a readable needs surface. Use “Chưa đặt yêu cầu” for an unknown constraint rather than “≥ 0 GB.” Keep current fields and explicit confirmation; preserve draft/confirmed separation and exact VND validation. Make errors and action controls reachable with IME and large fonts. First use emphasizes setting needs; returning use shows a compact confirmed summary above results.

**Acceptance:** cancellation, persistence failure and AI-proposed drafts do not silently change confirmed needs. After a successful commit, AN-05 links the confirmed summary to the newly computed result state; failure never plays the success transition. Budget and evidence caveats remain visible throughout.

### FE-09 — Make catalog results scannable and recoverable

**Audit:** UX-05, M3-03. **Dependencies:** FE-04, FE-07, FE-08.

Introduce explicit no-search-match, source/filter-empty, no-eligible and unresolved-evidence views derived from the stages of evaluation. Offer clear-search/clear-filter recovery without changing confirmed requirements. Cards separate concise identity, decisive specs, dated price, unknown total and source. Full raw titles/source details remain inspectable. Maintain exact listing identity; do not infer verified task fit from unknown data.

Use a measured list strategy (such as `FlatList` with stable IDs) for the current catalog, retaining accessibility order, selection and scroll position. Do not make smooth animation depend on rendering every card at once. Source refresh must not automatically reorder a reading target or replay entrances without explaining a result change.

**Acceptance:** clearing `zzzz-no-product` restores the same confirmed context; filter-empty differs from genuine no-fit; available count and updates are announced without chatter. AN-08 updates only the affected state and does not delay results for staggered reveals.

### FE-10 — Structure detail, provenance and unresolved facts

**Audit:** DATA-01, M3-03. **Dependencies:** FE-04, FE-06, FE-09.

Use labelled attribute rows and grouped source/date/cost evidence. Clearly distinguish known, missing and conflicting values. Separate current listings from historical snapshots. Preserve the seller/source action, dated-price caveat, share and save behavior, with confirmation of results in the active detail surface.

**Acceptance:** every displayed critical attribute maps to its source/evidence state; historical values never become a current-price claim; close/Back returns to the right list item. Expanded windows support list/detail context without stretching text across the entire screen. Use AN-04 rather than experimental shared-element routing.

### FE-11 — Implement meaningful two-item comparison

**Audit:** UX-06. **Dependencies:** FE-04, FE-07, FE-09, FE-10.

Provide a comparison selection tray with identities, count, remove and replace actions. Present aligned RAM, storage, historical price/date, unknown total and other available facts. On compact screens keep the two identities visible and use attribute-by-attribute paired values; wider screens show two aligned columns. Unknown/conflicting values remain neutral and explicit; highlighted differences do not imply a winner.

**Acceptance:** 0/1/2 selections have useful guidance; a third selection explains the limit; either device can be replaced from comparison. Users can identify three available differences without reopening each detail. AN-03/10 explain selection and assembly; exact strings, prices and current selection semantics update immediately.

### FE-12 — Complete saved decisions and settings

**Audit:** UX-01/02, M3-03. **Dependencies:** FE-03, FE-06, FE-10, FE-11.

Reuse readable historical cards, local save feedback and confirmed deletion. Empty saved state offers a useful return to discovery. Separate ordinary data settings from advanced service connection fields; use inline endpoint validation and connection feedback. Describe data age and local storage in language appropriate to the current app mode. Retain export/recovery behavior and protected-write handling.

**Acceptance:** save/restart/history/reuse-needs/delete flows retain exact snapshot identity and dates; current reevaluation requires confirmation. Connection failure preserves the last usable catalog and exposes recovery. AN-06/11 support feedback; settings do not require motion to remain understandable.

### FE-13 — Complete AI availability, waiting and recovery UX

**Audit:** AI-01. **Dependencies:** FE-04, FE-06, FE-10.

Represent checking, available, downloadable, downloading, unavailable, generating, cancelled, failed and completed states explicitly. Gate invocation on supported availability and a valid question. Show download/recheck/cancel actions only where relevant. Map errors to understandable messages and point to the actual source facts. Keep proposals reviewable and never apply them through an animation callback.

**Acceptance:** unavailable AI cannot trigger a guaranteed failing request; unsupported output/timeout/cancel retains requirements; stale replies stay rejected. Download/generation displays status and AN-09 with static equivalents, no invented percentage. Available-model device access is needed to accept the successful inference path; deterministic bridge simulations cover UI failure states only.

### FE-14 — Verify accessibility, adaptation and lifecycle

**Owners:** engineer with design/QA review. **Dependencies:** FE-08–13.

Exercise current UI on Android release builds: light/dark, default/1.3×/2.0× font settings, available larger display scale, TalkBack, external keyboard, effective touch targets, Back/IME, rotation, process recreation, background/resume and motion preference changes. Use compact/medium/expanded and compact-height windows. Reconcile unsupported OS/device behavior with the declared device matrix.

**Acceptance:** all audit cases have new evidence or a named unresolved issue; no test is passed from the old implementation's screenshots. CSS-pixel preview checks supplement Android dp/inset checks. Fresh animation recordings and native traces are required under the motion spec.

### FE-15 — Re-audit and package the frontend result

**Dependencies:** FE-14 and verified native motion performance.

Run the installed UX evaluator, antipattern, AI and flow skills against the implemented state, preserving their no-API limitations if applicable. Update current documentation without overwriting the dated 13 November audit baseline. Record source/package fingerprints, device/build settings, check results and remaining acceptance gaps; produce the review APK and equivalent preview.

**Acceptance:** AC-UX01–05 are mapped to actual evidence. Critical findings are fixed and rechecked; unknowns remain unknown. A new heuristic score is supplementary and cannot override a failed native criterion. Product acceptance remains a separate decision.

## 5. Screen and animation coverage

The [motion specification](../design/FRONTEND_MOTION_SPEC.md) defines AN-01–11, spring conversion, preview behavior, reduced motion, interruption and measurements. Motion is required in FE-01/06 and screen acceptance; phase 6 verifies it rather than introducing it.

| Surface | Required design change | Motion |
|---|---|---|
| Shared controls | Role-based hierarchy, accessible states and stationary targets | AN-01/02: press, selection and bounded shape changes |
| Needs/review | Inline validation, grouped choices, confirmed summary | AN-04/05: modal continuity and commit transition |
| Results | Compact summary, scannable cards, distinct recovery | AN-03/08: compare selection and stable result-state updates |
| Detail | Structured facts, local acknowledgement and provenance | AN-04/06: detail presentation and save result |
| Comparison | Pairwise attributes, persistent identities and replace | AN-03/10: tray and assembly hero interaction |
| Saved/settings | Safe deletion, useful empty states and connection feedback | AN-06/11: confirmation/status changes |
| AI/loading | Honest capability/status, bounded wait and cancel | AN-09: busy indicator with a static alternative |
| Navigation | Reachable labelled destinations and adaptive shell | AN-07: active indicator and restrained content transition |

## 6. Test and evidence contract

Use existing domain tests as protection, then add behavior-focused integration checks for the new UI boundaries. Do not rely on JSX snapshots or tests that simply repeat implementation constants. Choose the minimal compatible RN component-test harness in FE-01 if needed; retain current Node contract tests. Device behavior requires native execution.

| Case | Verify | Evidence layer |
|---|---|---|
| FE-T01 | Invalid budget and write failure stay visible inside the active modal; retry/cancel preserves state | Component integration + Android/preview |
| FE-T02 | Radio/task/source selection exposes roles, state and non-color indication | Component semantics + TalkBack/keyboard |
| FE-T03 | Single/bulk deletion cancellation, commitment, failure and restart | Store/UI integration + native |
| FE-T04 | Search/filter recovery restores results without changing requirements | Integration + preview/native |
| FE-T05 | Conflicting attributes stay unresolved consistently in filters/detail/compare/AI | Domain/adapter contract + UI |
| FE-T06 | Comparison supports 0/1/2 items, replacement and retained identities | Integration + compact/expanded native |
| FE-T07 | Native/preview tokens, light/dark contrast, accents and long amounts | Token-pair checks + visual review |
| FE-T08 | Navigation, scroll anchoring, modal origin, Back and IME remain usable | Native + preview |
| FE-T09 | Cancelled/reversed animations and live preference changes leave the correct final state | Motion adapter checks + recordings |
| FE-T10 | Animation callbacks cannot commit requirements, saves, deletions or AI edits | Transition integration + interrupted native runs |
| FE-T11 | AI availability/download/cancel/timeout/stale-output states | Controlled bridge integration + supported-device success |
| FE-T12 | Release animation responsiveness and frame deadlines meet proposed targets | Named physical-device traces; emulator for functional cases |

Commands at the appropriate phase: `npm run check`, `npm test`, `npm run build`, Android export/release build, dependency checks after adding native packages, then the named device/preview protocol. Run all required checks after each relevant code/dependency change; do not rebuild native solely for documentation edits.

Store new evidence under a newly dated `apps/adviser/verification/frontend-expressive/` run folder with source hash, exact package versions, APK hash, device/OS, viewport/density/font settings, motion preference, screenshots, short motion recordings and trace summaries. Label outcomes `passed`, `failed`, `blocked` or `not_run`; list the observed reason. Static screenshots cannot prove animation quality.

## 7. Traceability and completion

| Finding / criterion | Work | Acceptance cases |
|---|---|---|
| UX-01 | FE-02, FE-06, FE-12 | FE-T01/08/10 |
| UX-02 | FE-03, FE-12 | FE-T03/10 |
| UX-03 | FE-06, FE-08 | FE-T02/09 |
| UX-04 | FE-05, FE-06 | FE-T07/08 |
| UX-05 | FE-09 | FE-T04 |
| UX-06 | FE-11 | FE-T06 |
| PREVIEW-01 | FE-01, FE-07 | FE-T08 |
| M3-01 | FE-05, FE-06 | FE-T07 |
| M3-02 | FE-01, FE-06, all screen slices | FE-T09/10/12; AN-01–11 |
| M3-03 | FE-07–12 | FE-T06/07/08 |
| AI-01 | FE-13 | FE-T11 |
| DATA-01 | FE-04, FE-09–11, FE-13 | FE-T05 |
| AC-UX01 | FE-05–12 | Tokens, components and reviewed representative screens |
| AC-UX02 | FE-02/03/06/13/14 | States, semantics, feedback and control paths |
| AC-UX03 | FE-01/06/14 | All animation states, preferences and interruption evidence |
| AC-UX04 | FE-05/06/14 | Themes, contrast, glyphs, scaling, TalkBack and targets |
| AC-UX05 | FE-07/14 | Native adaptive/lifecycle cases and equivalent preview |

Frontend completion requires the fixes, coherent Expressive presentation, specified animation and no-motion equivalents, successful regression checks and current native evidence. Data/model/hardware gaps must be recorded explicitly and cannot be converted to passes by a visual review. The first implementation action is FE-00/01, followed by the blocking feedback/accessibility work.
