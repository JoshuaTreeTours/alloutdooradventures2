# Arches National Park — Engine6 Selection Notes

**Extraction date:** 2026-08-04  
**Source:** Viator public product + attraction listing pages (WebSearch full-page dumps; direct HTTP/WebFetch CAPTCHA-blocked by DataDome)  
**Raw data:** `scripts/arches-national-park-live-product-data.raw.json` (26 products)

## Recommended selected codes (18)

| Code | Tier | Why |
|------|------|-----|
| **108923P4** | premium | Private guided hike, 6h, $244 |
| **18497P17** | premium | Private hidden/solitaire desert hike |
| **18497P4** | premium | Guided Devils Garden 7mi hike challenge (renamed; not jeep) |
| **265766P8** | premium | Full-day private tour+hike, $973, 45 reviews |
| **334588P2** | premium | Private 4x4 backcountry half-day |
| **24134P2** | premium | Jeep backcountry, 610 reviews (shared) |
| **6896P1** | premium | Full-day Arches+Canyonlands 4x4 |
| **148657P5** | premium | Sunset + night photography workshop |
| **18497P9** | premium | Private secluded Devils Garden sunset hike |
| **14649P16** | premium | Helicopter (Corona Arch Canyon Run) |
| **14649P18** | premium | Arches airplane tour |
| **14649P2** | premium | Canyonlands+Arches air combo *(confirm live H1)* |
| **209615P252** | premium | Private 5h Arches tour, $984 |
| **265766P26** | premium | Full-day small-group Arches hike |
| **24134P13** | premium | Full-day Arches+Canyonlands 4x4 |
| **18497P1** | standard | Best scenic Arches walks (3–7h options), 92 reviews |
| **24134P16** | standard | Arches van tour (depth / value) |
| **122460P8** | standard* | Morning tour — *optional; only 2 reviews* |

**Premium mix:** 15/18 ≈ **83%** (exceeds ≥50% target).

## Rejected codes (with reasons)

| Code | Reason |
|------|--------|
| **22803P33** | Already Engine6-bound to Moab |
| **7016P4** | Already Engine6-bound to Moab |
| **6896MOABAPARK** | Already Engine6-bound to Moab |
| **458439P2** | Already Engine6-bound to Moab (use 148657P5 for photo/night) |
| **334588P4** | Already Engine6-bound to Moab |
| **18497P15** | Already Engine6-bound to Moab |
| **169760P14** | Already Engine6-bound to Moab (not re-extracted; known blocklist) |
| **265766P59** | Already Engine6-bound to Moab |
| **267535P4** | Audio / self-guided |
| **102020P34** | Audio / self-guided |
| **267535P17** | Audio / self-guided bundle (listing) |
| **259428P10** / **259640P12** / **309754P6** | Audio / self-guided (listing) |
| **18497P10** | Slot canyon — not Arches-focused |
| **122460P2** | Hummer slickrock safari — Moab trails, not Arches NP |

## Red flags / follow-ups

1. **18497P4 renamed** — live H1 is Devils Garden hike challenge; legacy jeep URL still resolves.
2. **14649P2 H1 uncertain** — related cards conflict with Airplane Tour labeling; confirm before wiring.
3. **14649P16** — live H1 is *Corona Arch Canyon Run Helicopter Tour*; USD price from operator ($159), Viator rating not captured.
4. **Direct page scrape blocked** — commercial fields triangulated from WebSearch dumps + US listing cards; re-validate prices/ratings via Viator Partner API when `VIATOR_API_KEY` available.
5. Do **not** dual-bind Moab Engine6 codes even when they dominate the Arches attraction listing.
