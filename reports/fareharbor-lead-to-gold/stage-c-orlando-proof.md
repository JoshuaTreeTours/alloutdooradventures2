# Stage C Orlando legacy FareHarbor tranche

Scope is `citySlug === orlando` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/orlando`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Orlando bucket.

- Total Orlando legacy products: 12
- Active booking pages: 12
- Terminal booking pages: 0
- Geography conflicts with Orlando: 0
- Moved to another destination: 0
- Excluded for uncertain/unmapped geography: 0
- Published Orlando routes: 0
- Withheld for no authoritative price: 11
- Authoritative price-preview fares among active pages: 1
- Active PRICE_NOT_FOUND before editorial: 11
- Runtime PASS: 0
- Runtime FAIL: 0
- Terminal removals: 0
- PRICE_NOT_FOUND after editorial: 10
- INSUFFICIENT_SOURCE_CONTENT: 1
- SOURCE_NOT_FOUND: 0
- OK priced pages: 0
- Runtime pages with a FareHarbor rating: 0
- Runtime pages without a FareHarbor rating: 0

## Ratings

- None. The ratings endpoint did not return a TripAdvisor or Google pair for any published page.

## Geography conflicts

- None.

## Terminal records retained for audit


## Manual review

- `694070` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/florida/orlando/tours/expeditions-694070` — none
- `254237` `PRICE_NOT_FOUND` `/destinations/florida/orlando/tours/the-real-florida-manatee-adventure-254237` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 87 words; rich FareHarbor source requires at least 100 words
- `254239` `PRICE_NOT_FOUND` `/destinations/florida/orlando/tours/kennedy-space-center-adventure-254239` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 36 words; rich FareHarbor source requires at least 100 words
- `254240` `PRICE_NOT_FOUND` `/destinations/florida/orlando/tours/kennedy-space-center-ultimate-adventure-254240` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 45 words; rich FareHarbor source requires at least 100 words
- `254242` `PRICE_NOT_FOUND` `/destinations/florida/orlando/tours/kennedy-space-center-adventure-and-chat-with-an-astronaut-254242` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 56 words; rich FareHarbor source requires at least 100 words
- `271301` `PRICE_NOT_FOUND` `/destinations/florida/orlando/tours/private-kennedy-space-center-adventure-271301` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 32 words; rich FareHarbor source requires at least 100 words
- `285090` `PRICE_NOT_FOUND` `/destinations/florida/orlando/tours/private-real-florida-manatee-adventure-285090` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 85 words; rich FareHarbor source requires at least 100 words
- `290231` `PRICE_NOT_FOUND` `/destinations/florida/orlando/tours/shingle-creek-guided-kayak-adventure-290231` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; experience copy is 76 words; rich FareHarbor source requires at least 100 words
- `491805` `PRICE_NOT_FOUND` `/destinations/florida/orlando/tours/kennedy-space-center-direct-express-491805` — experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 44 words; rich FareHarbor source requires at least 100 words
