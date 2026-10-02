# Stage C Chicago legacy FareHarbor tranche

Scope is `citySlug === chicago` FareHarbor products in `tours.generated.ts`. Engine 6 Viator routes and other cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/chicago`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. TripAdvisor rating and review count come only from `GET /api/v1/companies/{company}/items/{itemId}/ratings/` fields `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews`. The bubble image, Google reviews, and catalog quality_score / availability_count are not used. AggregateRating is omitted when that TripAdvisor pair is absent. Geography is taken from meeting point, item location, and source copy, not from the Chicago bucket.

- Total Chicago legacy products: 39
- Active booking pages: 28
- Terminal booking pages: 11
- Geography conflicts with Chicago: 1
- Moved to another destination: 1
- Excluded for uncertain/unmapped geography: 0
- Published Chicago routes: 27
- Authoritative price-preview fares among active pages: 17
- Active PRICE_NOT_FOUND before editorial: 11
- Runtime PASS: 28
- Runtime FAIL: 0
- Terminal removals: 11
- PRICE_NOT_FOUND after editorial: 8
- INSUFFICIENT_SOURCE_CONTENT: 1
- SOURCE_NOT_FOUND: 2
- OK priced pages: 17
- Runtime pages with a TripAdvisor rating: 16
- Runtime pages without a TripAdvisor rating: 12

## TripAdvisor ratings

Source: `ratings.tripadvisor.rating` and `ratings.tripadvisor.num_reviews` on the FareHarbor item ratings endpoint. Provider is TripAdvisor.
- `34311` `Bikes, Bites & Brews: Chicago's Signature Dishes Bike Tour` — 4.9 / 5765 TripAdvisor
- `153711` `The World Within (Part One): Dazzling Interiors™ of the Loop` — 5 / 3264 TripAdvisor
- `176320` `Open Your Eyes: Chicago's Underground Pedway & Other Secrets of the Loop` — 5 / 3264 TripAdvisor
- `184447` `Book a Private Tour for Your Group!` — 5 / 3264 TripAdvisor
- `185962` `The Christmas Tree Crawl: The Magic of Chicago at the Holidays` — 5 / 3264 TripAdvisor
- `215562` `The World Within (Part Two): Secret Interiors of the Riverfront` — 5 / 3264 TripAdvisor
- `335819` `Chicago in the Roaring '20s: Art Deco, Flappers, Gangsters, & Prohibition` — 5 / 3264 TripAdvisor
- `468913` `All That Glam: Chicago’s Art Deco Masterpieces` — 5 / 3264 TripAdvisor
- 8 more published pages carry the same TripAdvisor pair.

## Geography conflicts

- `584698` `Miami Beach Ultimate City Bike Tour` — moved — Miami Beach, Florida from meeting_point does not belong to Chicago; moved to existing /florida/miami-beach — `/destinations/florida/miami-beach/tours/miami-beach-ultimate-city-bike-tour-584698`

## Terminal records retained for audit

- `656890` `/destinations/illinois/chicago/tours/hamilton-in-chicago-656890` — `BOOKING_PAGE_NOT_FOUND`
- `657634` `/destinations/illinois/chicago/tours/2027-mlb-all-star-game-657634` — `BOOKING_PAGE_NOT_FOUND`
- `674133` `/destinations/illinois/chicago/tours/yankees-vs-cubs-at-wrigley-field-674133` — `BOOKING_PAGE_NOT_FOUND`
- `681784` `/destinations/illinois/chicago/tours/yankees-vs-cubs-at-wrigley-field-681784` — `BOOKING_PAGE_NOT_FOUND`
- `681789` `/destinations/illinois/chicago/tours/giants-vs-cubs-at-wrigley-field-681789` — `BOOKING_PAGE_NOT_FOUND`
- `681790` `/destinations/illinois/chicago/tours/giants-vs-cubs-at-wrigley-field-681790` — `BOOKING_PAGE_NOT_FOUND`
- `681949` `/destinations/illinois/chicago/tours/white-sox-vs-cubs-at-wrigley-field-681949` — `BOOKING_PAGE_NOT_FOUND`
- `681950` `/destinations/illinois/chicago/tours/white-sox-vs-cubs-at-wrigley-field-681950` — `BOOKING_PAGE_NOT_FOUND`
- `681955` `/destinations/illinois/chicago/tours/brewers-vs-cubs-at-wrigley-field-681955` — `BOOKING_PAGE_NOT_FOUND`
- `681956` `/destinations/illinois/chicago/tours/brewers-vs-cubs-at-wrigley-field-681956` — `BOOKING_PAGE_NOT_FOUND`
- `692705` `/destinations/illinois/chicago/tours/the-great-gatsby----in-chicago-692705` — `BOOKING_PAGE_NOT_FOUND`

## Manual review

- `644345` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/illinois/chicago/tours/captain-pat-erwin-644345` — none
- `687115` `SOURCE_NOT_FOUND` `/destinations/illinois/chicago/tours/37ft-sea-ray-sundancer--4-hours-test-687115` — none
- `687119` `SOURCE_NOT_FOUND` `/destinations/illinois/chicago/tours/37ft-sea-ray-sundancer--3-hours-test-687119` — none
