# Stage C Naples legacy FareHarbor tranche

Scope is `citySlug === naples` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/naples`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Naples bucket.

- Total Naples legacy products: 5
- Active booking pages: 5
- Terminal booking pages: 0
- Geography conflicts with Naples: 1
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 1
- Published Naples routes: 3
- Withheld for no authoritative price: 1
- Authoritative price-preview fares among active pages: 4
- Active PRICE_NOT_FOUND before editorial: 1
- Runtime PASS: 3
- Runtime FAIL: 0
- Terminal removals: 0
- PRICE_NOT_FOUND after editorial: 0
- INSUFFICIENT_SOURCE_CONTENT: 2
- SOURCE_NOT_FOUND: 0
- OK priced pages: 3
- Runtime pages with a FareHarbor rating: 3
- Runtime pages without a FareHarbor rating: 0

## Ratings

TripAdvisor wins when `ratings.tripadvisor.rating` and `num_reviews` are present. Otherwise Google reviews on the same endpoint are shown as Google.
- `44245` `Rookery Bay Kayak Tours` — 5 / 1525 Google
- `464256` `Deluxe Pedal Kayak Tour | Marco Island and Naples, Florida` — 5 / 1142 Google
- `416773` `Dolphin and Manatee Adventure Tour of Naples with Olde Florida History` — 4.8 / 343 Google

## Geography conflicts

- `416775` `Dolphin and Manatee Adventure Tour of Marco Island with Olde Florida History` — exclude — Naples Naples, Florida from meeting_point does not belong to Naples, and no matching public destination exists — `/destinations/florida/naples-naples/tours/dolphin-and-manatee-adventure-tour-of-marco-island-with-olde-florida-history-416775`

## Terminal records retained for audit


## Manual review

- `416775` geography exclude — Naples Naples, Florida from meeting_point does not belong to Naples, and no matching public destination exists
- `156715` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/naples/tours/ten-thousand-islands-tour-departing-from-our-new-location-port-of-the-islands-156715` — none
- `416775` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/naples-naples/tours/dolphin-and-manatee-adventure-tour-of-marco-island-with-olde-florida-history-416775` — none
