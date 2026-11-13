# Bounded integration spike

## Conclusion

The isolated Node/TypeScript-compatible spike exercises a checked decision round trip over real loopback HTTP. Synthetic variants/offers are used because reviewed research variants are unavailable. This proves the bounded adapters, not production catalog usefulness or Android/database integration.

## Observed results

Fifteen U08 unit cases and one HTTP integration scenario execute. The HTTP scenario confirms needs, evaluates an exact variant at 20,000,000 VND and one dong below, saves a dated snapshot, restores it through a new repository instance from a temporary disk file, and reads it through the API. Wrong identity, unknown shipping, expired offers, no-fit, stale catalog context, evidence withdrawal and source outage preserve distinct outcomes. Tests close their servers and remove only their temporary directory.

The first repository outage test and HTTP scenario failed because the new outage toggle assigned availability in the wrong direction. R08-initial-failure.log preserves that result. After correction, all original ten tests pass. This is a spike defect found and corrected during execution, not an existing production defect.

## Changes/decisions

Use injected snapshot storage with serialized copy-on-write commits. Unit mode uses cloned in-memory storage; HTTP integration uses JSON written to a temporary file with rename before acknowledgement. Current observations are upserted with stable IDs; dated price observations and saved historical configurations remain separate. Evidence updates reconcile a Map-based derived index; withdrawal removes the current claim and changes dependent capability to unknown while preserving saved history. Publication rejects implicit synthetic/draft promotion.

Shared contract_validation.mjs validates client/server context, candidates and saved shapes. Server/client are scripts using built-in Node HTTP/fetch. No new framework, database or model dependency is installed. Keep this adapter for contract development; substitute reviewed production repositories and complete offer-context policy only after scope/source gates. Do not infer PostgreSQL/Qdrant consistency, performance or production durability from this local adapter.

## Checks

Run from repository root:

    node --experimental-strip-types --test spikes/prebuild-contract/policy.test.mjs spikes/prebuild-contract/repository.test.mjs
    node --experimental-strip-types --test spikes/prebuild-contract/contract.test.mjs

For an explicitly requested manual empty-repository API session:

    node --experimental-strip-types spikes/prebuild-contract/server.ts

This binds 127.0.0.1:8791; stop with Ctrl+C. Automated tests bind an ephemeral loopback port and close it. The manual launcher is empty/in-memory; the integration test is the executable seeded durable round trip. No background server remains running from these checks.

## Gaps and next action

Android network smoke has not been performed on a named authorized target. No production database/index or live provider was used. Source rights and exact real workload evidence remain unresolved. R09 may compare synthetic retrieval arms, but independent real usefulness labels remain unavailable. Historical observations do not become current quotes on reopen.


## Continued invariant review

U08-10 and U08-11 reproduced two additional spike defects: absent capability defaulted to pass, and a confirmed discount with null amount was coerced to zero. The evaluator now retains unknown fit/complete total respectively. R08-unknowns-before.log retains the failing run; R08-unknowns-after.log records the passing unit and HTTP retest. The first unknown-discount regression failed because no unknown candidate existed; the final assertion explicitly checks that candidate before reading its amount. These fixes remain synthetic-spike evidence, not real capability or price validation.


A second HTTP integration case verifies mismatched needs/context rejection before evaluation. Decision/revision mismatches now return 409 stale_revision, which runClient preserves. Confirmed needs are validated at the request boundary. Both original round-trip and new mismatch integration tests pass.


Further bounded review added U08-12..15. Explicit supported RAM/SSD/OS/condition hard checks precede price and preferences; unsupported operators or absent evidence remain unknown. Restore validates collections and saved records before replacing state/index. Saving a later revision retains earlier snapshots, exact retries are idempotent, and reopen selects the latest retained snapshot. R08-hard-history-before-v2.log and R08-hard-history-after.log retain before/after evidence. Restart and retry checks execute through the actual repository adapter.


Saved-contract review U07-10: snapshots now require one or two exact variants with matching unique historical configurations and observations, string versions and genuine calendar instants. Missing amounts remain null. Canonical historical fixtures match the API schema. The HTTP save path rejects malformed history before any storage write. saved-contract-before.log/saved-contract-after.log retain the failing/passing evidence.
