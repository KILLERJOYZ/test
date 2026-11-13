# Current frontend audit evidence

Captured 13 November 2026, Asia/Saigon. These are **browser preview** artifacts for the active `AdviserApp.tsx`, not native Android acceptance evidence.

Start with the [audit report](../../../../docs/design/FRONTEND_DESIGN_AUDIT_2026-11-13.md), [research guide](../../../../docs/design/MATERIAL_3_EXPRESSIVE_RESEARCH.md) and [run results](run-results.json).

## Artifacts

- `home-390-dark.jpg`, `home-320-dark.jpg`, `home-1024-dark.jpg`: compact and expanded home layout samples.
- `needs-390-dark.jpg`, `invalid-budget-390-dark.jpg`, `form-semantics.json`: needs-form layout and invalid-budget/selection observations. The invalid screenshot is scrolled to confirmation; the error is not in the active modal. Closing the modal revealed the error on the underlying screen.
- `home-layout.json`: measured web navigation position with 48 result cards and a background notice after closing the invalid form. This is a web CSS-pixel measurement.
- `search-empty-390-dark.jpg`, `search-empty-dom.txt`: no-match query and recovery controls.
- `compare-390-dark.jpg`: stacked comparison at its lower scroll position.
- `ai-unavailable-390-dark.jpg`: unavailable AI with an enabled invocation action and raw error fallback.
- `saved-390-dark.jpg`, `settings-390-dark.jpg`: observed saved/settings states. No delete control was invoked.
- `source-measurements.json`: opaque sRGB contrast and active-source feature inspection. Default light colors are source measurements only.
- `source-hashes.json`: fingerprints of the current app source and five installed upstream skill files.
- Four skill-named JSON files: heuristic review outputs, all `api_enriched: false`.

Reproduce source measurements from repository root:

```powershell
node apps/adviser/verification/m3-expressive-2026-11-13/inspect-source.mjs
```

That command overwrites the measurement/hash records with the current source; preserve this dated baseline before rerunning after implementation changes. It is an evidence utility, not a native acceptance test or a full WCAG checker. It intentionally fails if the palette structure changes enough to invalidate extraction.

The source and browser observations distinguish native risk from browser-confirmed behavior. See `run-results.json` for the connected-device and optional-browser-check limitations. The reviewed preview used isolated local test state; one sample saved decision was created through the UI. No seller link, share action, external AI service, or deletion was invoked.
