# Stage B source-ingestion recommendation

Status: recommendation only. Do not implement until this architecture is approved. Stage B has not started.

## Recommendation

Re-harvest authoritative FareHarbor content and price endpoints into stored build artifacts, and use that harvest as the only source for later page copy and offers. Treat the unmerged derivative as a secondary factual cross-check. Do not copy it into product pages.

## Option A — stored re-harvest

Fetch each active legacy FareHarbor item once and store the raw responses next to the repository, with company shortname, item id, endpoint, fetch time, and a content hash. Rendering code reads those files. It does not call FareHarbor during a page request.

Store these responses:

- `https://fareharbor.com/api/items/v1/{company}/{item}/content/`
- `https://fareharbor.com/api/items/v1/{company}/{item}/structured-description/`
- `https://fareharbor.com/api/v1/companies/{company}/items/{item}/`
- `https://fareharbor.com/api/embed/{company}/price-preview/per-item/v2/?item_pks={item}`

The content and structured-description payloads are the operator's own prose, duration, meeting point, inclusions, and restrictions. The price-preview payload is the same family already used by the unmerged 131-row cache (`fareharbor-price-preview-v2`). A stored harvest can be repeated and diffed. Missing or thin payloads stay insufficient-source exceptions instead of being padded to 150 words.

## Option B — unmerged derivative as a secondary source

`origin/feat/fareharbor-content-rebuild:src/data/fareharborRebuild.generated.ts` has 7,447 route records. They were harvested from the content endpoints above, then wrapped in the sentence "is a locally operated experience in …" on every route. Matched to current generated paths, the average description is about 69 words. Only 41 matched routes reach 150 words. The file has no price and no rating.

The price cache on `origin/feat/fareharbor-commercial-reserve-phase1:src/data/fareharborPricing.ts` has 131 high-confidence USD adult prices. It does not include Country Boy item `145208`. Coverage against the 6,126 active legacy keys is a small minority.

Country Boy's stored derivative is 49 words. It names a one-hour group tour, ages 4+, a walk of more than 1,000 feet, and gold panning. It also carries operator marketing ("award winning", "you might just strike gold") that must not become AOA copy.

Use this derivative to check whether a re-harvest missed a fact, and to list products with no stored description. Do not treat the template opener, `quality_score / 20`, or `availability_count` as authoritative prose or ratings.

## Why Option A is the primary path

Main has no trustworthy from-price, currency, or product rating for this catalog. The visible Country Boy page is boilerplate, while Product and TouristTrip JSON-LD still offer a synthetic $129 floor. A provenance model has to exist before that floor is removed. The derivative cannot supply that price, and most of its text is too short and too templated to support a truthful 150-word rewrite.

## What this recommendation does not authorize

- No FareHarbor calls in this stage.
- No product-page, schema, price, rating, Engine 6, or Viator edits.
- No import of the derivative or the price cache onto this branch.
- No removal of `PRICE_FLOOR_USD`.
