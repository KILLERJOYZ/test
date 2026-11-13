# M3 host with Device Advisor feature — 0.5.1

This corrects the earlier standalone-root interpretation. `AdviserApp` opens first. Its “Mở Device Advisor” action displays the complete feature within the host, and all five host navigation tabs remain available. Exiting the feature preserves host search and selection state.

Verified on 14 November 2026:

- TypeScript check passed.
- Host/feature integration test passed: host-first startup, explicit feature entry, return with search state retained, and navigation away through the host tabs.
- Complete Phone, Tablet and PC component journeys passed, including exact three/three choices, clarification, review, restart and corrupt-draft retention.
- Browser inspection confirmed the M3 home, opening the complete category selector inside the app, and persistent host navigation.
- Web production build and Android release build/lint passed.
- All 33 application TypeScript files in the Metro source map match the delivered source.
- APK signature and 16 KB ZIP alignment checks passed.
- Emulator launch/restart evidence is recorded separately in `native-smoke.json` and the PNG/XML files. This is not a complete native accessibility, category or model-inference acceptance run.

Source commit: `24f0a77`. APK SHA-256: `49922d50b8d969b692ad919fa0402276cbdd8ab186e95a555db31dfb41a64c17`.

The 0.5.0 standalone-root screenshots and records are superseded. Current APK: `artifacts/lua-adviser-0.5.1.apk`. Physical Nano inference and production data/signing acceptance remain open.
