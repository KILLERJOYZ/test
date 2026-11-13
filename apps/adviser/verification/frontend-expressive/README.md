# Android frontend evidence — 13 November 2026

Start with the [implementation report](../../../../docs/design/FRONTEND_IMPLEMENTATION_STATUS.md) and [manifest](manifest.json).

Accepted result records:

- [Native flow checks](smoke-result.json).
- [Large-text, no-motion and expanded-window checks](configuration-result.json).
- [Committed-needs, motion and dark-theme checks](motion-result.json).
- [Final packaged control-animation smoke](final-animation-result.json).

Representative captures:

- [Home](final-home.png), [dark theme](dark-home.png), [2.0x text](large-text-2x.png).
- [Visible invalid budget](invalid-budget.png), [fixed save acknowledgement](save-feedback.png), [deletion confirmation](delete-confirmation.png).
- [Compact comparison](comparison.png), [expanded comparison](expanded-comparison.png), [empty search](empty-search.png).
- [Normal-motion recording](native-motion.mp4). The recording is an emulator demonstration, not a physical-device performance benchmark.
- [Raw emulator frame statistics](emulator-frame-stats.txt).

XML siblings contain native accessibility observations. `failure.*` and `search-diagnostic.*` are retained debugging captures from earlier attempts and are excluded from accepted results. Earlier QA failures caused by feedback placement were fixed; keyboard stylus onboarding and test swipe bounds were isolated and handled in the test environment/helper.

The APK was built for ARM64 and x86-64. Runtime observations are from the named x86-64 emulator only. No physical ARM64, complete TalkBack protocol or successful on-device Gemini Nano inference is certified.

Reproduce on the named emulator with the installed APK:

```powershell
python scripts/frontend-smoke.py
python scripts/frontend-config-smoke.py
```

The flow script creates and removes one disposable decision. The configuration script restores the settings it changes in `finally`. Use a test emulator; preserve any unrelated saved decisions. The existing smoke helper derives swipe bounds from the current vertical scroll pane so expanded layouts work.
