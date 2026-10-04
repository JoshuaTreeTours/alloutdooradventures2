# Stage C Miami legacy FareHarbor tranche

Scope is `citySlug === miami` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/miami`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Miami bucket.

- Total Miami legacy products: 12
- Active booking pages: 12
- Terminal booking pages: 0
- Geography conflicts with Miami: 0
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 0
- Published Miami routes: 4
- Withheld for no authoritative price: 8
- Authoritative price-preview fares among active pages: 8
- Active PRICE_NOT_FOUND before editorial: 4
- Runtime PASS: 4
- Runtime FAIL: 0
- Terminal removals: 0
- PRICE_NOT_FOUND after editorial: 4
- INSUFFICIENT_SOURCE_CONTENT: 4
- SOURCE_NOT_FOUND: 0
- OK priced pages: 4
- Runtime pages with a FareHarbor rating: 1
- Runtime pages without a FareHarbor rating: 3

## Ratings

TripAdvisor wins when `ratings.tripadvisor.rating` and `num_reviews` are present. Otherwise Google reviews on the same endpoint are shown as Google.
- `371933` `Miami Downtown Private Airplane Tour` — 4.9 / 278 Google

## Geography conflicts

- None.

## Terminal records retained for audit


## Manual review

- `660403` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/miami/tours/private-everglades-airboat-tour-660403` — none
- `660426` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/miami/tours/sunrise-private-airboat-tour-660426` — none
- `660427` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/miami/tours/sunset-private-airboat-tour-660427` — none
- `660430` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/miami/tours/nighttime-private-airboat-tour-660430` — none
- `538569` `PRICE_NOT_FOUND` `/destinations/florida/miami/tours/salt-cured-50-yacht-538569` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 21 words; rich FareHarbor source requires at least 100 words
