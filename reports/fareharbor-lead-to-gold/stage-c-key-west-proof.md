# Stage C Key West legacy FareHarbor tranche

Scope is `citySlug === key-west` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/key-west`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Key West bucket.

- Total Key West legacy products: 18
- Active booking pages: 18
- Terminal booking pages: 0
- Geography conflicts with Key West: 0
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 0
- Published Key West routes: 15
- Withheld for no authoritative price: 3
- Authoritative price-preview fares among active pages: 16
- Active PRICE_NOT_FOUND before editorial: 2
- Runtime PASS: 15
- Runtime FAIL: 0
- Terminal removals: 0
- PRICE_NOT_FOUND after editorial: 1
- INSUFFICIENT_SOURCE_CONTENT: 2
- SOURCE_NOT_FOUND: 0
- OK priced pages: 15
- Runtime pages with a FareHarbor rating: 6
- Runtime pages without a FareHarbor rating: 9

## Ratings

TripAdvisor wins when `ratings.tripadvisor.rating` and `num_reviews` are present. Otherwise Google reviews on the same endpoint are shown as Google.
- `624612` `Key West Southernmost Sweet Treats Tour` — 5 / 1463 TripAdvisor
- `104492` `Cowgirl 45' Premium Offshore Fishing Charter` — 4.8 / 1022 Google
- `26077` `Florida Keys Sunset Sail` — 4.9 / 487 Google
- `417200` `Half Day Charter 4hrs Boston Whaler` — 5 / 187 Google
- `417207` `3/4 Day 6hrs Boston Whaler` — 5 / 187 Google
- `515385` `5Hour Multiple Sandbar Hangout Boston Whaler` — 5 / 187 Google

## Geography conflicts

- None.

## Terminal records retained for audit


## Manual review

- `638429` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/key-west/tours/the-grand-admiral-638429` — none
- `637746` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/key-west/tours/2hr-sandbar-express---boston-whaler-637746` — none
