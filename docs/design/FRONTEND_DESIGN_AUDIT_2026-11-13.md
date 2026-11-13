# Lựa frontend design audit — 13 November 2026

**Verdict: the current frontend does not yet satisfy the project's Material 3 Expressive acceptance criteria.** Useful foundations are present, but several confirmed interaction/accessibility defects and missing design-system behaviors prevent acceptance. This is an audit of the current implementation, not a redesign, certification, or product-owner sign-off.

## Scope and evidence

- Baseline Git HEAD: `d2f26ee62e50d661e30bc2aa271ae061f9e4e823`, with extensive pre-existing uncommitted work. Reviewed the working tree, not just HEAD.
- Both [Android entry](../../apps/adviser/index.js) and [web entry](../../apps/adviser/src/main.web.tsx) import [AdviserApp.tsx](../../apps/adviser/src/AdviserApp.tsx). The old `AndroidApp.tsx` and prior purple/lime implementation are not the active UI.
- Requirements: lowercase [brd.md](../../brd.md), AC-UX01–05. Research: [Material 3 Expressive synthesis](MATERIAL_3_EXPRESSIVE_RESEARCH.md).
- Applied the installed `uxui-evaluator`, `interface-auditor`, `ai-interface-reviewer`, and `flow-checker` skills in their internal-knowledge modes. No `UXUI_API_KEY` was present. [Installation and limitations](UX_SKILLS.md).
- Rebuilt the production web preview and inspected dark-mode screens at 390×844, plus 320×720 and 1024×768 layout samples. Exercised needs editing, invalid input, empty search, comparison, product detail, unavailable AI, save and settings. Screenshots are browser evidence, not Android screenshots.
- [Evidence directory](../../apps/adviser/verification/m3-expressive-2026-11-13/), [source hashes](../../apps/adviser/verification/m3-expressive-2026-11-13/source-hashes.json), and [reproducible source/contrast measurements](../../apps/adviser/verification/m3-expressive-2026-11-13/source-measurements.json).

No application behavior or design source was changed for this audit. The build regenerated the CSS token file with identical content; its original CRLF line endings were restored. Added only skills, review documents and evidence artifacts. Existing user changes were preserved.

## Findings, in fix order

### UX-01 — Error and save feedback are outside the active modal (P1 / critical)

**Evidence:** [AdviserApp.tsx](../../apps/adviser/src/AdviserApp.tsx), `confirm()` around line 265, `setNotice` at line 304, notice rendering around line 593, and modal rendering at line 493. In the browser, enter `0` for budget and confirm: the form remains open without an inline error or invalid state. The error becomes visible only after closing the form. Saving a detail similarly produces no success feedback within that detail; the notice appears on the underlying screen. [Invalid-budget capture](../../apps/adviser/verification/m3-expressive-2026-11-13/invalid-budget-390-dark.jpg), [semantic evidence](../../apps/adviser/verification/m3-expressive-2026-11-13/form-semantics.json).

**Why it matters:** users cannot tell why confirmation failed and may repeatedly save because acknowledgement is hidden. Native modal layering is a source-based concern; this exact runtime failure was reproduced on web.

**Fix/recheck:** put validation beside the budget field within the modal, announce it, move focus to the invalid field, and keep the draft. Display save success/failure in the active detail surface. Test zero, empty, decimal, excessive budget and persistence failure. A user must recover without closing the dialog to discover the error.

### UX-02 — History deletion has no recovery or confirmation (P1 / critical)

**Evidence:** `AdviserApp.tsx:711–718` filters a saved entry immediately; `781–785` persists an empty history directly. There is no undo state, confirmation, trash or restore flow. Settings and saved controls were inspected; deletion was not invoked during the audit.

**Why it matters:** a mistaken tap can remove decisions and their historical evidence. This is a source-confirmed data-loss risk, not a claim that user data was deleted.

**Fix/recheck:** single-delete with a reliable undo window, or explicit confirmation with clear item identity; bulk-delete must show the number of records and a cancel path. Verify cancel, confirm, undo and restart behavior, including failed persistence.

### UX-03 — Requirement choices communicate selection only through color (P1 / critical)

**Evidence:** the shared `button()` at `AdviserApp.tsx:368–399` exposes a button role and disabled state only. RAM/storage/task/source callers express selection through the `secondary` color flag. The needs form's DOM has no checked/selected/pressed state on the options. Labels such as “16 GB” and “Lập trình” do not change when selected. [Form semantics](../../apps/adviser/verification/m3-expressive-2026-11-13/form-semantics.json).

**Fix/recheck:** use a labelled radio group for single-select RAM/storage/source choices and checkboxes or toggles for tasks. Add a non-color visual selection indicator. Verify selected state, group name and navigation with TalkBack and a keyboard. The bottom navigation declares selection in RN source, but the inspected web DOM did not expose `aria-selected`; verify that separately rather than assuming native behavior.

### UX-04 — Input boundaries and dark keyboard focus have insufficient contrast (P1 / critical)

**Evidence:** source-derived opaque-color ratios below. The empty inputs rely on their boundary/fill to show the editable area. The web focus outline remains the old purple `#59409D`, despite the active green theme. It was visible during the empty-search review but did not meet 3:1 against the surrounding dark surfaces.

| Pair | Light | Dark | Assessment |
|---|---:|---:|---|
| Main text / card | 13.91:1 | 12.11:1 | Pass normal-text threshold |
| Secondary text / card | 6.12:1 | 6.96:1 | Pass normal-text threshold |
| Action text / accent | 7.52:1 | 8.30:1 | Pass normal-text threshold |
| Input outline / card | 1.41:1 | 1.65:1 | Below 3:1 |
| Input outline / background | 1.29:1 | 2.01:1 | Below 3:1 |
| Focus outline / card | 7.94:1 | 1.82:1 | Dark fails |
| Focus outline / background | 7.27:1 | 2.22:1 | Dark fails |

Text thresholds and inactive-control exceptions follow [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html); essential control/state cues follow [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). These findings concern essential field boundaries and the focus indicator, not decorative card borders. The light palette was measured from source, not visually exercised. No disabled-button contrast failure is asserted.

**Fix/recheck:** introduce separate essential-outline and theme-aware focus roles; test the real adjacent colors in both themes. Retain the already good text contrast. Reproduce the measurements with `node apps/adviser/verification/m3-expressive-2026-11-13/inspect-source.mjs`.

### UX-05 — Empty search misdirects recovery toward changing requirements (P2 / warning)

**Evidence:** entering `zzzz-no-product` yields “Không có tin đáp ứng các tiêu chí đã biết” and “Chỉnh nhu cầu.” `AdviserApp.tsx:653–660` uses the same message whenever the post-search/post-source-filter visible list is empty. [Screenshot](../../apps/adviser/verification/m3-expressive-2026-11-13/search-empty-390-dark.jpg), [DOM](../../apps/adviser/verification/m3-expressive-2026-11-13/search-empty-dom.txt).

**Fix/recheck:** distinguish no search match, source/filter-empty and no eligible candidates. Offer “Xóa tìm kiếm”/“Xóa bộ lọc” before changing confirmed needs. Clearing a search must restore the same requirements and results without relaxing a budget.

### UX-06 — Comparison requires remembering values across large prose cards (P2 / warning)

**Evidence:** `AdviserApp.tsx:444–445,665–694` renders two `summary()` strings as stacked cards. Product identity, numbers, raw ISO timestamps, full URLs and caveats occupy the same text treatment. There are no aligned attributes, difference emphasis, or remove/replace controls on the comparison screen. [Comparison capture](../../apps/adviser/verification/m3-expressive-2026-11-13/compare-390-dark.jpg).

**Fix/recheck:** show aligned RAM, storage, price-observation and unknown-cost rows with both identities persistently visible; provide remove/replace actions. Move full URLs under a labelled source affordance while retaining access. On expanded windows, place comparable values side by side. Unknown must never look like a favorable match. Test whether a reviewer can identify three differences without returning to the result list.

### PREVIEW-01 — Bottom navigation falls below the complete catalog (P1 for preview validation)

**Evidence:** at 390×844, the measured page was 20,124 CSS px tall and tabs began at y=20,056.5 after the invalid-budget notice was closed. Navigation sits after the results in the web document, and the screen opens without it visible. [Layout measurements](../../apps/adviser/verification/m3-expressive-2026-11-13/home-layout.json). This was observed on the built preview; it is not evidence that Android has the same layout defect.

**Fix/recheck:** give the web root and safe-area wrapper a bounded flex layout with a scrollable content pane and stable navigation. Verify all five destinations remain reachable at 320/390/1024 widths without traversing every result. Browser-selected tabs also need exposed active state.

### M3-01 — The active implementation bypasses the shared design system (P2)

**Evidence:** the active component defines seven local colors at `AdviserApp.tsx:73–95`, uses local font sizes/radii, and does not import `design-tokens.ts`. The preview CSS still imports the older purple/lime tokens. Thus existing token documentation and prior verification describe a different implementation. [Source measurements](../../apps/adviser/verification/m3-expressive-2026-11-13/source-measurements.json).

**Fix/recheck:** use one role-based theme for native components and preview CSS, including typography, spacing, shape, elevation and interaction states. Document deliberate custom values. The green palette itself is not a defect.

### M3-02 — Missing state feedback, motion mapping and reduced-motion handling (P2)

**Evidence:** `button()` has a static style without pressed-state styling or Android ripple. The active file has no spring tokens or reduced-motion query/listener; every modal requests `animationType="slide"`. This is a source-confirmed implementation gap; the OS's final animation behavior was not tested.

**Fix/recheck:** define pressed/focused/selected/error/loading treatments and document a spatial/effects motion mapping. Read reduced-motion state and react to changes; all tasks must work with movement disabled. Use selective motion on confirming needs and comparison selection. Validate on Android with normal and disabled animation settings. [Motion guidance](https://m3.material.io/styles/motion/overview/how-it-works)

### M3-03 — Weak adaptation and insufficient decision hierarchy (P2)

**Evidence:** no window-size handling exists in the active component. At 1024×768 it remains a stretched single column with wide controls. The first result begins below the initial 390 px-wide screen, and “≥ 0 GB” exposes an internal representation of unknown requirements. Product cards lack a distinct hierarchy for decisive facts versus dense imported titles. Navigation has labels and five destinations but no icons. [390 px home](../../apps/adviser/verification/m3-expressive-2026-11-13/home-390-dark.jpg), [1024 px home](../../apps/adviser/verification/m3-expressive-2026-11-13/home-1024-dark.jpg).

**Fix/recheck:** distinguish the first-use needs prompt from returning-user results, keep a compact confirmed summary, and use intentional type roles. Replace unknown numeric defaults with understandable labels. Add an adaptive content/navigation layout and test breakpoint transitions. The initial viewport observation is evidence of density, not proof of user abandonment.

### AI-01 — Unavailable AI still offers an action that is guaranteed to fail (P2 / warning)

**Evidence:** `Hỏi AI` is disabled only for busy or failed boot, not `aiStatus`. On web, the status says Android AI is required but the action remains enabled. Submitting produces `Error: LOCAL_AI_UNAVAILABLE`. The fallback says evidence is “below” although the facts appear above the AI section. [AI failure capture](../../apps/adviser/verification/m3-expressive-2026-11-13/ai-unavailable-390-dark.jpg).

**Fix/recheck:** gate invocation on availability, show a clear download/recheck path where appropriate, and preserve source facts as a usable fallback. Map errors to user-facing messages and link/scroll to the actual facts. Test available, downloadable, downloading, unavailable, timeout, cancellation and unsupported-output states. Successful inference was not tested.

### DATA-01 — Contradictory specifications are displayed without identifying the conflict (P1 dependency)

**Evidence:** `real-catalog.json:908` names an Acer with 512 GB, while its `storage` is 2048; both appear in the comparison. At line 1188 the MacBook title says 8GB/256GB while `ram` is 256. This confirms an internal inconsistency, not which source value is correct. No seller-site verification was performed.

**Fix/recheck:** quarantine conflicting extracted attributes or mark the specific attribute unresolved; preserve the original evidence for review. The general “unreviewed” caveat is useful but does not explain which value conflicts. Do not silently select a preferred number from the title. This is a data-to-UI dependency and is not included in the visual-design score.

## Material acceptance matrix

| Project criterion | Current assessment | Evidence needed for acceptance |
|---|---|---|
| AC-UX01: one token set and purposeful hierarchy | Fail: active local styling and old preview tokens diverge | Shared documented roles; representative needs, result, detail, comparison and saved screens reviewed |
| AC-UX02: states and accessible semantics | Fail: UX-01/03 and static press styling | Selected/checked/disabled/error/loading/unknown state review plus TalkBack/keyboard checks |
| AC-UX03: consistent motion and preferences | Fail in source; native runtime unknown | Documented motion scheme, interruption and reduced-motion device evidence |
| AC-UX04: themes, contrast, typography, targets | Partial: text contrast passes; essential boundaries/focus fail; remaining native checks unknown | Both themes, fallback/dynamic-color behavior, Vietnamese text, long VND, font/display scaling, effective 48 dp targets |
| AC-UX05: adaptive Android journey and equivalent preview | Not accepted: source lacks adaptation; preview navigation fails; native tests unavailable | Compact/expanded native windows, IME/insets, Back, rotation/recreation and state preservation |

## What works

- A clear needs-editing CTA, visible labels and minimum 48-unit control heights in source; effective native target dimensions still need measurement.
- Good default opaque text contrast in both palettes, readable Vietnamese text in inspected dark previews, and grouped content with consistent spacing within the active component.
- Honest dated-price/source caveats; unknown total cost, stock and task suitability remain explicit rather than becoming a verified recommendation.
- Draft requirements require confirmation. AI proposals go to a reviewable draft rather than silently changing requirements.
- Source and unit tests support cancellation, stale-output rejection, checked-fact rendering, preservation of historical snapshots, and protected writes after load failures. These do not prove visual or assistive-technology behavior.

## Checks completed and limits

| Check | Result |
|---|---|
| `npm run build` | Passed: token generation, TypeScript, Vite and standalone HTML; safe-area `use client` warning |
| `npm test` | 57 passed, 0 failed |
| Vite development server | Failed dependency optimization: RN safe-area native codegen import aliased to missing web path; production build/preview worked |
| Browser console | Repeated `BackHandler is not supported on web` messages; Android Back must be tested natively |
| Current browser review | Dark-mode home, needs, invalid budget, empty search, two-item comparison, detail/AI-unavailable, saved and settings inspected |
| Contrast | Reproducible source measurement for active light/dark palettes and web focus; not a full rendered accessibility audit |
| Android availability | `adb devices -l` returned an empty list after the server started; no connected device/emulator |
| Native acceptance | Not performed: no new APK build/install, TalkBack, IME, external keyboard, large text, rotation, recreation, dynamic color or animation preference testing |
| Buyer research | Not performed; no conversion, decision-time or comprehension improvement claimed |

The last optional browser interaction was stopped by automatic approval review because of a usage limit. No attempt was made to bypass it. Existing evidence was retained; a later continuation restored the temporary viewport override. Light-mode rendering and further browser focus/target checks remain unverified. The temporary preview runs were used only for this audit.

## Structured skill outputs and interpretation

- [UX evaluator JSON](../../apps/adviser/verification/m3-expressive-2026-11-13/uxui-evaluator.json): focused core-flow review of UX-01–06; 26/100 (`poor`) under the skill's deduction rule: four critical ×15 and two warnings ×7. This is a deterministic heuristic tally of the listed findings, not a measured usability score or whole-product certification.
- [Interface auditor JSON](../../apps/adviser/verification/m3-expressive-2026-11-13/interface-auditor.json): observable feedback, selection/contrast and recovery antipatterns; no invented overload thresholds or abandonment rates.
- [AI reviewer JSON](../../apps/adviser/verification/m3-expressive-2026-11-13/ai-interface-reviewer.json): focused AI invocation/recovery review; useful trust controls are credited, native success remains unknown.
- [Flow checker JSON](../../apps/adviser/verification/m3-expressive-2026-11-13/flow-checker.json): requirements-form checklist, with failures and unknowns explicitly distinguished.

Proposed fix order: UX-01–04 and DATA-01; preview navigation and state behavior; shared tokens/adaptation/comparison; selective expressive motion; then the complete Android acceptance matrix and representative buyer sessions. This audit records the work to do; it does not mark any of these fixes complete.
