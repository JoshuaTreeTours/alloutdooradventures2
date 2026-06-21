# Engine6 Live Merge Itinerary Audit

Generated: 2026-06-21T21:54:19.996Z

## Scope

- Branch commit: `9f66e824b0b0cb777832d36347f7b5c340317b02`
- Live fetch: production /api/engine6/viator-product proxy (live-api responses)
- Local VIATOR_API_KEY present: no

Audited products:
- **San Francisco Love Tour** (1 products): 23068P2
- **NYC diverged cohort** (8 products): 233384P2, 7081NYCDAY, 62527P11, 5250LIBERTYELLIS, 5614063P8, 3857PHI, 3156P13, 5024MANSKY
- **Florida/Alaska diverged cohort** (13 products): 411138P3, 383300P6, 76145P2, 5559561P1, 89173P10, 231628P7, 8836P2, 10150P16, 214880P12, 402171P1, 408277P4, 5503P21, 342209P4

## Totals

- Products audited: 22
- Live fetch errors: 0
- Diverged merge mode: 22
- Aligned merge mode: 0
- Rows with title change from native after merge: 10
- Rows where live extraction used description-inferred titleSource: 116

## Per-product summary

| Group | Product | Route | Merge mode | Native rows | Live rows | Title changes | Live description-inferred rows | Fetch source |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| San Francisco Love Tour | 23068P2 | /destinations/california/san-francisco/tours/san-francisco-love-tour | diverged | 5 | 13 | 0 | 13 | live-api via production-api-proxy |
| NYC diverged cohort | 233384P2 | /destinations/new-york/new-york/tours/brooklyn-bridge-and-waterfront-bike-tour-264853 | diverged | 6 | 8 | 0 | 8 | live-api via production-api-proxy |
| NYC diverged cohort | 7081NYCDAY | /destinations/new-york/new-york/tours/new-york-in-one-day-guided-sightseeing-tour | diverged | 6 | 14 | 1 | 13 | live-api via production-api-proxy |
| NYC diverged cohort | 62527P11 | /destinations/new-york/new-york/tours/niagara-falls-in-one-day-from-new-york-city | diverged | 2 | 9 | 0 | 9 | live-api via production-api-proxy |
| NYC diverged cohort | 5250LIBERTYELLIS | /destinations/new-york/new-york/tours/statue-of-liberty-and-ellis-island-guided-tour | diverged | 3 | 5 | 0 | 5 | live-api via production-api-proxy |
| NYC diverged cohort | 5614063P8 | /destinations/new-york/new-york/tours/washington-d-c-tour-from-new-york | diverged | 2 | 12 | 0 | 12 | live-api via production-api-proxy |
| NYC diverged cohort | 3857PHI | /destinations/new-york/new-york/tours/philadelphia-and-amish-country-day-trip-from-new-york | diverged | 2 | 5 | 0 | 5 | live-api via production-api-proxy |
| NYC diverged cohort | 3156P13 | /destinations/new-york/new-york/tours/best-of-nyc-electric-bike-tour-202168 | diverged | 4 | 3 | 0 | 3 | live-api via production-api-proxy |
| NYC diverged cohort | 5024MANSKY | /destinations/new-york/new-york/tours/manhattan-sky-tour-new-york-helicopter-flight | diverged | 9 | 8 | 0 | 8 | live-api via production-api-proxy |
| Florida/Alaska diverged cohort | 411138P3 | /destinations/alaska/anchorage/tours/glacier-view-and-wildlife-anchorage-adventure-tour | diverged | 6 | 9 | 5 | 0 | live-api via production-api-proxy |
| Florida/Alaska diverged cohort | 383300P6 | /destinations/florida/fort-lauderdale/tours/guided-electric-bike-tours-of-greater-fort-lauderdale | diverged | 4 | 9 | 1 | 9 | live-api via production-api-proxy |
| Florida/Alaska diverged cohort | 76145P2 | /destinations/florida/fort-lauderdale/tours/authentic-private-everglades-airboat-tour-76145p2 | diverged | 3 | 1 | 1 | 0 | live-api via production-api-proxy |
| Florida/Alaska diverged cohort | 5559561P1 | /destinations/florida/fort-lauderdale/tours/jetcar-fort-lauderdale-rental-5559561p1 | diverged | 2 | 2 | 0 | 0 | bundled-fallback via production-api-proxy |
| Florida/Alaska diverged cohort | 89173P10 | /destinations/florida/fort-lauderdale/tours/fort-lauderdale-tropical-kayak-tour-and-island-adventure-89173p10 | diverged | 4 | 1 | 0 | 1 | live-api via production-api-proxy |
| Florida/Alaska diverged cohort | 231628P7 | /destinations/florida/miami/tours/taste-of-miami-helicopter-tour | diverged | 2 | 8 | 0 | 8 | live-api via production-api-proxy |
| Florida/Alaska diverged cohort | 8836P2 | /destinations/florida/miami/tours/miami-pirate-boat-tour-skyline-and-celebrity-homes | diverged | 3 | 8 | 1 | 7 | live-api via production-api-proxy |
| Florida/Alaska diverged cohort | 10150P16 | /destinations/florida/miami/tours/miami-raccoon-island-adventure | diverged | 3 | 5 | 0 | 5 | live-api via production-api-proxy |
| Florida/Alaska diverged cohort | 214880P12 | /destinations/florida/miami/tours/3-days-amazing-tour-in-miami | diverged | 3 | 9 | 1 | 5 | live-api via production-api-proxy |
| Florida/Alaska diverged cohort | 402171P1 | /destinations/florida/miami/tours/miami-excursions-luxury-experience-private | diverged | 0 | 4 | 0 | 2 | live-api via production-api-proxy |
| Florida/Alaska diverged cohort | 408277P4 | /destinations/florida/miami/tours/real-extreme-off-road-atv-miami-driver-license-required | diverged | 0 | 1 | 0 | 1 | live-api via production-api-proxy |
| Florida/Alaska diverged cohort | 5503P21 | /destinations/florida/miami/tours/all-included-combo-with-miami-watersports | diverged | 0 | 1 | 0 | 1 | live-api via production-api-proxy |
| Florida/Alaska diverged cohort | 342209P4 | /destinations/florida/miami/tours/sup-kayak-wildlife-exploration-through-mangrove-jungle | diverged | 0 | 1 | 0 | 1 | live-api via production-api-proxy |

## Title source transitions (changed rows only)

### 7081NYCDAY — New York in One Day Guided Sightseeing Tour

- Route: `/destinations/new-york/new-york/tours/new-york-in-one-day-guided-sightseeing-tour`
- Merge mode: **diverged**

| Index | Before (native) | Live extracted | After merge | Policy source |
| ---: | --- | --- | --- | --- |
| 4 | 9/11 Memorial and Museum (null) | 9/11 Memorial and Museum (product-override) | The National 9/11 Memorial & Museum (null) | explicit |


### 411138P3 — Glacier View & Wildlife Anchorage Adventure Tour

- Route: `/destinations/alaska/anchorage/tours/glacier-view-and-wildlife-anchorage-adventure-tour`
- Merge mode: **diverged**

| Index | Before (native) | Live extracted | After merge | Policy source |
| ---: | --- | --- | --- | --- |
| 0 | Anchorage (null) | Downtown Anchorage (public-json-ld) | Downtown Anchorage (null) | public-json-ld |
| 1 | Earthquake Park (null) | Beluga Point (public-json-ld) | Beluga Point (null) | public-json-ld |
| 2 | Beluga Point (null) | Alaska Wildlife Conservation Center (public-json-ld) | Alaska Wildlife Conservation Center (null) | public-json-ld |
| 3 | Alaska Wildlife Conservation Center (null) | Turnagain Arm (public-json-ld) | Turnagain Arm (null) | public-json-ld |
| 5 | Turnagain Arm Drive (null) | Explorer Glacier (public-json-ld) | Explorer Glacier (null) | public-json-ld |


### 383300P6 — 90 min Electric Bike Tour of Fort Lauderdale (min 2)

- Route: `/destinations/florida/fort-lauderdale/tours/guided-electric-bike-tours-of-greater-fort-lauderdale`
- Merge mode: **diverged**

| Index | Before (native) | Live extracted | After merge | Policy source |
| ---: | --- | --- | --- | --- |
| 3 | Fort Lauderdale Beach (null) | We gently bike along the 2 miles of the world-famous red brick road taking in the "Venice of the Americas", seeing mega yachts, the Intracoastal, landscaped parks, cafes, and restaurants all the way through to the next stop (description-inferred) | red brick road (null) | explicit |


### 76145P2 — Authentic Private Everglades Airboat Tour

- Route: `/destinations/florida/fort-lauderdale/tours/authentic-private-everglades-airboat-tour-76145p2`
- Merge mode: **diverged**

| Index | Before (native) | Live extracted | After merge | Policy source |
| ---: | --- | --- | --- | --- |
| 0 | Everglades Launch Area (null) | Everglades Launch Area (product-override) | Meet your captain (null) | explicit |


### 8836P2 — Miami Pirate Boat Tour: Skyline & Celebrity Homes

- Route: `/destinations/florida/miami/tours/miami-pirate-boat-tour-skyline-and-celebrity-homes`
- Merge mode: **diverged**

| Index | Before (native) | Live extracted | After merge | Policy source |
| ---: | --- | --- | --- | --- |
| 2 | Departure Pier (null) | Departure Pier (product-override) | Return to meeting point (null) | explicit |


### 214880P12 — 3 Days Amazing Tour in Miami

- Route: `/destinations/florida/miami/tours/3-days-amazing-tour-in-miami`
- Merge mode: **diverged**

| Index | Before (native) | Live extracted | After merge | Policy source |
| ---: | --- | --- | --- | --- |
| 1 | Coastal Cultural Stops (null) | Coastal Cultural Stops (product-override) | Day 2 - Coastal and cultural stops (null) | explicit |


## Notes

- **Before (native):** bundled registry itinerary (`engine6ResolvedTours`) before client merge.
- **Live extracted:** titles/titleSource from live API response extraction (same shape as `CityTourDetailRoute` fetch).
- **After merge:** result of `mergeEngine6NativeItineraryWithLive` on current branch; stored `titleSource` usually remains the native bundled value because merge strips live titleSource from spread.
- **Policy source:** authoritative titleSource from `resolveEngine6DivergedItineraryTitle` (diverged) or aligned native/live precedence rules.

Full row-level detail: `reports/engine6-live-merge-itinerary-audit.json`.
