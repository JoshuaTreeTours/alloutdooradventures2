# Stage C Kailua-Kona legacy FareHarbor tranche

Scope is `citySlug === kailua-kona` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/kailua-kona`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Kailua-Kona bucket.

- Total Kailua-Kona legacy products: 27
- Active booking pages: 27
- Terminal booking pages: 0
- Geography conflicts with Kailua-Kona: 0
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 0
- Published Kailua-Kona routes: 23
- Withheld for no authoritative price: 4
- Authoritative price-preview fares among active pages: 24
- Active PRICE_NOT_FOUND before editorial: 3
- Runtime PASS: 23
- Runtime FAIL: 0
- Terminal removals: 0
- PRICE_NOT_FOUND after editorial: 3
- INSUFFICIENT_SOURCE_CONTENT: 1
- SOURCE_NOT_FOUND: 0
- OK priced pages: 23
- Runtime pages with a FareHarbor rating: 20
- Runtime pages without a FareHarbor rating: 3

## Ratings

TripAdvisor wins when `ratings.tripadvisor.rating` and `num_reviews` are present. Otherwise Google reviews on the same endpoint are shown as Google.
- `1470` `2-Tank Local Morning Dive Charter` — 5 / 7703 Google
- `1482` `2 Tank Night Manta Dive Charter` — 5 / 7703 Google
- `95023` `Premium Advanced 2 Tank Long Range Charter` — 5 / 7703 Google
- `95025` `Black Water Night Dive` — 5 / 7703 Google
- `95265` `Private Charter Honu Lele` — 5 / 7703 Google
- `22899` `Big Island Grand Circle Island Tour` — 4.9 / 6877 TripAdvisor
- `22900` `Twilight Volcano and Stargazing Tour` — 4.9 / 6877 TripAdvisor
- `22901` `Big Island Waterfalls Adventure` — 4.9 / 6877 TripAdvisor
- 12 more published pages carry a FareHarbor rating.

## Geography conflicts

- None.

## Terminal records retained for audit


## Manual review

- `436214` `PRICE_NOT_FOUND` `/destinations/hawaii/kailua-kona/tours/kona-barbeque-436214` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 58 words; rich FareHarbor source requires at least 100 words
- `127660` `PRICE_NOT_FOUND` `/destinations/hawaii/kailua-kona/tours/kona-luxury-dolphin-snorkel-sail-127660` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 44 words; rich FareHarbor source requires at least 100 words
- `6980` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/hawaii/kailua-kona/tours/waa-hawaiian-outrigger-canoe-rides-6980` — none
