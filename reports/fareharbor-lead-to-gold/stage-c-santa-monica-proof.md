# Stage C Santa Monica legacy FareHarbor tranche

Scope is `citySlug === santa-monica` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/santa-monica`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Santa Monica bucket.

- Total Santa Monica legacy products: 6
- Active booking pages: 4
- Terminal booking pages: 2
- Geography conflicts with Santa Monica: 0
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 0
- Published Santa Monica routes: 3
- Withheld for no authoritative price: 1
- Authoritative price-preview fares among active pages: 3
- Active PRICE_NOT_FOUND before editorial: 1
- Runtime PASS: 3
- Runtime FAIL: 0
- Terminal removals: 2
- PRICE_NOT_FOUND after editorial: 1
- INSUFFICIENT_SOURCE_CONTENT: 0
- SOURCE_NOT_FOUND: 0
- OK priced pages: 3
- Runtime pages with a FareHarbor rating: 3
- Runtime pages without a FareHarbor rating: 0

## Ratings

TripAdvisor wins when `ratings.tripadvisor.rating` and `num_reviews` are present. Otherwise Google reviews on the same endpoint are shown as Google.
- `394572` `Santa Monica & Venice Beach eBike Tour` — 4.5 / 2375 TripAdvisor
- `394573` `Santa Monica & Venice Beach Bike Tour` — 4.5 / 2375 TripAdvisor
- `395126` `Santa Monica Private Bike Tour` — 4.4 / 148 TripAdvisor

## Geography conflicts

- None.

## Terminal records retained for audit

- `49179` `/destinations/california/santa-monica/tours/small-group-tour-49179` — `BOOKING_PAGE_NOT_FOUND`
- `49189` `/destinations/california/santa-monica/tours/the-best-private-tour-in-town-49189` — `BOOKING_PAGE_NOT_FOUND`

## Manual review

- None.
