# Retrieval and ranking evaluation

## Conclusion

Lexical and workload arms use the same synthetic snapshot and hard eligibility. Real-world usefulness remains unknown. The existing Python vector path requires Qdrant and its provider configuration; no vector arm was fabricated or substituted.

## Observed results

The query corpus has 60 stable cases: 30 exact identities, 15 Vietnamese tasks, ten typo/alias and five unsupported; development/heldout=40/20. Exact identity relevance is a synthetic oracle. Other relevance labels remain unknown and excluded from accuracy denominators. Development executes both arms and records returned IDs, per-query recall fractions, timing samples and integrity failures. These raw values are in 09-retrieval-ranking-results.json.

## Changes/decisions

Keep lexical/filter baseline for the bounded slice; defer vector selection until a comparable adapter and adjudicated corpus exist. No real workload-quality conclusion follows from fixture ranking. Heldout remains unconsumed; repeated development runs are retained separately. Budget/fit failures are integrity errors and cannot be offset by relevance scores.

## Checks

U09 tests exact recall, unknown labels, unfair comparisons, missing arms, reproducibility, holdout reuse, failures and hard constraints. The runner calls actual app fit/rank functions for the two implemented arms.

## Gaps and next action

Obtain independent real relevance/workload labels and source-approved snapshots. Run a frozen heldout once only after review; record later reuse as diagnostic. Do not report synthetic recall as confirmed recommendation usefulness.
