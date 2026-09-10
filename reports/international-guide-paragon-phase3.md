# International Guide Paragon Rewrite — Phase 3

## Goal

Extend the Santa Monica / major-U.S.-city editorial standard and the Phase 1–2 international Paragon architecture to the remaining high-value international guide cohort requested for Southeast Asia, Australia, Canada and Europe.

Phase 3 preserves the existing guide structure while replacing thin or generic destination copy with destination-specific orientation, factual context, practical planning guidance, seasonal advice and at least six asserted points of interest. Wikipedia or Wikimedia references are not treated as defects by themselves; the editorial failure condition remains thin, generic or misleading copy.

## Scope

Phase 3 adds **60 newly curated guide profiles** while retaining every existing Phase 2 Paragon guide.

| Region | New guides | Notes |
|---|---:|---|
| Southeast Asia / Asia-Pacific | 4 | Bangkok, Singapore, Bali and Port Douglas |
| Canada | 9 | Banff, Calgary, Canmore, Comox–Strathcona C, Halifax, Kamloops, Québec, Vancouver and Victoria |
| Remaining Europe | 47 | Belgium, Germany, Greece, Ireland, Italy, Lithuania, Netherlands, Norway, Portugal, Spain, Sweden and United Kingdom |
| **Total** | **60** | Added to the existing Phase 2 cohort |

## Editorial rules

Each Phase 3 profile must provide:

- a destination-specific overview of at least two sentences;
- factual geographic or historical context;
- practical planning guidance tied to the actual place;
- specific season and packing advice;
- at least six unique named POIs;
- factual POI seed copy of at least two sentences and 150 characters;
- final POI narratives of at least four sentences and 340 characters after the shared Phase 2 deepener runs;
- no banned generic filler phrases inherited from the earlier guide audit.

The Phase 2 category-aware narrative deepener is reused so museums, religious sites, palaces, markets, outdoor destinations, waterfronts, districts and landmarks receive practical visitor guidance appropriate to the type of place instead of one universal paragraph template.

## Regional-guide handling

Several surviving guide routes are not conventional cities. Phase 3 deliberately treats them according to what they actually are:

- **Comox–Strathcona C** is a Vancouver Island regional outdoor base, not an invented downtown.
- **Jostedal** is a glacier valley; glacier safety and guided ice access are stated explicitly.
- **Valmareno** is a Veneto foothill / Valsana regional base centered on nearby historic and landscape assets.
- **Escorca** is a Serra de Tramuntana mountain municipality.
- **Calvià** is a broad Mallorca municipality with separate inland and coastal districts.
- **Bali** is treated as an island destination whose regions require realistic travel-time planning.
- **Beaulieu, Hay-on-Wye, Peebles, Son Serra de Marina and similar small destinations** are written at their real scale rather than padded into city-style attraction lists.

## Rendering and tour governance

`CityGuideRoute` now runs international guides through the Phase 3 enhancer. Phase 3 first calls the Phase 2 enhancer, which guarantees that the original Phase 1–2 cohort remains unchanged. Newly profiled Phase 3 guides are then routed through the existing `InternationalCityGuideTemplate`, so they receive the same numbered POI cards, governed image treatment and overall Paragon visual architecture.

The existing Engine 6 Top Tours governance remains in place after editorial enhancement: when a qualifying international city has Engine 6 inventory, Top Tours is populated from Engine 6 rather than mixing legacy products into the curated presentation.

## Guardrails

The Phase 3 test suite asserts that:

1. exactly 60 new profiles are registered;
2. all Phase 2 Paragon keys remain governed by Phase 3;
3. every new guide has six or more unique POIs;
4. every final POI narrative meets the four-sentence / 340-character Phase 2 depth standard;
5. generic filler phrases remain absent;
6. an unrelated unprofiled international guide remains untouched.

This keeps the change additive and isolated: it improves only the audited cohort and does not globally rewrite every international route.
