# Catalog audit

## Conclusion

The current snapshot has 70 source listings: 55 new and 15 used. None is established as a reviewed exact variant or verified complete offer. All 70 remain unresolved research candidates.

## Observed results

Sources: CellphoneS 25; Dien May Xanh 15; FPT Shop 15; The Gioi Di Dong 15. No duplicate source IDs were found. Fifty-five rows lack one or more identity fields; zero complete payable totals can be established because shipping and mandatory fees are absent. Prices retain original crawl timestamps.

The owning normalizer at crawler/src/models/laptopSchema.js defaults availability to in_stock when a current price exists. Therefore stored in_stock is not independent stock evidence. The storage merger concatenates source records; it does not adjudicate cross-retailer canonical identity. No crawler was run and no raw snapshot was overwritten.

## Changes/decisions

The offline audit preserves every raw row, separates conditions, retains unresolved exact identities, records price completeness independently from stock, and builds a deterministic source-stratified queue of up to twenty new listings. Source slugs and family names do not establish canonical identity. Conditional discounts do not reduce guaranteed totals without confirmed eligibility and stacking.

## Checks

U04 tests eight catalog behaviors including exact totals, invalid monetary inputs, duplicate source records and deterministic nonmutation. audit_run executes against the full current snapshot. Hashes and logs are in the R04 run record.

## Gaps and next action

Reviewed=0, rejected=0, unknown=70. Manually verify the queued listings against exact manufacturer part/configuration evidence and retailer delivery/fee/stock evidence. Use documented source permissions before production storage/display. The queue is prepared; its observations have not been performed.
