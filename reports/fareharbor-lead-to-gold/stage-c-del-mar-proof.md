# Stage C Del Mar legacy FareHarbor tranche

Scope is `citySlug === del-mar` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/del-mar`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Del Mar bucket.

- Total Del Mar legacy products: 11
- Active booking pages: 11
- Terminal booking pages: 0
- Geography conflicts with Del Mar: 0
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 0
- Published Del Mar routes: 5
- Withheld for no authoritative price: 6
- Authoritative price-preview fares among active pages: 5
- Active PRICE_NOT_FOUND before editorial: 6
- Runtime PASS: 5
- Runtime FAIL: 0
- Terminal removals: 0
- PRICE_NOT_FOUND after editorial: 6
- INSUFFICIENT_SOURCE_CONTENT: 0
- SOURCE_NOT_FOUND: 0
- OK priced pages: 5
- Runtime pages with a FareHarbor rating: 0
- Runtime pages without a FareHarbor rating: 5

## Ratings

- None. The ratings endpoint did not return a TripAdvisor or Google pair for any published page.

## Geography conflicts

- None.

## Terminal records retained for audit


## Manual review

- `439580` `PRICE_NOT_FOUND` `/destinations/california/del-mar/tours/interactive-animal-encounter-439580` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 16 words; rich FareHarbor source requires at least 100 words
- `439587` `PRICE_NOT_FOUND` `/destinations/california/del-mar/tours/girl-scouts-badges-439587` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 44 words; rich FareHarbor source requires at least 100 words
- `461127` `PRICE_NOT_FOUND` `/destinations/california/del-mar/tours/outreaches-461127` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 37 words; rich FareHarbor source requires at least 100 words
- `483273` `PRICE_NOT_FOUND` `/destinations/california/del-mar/tours/onsite-field-trips-483273` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 38 words; rich FareHarbor source requires at least 100 words
- `509720` `PRICE_NOT_FOUND` `/destinations/california/del-mar/tours/spring-buddies-family-festival-509720` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 34 words; rich FareHarbor source requires at least 100 words
