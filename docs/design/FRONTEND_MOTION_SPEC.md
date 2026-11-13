# Lựa Material 3 Expressive animation specification

Version 1.0 · 13 November 2026 · Proposed implementation contract for the [frontend plan](../planning/FRONTEND_IMPLEMENTATION_PLAN.md). Values labelled product choices are starting design parameters to validate on device, not claims that Google mandates those amplitudes or durations.

## 1. Intent and platform choice

Use motion to explain touch feedback, selection, navigation, waiting and committed changes. The hero interactions are **confirming needs** and **assembling a comparison**. Other surfaces use restrained feedback. Data and focus remain usable while animation runs.

Material separates spatial motion from effects, with fast/default/slow springs. Spatial motion covers transforms, bounds and shape; effects covers color/opacity. [Material motion](https://m3.material.io/styles/motion/overview/how-it-works)

Native adapter: SDK-compatible Reanimated 4.1.x plus Worklets, confirmed by a release-build spike on the current RN 0.81.5/New Architecture project. Installed Expo SDK 54 metadata recommends `react-native-reanimated ~4.1.1` and `react-native-worklets 0.5.1`; these packages are currently absent from the app manifest. Record exact resolved versions rather than assuming all newer Reanimated releases support this runtime. [Compatibility table](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/)

Preview adapter: CSS transitions/keyframes for the same props, states and token names. Use Material's web approximations for simple noninteractive transitions; reserve actual spring retargeting for the native adapter. Keep native worklet imports outside the Vite path. The preview validates state/layout and approximate motion, while Android validates performance and interruption. [Cross-platform motion specifications](https://m3.material.io/styles/motion/overview/specs)

Do not introduce experimental shared-element navigation or a gesture-driven sheet dependency for the initial delivery. Existing Android-backed modal semantics can host one controlled content transition. This is a focused component implementation rather than a general animation framework.

## 2. Spring roles and native mapping

Start from the following official Expressive token values (AndroidX `ExpressiveMotionTokens`, generated version `v0_14_0`, consulted 13 November 2026). The `Damping` values here represent the damping ratio ζ, not the damping coefficient expected by a physical spring implementation. [AndroidX token source](https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt)

| Project role | Stiffness k | Ratio ζ | Derived coefficient c, mass 1 | Primary uses |
|---|---:|---:|---:|---|
| `spatial.fast` | 800 | 0.6 | 33.94 | Small press/selection shape changes |
| `spatial.default` | 380 | 0.8 | 31.19 | Tray and hero-container transitions |
| `spatial.slow` | 200 | 0.8 | 22.63 | Larger deliberate presentation, only where reviewed |
| `effects.fast` | 3800 | 1.0 | 123.29 | State-layer/indicator effects |
| `effects.default` | 1600 | 1.0 | 80.00 | Surface/status effects |
| `effects.slow` | 800 | 1.0 | 56.57 | Broader scrim/surface emphasis when needed |

Adapter equation: **c = 2 × ζ × √(k × m)**. Set `mass: 1` explicitly, pass k as `stiffness` and c as `damping` in the physics branch. Do not mix this with the duration/damping-ratio branch. Reanimated's documented defaults differ from these inputs, including mass. This conversion is an engineering starting model; validate visual response and interruption on the pinned library rather than asserting identical solvers. [withSpring API](https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring/)

Store k/ζ/m and derive c in one adapter. Preserve source attribution and record a pinned source revision during implementation. Do not copy the old global `MOTION` object's numbers as proof of a complete motion scheme. Override motion by role, not with arbitrary spring constants inside screens.

Effects must stay bounded: opacity within [0,1], color channels valid and paired foreground/background readable. Avoid animating a foreground through an inaccessible intermediate pairing. Prefer an atomic role-pair switch plus a bounded state-layer fade when a color tween would reduce contrast. Non-color selected/error indicators and semantic state update immediately.

For the preview, the baseline Material Expressive approximations are:

| Role | CSS cubic-bezier | Duration |
|---|---|---:|
| `spatial.fast` | `(0.42, 1.67, 0.21, 0.90)` | 350 ms |
| `spatial.default` | `(0.38, 1.21, 0.22, 1.00)` | 500 ms |
| `spatial.slow` | `(0.39, 1.29, 0.35, 0.98)` | 650 ms |
| `effects.fast` | `(0.31, 0.94, 0.34, 1.00)` | 150 ms |
| `effects.default` | `(0.34, 0.80, 0.34, 1.00)` | 200 ms |
| `effects.slow` | `(0.34, 0.88, 0.34, 1.00)` | 300 ms |

These are documented approximations for simple web transitions, not hard durations for physical springs. Do not apply a spatial overshooting curve to opacity. [Material specs](https://m3.material.io/styles/motion/overview/specs)

## 3. Animation inventory

Product amplitudes below are deliberately small starting values. Refine them through the native spike and record changes with evidence. A fixed accessible hit region surrounds any transforming decorative/content layer.

| ID | Trigger and animation | Token / starting treatment | Reduced-motion result |
|---|---|---|---|
| AN-01 | Press/release on primary and secondary controls | Native ripple/state layer; inner content scale 1→0.98 on press, spring return; `spatial.fast` plus bounded effects. Do not scale text fields or the hit region. | Immediate pressed state; no scaling or ripple movement |
| AN-02 | RAM/storage/source/task selection | Selected icon/state appears immediately; inner rounded container changes radius, e.g. 24→16 dp, with `spatial.fast`; paired surface treatment uses effects. Neighbor targets stay stationary. | Immediate icon, semantics and selected surface/shape |
| AN-03 | Add/remove compared item | Selection/count immediate; tray content enters from at most 8 dp with `spatial.default`; reserve a tray slot to avoid covering focused content. Remove retargets to the current list, never a stale count. | Tray and count update immediately, with a concise announcement |
| AN-04 | Needs/detail/confirmation overlay open/close | One controller owns scrim effects and content presentation; compact surface may use a ≤24 dp entry offset with `spatial.default`; large full-screen text-heavy detail can use effects only. Avoid native slide plus custom slide. | Immediate presentation/dismissal and correct focus transfer |
| AN-05 | Confirmed needs commit — hero 1 | After successful persistence, replace the draft with the confirmed summary and result state; animate the summary container/indicator using `spatial.default`, without animating numbers. The new data is available immediately. | Immediate committed summary/results with the same acknowledgement |
| AN-06 | Save success/failure and form errors | Stable local status region; `effects.fast` fade where useful. Invalid-field text/state appears immediately; no shake. Save check only follows successful persistence. | Static visible feedback and announcement |
| AN-07 | Navigation destination changes | Selected indicator uses `spatial.fast`; short content effect transition, no directional slide across unrelated tabs. Preserve destination context and deliberate focus. | Immediate destination and active indicator |
| AN-08 | Search/filter/refresh state updates | Render actual new results immediately; bounded effects on the summary/state message. Preserve list anchor where appropriate, stable keys, and no entrance animation for every catalog item. | Immediate results and status |
| AN-09 | Loading/download/generation | Small custom M3-inspired circle/squircle indicator with bounded shape motion while genuinely busy; keep descriptive status and Cancel available. No invented completion percentage or numeric progress animation. | Static busy glyph/status; Cancel remains available |
| AN-10 | Comparison opens or replaces one device — hero 2 | Paired headers/selection tray establish continuity via `spatial.default`; small opacity emphasis marks changed attributes. Keep the identity labels and the other column fixed; no bouncing prices/spec values. | Immediate comparison/replacement; announce changed identity |
| AN-11 | Confirm deletion / connection status / history view | After persistence, update stable content/status with restrained effects. Opening a confirmation uses AN-04; do not collapse items before successful deletion. History age/source labels remain constant. | Immediate final content and the same feedback |

No animation should imply verified fit, current stock, a better price or AI certainty. Do not animate a monetary counter through values the system has never asserted. The loading treatment is a custom adaptation; it is not claimed to reproduce every official Material loading-indicator shape.

## 4. State, focus and interruption contract

- Business state owns visual targets. Taps, validation, persistence and AI events update the correct state independently of animation completion callbacks. Completion callbacks may clean presentation resources; they must not commit requirements, saves, deletion or model edits.
- Retarget from the current visual value on fast repeated presses/selections. On a replaced request or dismissed overlay, cancel obsolete animation and pending presentation work. Never allow an old callback to change the current surface.
- Keep the latest pending-action identity and persistence/request revision at the controller boundary. A successful old operation cannot animate success onto a newer item or draft.
- Focus moves when the destination/field exists and is operable. A long entrance must not delay focus or trap keyboard input. Use modal visibility/mount readiness, with a deterministic no-motion path. Restore the origin when closing unless that item no longer exists; then focus the nearest meaningful heading/control.
- Keep semantic state and result text available as soon as authoritative state changes. Animated-out content must not remain a second selectable/accessible copy. Announce meaningful state changes once, not on animation frames.
- Prevent overlays/trays from covering fields, dialog actions or navigation when IME/insets/font size change. Geometry changes must not leave an in-flight target offscreen; finish/cancel presentation and recompute the layout.
- Stop repeating busy motion on background/unmount or when no longer busy; never replay hero transitions on resume, refresh, rotation or restored historical state merely because components remount.

## 5. Reduced/disabled motion and preference changes

Provide `useMotionPreferences` as the app source of truth. Begin conservatively with no spatial animation while preference is unknown; query `AccessibilityInfo.isReduceMotionEnabled()`, listen for `reduceMotionChanged`, and recheck on foreground resume. RN 0.81 documents Android transition-animation-off behavior in that event. [React Native 0.81 API](https://reactnative.dev/docs/0.81/accessibilityinfo)

Pass an explicit reduced-motion policy through every adapter animation, including loops and modal entry/exit. If reduction turns on during motion, cancel transforms/shape loops and snap to their logical targets; retain all selected, loading, error and success information. A preference change must not invoke the action again. The reduced path uses immediate state changes by default, with no essential transient timing dependency.

Do not rely only on Reanimated's `useReducedMotion`: its documented value reflects startup and preference changes do not cause a rerender. Validate the pinned 4.1.x behavior as part of the adapter spike. [Reanimated preference hook](https://docs.swmansion.com/react-native-reanimated/docs/device/useReducedMotion/)

The web adapter observes `prefers-reduced-motion` changes and disables its transitions/keyframes consistently. Avoid a second CSS animation that escapes the app policy. Keep static status feedback visible long enough to understand and respect accessibility timeouts where transient feedback is used.

## 6. Performance and proof

Prefer UI-thread transforms/opacity and scoped shape changes. Avoid a spring on every row, text/number interpolation, large animated shadows, or whole-list layout animation during a refresh. Test the current full catalog plus selected comparison and an active modal. Record any platform-specific limitations in the component matrix.

Proposed project targets, to confirm after the phase 0 device baseline:

- Semantic state/action feedback starts promptly; measured tap-to-visible-feedback p95 ≤100 ms in the defined release test workload.
- For each isolated animation scenario on the named baseline physical device, at most 5% of app-rendered frames miss their display deadlines during active animation windows. Use native frame-timeline/jank measurements; record refresh rate and raw counts rather than applying a fixed 16.7 ms rule to every device.
- No animation-induced UI stall above 100 ms in the measured scenarios. Separate cold-start/model inference/network waiting from animation cost and still report their observed delays.
- The no-motion journey completes all the same actions with correct state, focus, evidence and confirmation. Passing this path does not replace normal-motion testing.

For each AN case, run 10 repetitions after a documented warm-up, with normal settings on the baseline release device. Record taps/state timing and a native trace; inspect rapid reversal, close-during-entry, background/resume and rotation separately. Repeat functional checks with reduced motion and Android animations disabled. If tooling cannot isolate a metric, mark it unknown and retain the raw observation; do not infer a pass from a smooth video.

Keep a short recording of both hero interactions, representative controls, loading/cancel and the reduced-motion equivalents; include intermediate states and interruption. Evidence metadata must identify build/source/package hashes, device/OS, refresh rate, font/display settings, preference and scenario. Compare against the same baseline workload after changing motion tokens.

## 7. Animation acceptance checklist

1. AN-01–11 implemented or an explicit, reviewed platform adaptation recorded; native and preview state contracts agree.
2. Shared role mapping and coefficient conversion documented and tested; no accidental reliance on library default mass or a direct ratio-to-coefficient copy.
3. Motion/disabled-motion preferences are honored at startup, during an animation and after resume, with listeners cleaned up.
4. Interrupted animations leave the latest correct state, preserve accessible hit targets and focus, and never perform a delayed business action.
5. Effects preserve contrast, numerical/evidence strings remain truthful, and history/unknown states do not use success animation.
6. Named-device recordings and release traces satisfy the agreed targets; unsupported cases remain explicit acceptance gaps.
