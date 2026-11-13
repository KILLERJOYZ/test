# Flow validation

## Conclusion

All fourteen specified U06 cases plus the new U06-15 updater-failure case execute. Controlled tests cover production-used helpers wired into AndroidApp. This is engineering evidence; native journeys and buyer comprehension remain unvalidated.

## Observed results

T01-T23 are traced in the JSON state matrix. FLOW-01-04 have baseline/retest references. Original immutable Git handlers fail desired persistence regressions; the original source diagnostic was preserved before changes. U06-12 has a failing-before log from the current working source and a passing-after log. The throwing-updater regression also failed before correction. Original-handler desired regressions were added retrospectively and are labelled accordingly.

## Changes/decisions

Serialize reducers and recovery operations through one durable coordinator. Block writes after failed hydration. Preserve current corrupt recovery bytes. Validate confirmed needs and saved observation/date/version references. Clone draft arrays; use confirmed-needs, comparison, filter, request-validity and navigation helpers in the actual app. Pending repeated actions coalesce; injected clock plus monotonic suffix and existing-ID checks avoid save-ID collisions. Chat close returns to its originating exact detail; focused request context remains R10.

FLOW-05-08 remain explicit R07/R10 work: ranking-grounded fallback, catalog/offer stale-response rejection, focused variant payload and transport abort propagation. Native modal dispatch, focus and lifecycle remain R11. Removed historical identity/tombstone handling belongs to the R07/R08 contract; current fixture restore quarantines unknown IDs rather than inventing replacements.

## Checks

See R06 run record and U06 pack logs. TypeScript and UBASE are required affected checks. Original Git desired regressions intentionally fail and remain historical baseline evidence, not a current acceptance command. The old flow probe extracts pre-fix closures and is superseded for fixed behavior by decision-state.test.ts.

## Gaps and next action

Execute the JSON cognitive and five-person uncoached protocols with frozen build/fixture context. Perform D01-D08 on a named authorized device. Record real outcomes before claiming comprehension or native acceptance. No gate decision follows from these unit results.
