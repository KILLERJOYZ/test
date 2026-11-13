# Demo 2: real reference database

**Current recommendation integration:** see [Device Advisor module](./RECOMMENDATION_MODULE.md). The reference flow now uses versioned hard checks, utility intervals, evidence reasons and explicit constraints. Earlier price-ordering/RAM-threshold notes below describe the previous reference prototype.

The app opens Demo 2 directly, using collected retailer records instead of fictional products. The same recommendation screen is used on first launch and after tasks → budget → priorities → review → confirmation. Before confirmation, the VND 22 million example profile is explicitly described as a starting reference.

## Data and database

- Source: `data/all_laptops_normalized.json` in the workspace, collected on 11 November 2026; 70 listing records across CellphoneS, Thế Giới Di Động, Điện Máy Xanh and FPT Shop.
- Android opens `lua-reference.db` through Expo SQLite. First launch imports the bundled, normalized reference seed in a transaction; later launches read the database. Source listings remain separate; no inferred cross-retailer canonical-variant merge is performed.
- Tables: `reference_meta`, `reference_source`, `reference_listing`, `reference_offer`, `reference_fact`. Foreign keys, positive-price constraints, indexes and a seed-version marker are included. Failed imports roll back rather than activating a partial version.
- An inspectable SQLite export is provided at `artifacts/lua-reference.sqlite`. Run `npm run reference:database` from the app directory to rebuild and verify it using the same schema and seed as Android. Source/seed hashes must match.
- The HTML preview uses the exported seed through a web adapter; it does not execute Android SQLite. Saved preview decisions use browser storage.

## Complete testing journey

1. Open the reference suggestions, set tasks/budget/priorities through the separate screens, review, then confirm. Confirmed needs persist independently of incomplete drafts.
2. Search by name, manufacturer, source or RAM description. Filter by maximum weight and sort by price/weight. Missing weight never passes an explicit weight filter. Clear filters without editing the confirmed needs.
3. Inspect price observations, original specifications, source URL, observation time, exclusions and unknowns. Open an allowlisted HTTPS source page to verify current details yourself.
4. Select two source records and open comparison. Similar names remain separate, with no unsupported lowest-total or performance winner.
5. Save an exact record with needs, dated observed price and source context. Reopen it, share its historical summary or delete it. Reopening does not refresh or re-certify a price.
6. Under settings/testing, explicitly switch to the synthetic fixtures to test corrupt catalog rejection, snapshot rollback and injected storage failure. Those controls cannot modify the real reference database.

## Recommendation boundary

These are real collected observations, not currently verified purchasable offers. Unknown shipping, checkout eligibility, stock and software/workload compatibility stay unknown. An advertised body price below the ceiling is a provisional reference candidate; it is never presented as proof of complete affordability. Used/returned records are excluded from the new-laptop path; above-budget body prices are excluded. Illustrative RAM thresholds are labelled as such. A missing RAM value triggers uncertainty, not a pass.

Priorities remain captured for the decision, but the reference data lacks comparable performance/battery measurements. The UI therefore explains its price/weight ordering rather than inventing utility scores. No live crawling, automatic refresh, model inference, source-license certification or production acceptance is implied by this test build. Nano and the separately planned authenticated sync are not implemented.

## Verification

- `npm test`: 28 tests, including source identity, budget boundaries, missing facts, reference exclusions and URL allowlists.
- `npm run test:demo2`: 16 component flow checks, including intake/review, restart, reference details, save/reopen/delete and paired comparison. Native modules/storage are mocked for these component checks.
- `npm run reference:database`: actual SQLite integrity and foreign-key checks, 70 records/four sources, negative-price rejection and transaction rollback.
- TypeScript and self-contained HTML builds pass. Android release packaging/device results are recorded in `verification/demo2-build.json`; a build pass alone is not an installed-device or TalkBack pass.

Source editing/import generation is a development workflow. The app's initial bundled reference snapshot is not a remotely authenticated update service. Changes to collected source records require normalization, schema validation, rebuilding the seed/database, and a new app build.

Installed release verification passed on the task emulator: actual SQLite initial import displays 70 records; tasks → budget → preferences → review → recommendations → real reference detail completed. See `verification/reference-native-results.json`, `reference-native.xml` and `reference-native-detail.xml`. The first capture included an ADB display warning prefix; after removing that transport prefix, both PNGs decoded successfully and the detail screenshot was inspected. XML, screenshots and interaction outcomes are recorded. Physical-phone/TalkBack and live-price verification remain pending.
