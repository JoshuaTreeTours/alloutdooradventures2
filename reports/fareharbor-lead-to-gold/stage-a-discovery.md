# Stage A — Legacy FareHarbor Lead to Gold discovery

Status: STOP. Stage B is not authorized by this report.

Generated: 2026-09-29T17:21:02.268123+00:00
Base commit: `fdc69d340314f13ee844c44cd2cc2724cb128212`
Branch: `fix/fareharbor-lead-to-gold`

## Authoritative population

The brief estimated about 7,000 legacy FareHarbor products. Unique item keys in the CSV files read by `scripts/import-tours-from-csv.ts` are 6,960, which is the warehouse behind that estimate. The generated page catalog is smaller because import drops rows. Engine 2 modules add FareHarbor items that never entered `tours.generated.ts`. Engine 3 in this repository is Viator-only. There are **0 Engine 3 FareHarbor products**.

| Population | Count |
| --- | ---: |
| CSV warehouse rows with an item id | 12902 |
| Unique `company:item` keys in the CSV warehouse | 10751 |
| Importer CSV rows (`import-tours-from-csv.ts` directories) | 7467 |
| Unique importer `company:item` keys | 6960 |
| `fhdn-mxn` affiliate rows (MXN marketplace signal, not a price) | 66 |
| `tours.generated.ts` records | 5173 |
| Generated FareHarbor records | 5173 |
| Generated Viator records | 0 |
| Unique generated FareHarbor keys | 5143 |
| Engine 2 FareHarbor keys in `src/engine2/data` | 1603 |
| Engine 2 keys also present in the generated catalog | 596 |
| Engine 2 FareHarbor keys absent from the generated catalog | 1007 |
| Manual / Flagstaff / Sedona FareHarbor keys | 77 |
| Supplement keys absent from the generated catalog | 61 |
| Engine 3 FareHarbor keys | 0 |
| Proposed active legacy FareHarbor population | 6126 |
| Excluded retired / opt-out / Engine6-path collisions | 84 |
| Engine 6 configured routes (Viator, excluded) | 1139 |
| Engine 6 routes that collide with a legacy FareHarbor canonical path | 4 |
| Engine 3 Viator product records (excluded) | 3 |
| Engine 4 Viator product records (excluded) | 36 |
| Engine 2 file Viator URL hits (excluded) | 2 |
| Retired FareHarbor item ids | 152 |
| Retired ids that also appear in the generated catalog | 73 |
| CSV rows missing description text | 12900 |
| Duplicate `company:item` signals | 2151 |
| Same item id used by more than one company | 3 |
| Malformed source signals | 4 |

### How engines map

- **Engine 1 / untagged legacy catalog.** `src/data/tours.generated.ts` is produced by `scripts/import-tours-from-csv.ts`. Records have no `engine` field. `src/data/tours.ts` calls this path engine1 and ranks it below Engine 2.
- **Engine 2 FareHarbor.** Separate modules under `src/engine2/data`, mostly the same CSV items rendered through `buildTourCopy`. Public dedupe keeps the Engine 2 record when the FareHarbor item id collides.
- **Engine 3.** `src/engine3/types.ts` fixes `bookingProvider` to `viator`. Three Palm Springs Viator products. Not a FareHarbor population.
- **Engine 4 and Engine 6.** Viator. Out of scope. This discovery does not modify them.

The migration population proposed for later stages is the active legacy FareHarbor set above: unique FareHarbor item keys from the generated catalog, Engine 2-only modules, and manual/Flagstaff/Sedona supplements, minus retired ids, the red-jeep opt-out, and canonical paths occupied by Engine 6. The CSV warehouse is larger because regional files repeat the same item and because many CSV files are not published by the current importer.

## Source mapping

Authoritative commercial prose, prices, and product ratings are **not stored on main**.

What main does contain:

- Catalog CSVs with operator, item id, title, tags, image, quality score, availability count, and FareHarbor embed URLs. The standard 17-column header has no description, price, currency, or rating.
- `src/data/fareharborPricing.ts` is an empty object on main.
- `src/utils/fh/fareharborBookFixtures.ts` contains two hand-authored HTML fixtures (`data-fh` sections) for items `34849` and `459591`. Those are parser fixtures, not a catalog harvest.
- `data/amsterdam.csv` is a 10-column example file (`example-amsterdam`, Unsplash image, prices 59 and 45). It is not an authoritative FareHarbor extract.
- `data/tourEnrichment.csv` descriptions use the filler sentence “Enjoy a guided …”. Prices and ratings in that file are blank.

What exists only on unmerged branches, inspected read-only and not copied onto this branch:

- `origin/feat/fareharbor-content-rebuild:src/data/fareharborRebuild.generated.ts` on `origin/feat/fareharbor-content-rebuild` has **7447** route records. Blob: `100644 blob db8fe9858ce30d6af53241dbb064cc7c6ce0137c 11183021	src/data/fareharborRebuild.generated.ts`.
- Those records were harvested from FareHarbor item APIs (`/api/items/v1/{company}/{item}/content/`, `structured-description/`, and `/api/v1/companies/{company}/items/{item}/`), then wrapped in a repeated opener: “is a locally operated experience in …” appears **7447** times. The file has rating fields: False. It has starting-price fields: False.
- Matched to current generated canonical paths: **4608**. Generated FareHarbor paths with no derivative: **535**.
- Derivative word count average among matched routes: **69.3**. Routes at or above 150 words: **41**.
- `origin/feat/fareharbor-commercial-reserve-phase1:src/data/fareharborPricing.ts` has **131** adult price-preview entries (`fareharbor-price-preview-v2`, confidence high). That cache is not on main. Country Boy item 145208 is in that cache: **False**.

Stage B cannot treat the unmerged derivative as raw FareHarbor HTML. It is already lightly templated. Raw API JSON was not committed. A later stage needs an explicit decision: re-harvest the FareHarbor content and price APIs into stored build artifacts on this branch, or extract facts from the unmerged derivative and mark its template opener as non-authoritative.

## Pricing

No trustworthy from-price is stored on main for the legacy catalog.

- Generated records with `startingPrice`: **0**.
- Generated records with `currency`: **0**.
- `badges.priceFrom` values: `[]`.
- Synthetic floor still in code: `PRICE_FLOOR_USD = 129` in `src/constants/merchantDefaults.ts`. `applyPriceFloor` in `src/utils/merchantPricing.ts` substitutes 129 when price is missing, zero, or below 20.
- `src/pages/tours/TourDetail.tsx` and `src/pages/tours/FlagstaffTourDetailRoute.tsx` render “From $129 per person” when that floor applies.
- `src/engine2/schema/buildSchemaGraph.ts` sets Engine 2 `schemaPrice` from `applyPriceFloor` when no rewrite price exists, so a missing Engine 2 price becomes Offer `129.00`.
- Static HTML does not use that React graph alone. `scripts/prerender.mjs` and `scripts/finalize-product-structured-data.mjs` call `buildTourProductStructuredData`, which runs `toOfferPrice` → `applyPriceFloor`. Missing FareHarbor prices are written as Offer `129.00` on both Product and TouristTrip. The visible Country Boy page shows no dollar amount.

Unmerged price cache currencies: `{'USD': 131}`.

## Ratings

The numbers on generated FareHarbor records are not FareHarbor product ratings.

`scripts/import-tours-from-csv.ts` sets `badges.rating` to `quality_score / 20` (clamped 1–5) and `badges.reviewCount` to `availability_count`. Quality score and availability count are catalog-export columns, not review aggregates.

- Rows compared to a CSV copy of the same item: **5173**.
- Generated records whose joined CSV row exists but the record has no rating badge: **76**. Wyoming and some other loaders never copy `quality_score` into `badges.rating`.
- Rating matched `quality_score / 20` on the preferred importer CSV row: **3796**.
- Review count matched availability count: **5111**.
- Mismatch sample (often a second CSV copy with a different quality score): `[{'itemId': '49383', 'catalogRating': 4.9, 'formulaRating': 4.8, 'qualityScore': '97', 'csvFile': 'data/cycling2.csv', 'csvCopies': 3}, {'itemId': '16628', 'catalogRating': 4.3, 'formulaRating': 4.2, 'qualityScore': '85', 'csvFile': 'data/cycling2.csv', 'csvCopies': 1}, {'itemId': '16637', 'catalogRating': 4.3, 'formulaRating': 4.2, 'qualityScore': '85', 'csvFile': 'data/cycling2.csv', 'csvCopies': 1}, {'itemId': '27344', 'catalogRating': 4.3, 'formulaRating': 4.2, 'qualityScore': '85', 'csvFile': 'data/cycling2.csv', 'csvCopies': 3}, {'itemId': '27347', 'catalogRating': 4.3, 'formulaRating': 4.2, 'qualityScore': '85', 'csvFile': 'data/cycling2.csv', 'csvCopies': 3}, {'itemId': '37619', 'catalogRating': 4.3, 'formulaRating': 4.2, 'qualityScore': '85', 'csvFile': 'data/cycling2.csv', 'csvCopies': 3}, {'itemId': '92118', 'catalogRating': 4.3, 'formulaRating': 4.2, 'qualityScore': '85', 'csvFile': 'data/cycling2.csv', 'csvCopies': 1}, {'itemId': '284554', 'catalogRating': 4.3, 'formulaRating': 4.2, 'qualityScore': '85', 'csvFile': 'data/cycling2.csv', 'csvCopies': 2}]`.
- Most common derived ratings: `[('2.3', 306), ('2.4', 293), ('3.3', 291), ('1', 289), ('3.2', 243), ('2.5', 235), ('3.4', 226), ('2.2', 185)]`.
- The current Product schema graph in `src/schema/buildTourSchemaGraph.ts` does not emit `AggregateRating` for this legacy path.
- Engine 2 emits Viator `aggregateRating` only when `bookingProvider === "viator"`.

Product-level FareHarbor rating coverage on main: **0**. Unknown is the correct rating state.

## Content and boilerplate

- Generated long descriptions containing “keeps the logistics simple and the scenery front and center”: **5173** of 5173.
- Average generated long-description word count: **42.52**. Under 150 words: **5173**.
- `getExpandedTourDescription` in `src/data/tourNarratives.ts` appends three more generic paragraphs, including an invented skill level and a default duration of “a flexible half-day window” when no duration exists.
- Engine 2 copy template “more than a quick photo stop” occurrences in `src/engine2/data`: **497**.
- Engine 2 meta sentence “Guided experience, clear logistics, and memorable local stops” occurrences: **182**.
- Enrichment file “Enjoy a guided” rows: **286** of 288. Blank enrichment prices: **288**. Blank enrichment ratings: **286**.

A 150-word factual rewrite is not supported by the CSV row alone. Titles, tags, operator, and city are real. Itinerary, inclusions, duration, meeting point, and restrictions are not on main except inside the two fixtures and the unmerged derivative.

## Schema — Country Boy Gold Mine

Primary page: https://www.alloutdooradventures.com/destinations/colorado/breckenridge/tours/country-boy-gold-mine-tour-145208

```json
{
  "url": "https://www.alloutdooradventures.com/destinations/colorado/breckenridge/tours/country-boy-gold-mine-tour-145208",
  "status": 200,
  "finalUrl": "https://www.alloutdooradventures.com/destinations/colorado/breckenridge/tours/country-boy-gold-mine-tour-145208",
  "htmlBytes": 18713,
  "visible129": true,
  "visibleFromPrice": false,
  "boilerplatePhrasePresent": true,
  "expandedBoilerplatePresent": true,
  "jsonLdSummaries": [
    {
      "@type": "Product",
      "name": "Country Boy Gold Mine Tour",
      "offers": {
        "@type": "Offer",
        "url": "https://www.alloutdooradventures.com/destinations/colorado/breckenridge/tours/country-boy-gold-mine-tour-145208/book",
        "availability": "https://schema.org/InStock",
        "price": "129.00",
        "priceCurrency": "USD",
        "priceValidUntil": "2027-09-29"
      },
      "aggregateRating": null
    },
    {
      "@type": "TouristTrip",
      "name": "Country Boy Gold Mine Tour"
    },
    {
      "@type": "BreadcrumbList",
      "itemCount": 3
    }
  ]
}
```

Live production HTML, fetched during this discovery, is the assay. Static HTML is written by `scripts/prerender.mjs` and `scripts/finalize-product-structured-data.mjs` through `buildTourProductStructuredData` / `buildTourTripStructuredData`. `toOfferPrice` calls `applyPriceFloor`, so a missing FareHarbor price becomes `129.00`.

- Visible page: no from-price. The hero shows BOOK and no dollar amount. The body is four boilerplate paragraphs, including an invented skill level and “a flexible half-day window”. The snapshot duration says “Check booking page”.
- Product JSON-LD: one Product node. Offer price is `129.00` USD, availability `https://schema.org/InStock`, no AggregateRating. That price is the synthetic floor. It does not match a visible price because the page shows no price.
- TouristTrip JSON-LD: a second Offer with the same synthetic `129.00`. Two commercial Offer nodes, one product.
- Merchant listing fails because the price is synthetic and not visible.
- Product snippet fails for the same price mismatch.
- BreadcrumbList is present with three items: Destinations, Colorado, and the product. The live list does not include the city or a Tours crumb.
- Catalog `badges.rating` 3.2 and `reviewCount` 895 are the quality-score formula and the availability count. They are not in the live schema. They must stay out.

Google Rich Results Test was not executed. Manual URL:

https://search.google.com/test/rich-results?url=https%3A%2F%2Fwww.alloutdooradventures.com%2Fdestinations%2Fcolorado%2Fbreckenridge%2Ftours%2Fcountry-boy-gold-mine-tour-145208

## Representative products

Full dossiers are in `stage-a-representative-products.json`.

Sample size: **10**. Destinations: 10. Operators: 10. Activity types: gold-mine tour, self-guided bike, walking / subway, scenic float, motorcycle rental, private float, e-bike, jeep, kayak, blowhole / sightseeing. Pricing states: no-stored-price, unmerged-price-cache. Paths: engine2-only, legacy-catalog.

- **Country Boy Gold Mine Tour** (`145208`, Breckenridge, Colorado, countryboymine). Path: legacy-catalog. Activity: gold-mine tour. Primary assay sample required by the brief Legacy words: 42. Derivative stored: True. Unmerged price: none.
- **Haleakala Downhill Self-Guided Bike Tour** (`181765`, Paia, Hawaii, mauisunriders). Path: legacy-catalog. Activity: self-guided bike. Present in the unmerged 132-item FareHarbor price cache Legacy words: 43. Derivative stored: True. Unmerged price: 119.0 USD.
- **NYC's Underground Subway Tour - Private Tour** (`322210`, New York, New York, untappednewyork). Path: legacy-catalog. Activity: walking / subway. Longest stored derivative description among matched routes Legacy words: 45. Derivative stored: True. Unmerged price: none.
- **Scenic Float Tour** (`595701`, Wilson, Wyoming, wilsonfishingguides). Path: legacy-catalog. Activity: scenic float. Legacy page with no stored derivative on the unmerged rebuild branch Legacy words: 40. Derivative stored: False. Unmerged price: none.
- **Self-Guided ADV Motorcycle Rental – KLR 650** (`694384`, Cody, Wyoming, yellowstoneadvmoto). Path: legacy-catalog. Activity: motorcycle rental. Rental-shaped product Legacy words: 44. Derivative stored: True. Unmerged price: none.
- **Grand Teton Scenic Float - Private Tour** (`646999`, Moose, Wyoming, solitudefloattrips). Path: legacy-catalog. Activity: private float. Private-format product Legacy words: 43. Derivative stored: True. Unmerged price: none.
- **(Guided) 4-Hr E-Bike Tour of Vancouver Seawall - JW Marriott** (`612500`, Vancouver, British Columbia, hotelebikerentals). Path: legacy-catalog. Activity: e-bike. International or non-US location string Legacy words: 49. Derivative stored: True. Unmerged price: none.
- **Shared San Andreas Fault Jeep Tour** (`34849`, Palm Springs, California, red-jeep). Path: legacy-catalog. Activity: jeep. California jeep / desert activity Legacy words: 44. Derivative stored: False. Unmerged price: none.
- **Date Night Neon Glow Clear Kayak or Paddleboard & Champagne Orlando** (`333279`, Orlando, Florida, epicpaddleadventures). Path: legacy-catalog. Activity: kayak. Distinct activity type Legacy words: 47. Derivative stored: True. Unmerged price: none.
- **La Bufadora Tour in Baja California** (`193220`, Ensenada, California, wineroutebaja). Path: engine2-only. Activity: blowhole / sightseeing. Engine 2-only module path with an unmerged price-preview entry and no generated-catalog record Legacy words: n/a. Derivative stored: True. Unmerged price: 40.0 USD.

Country Boy stored derivative on the unmerged branch is 49 words. It does name a one-hour combined group tour, ages 4+, a walk of more than 1,000 feet into the mountain, and gold panning. It also carries operator marketing (“award winning”, “you might just strike gold”) that is not usable as AOA copy. Forty-nine source words cannot support a 150-word factual rewrite. Under the brief, that product is an insufficient-source exception unless a fuller FareHarbor content payload is harvested.


## Coverage estimate

| Signal | Estimate |
| --- | --- |
| Trustworthy from-price on main | 0% |
| High-confidence adult price on the unmerged price-preview cache, among active legacy keys | 66/6126 |
| Trustworthy currency on main | 0%. The empty price cache and the $129 floor both assume USD. |
| Trustworthy product rating | 0% |
| Trustworthy review count | 0%. Current counts are availability counts. |
| Usable derivative description on the unmerged branch, matched to a generated path | 4608 paths; 41 of those have at least 150 words before editorial rewrite |
| Insufficient source content on main | 12900 CSV item rows have no description |

## Blockers before Stage B

1. Confirm the population definition: active legacy FareHarbor keys, with Engine 3 FareHarbor = 0.
2. Authorize a stored re-harvest of FareHarbor content and price endpoints, or authorize fact extraction from the unmerged derivative. Do not scrape FareHarbor during page render.
3. Do not import `quality_score` or `availability_count` as ratings.
4. Remove the $129 floor from FareHarbor visible copy and Offer schema only after a price provenance model exists. That code change is Stage B or later, not this discovery commit's behavior change.
5. Engine 6 and Viator files stay untouched.

## Recommended Stage B source ingestion

This is a recommendation only. Neither option is implemented in this commit. Stage B stays unauthorized until the architecture is approved.

Prefer a stored re-harvest of authoritative FareHarbor content and price endpoints as the primary source. Keep the unmerged derivative as a secondary factual cross-check, not as page copy.

| Option | What it is | Why it is or is not enough |
| --- | --- | --- |
| Re-harvest into stored build artifacts | Fetch item content, structured description, item JSON, and the price-preview response once, and commit or cache those payloads with company, item id, endpoint, fetch time, and a content hash. Page render reads the stored artifact. | These responses are the operator's own fields: description, duration, meeting point, inclusions, restrictions, and adult from-price. The current main branch does not have them. A stored harvest can be re-run without scraping during a request. |
| Unmerged derivative as a secondary source | `origin/feat/fareharbor-content-rebuild:src/data/fareharborRebuild.generated.ts` (7,447 routes) plus the 131-row price cache on `origin/feat/fareharbor-commercial-reserve-phase1`. | The prose is already wrapped in one template sentence on every route. Matched descriptions average about 69 words, and only 41 matched routes reach 150 words. The file has no price and no rating. Country Boy's derivative is 49 words and includes operator marketing that must not be copied. The price cache misses Country Boy and covers a small slice of the 6,126 active keys. |

Use the derivative only to compare extracted facts and to notice products the re-harvest missed. Do not paste its template opener, quality score, or availability count into ratings. Leave the $129 floor in place until a harvested price has provenance. Products whose harvested facts cannot support a truthful 150-word page stay insufficient-source exceptions.

Endpoints to store, not to call at render time:

- `https://fareharbor.com/api/items/v1/{company}/{item}/content/`
- `https://fareharbor.com/api/items/v1/{company}/{item}/structured-description/`
- `https://fareharbor.com/api/v1/companies/{company}/items/{item}/`
- `https://fareharbor.com/api/embed/{company}/price-preview/per-item/v2/?item_pks={item}`

Full comparison: `reports/fareharbor-lead-to-gold/stage-b-source-ingestion-recommendation.md`.

## Files changed

Discovery artifacts only. No product page, Engine 6, or Viator renderer was modified.

## Tests

The discovery script asserts that Country Boy item 145208 resolves, Engine 3 FareHarbor count is 0, the generated catalog parses, the boilerplate phrase is present on the majority of generated descriptions, and the representative sample has at least 10 products across legacy and Engine 2-only paths. Production build was not run. Page output is unchanged.

## Usage and cost

Model: grok-4.7. Discovery was first recorded on this branch by https://cursor.com/agents/bc-6527e378-1e25-4a2a-9595-2b4b1260d6fd and corrected here by https://cursor.com/agents/bc-d789ac6a-38a7-405e-941c-614de4092196. Token counts and dollar cost are not exposed by run-info, so cost per product is not available for Stage A. This pass is a local census plus one production HTML fetch of the Country Boy page. It did not call FareHarbor. Stage B was not started.

## Checkpoint

`migration-manifest.jsonl` lists every discovered legacy FareHarbor key with source, price, rating, and content status. Rows in the representative sample have `representativeSample: true`. `rewriteStatus` and `validationStatus` are `not_started`. `migrationTimestamp` is null. Re-running discovery regenerates the same product statuses from source files.

