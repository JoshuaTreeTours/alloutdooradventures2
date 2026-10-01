# Stage C Boston legacy FareHarbor tranche

Scope is `citySlug === boston` FareHarbor products in `tours.generated.ts`. Engine 6 Viator Boston routes and non-Boston cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/boston`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. AggregateRating is omitted. Geography is taken from meeting point, item location, and source copy, not from the Boston bucket.

- Total Boston legacy products: 230
- Active booking pages: 222
- Terminal booking pages: 8
- Geography conflicts with Boston: 2
- Moved to another destination: 1
- Excluded for uncertain/unmapped geography: 1
- Published Boston routes: 220
- Authoritative price-preview fares among active pages: 103
- Active PRICE_NOT_FOUND before editorial: 119
- Runtime PASS: 221
- Runtime FAIL: 0
- Terminal removals: 8
- PRICE_NOT_FOUND after editorial: 109
- INSUFFICIENT_SOURCE_CONTENT: 20
- SOURCE_NOT_FOUND: 0
- OK priced pages: 93

## Geography conflicts

- `448094` `Portland, Maine Highlights` — moved — Portland, Maine from title does not belong to Boston; moved to existing /maine/portland — `/destinations/maine/portland/tours/portland-maine-highlights-448094`
- `73240` `Wheels in the Woods` — exclude — Hardwick, Vermont from meeting_point does not belong to Boston, and no matching public destination exists — `/destinations/vermont/hardwick/tours/wheels-in-the-woods-73240`

## Terminal records retained for audit

- `481940` `/destinations/massachusetts/boston/tours/protest-to-freedom-boston-black-heritage-tour-481940` — `BOOKING_PAGE_NOT_FOUND`
- `481941` `/destinations/massachusetts/boston/tours/the-protest-to-freedom-walking-tour-481941` — `BOOKING_PAGE_NOT_FOUND`
- `677691` `/destinations/massachusetts/boston/tours/boston-small-group-freedom-trail-walking-tour-677691` — `BOOKING_PAGE_NOT_FOUND`
- `677692` `/destinations/massachusetts/boston/tours/boston-highlights-private-walking-tour-677692` — `BOOKING_PAGE_NOT_FOUND`
- `379532` `/destinations/massachusetts/boston/tours/boston-harbor-cruise-byob---legacy-motor-yacht-379532` — `BOOKING_PAGE_NOT_FOUND`
- `463302` `/destinations/massachusetts/boston/tours/nubian-square-walking-tour-463302` — `BOOKING_PAGE_NOT_FOUND`
- `288303` `/destinations/massachusetts/boston/tours/full-moon-paddle---charles-river-boston-288303` — `BOOKING_PAGE_NOT_FOUND`
- `361872` `/destinations/massachusetts/boston/tours/the-bostoner-cannabis-and-cannoli-tour-361872` — `BOOKING_PAGE_NOT_FOUND`

## Manual review

- `73240` geography exclude — Hardwick, Vermont from meeting_point does not belong to Boston, and no matching public destination exists
- `112945` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/chinatowns-culture-and-cuisine-112945` — none
- `117124` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/happy-hour-stroll-117124` — none
- `151824` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/classic-downtown-boston-151824` — none
- `243407` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/local-gems-of-the-south-end-243407` — none
- `371157` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/ben-franklin-son-of-boston-371157` — none
- `387481` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/rowes-wharf-sensationally-good-city-making-387481` — none
- `630528` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/community-event-630528` — none
- `685351` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/cooking-101-685351` — none
- `130424` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-lighthouse-sunset-cruise-130424` — none
- `130441` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-lighthouse-sunset-cruise-130441` — none
- `448091` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/marthas-vineyard-daytrip-from-boston-with-round-trip-ferry-and-island-tour-448091` — none
- `653308` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/rhythm-and-remedy---thursday-and-friday-653308` — none
- `525191` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/wedding-525191` — none
- `194038` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-cityscapes-night-photography-tour-194038` — none
- `347869` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-common-winter-lights-night-tour-347869` — none
- `58912` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-scavenger-hunt-58912` — none
- `306874` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/specialty-tour-charlie-gibsons-queer-boston-306874` — none
- `27367` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/tandem-rental-27367` — none
- `39486` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/electric-assist-bike-rental-39486` — none
- `417626` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/luggage-storage-417626` — none
