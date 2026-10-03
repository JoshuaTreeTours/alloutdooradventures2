# Stage C Laguna Beach legacy FareHarbor tranche

Scope is `citySlug === laguna-beach` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/laguna-beach`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Laguna Beach bucket.

- Total Laguna Beach legacy products: 3
- Active booking pages: 3
- Terminal booking pages: 0
- Geography conflicts with Laguna Beach: 0
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 0
- Published Laguna Beach routes: 1
- Withheld for no authoritative price: 2
- Authoritative price-preview fares among active pages: 1
- Active PRICE_NOT_FOUND before editorial: 2
- Runtime PASS: 1
- Runtime FAIL: 0
- Terminal removals: 0
- PRICE_NOT_FOUND after editorial: 2
- INSUFFICIENT_SOURCE_CONTENT: 0
- SOURCE_NOT_FOUND: 0
- OK priced pages: 1
- Runtime pages with a FareHarbor rating: 0
- Runtime pages without a FareHarbor rating: 1

## Ratings

- None. The ratings endpoint did not return a TripAdvisor or Google pair for any published page.

## Geography conflicts

- None.

## Terminal records retained for audit


## Manual review

- `245311` `PRICE_NOT_FOUND` `/destinations/california/laguna-beach/tours/electric-bike-rentals---in-store-rentals-245311` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 32 words; rich FareHarbor source requires at least 100 words
- `247443` `PRICE_NOT_FOUND` `/destinations/california/laguna-beach/tours/electric-bike-rentals---delivery-247443` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 36 words; rich FareHarbor source requires at least 100 words; meaningless filler: the description says the group covers a title or label
