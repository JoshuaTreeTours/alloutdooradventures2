# Stage C Sarasota legacy FareHarbor tranche

Scope is `citySlug === sarasota` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/sarasota`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Sarasota bucket.

- Total Sarasota legacy products: 11
- Active booking pages: 3
- Terminal booking pages: 8
- Geography conflicts with Sarasota: 0
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 0
- Published Sarasota routes: 1
- Withheld for no authoritative price: 2
- Authoritative price-preview fares among active pages: 1
- Active PRICE_NOT_FOUND before editorial: 2
- Runtime PASS: 1
- Runtime FAIL: 0
- Terminal removals: 8
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

- `680066` `/destinations/florida/sarasota/tours/inshore-nearshore-fishing-charter-680066` — `BOOKING_PAGE_NOT_FOUND`
- `680075` `/destinations/florida/sarasota/tours/lil-angler-fishing-680075` — `BOOKING_PAGE_NOT_FOUND`
- `680076` `/destinations/florida/sarasota/tours/single-angler-fishing-enthusiast-680076` — `BOOKING_PAGE_NOT_FOUND`
- `680083` `/destinations/florida/sarasota/tours/eco-nature-tours-680083` — `BOOKING_PAGE_NOT_FOUND`
- `680091` `/destinations/florida/sarasota/tours/sandbar-shelling-excursion-680091` — `BOOKING_PAGE_NOT_FOUND`
- `680092` `/destinations/florida/sarasota/tours/lil-pirate-treasure-hunt-680092` — `BOOKING_PAGE_NOT_FOUND`
- `680093` `/destinations/florida/sarasota/tours/cheeseburger-in-sarasota-paradise-680093` — `BOOKING_PAGE_NOT_FOUND`
- `430401` `/destinations/florida/sarasota/tours/seahorse-safari-430401` — `BOOKING_PAGE_NOT_FOUND`

## Manual review

- `579414` `PRICE_NOT_FOUND` `/destinations/florida/sarasota/tours/private-3-hour-island-sandbar-tiki-cruise-579414` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 34 words; rich FareHarbor source requires at least 100 words
