# Stage C Los Angeles legacy FareHarbor tranche

Scope is `citySlug === los-angeles` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/los-angeles`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Los Angeles bucket.

- Total Los Angeles legacy products: 15
- Active booking pages: 12
- Terminal booking pages: 3
- Geography conflicts with Los Angeles: 1
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 1
- Published Los Angeles routes: 6
- Withheld for no authoritative price: 5
- Authoritative price-preview fares among active pages: 7
- Active PRICE_NOT_FOUND before editorial: 5
- Runtime PASS: 6
- Runtime FAIL: 0
- Terminal removals: 3
- PRICE_NOT_FOUND after editorial: 4
- INSUFFICIENT_SOURCE_CONTENT: 2
- SOURCE_NOT_FOUND: 0
- OK priced pages: 6
- Runtime pages with a FareHarbor rating: 3
- Runtime pages without a FareHarbor rating: 3

## Ratings

TripAdvisor wins when `ratings.tripadvisor.rating` and `num_reviews` are present. Otherwise Google reviews on the same endpoint are shown as Google.
- `333382` `A Taste of LA: Half Day Tour of the BEST of Los Angeles` — 4.9 / 9992 Google
- `168579` `LA Essential Star Homes Tour` — 4.9 / 1335 Google
- `518084` `Private Los Angeles Tour (Beverly Hills)` — 4.9 / 1335 Google

## Geography conflicts

- `629071` `Venice’s Finest: A Daytime Experience` — exclude — Venice, California from meeting_point does not belong to Los Angeles, and no matching public destination exists — `/destinations/california/venice/tours/venices-finest-a-daytime-experience-629071`

## Terminal records retained for audit

- `324799` `/destinations/california/los-angeles/tours/beverly-hills-tour-1h15-minutes-324799` — `BOOKING_PAGE_NOT_FOUND`
- `382848` `/destinations/california/los-angeles/tours/the-beach-tour-4-hours-382848` — `BOOKING_PAGE_NOT_FOUND`
- `547525` `/destinations/california/los-angeles/tours/1-hour-walk-of-fame-guided-tour-547525` — `BOOKING_PAGE_NOT_FOUND`

## Manual review

- `629071` geography exclude — Venice, California from meeting_point does not belong to Los Angeles, and no matching public destination exists
- `205984` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/los-angeles/tours/1-hr---real-hollywood-sign-tour-205984` — none
- `349518` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/los-angeles/tours/sightseeing-hollywood-tours-349518` — none
- `471726` `PRICE_NOT_FOUND` `/destinations/california/los-angeles/tours/the-official-hollywood-sign-express-walking-tour-in-los-angeles-free-waters-471726` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 27 words; rich FareHarbor source requires at least 100 words
- `495929` `PRICE_NOT_FOUND` `/destinations/california/los-angeles/tours/hollywood-sightseeing-trolley-tour-495929` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 71 words; rich FareHarbor source requires at least 100 words
- `629071` `PRICE_NOT_FOUND` `/destinations/california/venice/tours/venices-finest-a-daytime-experience-629071` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 88 words; rich FareHarbor source requires at least 100 words
