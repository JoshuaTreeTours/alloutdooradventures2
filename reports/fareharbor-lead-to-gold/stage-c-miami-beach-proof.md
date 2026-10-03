# Stage C Miami Beach legacy FareHarbor tranche

Scope is `citySlug === miami-beach` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/miami-beach`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Miami Beach bucket.

- Total Miami Beach legacy products: 11
- Active booking pages: 11
- Terminal booking pages: 0
- Geography conflicts with Miami Beach: 0
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 0
- Published Miami Beach routes: 9
- Withheld for no authoritative price: 2
- Authoritative price-preview fares among active pages: 10
- Active PRICE_NOT_FOUND before editorial: 1
- Runtime PASS: 9
- Runtime FAIL: 0
- Terminal removals: 0
- PRICE_NOT_FOUND after editorial: 1
- INSUFFICIENT_SOURCE_CONTENT: 1
- SOURCE_NOT_FOUND: 0
- OK priced pages: 9
- Runtime pages with a FareHarbor rating: 9
- Runtime pages without a FareHarbor rating: 0

## Ratings

TripAdvisor wins when `ratings.tripadvisor.rating` and `num_reviews` are present. Otherwise Google reviews on the same endpoint are shown as Google.
- `107989` `Everglades Airboat Adventure + FREE 2 HOURS with Rentals.` — 4.9 / 2155 Google
- `117385` `Miami City and Boat Tour Combo Little Havana Included plus FREE 2 HOURS with Rentals.` — 4.9 / 2155 Google
- `297478` `Everglades Airboat and Millionaire's Row Cruiser Tour Combo + FREE 2 HOURS with Rentals.` — 4.9 / 2155 Google
- `575606` `Miami Beach Bikes, Bites & Views Food Tour (Adults Only)` — 4.9 / 398 TripAdvisor
- `176702` `Key West Tour with Dolphin Spotting Boat from Miami` — 3.7 / 383 TripAdvisor
- `81627` `Everglades Airboat and Wildlife Sanctuary with round-trip transportation` — 3.7 / 383 TripAdvisor
- `81669` `Key West Tour with Snorkel Boat from Miami` — 3.7 / 383 TripAdvisor
- `266593` `Miami Boat Tour with FREE South Beach Bicycle Rental` — 4.7 / 33 TripAdvisor
- 1 more published pages carry a FareHarbor rating.

## Geography conflicts

- None.

## Terminal records retained for audit


## Manual review

- `625274` `PRICE_NOT_FOUND` `/destinations/florida/miami-beach/tours/aqua-escape-party-boat-625274` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 60 words; rich FareHarbor source requires at least 100 words
- `293969` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/miami-beach/tours/miami-millionaires-row-cruiser-tour-free-2-hours-with-rentals-293969` — none
