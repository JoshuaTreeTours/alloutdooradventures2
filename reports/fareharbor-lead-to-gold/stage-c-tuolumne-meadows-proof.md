# Stage C TUOLUMNE MEADOWS legacy FareHarbor tranche

Scope is `citySlug === tuolumne-meadows` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/tuolumne-meadows`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the TUOLUMNE MEADOWS bucket.

- Total TUOLUMNE MEADOWS legacy products: 7
- Active booking pages: 7
- Terminal booking pages: 0
- Geography conflicts with TUOLUMNE MEADOWS: 6
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 6
- Published TUOLUMNE MEADOWS routes: 0
- Withheld for no authoritative price: 1
- Authoritative price-preview fares among active pages: 1
- Active PRICE_NOT_FOUND before editorial: 6
- Runtime PASS: 0
- Runtime FAIL: 0
- Terminal removals: 0
- PRICE_NOT_FOUND after editorial: 1
- INSUFFICIENT_SOURCE_CONTENT: 6
- SOURCE_NOT_FOUND: 0
- OK priced pages: 0
- Runtime pages with a FareHarbor rating: 0
- Runtime pages without a FareHarbor rating: 0

## Ratings

- None. The ratings endpoint did not return a TripAdvisor or Google pair for any published page.

## Geography conflicts

- `619647` `Tenaya Lake: Family Swimming & Beach Day` — exclude — Yosemite, California from meeting_point does not belong to TUOLUMNE MEADOWS, and no matching public destination exists — `/destinations/california/yosemite/tours/tenaya-lake-family-swimming-and-beach-day-619647`
- `619653` `Yosemite Valley Walking Tour` — exclude — Yosemite, California from meeting_point does not belong to TUOLUMNE MEADOWS, and no matching public destination exists — `/destinations/california/yosemite/tours/yosemite-valley-walking-tour-619653`
- `619655` `Mist Trail: Vernal and Nevada Falls` — exclude — Yosemite, California from meeting_point does not belong to TUOLUMNE MEADOWS, and no matching public destination exists — `/destinations/california/yosemite/tours/mist-trail-vernal-and-nevada-falls-619655`
- `619659` `Backcountry Hike To Cathedral Lakes` — exclude — Yosemite, California from meeting_point does not belong to TUOLUMNE MEADOWS, and no matching public destination exists — `/destinations/california/yosemite/tours/backcountry-hike-to-cathedral-lakes-619659`
- `619663` `Hike to Upper Yosemite Falls` — exclude — Yosemite, California from meeting_point does not belong to TUOLUMNE MEADOWS, and no matching public destination exists — `/destinations/california/yosemite/tours/hike-to-upper-yosemite-falls-619663`
- `619664` `Summit Half Dome in a Day` — exclude — Yosemite, California from meeting_point does not belong to TUOLUMNE MEADOWS, and no matching public destination exists — `/destinations/california/yosemite/tours/summit-half-dome-in-a-day-619664`

## Terminal records retained for audit


## Manual review

- `619647` geography exclude — Yosemite, California from meeting_point does not belong to TUOLUMNE MEADOWS, and no matching public destination exists
- `619653` geography exclude — Yosemite, California from meeting_point does not belong to TUOLUMNE MEADOWS, and no matching public destination exists
- `619655` geography exclude — Yosemite, California from meeting_point does not belong to TUOLUMNE MEADOWS, and no matching public destination exists
- `619659` geography exclude — Yosemite, California from meeting_point does not belong to TUOLUMNE MEADOWS, and no matching public destination exists
- `619663` geography exclude — Yosemite, California from meeting_point does not belong to TUOLUMNE MEADOWS, and no matching public destination exists
- `619664` geography exclude — Yosemite, California from meeting_point does not belong to TUOLUMNE MEADOWS, and no matching public destination exists
- `619647` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/yosemite/tours/tenaya-lake-family-swimming-and-beach-day-619647` — none
- `619652` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/tuolumne-meadows/tours/family-hike-to-a-hidden-lake-and-swim-619652` — none
- `619653` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/yosemite/tours/yosemite-valley-walking-tour-619653` — none
- `619659` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/yosemite/tours/backcountry-hike-to-cathedral-lakes-619659` — none
- `619663` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/yosemite/tours/hike-to-upper-yosemite-falls-619663` — none
- `619664` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/yosemite/tours/summit-half-dome-in-a-day-619664` — none
