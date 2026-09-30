# Stage C Boston legacy FareHarbor tranche

Scope is `citySlug === boston` FareHarbor products in `tours.generated.ts`. Engine 6 Viator Boston routes and non-Boston cities were not processed.

Authority is the stored harvest under `data/fareharbor-lead-to-gold/boston`. Visible Price / Product Offer / TouristTrip Offer use price-preview only. Empty price-preview stays `PRICE_NOT_FOUND`. Marketing headlines are not Offer prices. AggregateRating is omitted.

- Total Boston legacy products: 230
- Already retired before this tranche: 4
- Active booking pages: 222
- Terminal booking pages: 8 (4 previously retired + 4 newly classified)
- Authoritative price-preview fares among active pages: 103
- Active PRICE_NOT_FOUND before editorial: 119
- Runtime PASS: 222
- Runtime FAIL: 0
- Terminal removals: 8
- PRICE_NOT_FOUND after editorial: 119
- INSUFFICIENT_SOURCE_CONTENT: 0
- SOURCE_NOT_FOUND: 0
- OK priced pages: 103

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

- None.
