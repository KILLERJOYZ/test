# G1 Decision Pack — Android Foundation & Native Expressive Slice (`DEMO-01`, `DEMO-02`)

| Document control | Value |
|---|---|
| Date | 13 November 2026 |
| Gate | G1 — Android foundation & native Expressive slice (`DEMO-01`, `DEMO-02`) |
| Governing baseline | [brd.md](../../brd.md) v3.2 · [IMPLEMENTATION_PLAN.md](../planning/IMPLEMENTATION_PLAN.md) v3.2 |
| Prebuild record | [11-android-device-validation.md](../../research/prebuild/11-android-device-validation.md) · [manifest.json](../../apps/adviser/verification/frontend-expressive/manifest.json) |
| Current status | Engineering & emulator verification `done`; physical-phone matrix remains open under `P09` |

---

## 1. Native Host & Dependency Matrix (`DEMO-01`)

| Component | Version / Configuration | Evidence |
|---|---|---|
| Android Package | `vn.lua.adviser` (`v0.4.0`, `versionCode 2`) | [app.json](../../apps/adviser/app.json) · [lua-adviser-demo.manifest.json](../../apps/adviser/artifacts/lua-adviser-demo.manifest.json) |
| Android SDK Targets | `minSdk 26`, `compileSdk 36`, `targetSdk 36`, `buildTools 36.0.0`, `ndk 27.1.12297006` | [build-android.ps1](../../apps/adviser/scripts/build-android.ps1) |
| Native Architectures | `arm64-v8a`, `x86_64` | Dual-ABI release APK (`lua-adviser-demo.apk`) |
| UI Runtime | Expo `54.0.38`, React Native `0.81.5`, React `19.1.0` | [package.json](../../apps/adviser/package.json) |
| Expressive Motion & Vector Primitives | `react-native-reanimated 4.1.7`, `react-native-worklets 0.5.1`, `react-native-svg 15.12.1`, `react-native-safe-area-context 5.6.2` | [ExpressiveButton.tsx](../../apps/adviser/src/ExpressiveButton.tsx) · [ExpressiveSurface.tsx](../../apps/adviser/src/ExpressiveSurface.tsx) |
| On-Device AI Bridge | `com.google.mlkit:genai-prompt:1.0.0-beta4` (`Kotlin 2.2.10`) | [LocalAiModule.kt](../../apps/adviser/native/adviser/LocalAiModule.kt) · [with-local-ai.cjs](../../apps/adviser/plugins/with-local-ai.cjs) |
| Network Security | HTTPS default; explicit loopback cleartext only (`127.0.0.1`, `10.0.2.2`, `localhost`); `allowBackup=false` | [with-local-network.cjs](../../apps/adviser/plugins/with-local-network.cjs) |

---

## 2. Native Expressive Slice Verification (`DEMO-02`, `T-D01`)

1. **Material 3 Expressive Token & Dynamic Tonal System (`AC-UX01`):**
   - Implemented in [expressive-theme.ts](../../apps/adviser/src/expressive-theme.ts), [useExpressiveTheme.ts](../../apps/adviser/src/useExpressiveTheme.ts), and [theme-validation.ts](../../apps/adviser/src/theme-validation.ts).
   - Enforces WCAG AA contrast (`>= 4.5:1` for text, `>= 3.0:1` for essential outlines) before adopting Android 12+ dynamic system palettes; falls back to validated light/dark Expressive palettes (`THEME-01`).
2. **Spring Physics & Reduced-Motion Compliance (`AC-UX02`):**
   - Native Reanimated 4 spring transitions (`EXPRESSIVE_SPRING`) with shape morphing (`EXPRESSIVE_SHAPE.button` `20dp` → `EXPRESSIVE_SHAPE.selected` `14dp`), tonal container fills, and immediate animation cancellation when `AccessibilityInfo.isReduceMotionEnabled()` is active or when backgrounded.
3. **Typed Value Round-Trip, Focus & Hardware Back (`AC-UX03`, `AC-UX04`):**
   - Verified on `emulator-5554` (`sdk_gphone16k_x86_64`, Android 17 / API 37) via [frontend-smoke.py](../../apps/adviser/scripts/frontend-smoke.py) and [frontend-config-smoke.py](../../apps/adviser/scripts/frontend-config-smoke.py):
     - Checked radio/checkbox accessibility states (`checked="true"` in UIAutomator hierarchy).
     - Layered Android hardware Back handling (`deletion` → `form` → `quoteModal` → `detail` → `history` → `tab`).
     - `2.0x` system font scaling, `0x` disabled system animation scale, and `1200dp` expanded layout adaptation.

---

## 3. Gate Status & Residual Dependencies

- **Engineering & Emulator Slice:** **Complete** (`0` unresolved S0/S1 engineering defects).
- **External Dependency (`P09`):** Physical Android phone execution of TalkBack/Switch Access and 30-sample frame/startup distributions remains scheduled prior to public release.

