# Florida and Alaska Engine6 Itinerary Title Alignment Inventory

Audit-only inventory generated from bundled Engine6 exact-product fixtures and current Engine6 rendered tour registry. No production code, rendering, routing, booking, schema, overrides, or itinerary titles were changed.

## Summary

- totalFloridaProductsScanned: 20
- totalAlaskaProductsScanned: 3
- totalProductsWithCountAlignment: 4
- totalProductsWithCountMismatches: 19
- totalProductsCurrentlyRelyingOnOverrides: 10
- totalProductsWhereViatorJsonLdCouldBecomeSourceOfTruth: 0
- estimateOfRemediationEffort: high

## Inventory

| Product | State | Route | Tour title | Rendered | Payload | JSON-LD | Aligned | Title source | Overrides | Description-derived | Clean JSON-LD names | Clean payload fields | Recommended authority | Extractor path |
|---|---|---|---|---:|---:|---:|---|---|---|---|---|---|---|---|
| 53474P8 | Alaska | `/destinations/alaska/anchorage/tours/anchorage-greenbelt-bike-tour-391155` | Anchorage Greenbelt Bike Tour | 7 | 7 | 0 | no | product-override, explicit | yes | no | no | yes | payload-title | `product.itineraryItems` |
| 411138P3 | Alaska | `/destinations/alaska/anchorage/tours/glacier-view-and-wildlife-anchorage-adventure-tour` | Glacier View & Wildlife Anchorage Adventure Tour | 6 | 6 | 0 | no | explicit, product-override | yes | no | no | yes | payload-title | `product.itineraryItems` |
| 100569P5 | Alaska | `/destinations/alaska/anchorage/tours/sunset-wilderness-wildlife-glacier-and-nature-free-photo-lessons-may-sept` | Glacier Hike on Matanuska Glacier - Best Vacation Value | 3 | 3 | 0 | no | explicit | no | no | no | yes | payload-title | `product.itineraryItems` |
| 118958P8 | Florida | `/destinations/florida/fort-lauderdale/tours/4-hour-shared-big-game-fishing-118958p8` | 4 Hour Shared Big Game Fishing | 3 | 3 | 0 | no | product-override | yes | no | no | no | reviewed-override | `product.itineraryItems` |
| 76145P2 | Florida | `/destinations/florida/fort-lauderdale/tours/authentic-private-everglades-airboat-tour-76145p2` | Authentic Private Everglades Airboat Tour | 3 | 3 | 0 | no | product-override | yes | no | no | no | reviewed-override | `product.itineraryItems` |
| 6331BAHA | Florida | `/destinations/florida/fort-lauderdale/tours/bahamas-day-escape-by-ferry-6331baha` | FROM FLORIDA: Bahamas Day Escape By Ferry | 4 | 4 | 0 | no | explicit, product-override | yes | no | no | yes | payload-title | `product.itineraryItems` |
| 89173P10 | Florida | `/destinations/florida/fort-lauderdale/tours/fort-lauderdale-tropical-kayak-tour-and-island-adventure-89173p10` | Fort Lauderdale Tropical Kayak Tour and Island Adventure | 4 | 4 | 0 | no | explicit, product-override | yes | no | no | yes | payload-title | `product.itineraryItems` |
| 383300P6 | Florida | `/destinations/florida/fort-lauderdale/tours/guided-electric-bike-tours-of-greater-fort-lauderdale` | 90 min Electric Bike Tour of Fort Lauderdale (min 2) | 4 | 4 | 0 | no | explicit | no | no | no | yes | payload-title | `product.itinerary` |
| 5559561P1 | Florida | `/destinations/florida/fort-lauderdale/tours/jetcar-fort-lauderdale-rental-5559561p1` | JetCar Fort Lauderdale Rental | 2 | 2 | 0 | no | explicit | no | no | no | yes | payload-title | `product.itineraryItems` |
| 89173P8 | Florida | `/destinations/florida/fort-lauderdale/tours/reef-and-snorkel-paddle-tour-89173p8` | Reef Snorkel & Ocean Paddle Adventure in Fort Lauderdale Beach | 4 | 4 | 0 | no | explicit | no | no | no | yes | payload-title | `product.itineraryItems` |
| 57834P1 | Florida | `/destinations/florida/fort-lauderdale/tours/venice-of-america-fort-lauderdale-cruise` | VENICE OF AMERICA TOUR!! Best of Fort Lauderdale over 30 years!!! | 4 | 4 | 0 | no | explicit | no | no | no | yes | payload-title | `product.itineraryItems` |
| 214880P12 | Florida | `/destinations/florida/miami/tours/3-days-amazing-tour-in-miami` | 3 Days Amazing Tour in Miami | 3 | 3 | 0 | no | explicit, product-override | yes | no | no | yes | payload-title | `product.itineraryItems` |
| 5503P21 | Florida | `/destinations/florida/miami/tours/all-included-combo-with-miami-watersports` | All Included Combo with Miami Watersports | 0 | 0 | 0 | yes | none | no | no | no | no | manual-review | `product.itineraryItems` |
| 44152P18 | Florida | `/destinations/florida/miami/tours/everglades-to-keys-floridas-ultimate-national-parks-expedition` | Everglades to Keys: Florida's Ultimate National Parks Expedition | 3 | 3 | 0 | no | product-override | yes | no | no | no | reviewed-override | `product.itineraryItems` |
| 7943P1 | Florida | `/destinations/florida/miami/tours/miami-biscayne-bay-jet-ski-tour` | Miami Biscayne Bay Jet Ski Tour | 1 | 1 | 0 | no | explicit | no | no | no | yes | payload-title | `product.itineraryItems` |
| 402171P1 | Florida | `/destinations/florida/miami/tours/miami-excursions-luxury-experience-private` | Miami Excursions Luxury Experience Private | 0 | 0 | 0 | yes | none | no | no | no | no | manual-review | `product.itineraryItems` |
| 8836P2 | Florida | `/destinations/florida/miami/tours/miami-pirate-boat-tour-skyline-and-celebrity-homes` | Miami Pirate Boat Tour: Skyline & Celebrity Homes | 3 | 3 | 0 | no | explicit, product-override | yes | no | no | yes | payload-title | `product.itineraryItems` |
| 438341P2 | Florida | `/destinations/florida/miami/tours/miami-private-boat-cruise-with-a-captain` | Miami Private Boat Cruise with a Captain | 3 | 3 | 0 | no | explicit | no | no | no | yes | payload-title | `product.itineraryItems` |
| 10150P16 | Florida | `/destinations/florida/miami/tours/miami-raccoon-island-adventure` | Miami Raccoon Island Adventure | 3 | 3 | 0 | no | explicit | no | no | no | yes | payload-title | `product.itineraryItems` |
| 5503P10 | Florida | `/destinations/florida/miami/tours/parasailing-with-miami-watersports` | Parasailing with Miami Watersports | 3 | 3 | 0 | no | explicit, product-override | yes | no | no | yes | payload-title | `product.itineraryItems` |
| 408277P4 | Florida | `/destinations/florida/miami/tours/real-extreme-off-road-atv-miami-driver-license-required` | Real Extreme Off Road ATV Miami (driver license required) | 0 | 0 | 0 | yes | none | no | no | no | no | manual-review | `product.itineraryItems` |
| 342209P4 | Florida | `/destinations/florida/miami/tours/sup-kayak-wildlife-exploration-through-mangrove-jungle` | SUP / Kayak Wildlife exploration through mangrove jungle | 0 | 0 | 0 | yes | none | no | no | no | no | manual-review | `product.itineraryItems` |
| 231628P7 | Florida | `/destinations/florida/miami/tours/taste-of-miami-helicopter-tour` | Taste of Miami Helicopter Tour | 2 | 2 | 0 | no | explicit | no | no | no | yes | payload-title | `product.itineraryItems` |

## Count mismatches

### 53474P8 — Anchorage Greenbelt Bike Tour
- Rendered count: 7
- Payload count: 7
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 411138P3 — Glacier View & Wildlife Anchorage Adventure Tour
- Rendered count: 6
- Payload count: 6
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 100569P5 — Glacier Hike on Matanuska Glacier - Best Vacation Value
- Rendered count: 3
- Payload count: 3
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 118958P8 — 4 Hour Shared Big Game Fishing
- Rendered count: 3
- Payload count: 3
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 76145P2 — Authentic Private Everglades Airboat Tour
- Rendered count: 3
- Payload count: 3
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 6331BAHA — FROM FLORIDA: Bahamas Day Escape By Ferry
- Rendered count: 4
- Payload count: 4
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 89173P10 — Fort Lauderdale Tropical Kayak Tour and Island Adventure
- Rendered count: 4
- Payload count: 4
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 383300P6 — 90 min Electric Bike Tour of Fort Lauderdale (min 2)
- Rendered count: 4
- Payload count: 4
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itinerary`

### 5559561P1 — JetCar Fort Lauderdale Rental
- Rendered count: 2
- Payload count: 2
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 89173P8 — Reef Snorkel & Ocean Paddle Adventure in Fort Lauderdale Beach
- Rendered count: 4
- Payload count: 4
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 57834P1 — VENICE OF AMERICA TOUR!! Best of Fort Lauderdale over 30 years!!!
- Rendered count: 4
- Payload count: 4
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 214880P12 — 3 Days Amazing Tour in Miami
- Rendered count: 3
- Payload count: 3
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 44152P18 — Everglades to Keys: Florida's Ultimate National Parks Expedition
- Rendered count: 3
- Payload count: 3
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 7943P1 — Miami Biscayne Bay Jet Ski Tour
- Rendered count: 1
- Payload count: 1
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 8836P2 — Miami Pirate Boat Tour: Skyline & Celebrity Homes
- Rendered count: 3
- Payload count: 3
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 438341P2 — Miami Private Boat Cruise with a Captain
- Rendered count: 3
- Payload count: 3
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 10150P16 — Miami Raccoon Island Adventure
- Rendered count: 3
- Payload count: 3
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 5503P10 — Parasailing with Miami Watersports
- Rendered count: 3
- Payload count: 3
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

### 231628P7 — Taste of Miami Helicopter Tour
- Rendered count: 2
- Payload count: 2
- JSON-LD count: 0
- Suspected missing rows: none
- Suspected dropped rows: none
- Exact extractor path used: `product.itineraryItems`

## Special-focus products

### 411138P3
- Route: `/destinations/alaska/anchorage/tours/glacier-view-and-wildlife-anchorage-adventure-tour`
- Counts: rendered 6, payload 6, JSON-LD 0; aligned no.
- Current title source: explicit, product-override; overrides yes; description-derived no.
- Recommended authority: payload-title.
- Rendered titles: Anchorage; Earthquake Park; Beluga Point; Alaska Wildlife Conservation Center; Girdwood; Turnagain Arm Drive
- Extracted titles: Anchorage; Earthquake Park; Beluga Point; Alaska Wildlife Conservation Center; Girdwood; Turnagain Arm Drive
- Viator JSON-LD names: none

### 53474P8
- Route: `/destinations/alaska/anchorage/tours/anchorage-greenbelt-bike-tour-391155`
- Counts: rendered 7, payload 7, JSON-LD 0; aligned no.
- Current title source: product-override, explicit; overrides yes; description-derived no.
- Recommended authority: payload-title.
- Rendered titles: Campbell Creek Trail; Chester Creek Trail; Westchester Lagoon; Earthquake Park; Kincaid Park; Point Woronzof; Tony Knowles Coastal Trail
- Extracted titles: Campbell Creek Trail; Chester Creek Trail; Westchester Lagoon; Earthquake Park; Kincaid Park; Point Woronzof; Tony Knowles Coastal Trail
- Viator JSON-LD names: none

### 100569P5
- Route: `/destinations/alaska/anchorage/tours/sunset-wilderness-wildlife-glacier-and-nature-free-photo-lessons-may-sept`
- Counts: rendered 3, payload 3, JSON-LD 0; aligned no.
- Current title source: explicit; overrides no; description-derived no.
- Recommended authority: payload-title.
- Rendered titles: Matanuska Glacier State Recreational Site; Palmer; Eagle River
- Extracted titles: Matanuska Glacier State Recreational Site; Palmer; Eagle River
- Viator JSON-LD names: none

### 118958P8
- Route: `/destinations/florida/fort-lauderdale/tours/4-hour-shared-big-game-fishing-118958p8`
- Counts: rendered 3, payload 3, JSON-LD 0; aligned no.
- Current title source: product-override; overrides yes; description-derived no.
- Recommended authority: reviewed-override.
- Rendered titles: Fort Lauderdale Marina; Offshore Fishing Grounds; Harbor Arrival
- Extracted titles: Fort Lauderdale Marina; Offshore Fishing Grounds; Harbor Arrival
- Viator JSON-LD names: none

### 44152P18
- Route: `/destinations/florida/miami/tours/everglades-to-keys-floridas-ultimate-national-parks-expedition`
- Counts: rendered 3, payload 3, JSON-LD 0; aligned no.
- Current title source: product-override; overrides yes; description-derived no.
- Recommended authority: reviewed-override.
- Rendered titles: Miami; Everglades Region; Florida Keys
- Extracted titles: Miami; Everglades Region; Florida Keys
- Viator JSON-LD names: none

### 76145P2
- Route: `/destinations/florida/fort-lauderdale/tours/authentic-private-everglades-airboat-tour-76145p2`
- Counts: rendered 3, payload 3, JSON-LD 0; aligned no.
- Current title source: product-override; overrides yes; description-derived no.
- Recommended authority: reviewed-override.
- Rendered titles: Everglades Launch Area; Everglades Wetlands; Dock Arrival
- Extracted titles: Everglades Launch Area; Everglades Wetlands; Dock Arrival
- Viator JSON-LD names: none

