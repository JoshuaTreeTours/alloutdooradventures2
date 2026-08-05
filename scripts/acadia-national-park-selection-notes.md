# Acadia National Park — Engine6 Selection Notes

**Extraction date:** 2026-08-05  
**Source:** Viator public Bar Harbor attraction listing + product page dumps (WebFetch/WebSearch; direct curl/Playwright often CAPTCHA-blocked by DataDome)  
**Catalog:** https://www.viator.com/Bar-Harbor-attractions/Acadia-National-Park/d4371-a16085  
**Branch:** `engine6/Acadia-National-Park`  
**Paragon:** `/destinations/utah/zion-national-park/tours/bryce-canyon-full-day-private-tour-hike-265766P10`

## Selected codes (15)

| Code | Tier | Why |
|------|------|-----|
| **124652P1** | standard | Flagship narrated bus tour; strong commercial depth |
| **124652P2** | standard | Premium narrated bus (longer half-day) |
| **266852P3** | standard | Guided e-bike carriage roads |
| **87115P76** | standard | Premium small-group Bar Harbor + Cadillac |
| **265766P25** | premium | Full-day small-group naturalist tour/hike |
| **227717P1** | premium | 3hr private signature Park Loop |
| **227717P2** | premium | 4hr private fjord & mansions |
| **227717P3** | premium | 6hr private with lobster lunch stop |
| **485251P2** | premium | Way Life Should Be private guided |
| **265766P29** | premium | Half-day private bike on carriage roads |
| **5569071P4** | premium | Classic Acadia private |
| **5569071P10** | premium | Full-day private Mount Desert Island |
| **5596065P9** | premium | Sunrise/sunset Cadillac private |
| **5596065P3** | premium | Bass Harbor Head Light private drive |
| **265766P17** | premium | Full-day private tour & hike (paragon-family) |

**Premium mix:** 11/15 = **73%**.

## Why 15 (not 20–25)

Live Acadia catalog has many self-guided audio/app/GPS and rental SKUs. After rejecting those plus town-only food/ghost/sailing and thin SKUs without verified product heroes, **15** guided park-focused products remain with usable commercial fields and unique heroes. Do not pad with weak inventory. No jeep/helicopter/wine tours found in the live Acadia attraction catalog.

## Rejected (summary)

Self-guided audio/app/GPS: 267535P6, 259648P31, 259648P19, 309754P26, 222222P92, 259620P23  
Self-guided rentals: 266852P1, 67541P7  
Town/non-park: 143688P1, 343563P1, 197186P1  
Weaker / missing hero: 470431P4, 5596065P10, 5596065P12, 67541P9

## Neutral itinerary fallbacks

None required — stop titles use verified POI/location names (Cadillac Mountain, Thunder Hole, Jordan Pond, Bass Harbor Head Light, Carriage Roads, etc.).

## Commercial notes

- **265766P29** price captured from public product page locale dump (`From £664.99` → numeric 664.99); USD merchant display follows Engine6 pricing extraction from fixture `priceFrom`.
- Thin-review premium SKUs (5596065P9, 5596065P3, 265766P29) retained for category diversity with verified heroes and private positioning.
