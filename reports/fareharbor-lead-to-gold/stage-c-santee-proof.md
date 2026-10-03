# Stage C Santee legacy FareHarbor tranche

Scope is `citySlug === santee` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/santee`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Santee bucket.

- Total Santee legacy products: 2
- Active booking pages: 2
- Terminal booking pages: 0
- Geography conflicts with Santee: 0
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 0
- Published Santee routes: 0
- Withheld for no authoritative price: 2
- Authoritative price-preview fares among active pages: 2
- Active PRICE_NOT_FOUND before editorial: 0
- Runtime PASS: 0
- Runtime FAIL: 0
- Terminal removals: 0
- PRICE_NOT_FOUND after editorial: 0
- INSUFFICIENT_SOURCE_CONTENT: 2
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

- `231271` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/santee/tours/zoo-animal-party-1-15-attendees-231271` — none
- `359106` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/santee/tours/zoo-animal-party-16-35-attendees-359106` — none
