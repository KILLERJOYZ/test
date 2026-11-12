# Bounded demo AI service

See the [Android demo README](../../apps/adviser/README.md#optional-live-ai) for setup. Node 24 is the tested runtime; no server dependencies are required.

From `apps/adviser`, run `npm run ai`. Configuration lives in server-only environment variables (`.env.example` documents them). An unset key or model produces an explicit unavailable response. Never put credentials into Expo public variables or mobile assets.

The service interprets needs and selects allowed explanation claims. Deterministic code owns variant identity, amounts, eligibility and wording. A candidate claim with a real fact ID but the wrong verdict is rejected. It never returns arbitrary seller URLs.

Run controlled contract checks with `npm run test:service` from the app directory. The injected provider is a test double. A real provider-backed run must be recorded separately before claiming D1 acceptance.

Provider API reference: [OpenAI Chat Completions](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create).
