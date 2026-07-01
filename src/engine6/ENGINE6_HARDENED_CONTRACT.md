# Engine6 Hardened Contract (Creation Standard)

This document freezes the merged Engine6 behavior as the required baseline for all future Engine6 tour creation work.

## Mandatory inherited behavior for every new Engine6 tour

Every new Engine6 specimen must inherit these behaviors without custom branching:

- **Hero parity:** detail hero, city/state listing card hero, `/tours?state=...&city=...` card hero, and related slider card hero must be identical.
- **Hero winner policy:** if a resolved Engine6 hero exists, it must win. Placeholder/hiking hero is only allowed when no valid hero exists.
- **CTA policy:** CTA must use the resolved booking target and preserve current monetized Viator query params (`pid`, `uid`, `mcid`, `medium`, `currency`).
- **Schema URL split:**
  - `Product.url` = local AOA canonical URL.
  - `Offer.url` = booking URL.
- **Listing participation:** every Engine6 tour must appear in:
  - `/destinations/[state]/[city]/tours`
  - `/tours?state=[state]&city=[city]`
- **City discoverability:** state/city selector must include any city with valid indexed Engine6 inventory.
- **Related tours source:** related section must use same-city unified inventory and exclude current tour by product code and slug.
- **Collision guard:** legacy route collision must throw unless explicitly configured in `ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS`.
- **Itinerary rendering:** timeline rendering only when structured stop data exists; summary-only itinerary must render explicitly and visually distinct.
- **New-build itinerary originality rule:** for newly created Engine6 tours only, itinerary stop order/structure must remain Viator-authored while each stop description is rewritten as one concise factual sentence (no verbatim copy or generic filler); existing Engine6 tours must not be retro-edited to satisfy this rule.
- **New-build overview governance rule:** for newly created Engine6 tours only, overviews must use original travel-guide wording (120–250 words), preserve named locations from source material, avoid operational openings and supplier copy, and pass duplicate-content and factual-content review; reviewed product-specific overview overrides and existing Engine6 tours remain unchanged.
- **New-build fixture default:** every Engine6 product outside the original merchant-approved set automatically receives `itineraryOriginalityForNewBuilds: true` in `validationFixtures.ts`, enabling itinerary and overview governance without per-fixture boilerplate.
- **FAQ parity:** FAQ schema must match visible FAQ entries.
- **Price contract:** price is "From" minimum price, kept aligned between UI copy and schema (`price`, `priceCurrency`, `priceValidUntil`).

## Stage 2: Merchant feed image governance

Every Engine6 merchant-feed generation path must enforce live image URL validation before writing `image_link` values:

- Resolve each row's initial hero using the standard Engine6 display-hero policy for the destination.
- Before writing any merchant feed CSV row, verify every `image_link` URL resolves successfully.
- Reject HTTP 404, 403, 5xx, timeout, invalid redirect, empty response, placeholder, missing, broken, or non-image URLs.
- When the selected hero fails validation, recover automatically in this order:
  1. next valid product-specific image
  2. next valid POI/location image
  3. curated product fallback image
  4. destination canonical image
  5. global Engine6 fallback image
- Fail generation only when no valid replacement image exists for newly added or branch-modified Engine6 scope.
- Report invalid images on unchanged legacy and non-Engine6 baseline rows without blocking production regeneration.
- Report images validated, automatically repaired, requiring fallback, and unrecoverable failures in the build completion output.

This Stage 2 rule applies to all future Engine6 city builds and all merchant-feed generation. Existing published cities remain unchanged until they are regenerated.

## Stage 2: Product selection, portfolio diversity, and live validation

Before writing any Engine6 destination fixtures, validate every candidate product through the existing live Viator validation infrastructure:

- Reuse `validateEngine6LiveViatorCandidate` and ranked backup selection; do not duplicate validation logic.
- Reject inactive, removed, unavailable, blocked, or commercially incomplete products before fixtures, merchant feed rows, routes, or sitemap entries are generated.
- Maintain ranked candidate pools with backup products for every major experience type; replace failed primaries automatically with the next valid candidate.
- Target an approximately 50/50 premium vs standard portfolio mix when the destination catalog permits, while preserving product quality and experience-type diversity.
- Honor destination-specific selection priorities without unnecessary duplication of nearly identical products.
- Keep live validation PR-scoped so only newly introduced products can block the current pull request.
- Preserve deterministic build order: Live Validation → Fixtures → Merchant Feed → Routes → Sitemap.

Use `selectEngine6DestinationPortfolio` in `src/engine6/engine6ProductSelectionGovernance.ts` for destination builds and `validate:engine6-product-selection` for completion reporting.

## Forbidden patterns

The following are forbidden in Engine6 work:

- Specimen-specific branching to pass one tour while weakening the general contract.
- Alternate image override paths that bypass resolved Engine6 hero.
- Legacy route coexistence without explicit replacement declaration.
- Silent fallback from structured itinerary to fake timeline behavior.
- For new builds, copying Viator itinerary descriptions verbatim or using generic placeholder stop descriptions.
- For new builds, copying supplier overview prose verbatim or opening overviews with pickup, meeting, clothing, or other operational instructions.

## Pre-merge requirements for Engine6 changes

Before merging any Engine6 creation/update work:

1. Run `src/engine6/creationValidation.test.tsx` and `src/engine6/engine6.test.tsx`.
2. Confirm no contract violations in creation validator across all validation fixtures.
3. Confirm listing inclusion and city selector discoverability for affected routes.
4. Confirm collision policy is explicit for any route that overlaps legacy/Engine4 paths.

## Reusable creation validation

Use `validateEngine6CreationContract` in `src/engine6/creationValidation.tsx` for new specimens. It validates:

- route ownership
- hero/card/schema parity
- CTA correctness
- listing inclusion
- related tours participation
- structured itinerary behavior
- FAQ behavior
- schema contract
- city discoverability

This is the general Engine6 rule set and must not be replaced by specimen-by-specimen exceptions.
