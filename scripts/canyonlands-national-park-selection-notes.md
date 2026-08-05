# Canyonlands National Park — Engine6 Selection Notes

**Extraction date:** 2026-08-05  
**Source:** Viator public product + attraction listing pages (WebSearch full-page dumps; WebFetch/curl often CAPTCHA-blocked by DataDome)  
**Catalog:** https://www.viator.com/Moab-attractions/Canyonlands-National-Park/d5600-a16027 (15 results)  
**Branch:** `engine6/Canyonlands-Park-tours` (spaces invalid in git; closest valid form of requested `engine6/Canyonlands Park-tours`)

## Selected codes (8)

| Code | Tier | Why |
|------|------|-----|
| **24134P3** | premium | Half-day Canyonlands backcountry Jeep, $210, 423 reviews |
| **6896MOABCHPARK** | premium | Full-day Needles District 4x4 + optional Joint Trail |
| **6896MOABWRIM** | premium | Full-day White Rim Trail 4WD, ~$337, 210 reviews |
| **14649P15** | premium | Island in the Sky helicopter, $598, 5.0 / 14 |
| **265766P60** | premium | Canyonlands-specific full-day private hike, $973 |
| **14649P17** | premium | Geology airplane charter, $1,156 |
| **18497P14** | premium | Private secluded sunset 4x4 + scramble |
| **148657P1** | premium | Sunrise photography Dead Horse + Canyonlands |

**Premium mix:** 8/8 = **100%**.

## Why fewer than 10–20

Catalog shows only **15** attraction results. After rejecting audio/self-guided apps, Moab-bound SKUs, Arches-bound combos, Salt Lake multi-day packages, and thin/uncertain commercial SKUs, **8** unbound Canyonlands-focused guided products remain. Do not pad with weak inventory.

## Rejected (summary)

Moab-bound: 6896MOABCPARK, 18497P15, 265766P59, 334588P3  
Arches-bound: 6896P1, 24134P13  
Audio/self-guided: 267535P8, 267535P17, 102020P32, 309754P6, 309754P71  
Other: 481812P6/P5 (SLC multi-day), 14649P14 (Lake Powell charter / unverified ratings), 14649P2 (uncertain H1), 148657P4 (multi-park photo day), 269326P2 (Moab slickrock private jeep)

## Neutral itinerary fallbacks

- **18497P14**: `Secluded sunset overlook` — verified POI name not published on page dumps; neutral label used.
