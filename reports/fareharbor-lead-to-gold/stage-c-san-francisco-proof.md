# Stage C San Francisco legacy FareHarbor tranche

Scope is `citySlug === san-francisco` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/san-francisco`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the San Francisco bucket.

- Total San Francisco legacy products: 21
- Active booking pages: 17
- Terminal booking pages: 4
- Geography conflicts with San Francisco: 0
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 0
- Published San Francisco routes: 14
- Withheld for no authoritative price: 3
- Authoritative price-preview fares among active pages: 14
- Active PRICE_NOT_FOUND before editorial: 3
- Runtime PASS: 14
- Runtime FAIL: 0
- Terminal removals: 4
- PRICE_NOT_FOUND after editorial: 3
- INSUFFICIENT_SOURCE_CONTENT: 0
- SOURCE_NOT_FOUND: 0
- OK priced pages: 14
- Runtime pages with a FareHarbor rating: 14
- Runtime pages without a FareHarbor rating: 0

## Ratings

TripAdvisor wins when `ratings.tripadvisor.rating` and `num_reviews` are present. Otherwise Google reviews on the same endpoint are shown as Google.
- `10199` `Golden Gate Bridge to Sausalito Bike Tour` — 4.5 / 2825 TripAdvisor
- `15779` `Alcatraz & Streets of San Francisco Tour` — 4.5 / 2825 TripAdvisor
- `165139` `Bike The Bridge & Muir Woods Tour Combo` — 4.5 / 2825 TripAdvisor
- `280403` `Alcatraz & Full Day Electric Bike Rental` — 4.5 / 2825 TripAdvisor
- `333235` `Private Golden Gate Bridge to Sausalito` — 4.5 / 2825 TripAdvisor
- `81664` `Alcatraz & the Golden Gate Bridge to Sausalito Tour` — 4.5 / 2825 TripAdvisor
- `138644` `The Golden Gate Bridge Bike Tour` — 4.3 / 224 TripAdvisor
- `201053` `Best of San Francisco Electric Bike Tour` — 4.3 / 224 TripAdvisor
- 6 more published pages carry a FareHarbor rating.

## Geography conflicts

- None.

## Terminal records retained for audit

- `901001` `/destinations/california/san-francisco/tours/golden-gate-kayak-adventure-901001` — `BOOKING_PAGE_NOT_FOUND`
- `901003` `/destinations/california/san-francisco/tours/san-francisco-sunset-cruise-901003` — `BOOKING_PAGE_NOT_FOUND`
- `901002` `/destinations/california/san-francisco/tours/golden-gate-bridge-electric-bike-tour-901002` — `BOOKING_PAGE_NOT_FOUND`
- `423384` `/destinations/california/san-francisco/tours/go-with-the-flow---south-423384` — `BOOKING_PAGE_NOT_FOUND`

## Manual review

- None.
