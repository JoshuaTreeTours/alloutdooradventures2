# Stage C Joshua Tree legacy FareHarbor tranche

Scope is `citySlug === joshua-tree` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/joshua-tree`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Joshua Tree bucket.

- Total Joshua Tree legacy products: 23
- Active booking pages: 22
- Terminal booking pages: 1
- Geography conflicts with Joshua Tree: 1
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 1
- Published Joshua Tree routes: 12
- Withheld for no authoritative price: 9
- Authoritative price-preview fares among active pages: 17
- Active PRICE_NOT_FOUND before editorial: 5
- Runtime PASS: 12
- Runtime FAIL: 0
- Terminal removals: 1
- PRICE_NOT_FOUND after editorial: 4
- INSUFFICIENT_SOURCE_CONTENT: 6
- SOURCE_NOT_FOUND: 0
- OK priced pages: 12
- Runtime pages with a FareHarbor rating: 8
- Runtime pages without a FareHarbor rating: 4

## Ratings

TripAdvisor wins when `ratings.tripadvisor.rating` and `num_reviews` are present. Otherwise Google reviews on the same endpoint are shown as Google.
- `402194` `Sunset Trail Ride` — 5 / 373 Google
- `513079` `El Dorado` — 5 / 373 Google
- `514091` `La Luna` — 5 / 373 Google
- `514094` `Durango` — 5 / 373 Google
- `515026` `Campsite #6` — 5 / 373 Google
- `520036` `Campsite #7` — 5 / 373 Google
- `587300` `In the Company of Horses & Wine` — 5 / 373 Google
- `598562` `Morning Trail Ride` — 5 / 373 Google

## Geography conflicts

- `459584` `Private Stargazing with an Astronomer` — exclude — Twentynine Palms, California from company_start_location does not belong to Joshua Tree, and no matching public destination exists — `/destinations/california/twentynine-palms/tours/private-stargazing-with-an-astronomer-459584`

## Terminal records retained for audit

- `901301` `/destinations/california/joshua-tree/tours/joshua-tree-stargazing-night-walk-901301` — `BOOKING_PAGE_NOT_FOUND`

## Manual review

- `459584` geography exclude — Twentynine Palms, California from company_start_location does not belong to Joshua Tree, and no matching public destination exists
- `459584` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/twentynine-palms/tours/private-stargazing-with-an-astronomer-459584` — full product title is repeated in the description
- `512102` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/joshua-tree/tours/custom-groups-512102` — none
- `528426` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/joshua-tree/tours/photography-hike-528426` — none
- `365796` `PRICE_NOT_FOUND` `/destinations/california/joshua-tree/tours/equine-therapy-365796` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 27 words; rich FareHarbor source requires at least 100 words
- `404983` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/joshua-tree/tours/1-hour-visitor-pass-404983` — none
- `444127` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/joshua-tree/tours/interactive-equine-visitor-pass-444127` — none
- `475058` `PRICE_NOT_FOUND` `/destinations/california/joshua-tree/tours/pony-ride-475058` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 13 words; rich FareHarbor source requires at least 100 words
- `475064` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/joshua-tree/tours/natural-horsemanship-and-basic-riding-lessons-475064` — none
- `476256` `PRICE_NOT_FOUND` `/destinations/california/joshua-tree/tours/photoshoot-476256` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 18 words; rich FareHarbor source requires at least 100 words
- `646142` `PRICE_NOT_FOUND` `/destinations/california/joshua-tree/tours/sunset-sound-bath-with-wild-horses-646142` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 52 words; rich FareHarbor source requires at least 100 words
