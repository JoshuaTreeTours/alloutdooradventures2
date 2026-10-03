# Stage C Fort Lauderdale legacy FareHarbor tranche

Scope is `citySlug === fort-lauderdale` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/fort-lauderdale`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Fort Lauderdale bucket.

- Total Fort Lauderdale legacy products: 1
- Active booking pages: 1
- Terminal booking pages: 0
- Geography conflicts with Fort Lauderdale: 0
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 0
- Published Fort Lauderdale routes: 0
- Withheld for no authoritative price: 1
- Authoritative price-preview fares among active pages: 0
- Active PRICE_NOT_FOUND before editorial: 1
- Runtime PASS: 0
- Runtime FAIL: 0
- Terminal removals: 0
- PRICE_NOT_FOUND after editorial: 1
- INSUFFICIENT_SOURCE_CONTENT: 0
- SOURCE_NOT_FOUND: 0
- OK priced pages: 0
- Runtime pages with a FareHarbor rating: 0
- Runtime pages without a FareHarbor rating: 0

## Ratings

- None. The ratings endpoint did not return a TripAdvisor or Google pair for any published page.

## Geography conflicts

- None.

## Terminal records retained for audit


## Manual review

- `56394` `PRICE_NOT_FOUND` `/destinations/florida/fort-lauderdale/tours/las-olas-coffee-snacks-and-shops-tour-56394` — schema description is not shorter than the editorial body; malformed keyword fragment; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 12 words; rich FareHarbor source requires at least 100 words
