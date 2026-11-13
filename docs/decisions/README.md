# Stage Gate Decision Packs (G1–G5) — Lựa Adviser

| Gate | Scope | Decision Pack | Engineering & Emulator Status | External Human / Commercial Inputs |
|---|---|---|---|---|
| **G1** | Android foundation, SDK matrix & native M3 Expressive slice (`DEMO-01`, `DEMO-02`) | [G1_DECISION_PACK.md](./G1_DECISION_PACK.md) | **Complete** (`vn.lua.adviser` v0.4.0, dual-ABI APK, dynamic tonal theme, Reanimated 4 springs) | Physical phone TalkBack & 30-sample frame timing (`P09`) |
| **G2** | Deterministic domain, flow, accessibility & failure handling (`DEMO-03`–`DEMO-08`) | [G2_DECISION_PACK.md](./G2_DECISION_PACK.md) | **Complete** (`67/67` app unit tests, `158/158` prebuild unit cases, native smoke & config suites passed) | Physical phone matrix (`P09`) |
| **G3** | On-device Gemini Nano AI, connected refresh & demo review (`DEMO-09`, `DEMO-10`, `REVIEW-01`) | [G3_DECISION_PACK.md](./G3_DECISION_PACK.md) | **Complete** (`NANO-01`–`07`, `CLIENT-01`–`05`, scripted scenario, APK + web preview) | 5-person exploratory buyer session (`P10`) & physical AICore inference (`P08`/`P09`) |
| **G4** | Source-use grants, starter catalog audit, staff RBAC & operations readiness (`REAL-01`, `REAL-02`) | [G4_DECISION_PACK.md](./G4_DECISION_PACK.md) | **Complete** (`GOV-01`–`04` in [governance.mjs](../../services/adviser/governance.mjs), backup/restore, redaction) | Signed retailer permissions (`P01`), human catalog adjudication (`P02`/`P03`), rate cards (`P12`) |
| **G5** | Real-data journeys (`U01`–`U08`), `U06` quotation intake, `U08` reports & pilot evaluation (`REAL-03`, `REAL-04`, `PILOT-01`) | [G5_DECISION_PACK.md](./G5_DECISION_PACK.md) | **Complete** (`REAL-13`, `PILOT-01` in [pilot-eval.mjs](../../services/adviser/pilot-eval.mjs), `16/16` service tests) | Bounded user pilot observations (`P10`) & sponsor release sign-off (`P14`) |

