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
- PRICE_NOT_FOUND after editorial: 62
- INSUFFICIENT_SOURCE_CONTENT: 92
- SOURCE_NOT_FOUND: 0
- OK priced pages: 68

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
- `191688` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/request-a-private-corporate-tour-experience-191688` — none
- `26493` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/labor-day-weekend-harbor-fireworks-cruise-aboard-adirondack-26493` — none
- `361708` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/literary-beacon-hill-the-20th-century-361708` — none
- `362214` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/the-flat-of-beacon-hill-362214` — none
- `393817` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/private-tour-the-dark-side-of-boston-393817` — none
- `393819` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/private-tour-the-north-end-bostons-immigration-gateway-393819` — none
- `401790` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/bulfinch-triangle-401790` — none
- `438147` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boisterous-bostonians-riots-and-protests-438147` — none
- `438151` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/uphams-corner-438151` — none
- `438152` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/fort-point-channel-438152` — none
- `452880` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/fierce-and-feminine-great-women-of-boston-452880` — none
- `453628` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/remarkable-women-of-jamaica-plain-453628` — none
- `455620` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/adventures-at-sea-455620` — none
- `455624` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/avenue-of-the-arts-455624` — none
- `455625` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/bay-village-455625` — none
- `455626` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-by-bulfinch-455626` — none
- `455627` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-common-and-the-public-garden-455627` — none
- `455634` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/the-custom-house-historic-district-455634` — none
- `455635` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/dams-bridges-and-locks-455635` — none
- `455639` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/the-esplanade-455639` — none
- `455640` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/finding-aesops-fables-in-copley-square-455640` — none
- `455643` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/historic-waterfront-455643` — none
- `455645` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/jewish-north-end-455645` — none
- `455650` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/the-making-of-mit-455650` — none
- `455652` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/murder-martyrs-and-mysticism-455652` — none
- `455654` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/old-west-end-455654` — none
- `455656` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/rethinking-boston-brutalism-455656` — none
- `455660` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/taverns-to-tea-houses-455660` — none
- `508151` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/virtual-program-508151` — none
- `630528` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/community-event-630528` — none
- `26333` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/downtown-to-back-bay-via-beacon-hill-walking-tour-26333` — none
- `26335` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/back-bay-to-downtown-freedom-trail-via-beacon-hill-walking-tour-26335` — none
- `26336` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/private-group-walking-tour-26336` — none
- `26337` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-jewish-cultural-walking-tour-26337` — none
- `26338` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/old-downtownwaterfrontnorth-end-walking-tour-26338` — none
- `26339` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/harvard-square-evening-excursion-through-cambridge-26339` — none
- `685351` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/cooking-101-685351` — none
- `259002` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/north-end-neighborhood-tour---private-tour-259002` — none
- `259011` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/north-end-and-market-district-tour---private-tour-259011` — none
- `259015` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/beacon-hill-neighborhood-tour---private-tour-259015` — none
- `306974` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/north-end-neighborhood-tour---public-tour-306974` — none
- `130424` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-lighthouse-sunset-cruise-130424` — none
- `130441` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-lighthouse-sunset-cruise-130441` — none
- `426001` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/freedom-trail-and-little-italy---private-walking-tour-426001` — none
- `518093` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/private-tour-of-lexington-concord-and-boston-518093` — none
- `518095` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/half-day-driving-tour-of-boston-and-cambridge-518095` — none
- `617316` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/april-19-1775-a-revolution-begins-semi-private-tour-617316` — none
- `448091` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/marthas-vineyard-daytrip-from-boston-with-round-trip-ferry-and-island-tour-448091` — none
- `448093` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/explore-cape-cod-in-a-day-448093` — none
- `464912` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/highlights-of-boston---public-walking-tour-464912` — none
- `556936` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/north-shore-coast-excursion---day-trip-from-boston-556936` — none
- `609024` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/hidden-boston-tales-tidbits-and-treasures-609024` — none
- `641580` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/highlights-of-boston---public-walking-tour-spanish-641580` — none
- `451242` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/full-day-sailing-and-island-experience-451242` — none
- `257506` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/private-north-shore-and-salem-tour-257506` — none
- `333848` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/stories-from-the-freedom-trail-333848` — none
- `522022` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-step-on-guide-service-522022` — none
- `540129` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-and-north-east-coast-explorer---4-day-experience-540129` — none
- `531495` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/walking-tour-531495` — none
- `144864` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/two-hour-private-sail-charter-144864` — none
- `144869` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/private-half-day-sail-charter-144869` — none
- `144871` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/private-full-day-sail-charter-144871` — none
- `525191` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/wedding-525191` — none
- `347680` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/diva-royale---drag-queen-show-boston-347680` — none
- `130702` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-harborfest-fireworks-cruise-130702` — none
- `80573` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-harbor-day-sail-80573` — none
- `80585` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-harbor-sunset-sail-80585` — none
- `512328` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-harbor-sunset-cruise-512328` — none
- `512335` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-harbor-moonlight-cruise-512335` — none
- `692147` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-250-692147` — none
- `194038` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-cityscapes-night-photography-tour-194038` — none
- `347869` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-common-winter-lights-night-tour-347869` — none
- `58904` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/highlights-of-boston-photo-tour-58904` — none
- `58912` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-scavenger-hunt-58912` — none
- `94381` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-dog-photography-class-94381` — none
- `454073` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/tour-bostons-rock-and-roll-past-and-present-454073` — none
- `348848` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/rise-and-shine-sup-yoga-boston-ma-348848` — none
- `348849` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/sunset-sup-yoga-boston-ma-348849` — none
- `350210` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-harbor-paddle-boston-ma-350210` — none
- `350211` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/rise-and-shine-sup-yoga-boston-harbor-paddle-combo-package-boston-ma-350211` — none
- `367212` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-massachusetts-367212` — none
- `306874` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/specialty-tour-charlie-gibsons-queer-boston-306874` — none
- `639737` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/charlies-queer-boston--an-evening-with-the-history-project-639737` — none
- `605912` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/boston-night-tour-605912` — none
- `562574` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/the-untold-history-of-boston-walking-tour-562574` — none
- `27347` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/tour-de-cambridge-27347` — none
- `27349` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/emerald-necklace-tour-27349` — none
- `27352` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/city-bike-rental-27352` — none
- `27367` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/tandem-rental-27367` — none
- `39486` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/electric-assist-bike-rental-39486` — none
- `417626` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/massachusetts/boston/tours/luggage-storage-417626` — none
- `73240` `INSUFFICIENT_SOURCE_CONTENT` `/destinations/vermont/hardwick/tours/wheels-in-the-woods-73240` — none
