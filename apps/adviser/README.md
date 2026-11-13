# Lựa — unified device adviser 0.5.1

One Phone / Tablet / PC app, with the shared Material 3 Expressive interface, offline SQLite catalog, signed FastAPI refresh, comparison, historical decisions, manual laptop quotation checks, durable reporting and checked local explanations.

[Active app contract, setup, migration and verification](./UNIFIED_APP.md) · [Android APK](./artifacts/lua-adviser-0.5.1.apk) · [Web preview](./dist/demo.html).

Both platform entries use src/AdviserApp.tsx. The existing M3 adviser is the host; “Mở Device Advisor” opens the complete Phone / Tablet / PC feature inside it. Personal advice follows exactly three ordered purposes and priorities with separate intake screens and explicit review. Direct catalog discovery is available before intake.

From this directory: npm ci; npm run check; npm test; npm run build; npm run build:android. Run npm run catalog:prepare once for the local publisher, rebuild to include its pin, then npm run service:adviser for FastAPI on port 8788. See the app contract for Python dependencies and Android forwarding.

Earlier Demo 1, intermediate Demo 2 and connected laptop roots remain regression source; they are not separate destinations in the shipped app. Historical instructions are in [README-demo-history.md](./README-demo-history.md). Prices, stock and compatibility remain unknown wherever evidence is incomplete. Supported physical Nano inference, production signing and acceptance remain open.
