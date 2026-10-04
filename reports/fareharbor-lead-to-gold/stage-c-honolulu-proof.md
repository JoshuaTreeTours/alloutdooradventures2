# Stage C Honolulu legacy FareHarbor tranche

Scope is `citySlug === honolulu` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/honolulu`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Honolulu bucket.

- Total Honolulu legacy products: 42
- Active booking pages: 42
- Terminal booking pages: 0
- Geography conflicts with Honolulu: 0
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 0
- Published Honolulu routes: 32
- Withheld for no authoritative price: 10
- Authoritative price-preview fares among active pages: 39
- Active PRICE_NOT_FOUND before editorial: 3
- Runtime PASS: 32
- Runtime FAIL: 0
- Terminal removals: 0
- PRICE_NOT_FOUND after editorial: 3
- INSUFFICIENT_SOURCE_CONTENT: 7
- SOURCE_NOT_FOUND: 0
- OK priced pages: 32
- Runtime pages with a FareHarbor rating: 21
- Runtime pages without a FareHarbor rating: 11

## Ratings

TripAdvisor wins when `ratings.tripadvisor.rating` and `num_reviews` are present. Otherwise Google reviews on the same endpoint are shown as Google.
- `42966` `Pearl Harbor City - from Waikiki` — 4.9 / 38886 TripAdvisor
- `9620` `Pearl Harbor Remembered A - from Waikiki` — 4.9 / 38886 TripAdvisor
- `284519` `Turtle Canyons Snorkel Excursion` — 5 / 8891 Google
- `323935` `Waikiki Sunset Cruise BYOB` — 5 / 8891 Google
- `494462` `Deluxe Snorkel and Wildlife Cruise` — 5 / 8891 Google
- `247` `Parasail` — 4.9 / 8172 TripAdvisor
- `110203` `Turtle Snorkeling Adventure + Guaranteed Sightings` — 4.8 / 5559 Google
- `80660` `Sunset Splash Adventure` — 4.8 / 5559 Google
- 13 more published pages carry a FareHarbor rating.

## Geography conflicts

- None.

## Terminal records retained for audit


## Manual review

- `556053` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/hawaii/honolulu/tours/downhill-bike-and-koolau-waterfall-hike-556053` — none
- `556071` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/hawaii/honolulu/tours/rainforest-to-reef-tour-full-day-556071` — none
- `556977` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/hawaii/honolulu/tours/downhill-bike-adventure-556977` — none
- `114800` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/hawaii/honolulu/tours/private-bike-tour-experience-114800` — none
- `558599` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/hawaii/honolulu/tours/hawaii-foodie-budget-bike-tour-558599` — none
- `640554` `PRICE_NOT_FOUND` `/destinations/hawaii/honolulu/tours/private-boat-charter-in-waikiki-big-kahuna-640554` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 26 words; rich FareHarbor source requires at least 100 words
- `68065` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/hawaii/honolulu/tours/canoe-surfing-68065` — none
- `68068` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/hawaii/honolulu/tours/burial-at-sea-68068` — none
