# Research API architecture decision

## Conclusion

Use TypeScript-compatible Node modules for the isolated R08 spike, with injected repositories and clocks. Reuse the app's checked fixture rules and the shared runtime contract validator. This selects a bounded research implementation; it does not approve a production stack or merge the separate main branch.

## Observed results

The app calls /demo/advice/explain and /demo/needs/interpret. The current Node service defaults to 8787. The main-branch Python server also defaults to 8787 but accepts /api/advise with a request string. Its schema separates family, variant, offer and dated price evidence; its catalog is crawled_draft. These services cannot be connected by merely changing a URL. Main schema.sql, agent_flow.py and server.py were inspected with git show, without executing databases or providers.

## Changes/decisions

Reserve loopback 8791 for the research API, injected/ephemeral ports for tests. Preserve existing service ports. New /research/v1 endpoints cover runs, exact variants/offers, comparisons and saved decisions. Fit, offer validity, completeness and affordability are independent. Use the ordered result decision table. Every result contains decision/run/request/profile/catalog/rules/offer context plus focused IDs and origin; stale context rejects at the boundary.

The shared runtime validator rejects extra authoritative fields, unsafe money, exact-variant mismatch and contradictory claims even when fact IDs exist. Saved records retain historical configurations; removed current identities must not be replaced with similar catalog entries. Refresh creates a separate current run. AI remains behind server-only adapters and may explain checked facts or propose confirmed edits.

## Checks

U07 covers seven required behaviors, with an additional domain-shape subtest. OpenAPI local component references and examples are structurally validated. R08 must consume the same runtime validators and exercise transport/repository boundaries; schema validation alone does not prove integration.

## Gaps and next action

No production database/index, reviewed catalog, live provider or API deployment is established. Implement the isolated R08 repository/client round trip, immutable history and evidence withdrawal. G3/G4 remain pending.


Continued API review: U07-08 now rejects confirmed needs with missing/invalid/overlapping uses or duplicate preferences. U07-09 binds request needs to the same decision/revision as its context. The HTTP boundary returns 409 stale_revision for mismatches, and the client preserves that error rather than reporting a source outage. API-boundary-before.log and API-boundary-after.log preserve regression evidence.


Saved-contract review U07-10: snapshots now require one or two exact variants with matching unique historical configurations and observations, string versions and genuine calendar instants. Missing amounts remain null. Canonical historical fixtures match the API schema. The HTTP save path rejects malformed history before any storage write. saved-contract-before.log/saved-contract-after.log retain the failing/passing evidence.
