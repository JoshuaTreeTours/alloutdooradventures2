# Stage C Goodland legacy FareHarbor tranche

Scope is `citySlug === goodland` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/goodland`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Goodland bucket.

- Total Goodland legacy products: 30
- Active booking pages: 29
- Terminal booking pages: 1
- Geography conflicts with Goodland: 0
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 0
- Published Goodland routes: 18
- Withheld for no authoritative price: 11
- Authoritative price-preview fares among active pages: 24
- Active PRICE_NOT_FOUND before editorial: 5
- Runtime PASS: 18
- Runtime FAIL: 0
- Terminal removals: 1
- PRICE_NOT_FOUND after editorial: 4
- INSUFFICIENT_SOURCE_CONTENT: 7
- SOURCE_NOT_FOUND: 0
- OK priced pages: 18
- Runtime pages with a FareHarbor rating: 10
- Runtime pages without a FareHarbor rating: 8

## Ratings

TripAdvisor wins when `ratings.tripadvisor.rating` and `num_reviews` are present. Otherwise Google reviews on the same endpoint are shown as Google.
- `128312` `Sunset Eco-Tour` — 5 / 1525 Google
- `154092` `4 Hour Shelling Tour` — 5 / 1525 Google
- `44195` `Marco Island Wildlife Sightseeing and Shelling Tour` — 5 / 1525 Google
- `44212` `Dolphin Tours` — 5 / 1525 Google
- `44214` `3 Hour Eco Tour` — 5 / 1525 Google
- `49231` `Private Wildlife Sightseeing and Shelling Tour` — 5 / 1525 Google
- `525862` `2 Hour Private Tour` — 5 / 1525 Google
- `525864` `3 Hour Private Tour` — 5 / 1525 Google
- 2 more published pages carry a FareHarbor rating.

## Geography conflicts

- None.

## Terminal records retained for audit

- `541644` `/destinations/florida/goodland/tours/afternoon-cruise-541644` — `BOOKING_PAGE_NOT_FOUND`

## Manual review

- `490967` `PRICE_NOT_FOUND` `/destinations/florida/goodland/tours/audubon-birding-tour-490967` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 14 words; rich FareHarbor source requires at least 100 words
- `692761` `PRICE_NOT_FOUND` `/destinations/florida/goodland/tours/3-hour-shelling-tour-692761` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 46 words; rich FareHarbor source requires at least 100 words
- `239568` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/goodland/tours/sunset-boat-tour-239568` — none
- `239574` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/goodland/tours/best-of-marco-dolphin-boat-tour-239574` — none
- `239623` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/goodland/tours/4hr-private-boat-tour-239623` — none
- `332475` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/goodland/tours/6hr-private-boat-tour-332475` — none
- `339514` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/goodland/tours/3hr-private-boat-tour-339514` — none
- `478602` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/goodland/tours/25hr-private-boat-tour-478602` — none
- `524677` `PRICE_NOT_FOUND` `/destinations/florida/goodland/tours/2-hour-small-group-private-tour-524677` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 64 words; rich FareHarbor source requires at least 100 words
- `524679` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/goodland/tours/25hr-small-group-private-boat-tour-524679` — none
- `547157` `PRICE_NOT_FOUND` `/destinations/florida/goodland/tours/morning-eco-tour-25hr-private-547157` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 73 words; rich FareHarbor source requires at least 100 words
