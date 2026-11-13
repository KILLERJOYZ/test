# Demo 2 — offline advisor integration

**Current implementation:** see [real-reference database demo](./REAL_REFERENCE_DEMO.md). The entries below preserve the earlier synthetic prototype history. Demo 2 now defaults to collected real reference records stored in SQLite on Android; synthetic scenarios are isolated under testing.

Open the app directly to Demo 2 recommendations. First launch shows clearly labelled example suggestions; after confirmation the same screen uses your needs. The demo selector remains accessible via Android Back from recommendations, and retains Demo 1. Start with `npm start` from `apps/adviser` for Expo, or open `dist/demo.html` for the self-contained design preview. `npm run build:android` packages both journeys in the standalone Android app.

## Demonstration

1. Select one to three ordered tasks, set the exact VND ceiling, clarify VM scope if selected, and confirm. Results use the confirmed profile, not unfinished form edits.
2. Enter `Tối đa 20 triệu`. The deterministic parser proposes the ceiling change; confirm or dismiss it. Approximate or contradictory wording asks for clarification rather than inventing a ceiling.
3. Open an exact configuration and its sample offers. Select two configurations to compare and share a dated synthetic summary.
4. In **Phòng thử tích hợp**, activate catalog 2. Every offer's base price rises by VND 1.5 million; the shortlist recomputes from that snapshot. The result key includes profile/catalog/policy versions.
5. Try the corrupt bundle. Validation rejects the negative price and keeps the active catalog.
6. Restore the previous catalog. The original snapshot and recommendation results return.
7. Close/reopen Demo 2. Confirmed needs, active catalog and previous catalog restore from an independent AsyncStorage key. Storage failures do not acknowledge a successful save or activate a new state.

## Implementation boundary

This is a synthetic laptop integration increment. It reuses the existing TypeScript eligibility, money and ranking logic with explicit snapshot products/offers. It adds catalog validation, durable snapshot activation/rollback, profile/catalog-bound budget proposals, comparison and sample-offer details. Bundles are embedded fixtures, with a deliberately narrow known-product validator.

Nano is not installed or probed. Text interpretation is a deterministic parser, labelled in the UI; it makes no network requests. Android persistence now uses Expo SQLite with transactional record replacement and legacy AsyncStorage migration. The HTML preview uses browser storage. Drafts and confirmed/saved decisions have separate ownership. No authenticated remote bundle transport/signature validation, server synchronization, reviewed real catalog, Phone/Tablet support or native model inference is claimed. Full integration packages remain pending.

## Verification

TypeScript checking passed. All 22 domain/picker/AI/integration tests passed, including four new integration tests. The self-contained HTML artifact built successfully. Android build and device observations must be recorded separately; a successful bundle/build does not establish physical-phone, TalkBack or Nano acceptance.

Android `assembleRelease` passed (ARM64/x86-64). Handoff APK: `artifacts/lua-adviser-demo2.apk`, SHA-256 `FAD9A49C968AEA55FC88634ABEF00CCE835B3EDEF3D8C3A1AF86469B862BBDBB`. Emulator installation via the existing ADB server stalled and was stopped; no installed-device interaction pass is claimed for Demo 2. The APK uses the existing demo debug signing setup. The controlled-provider service regression test also passed.

## Screen-based flow update

Tasks → budget → preferences → review → shared recommendations. Each step has its own screen; review supports editing earlier answers. Cancelling intake preserves the previous confirmed results. Search/recommendations, exact detail, comparison, saved decisions and test settings are separate destinations. The first-launch and confirmed-result experiences render the same recommendation branch, with explicit sample/personalized context.

`npm run test:demo2` passes 11 React component navigation/review/restoration checks using mocked native and storage boundaries. This verifies the screen flow, not Android rendering or native SQLite reliability. The existing 22 app tests also pass. No emulator was reachable on the fresh ADB server during this revision, so physical/emulator interaction acceptance remains pending.

Latest screen-based Android build passed; native SQLite libraries and module were verified in the APK. Latest artifact SHA-256: `b230087ea2e5873c37dac4b28e178f638b21128786fe7825f21263db0ab36a3a`. See `verification/demo2-build.json` and `verification/demo2-screen-flow.json`. Earlier hashes above identify the prior prototype, not the latest package.

## Selection design refresh

The intake now uses the shared purple/lime palette, white choice cards, category accents, readable task descriptions, numbered selected states, explicit selection counts and a four-part progress indicator. Budget presets and priorities use the same accessible checkbox-card pattern. Secondary navigation uses quieter styling; primary continuation remains prominent. Existing flow checks and TypeScript passed; HTML preview was rebuilt. These checks do not replace visual/TalkBack testing on Android.
