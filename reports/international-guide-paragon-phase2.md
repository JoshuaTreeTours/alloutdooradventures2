# International guide paragon rewrite — Phase II presentation pass

Branch: `international-guide-paragon-rewrite`

## Purpose

Phase II keeps the factual Phase I destination guidance but raises the flagship international POI presentation to the same visual and editorial family as the Santa Monica paragon.

## What changed

- Flagship international POI descriptions are now hardened to at least four sentences and 340 characters.
- Short descriptions receive category-aware visitor guidance rather than generic filler. Museums, religious sites, palaces, markets, outdoor sites, waterfronts, districts and monuments receive different planning treatment.
- The existing anti-boilerplate checks remain in force and Phase II adds additional banned phrases associated with the former generated guide copy.
- The Phase II international cohort receives a dedicated city-guide renderer rather than changing every world guide at once.
- POIs render as individual rounded cards with a wide landscape image above the numbered title and longer narrative, matching the visual grammar used by the Santa Monica guide.
- Each POI first attempts to resolve a landmark-specific Wikimedia/Wikipedia image through the existing high-confidence landmark-image resolver. A governed destination image is retained as the graceful fallback so the card never collapses into a text-only block merely because an external landmark image is unavailable.
- The factual Phase I overview, city context, planning guidance, season advice and packing advice remain visible in the Phase II renderer.
- The international Top Tours rule remains: if any Engine 6 inventory exists for the city or country, Top Tours uses only Engine 6; legacy inventory is used only when the Engine 6 set is empty.

## Scope control

The new visual renderer is limited to the existing Phase I flagship cohort. Unprofiled international cities continue to use the existing world-guide template and are not silently upgraded with generated content. Paris remains a dedicated route but now uses the same Phase II POI card and narrative-depth behavior.

## Quality gates

Automated tests cover narrative depth, banned boilerplate, Berlin's image-backed card rendering, Paris's image-backed card rendering, Engine 6 exclusivity, and the zero-Engine-6 legacy fallback case.

The branch should remain unmerged until the preview build/type checks pass and representative desktop/mobile pages are visually reviewed, especially Berlin, Munich, Paris, Rome, London and one non-Phase-II international city to confirm scope isolation.
