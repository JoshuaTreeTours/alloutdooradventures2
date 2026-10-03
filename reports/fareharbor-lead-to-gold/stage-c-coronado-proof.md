# Stage C Coronado legacy FareHarbor tranche

Scope is `citySlug === coronado` FareHarbor products in the legacy catalog (generated tours and manual tours). Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/coronado`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. When that pair is absent, `ratings.google_reviews.rating` and `ratings.google_reviews.user_ratings_total` are used and attributed to Google. The bubble image, catalog quality_score, and availability_count are not used. AggregateRating is omitted when neither pair is present. Geography is taken from meeting point, item location, and source copy, not from the Coronado bucket.

- Total Coronado legacy products: 48
- Active booking pages: 48
- Terminal booking pages: 0
- Geography conflicts with Coronado: 1
- Moved to another destination: 1
- Excluded for uncertain/unmapped geography: 0
- Published Coronado routes: 6
- Withheld for no authoritative price: 42
- Authoritative price-preview fares among active pages: 9
- Active PRICE_NOT_FOUND before editorial: 39
- Runtime PASS: 6
- Runtime FAIL: 0
- Terminal removals: 0
- PRICE_NOT_FOUND after editorial: 6
- INSUFFICIENT_SOURCE_CONTENT: 36
- SOURCE_NOT_FOUND: 0
- OK priced pages: 6
- Runtime pages with a FareHarbor rating: 0
- Runtime pages without a FareHarbor rating: 6

## Ratings

- None. The ratings endpoint did not return a TripAdvisor or Google pair for any published page.

## Geography conflicts

- `419629` `Beneteau 40 - Coronado Bareboat Rental` — moved — San Diego, California from meeting_point does not belong to Coronado; moved to existing /california/san-diego — `/destinations/california/san-diego/tours/beneteau-40---coronado-bareboat-rental-419629`

## Terminal records retained for audit


## Manual review

- `339050` `PRICE_NOT_FOUND` `/destinations/california/coronado/tours/delivery---4-passenger-multi-day-339050` — schema description is not shorter than the editorial body; experience copy is under 100 words; rich FareHarbor source requires at least 100 words, or mark INSUFFICIENT_SOURCE_CONTENT when the source cannot support that; editorial lacks minimum experience substance; use remaining FareHarbor details or keep this as a composer FAIL, not INSUFFICIENT_SOURCE_CONTENT, when source is rich; experience copy is 21 words; rich FareHarbor source requires at least 100 words; full product title is repeated in the description
- `580033` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/skating-by-the-sea-580033` — none
- `471073` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/jet-ski-rentals-471073` — none
- `527560` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/speed-boat-rental-527560` — none
- `528464` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/pontoon-boat-rental-528464` — none
- `418569` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/sylvan-18---coronado-rental-418569` — none
- `418874` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/catalina-250---coronado-rental-418874` — none
- `418883` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/tritoon-25---coronado-rental-418883` — none
- `419398` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/catalina-320---coronado-bareboat-rental-419398` — none
- `419404` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/catalina-320---coronado-captain-charter-419404` — none
- `419502` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/catalina-270---coronado-captain-charter-419502` — none
- `419503` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/catalina-270---coronado-bareboat-rental-419503` — none
- `419627` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/beneteau-40---coronado-captain-charter-419627` — none
- `419629` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/san-diego/tours/beneteau-40---coronado-bareboat-rental-419629` — none
- `419639` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/lagoon-380---coronado-bareboat-rental-419639` — none
- `419640` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/lagoon-380---coronado-captain-charter-419640` — none
- `419658` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/nautitech-40-erasmus---coronado-captain-charter-419658` — none
- `419707` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/nautitech-40-paradise---coronado-captain-charter-419707` — none
- `419951` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/aquila-44-catastic---coronado-captain-charter-419951` — none
- `420173` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/sunset-sail---coronado-420173` — none
- `423717` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/100-dock---coronado---pick-up-or-one-way-423717` — none
- `424572` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/sup---coronado-424572` — none
- `424591` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/tandem-kayak---coronado-424591` — none
- `424599` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/single-kayak---coronado-rental-424599` — none
- `425335` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/bay-skiff---coronado-425335` — none
- `466554` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/monterey-21---coronado-466554` — none
- `528181` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/blue-bridge-kayak-tour-528181` — none
- `529512` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/above-board-stand-up-paddle-tours-sup-529512` — none
- `607180` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/marquis-70-607180` — none
- `638904` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/trophy-18---coronado-638904` — none
- `639205` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/limo-boat---coronado-639205` — none
- `665947` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/60-luxury-sailing-catamaran-665947` — none
- `667594` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/100-dock---coronado---drop-off-667594` — none
- `671123` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/lagoon-380-coronado---multi-day-charter-671123` — none
- `679820` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/marquis-70-coronado---multi-day-charter-679820` — none
- `690094` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/aquila-44-coronado---multi-day-charter-690094` — none
- `690112` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/california/coronado/tours/aquila-44-catitude---coronado-captain-charter-690112` — none
