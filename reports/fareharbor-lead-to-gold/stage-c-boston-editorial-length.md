# Stage C Boston editorial length

Scope is the 221 active Boston migrated FareHarbor products. No other city was processed. Geography, pricing authority, terminal products, and the Merchant feed were not retargeted.

The visible “What you’ll experience” body must be at least 100 words, and preferably 100–150, when authoritative FareHarbor copy can support that much specific prose. The reusable check lives in `editorial_voice.py` (`editorial_length_errors`) and `build_stage_b_proof.py` (`validate`). Withheld pages (`INSUFFICIENT_SOURCE_CONTENT`, missing source, terminal booking pages) keep a short stub. A non-withheld page under 100 words fails validation.

`INSUFFICIENT_SOURCE_CONTENT` is used only when structured description, public booking details, itinerary, and inclusions together are under 100 words. Richer sources are not relabeled insufficient to hide a short body.

## Counts

Measured against the prior Boston file (`d6787866`) and the rebuilt runtime set.

| Metric | Count |
| --- | ---: |
| Active pages under 100 words before correction | **200** |
| Of those, rewritten to 100–150 words | **44** |
| Of those, rewritten above 150 words (151–168) | 17 |
| Still genuinely `INSUFFICIENT_SOURCE_CONTENT` | **36** |
| Final runtime PASS | **114** |

The 200 figure excludes 4 pages that were already insufficient. Those 4 remain insufficient. 32 more active pages were classified insufficient because the stored source cannot support 100 words without invention. 36 total.

107 active pages still have a body under 100 words even though the raw source word count is at least 100. They stay `OK` or `PRICE_NOT_FOUND` and **fail** validation. They are not counted as insufficient. Runtime FAIL is 107, all for that length rule. 114 + 107 = 221.

Exception mix on the 221 runtime records: **83 priced OK / 102 `PRICE_NOT_FOUND` / 36 `INSUFFICIENT_SOURCE_CONTENT`**.

17 products were already at or above 100 words before this pass. All 17 stayed at or above 100 words.

Preferred band is 100–150 words. 23 published bodies are 151–168 words, including the City View Tour overlay (`27344`, 168). Length above 150 is not a validation failure.
