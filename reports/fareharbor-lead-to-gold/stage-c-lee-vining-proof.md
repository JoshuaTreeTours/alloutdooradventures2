# Stage C Lee Vining legacy FareHarbor tranche

Scope is `citySlug === lee-vining` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/lee-vining`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Lee Vining bucket.

- Total Lee Vining legacy products: 1
- Active booking pages: 1
- Terminal booking pages: 0
- Geography conflicts with Lee Vining: 1
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 1
- Published Lee Vining routes: 0
- Withheld for no authoritative price: 0
- Authoritative price-preview fares among active pages: 0
- Active PRICE_NOT_FOUND before editorial: 1
- Runtime PASS: 0
- Runtime FAIL: 0
- Terminal removals: 0
- PRICE_NOT_FOUND after editorial: 0
- INSUFFICIENT_SOURCE_CONTENT: 1
- SOURCE_NOT_FOUND: 0
- OK priced pages: 0
- Runtime pages with a FareHarbor rating: 0
- Runtime pages without a FareHarbor rating: 0

## Ratings

- None. The ratings endpoint did not return a TripAdvisor or Google pair for any published page.

## Geography conflicts

- `619660` `Summit Clouds Rest` — exclude — Yosemite, California from company_start_location does not belong to Lee Vining, and no matching public destination exists — `/destinations/california/yosemite/tours/summit-clouds-rest-619660`

## Terminal records retained for audit


## Manual review

- `619660` geography exclude — Yosemite, California from company_start_location does not belong to Lee Vining, and no matching public destination exists
- `619660` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/yosemite/tours/summit-clouds-rest-619660` — none
