> Historical implementation/evidence record. The active unified 0.5.0 runtime, service setup and SDK matrix are defined in the [application contract](../../apps/adviser/UNIFIED_APP.md). Earlier startup and port instructions below describe their recorded release.

# Frontend implementation and verification

13 November 2026. The audit-driven frontend changes are implemented and packaged. Native regression and configuration checks passed on the named emulator. Product acceptance and physical-device accessibility/performance evidence remain separate.

## Delivered behavior

- Shared fallback light/dark palettes, semantic foreground/background pairs, essential outlines, focus treatment, shape/spring values and generated preview CSS.
- Android 12+ system-tonal color adapter. The app applies a system scheme only if its text and essential-outline pairs pass contrast validation; otherwise it keeps the fallback. Both native light and dark system palettes were visually inspected on the emulator.
- Native Reanimated 4.1.7 / Worklets 0.5.1 press, selection-shape and surface motion. Web-specific adapters keep native worklets outside Vite. Explicit mass and damping-coefficient mapping retain the documented Material spring model.
- Confirmed-needs summary transition, comparison selection/assembly transitions, modal presentation and a bounded shape-changing busy indicator. Motion preferences are queried, observed live and rechecked on resume. Background/unmount cancels repeating presentation work. Animation completion does not perform business actions.
- Accessible checked radio/checkbox states, visible non-color selection indicators, stationary minimum 48-unit target regions, keyboard focus treatment and labelled vector navigation icons.
- Field-local invalid-budget feedback, focus/scroll recovery, fixed modal save/error acknowledgement, and duplicate-pending-action guards.
- Explicit confirmation and cancellation for single/bulk history deletion through the existing serialized store.
- Search/source-specific empty-state recovery and a virtualized results list with stable listing IDs and persistent navigation.
- Adaptive paired comparison rows, explicit unknown values, model identity cards and remove/replace controls. The expanded layout was exercised at 1200 dp width.
- Explicit title/specification conflict detection shared by cards, comparisons, constraint assessment and AI fact selection. Conflicting attributes become unresolved; raw observations and saved snapshots are retained. The detector covers explicit GB/GB and GB/TB title pairs, not every possible retailer naming format.
- AI availability gating, download/generation status, cancellation and readable fallback copy. Successful Gemini Nano inference still needs a supported device; the emulator exercises unavailable-state behavior and contract tests cover controlled responses.

## Audit closure evidence

| Finding | Current result |
|---|---|
| UX-01 hidden modal feedback | Native invalid-budget and save acknowledgement checks pass. A visible-placement failure found during QA was fixed before the accepted run. |
| UX-02 immediate deletion | Native Cancel and explicit Confirm paths pass; only a disposable saved decision is removed by the regression script. |
| UX-03 color-only selection | Native checked state and visible selection indicators pass. Full TalkBack reading/grouping and external-keyboard traversal remain unreviewed. |
| UX-04 essential contrast | Fallback pairs pass tests; dynamic schemes are gated by the same validation. Native keyboard focus appearance has source support, not a complete physical-keyboard certification. |
| UX-05 misleading empty search | Native no-match and clear-search recovery pass without changing confirmed needs. |
| UX-06 prose comparison | Paired attribute presentation, identities and replacement controls implemented; compact and expanded native captures recorded. |
| PREVIEW-01 inaccessible navigation | Root/scroll constraints and explicit selected states implemented; production build and development dependency optimization pass. Browser interaction verification remains blocked by the earlier automatic review. |
| M3-01 competing active styling | Active native/preview colors share the Expressive theme source. Shared primitives centralize interaction styling; a wholesale rewrite of historical demo screens was unnecessary. |
| M3-02 motion | Native adapters, selected shapes, summary/comparison transitions, busy indication and no-motion operation implemented. Normal-motion recording and disabled-system-animation functional checks pass. Physical timing targets remain unmeasured. |
| M3-03 adaptation | Bounded content widths, persistent navigation, virtualized results and expanded paired comparison implemented. Default and 2.0x font samples recorded. |
| AI-01 guaranteed failing invocation | Generation is gated by model availability and a nonempty question; raw errors are replaced with actionable fallback copy. |
| DATA-01 contradictory specifications | Two audited conflicts are covered by explicit tests; unresolved facts cannot become trusted constraint or AI assertions. |

## Verification results

- `npm run check`: passed.
- `npm test`: 67 passed, 0 failed, including conflict propagation, reproducible total cost (`REAL-09`), sibling configuration lookup (`REAL-10`), budget upgrade candidates and observation age (`REAL-11`), task hardware guidance (`REAL-12`), quotation intake (`REAL-13`), Vietnamese i18n string table (`I18N-01`), report submission (`CLIENT-05`), and theme validation (`THEME-01`).
- `npm run test:adviser-service`: 16 passed, 0 failed (including `GOV-01`–`GOV-04` governance, RBAC, report triage, backup/restore, durable restart persistence, telemetry redaction, and `PILOT-01` fixed-snapshot evaluation across 8 buyer cohorts). The initial sandbox run could not open localhost sockets; the authorized rerun passed.
- `npm run build`: production preview and standalone HTML passed. Safe-area/SVG directive and preview chunk-size warnings remain build warnings.
- Vite forced dependency optimization/development startup: passed; the earlier native-codegen resolution failure did not recur.
- Android release: ARM64 + x86-64 build passed. APK signature verified, installed and launched on the emulator.
- Native flow regression: navigation, checked semantics, invalid input, draft cancellation, empty search recovery, two-item comparison, save acknowledgement and delete Cancel/Confirm passed.
- Configuration regression: 2.0x text, disabled Android animation settings and 1200 dp expanded comparison passed. Original font, animation, size and density settings were restored.
- Final refinement checks: successful needs commit/acknowledgement, normal-motion selection and dark-theme capture passed. The emulator keyboard's stylus tutorial was isolated as test interference; its temporary handwriting preference was restored to the original unset value.

The full flow run preceded the final needs-summary-animation and title-height refinement. The packaged APK was subsequently exercised by the configuration and committed-needs/motion checks. A final independent press-release cleanup was then rebuilt and checked separately on the packaged APK. Screenshots and JSON results identify their individual cases; they do not imply every possible combination was tested.

## Artifacts and limitations

- [Updated demo APK](../../apps/adviser/artifacts/lua-adviser-demo.apk), containing ARM64 and x86-64 libraries; existing demo signing configuration.
- [APK manifest](../../apps/adviser/artifacts/lua-adviser-demo.manifest.json).
- [Source/build/device evidence manifest](../../apps/adviser/verification/frontend-expressive/manifest.json).
- [Native screenshots, motion recording and check results](../../apps/adviser/verification/frontend-expressive/README.md).

APK SHA-256: `560ff20ae8fa60e3b0e6aedf25cd1100a1e508e8b78d1b7be18355d063f559b5`.

No physical phone, complete TalkBack/switch-access/external-keyboard protocol, representative buyer research or physical-device animation performance target is claimed. Emulator frame statistics are retained as raw observations. Those external acceptance items remain open under AC-UX01–05; implementation and successful builds do not automatically accept product stage gates.

Implementation follows the existing controller/store contracts and uses focused component extraction rather than replacing the application with a new routing/state architecture. The earlier audit, plan and dated baseline evidence remain available for comparison. Existing unrelated working-tree changes were preserved.
