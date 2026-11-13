# Material 3 Expressive: research and application to Lựa

Research date: 13 November 2026. Scope: the Android React Native adviser and its HTML/CSS preview. This is a design research synthesis and proposed implementation direction, not an implemented redesign or Material certification.

## What the update means

M3 Expressive extends Material 3. Its purpose is to direct attention and make meaningful interactions feel more engaging. The supplied launch article describes seven tactics: varied shapes, richer color hierarchy, typographic emphasis, content grouping, natural motion, context-sensitive components, and selective combinations that create a hero moment. It recommends only one or two such moments rather than constant visual excitement. [Material's launch article](https://m3.material.io/blog/building-with-m3-expressive)

**Application to this product:** emphasize confirming needs and understanding a decisive comparison. Repeated product cards should support scanning. The green brand palette can remain; changing to a particular hue, adding blobs, or making every card bouncy would not establish compliance. A restrained adviser can still be expressive.

Google reports 46 studies and more than 18,000 participants, using methods including eye tracking, surveys, experiments and usability testing. Its reported improvements in finding key elements concern studied designs and tasks. They are evidence for testing purposeful emphasis, not a promise that this app becomes four times faster. Buyer comprehension and decision quality need their own evaluation. [Google Design research](https://design.google/library/expressive-material-design-google-research)

Google's designers also describe expression as compatible with both quiet and energetic interfaces. This supports treating tone as a product choice. For a buying adviser with incomplete evidence, confidence should come from understandable constraints and sources, rather than celebratory claims of a perfect match. [Inside M3 Expressive](https://design.google/library/design-notes-material-3-expressive-liam-spradlin)

## Color: semantic roles before decoration

Material pairs foreground roles with their corresponding backgrounds, such as `onPrimary` with `primary`. Surface containers organize hierarchy; primary, secondary and tertiary accents carry different emphasis; error roles communicate failures. Custom components need the same role mapping. Static and dynamic schemes both use these roles. [Color roles](https://m3.material.io/styles/color/roles)

**Proposed Lựa mapping:** a shared theme should define `surface`, several surface-container levels, `onSurface`, `onSurfaceVariant`, `primary/onPrimary`, `primaryContainer/onPrimaryContainer`, `secondaryContainer/onSecondaryContainer`, `outline`, `outlineVariant`, and error pairs. Use primary for confirmation, secondary container for selected filters, and an explicit text-plus-icon treatment for unverified evidence. Keep unknown separate from success. Separate an essential input outline from a subtle card divider.

Dynamic color is an enhancement to implement where supported and validate against the same roles. A documented, accessible fallback is essential under this project's AC-UX04. Neither arbitrary green colors nor a wallpaper palette automatically satisfies the requirement.

## Typography: readable hierarchy and meaningful numbers

Material's scale separates display, headline, title, body and label roles, each with size variants. Short headings can be expressive while long reading text stays conventional. Guidance covers line height, platform typesetting and tabular numbers for aligned values. [Applying type](https://m3.material.io/styles/typography/applying-type)

**Proposed Lựa mapping:** use an emphasized headline for the needs prompt, a short title for product identity, body text for reasons and evidence, and labels for controls. Give the confirmed budget and comparison differences clear prominence. Render unknown RAM/storage as “Chưa đặt yêu cầu,” not “≥ 0 GB.” Keep full model/variant identity available, but separate it from long imported marketing titles. Use aligned VND values in comparison rows. Preserve Vietnamese accents and allow text growth; validate line height on Android instead of assuming browser text metrics transfer.

Static fonts are a legitimate option. A variable font is not a prerequisite for every screen. Choose any new font only after checking Vietnamese coverage, licensing, Android rendering, and bundle implications.

## Shape, containment and component behavior

Shape should help distinguish a prominent action, a selected item and a related group. The launch's expanded decorative library does not mean every screen needs all 35 shapes. A small, purposeful shape vocabulary is a defensible product decision. [Material's launch article](https://m3.material.io/blog/building-with-m3-expressive)

**Proposed Lựa approach:** give the needs summary a distinctive container, use quieter repeated listing surfaces, and use connected or clearly grouped selection controls for RAM/storage. Keep multi-select tasks distinguishable from single-select options. Decorative shape morphing must preserve stable targets and readable text. The current 14/18/24 px corner radii alone do not demonstrate a state or shape system.

Current Material component guidance continues to evolve beyond the May 2025 launch: expressive lists, for example, gained segmented styling, stronger selection treatment and flexible content slots. Use the actual component guidance applicable to the design rather than a frozen launch-component count. [Lists overview](https://m3.material.io/components/lists/overview)

## Motion: spatial movement and visual effects

The motion system distinguishes spatial springs for position, size, rotation and shape from effects springs for color and opacity. It provides fast, default and slow variants within standard and expressive schemes. Motion should be coherent and interruptible, with expressive emphasis reserved for meaningful interactions in this product. [Motion physics overview](https://m3.material.io/styles/motion/overview/how-it-works)

Material publishes cross-platform guidance and curve approximations for web animations without interruption or gestures. Spring composite tokens combine damping and stiffness; these values cannot be blindly substituted for a differently defined damping coefficient in another animation API. [Motion specifications](https://m3.material.io/styles/motion/overview/specs)

**React Native implementation proposal:** maintain named spatial/effects tokens, document the mapping into the selected animation API, and validate settling and interruption. Keep repeated list motion minimal. On confirmation, transition the summary and result state without delaying the result. For reduced motion, replace movement with an immediate state change and retain all feedback. The installed RN version is 0.81.5; its `AccessibilityInfo` API exposes motion preference queries and change events, including Android animation-scale behavior. Verify against the installed version before implementation. [React Native AccessibilityInfo](https://reactnative.dev/docs/0.81/accessibilityinfo)

## Navigation and adaptive layouts

The Material navigation bar supports three to five top-level destinations with an icon, label and active indicator at the window bottom. Compact and medium layouts can arrange these elements differently. The active destination should remain identifiable; clear labels must not be removed merely to save space. [Navigation bar guidelines](https://m3.material.io/components/navigation-bar/guidelines)

**Lựa implication:** five destinations are within the recommended count. The existing labels are useful. Add meaningful icons and selection semantics, keep the bar reachable independently of the result list, and distinguish navigation from in-page filters. Consider a comparison selection tray so users can see the two chosen models and replace either without searching the catalog again.

Android classifies available window width, not device identity: compact below 600 dp, medium 600–839 dp, expanded 840–1199 dp, with larger classes above that. Height and posture also matter. [Window size classes](https://developer.android.com/develop/adaptive-apps/guides/use-window-size-classes)

**Lựa proposal:** compact uses a single pane; medium gets bounded reading widths and deliberate grouping; expanded uses a list/detail or a two-column comparison layout with persistent context. Test 599/600 and 839/840 dp transitions, landscape with limited height, split screen and large font settings. A stretched phone column is not sufficient evidence of adaptation. Browser CSS pixels are preview measurements; native dp/insets and IME behavior still require device checks.

## Accessibility is part of the design

Android Material guidance calls for at least 48 dp interactive targets. Native component libraries can supply defaults, but custom React Native controls must implement and verify their own target area and semantics. A `minHeight` declaration does not verify width, clipping, overlap or effective hit regions. [Android accessibility defaults](https://developer.android.com/develop/ui/compose/accessibility/api-defaults)

Normal text needs 4.5:1 contrast; qualifying large text needs 3:1. Inactive controls have exceptions. Apply those rules to actual role pairs rather than rejecting every subdued decorative line. [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

Essential visual cues identifying an input or state require 3:1 against adjacent colors. A decorative card border is a different case from the only visible boundary of an empty field. [WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

**Lựa checks:** radio/checkbox semantics for requirements, selected state plus a check/icon, announced inline errors, modal focus and return, visible keyboard focus, distinguishable unknown/error states, large-text layout, TalkBack order and motion preferences. These are acceptance criteria, not optional polish after a visual redesign.

## Recommended implementation order

1. Correct hidden errors, destructive-action recovery, control semantics and input/focus contrast.
2. Consolidate the active app and preview onto one documented token set and shared stateful components.
3. Rework needs, empty-state recovery and comparison around the user's next decision. Keep raw evidence available through progressive disclosure.
4. Adapt navigation and content for compact, medium and expanded windows; retain draft/confirmed state across transitions.
5. Add selective motion and emphasis, then validate native accessibility and buyer comprehension.

These are recommendations. The companion [audit](FRONTEND_DESIGN_AUDIT_2026-11-13.md) records the current implementation and the evidence needed before marking AC-UX01–05 accepted.
