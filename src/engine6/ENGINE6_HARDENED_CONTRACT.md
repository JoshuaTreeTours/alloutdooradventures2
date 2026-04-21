# Engine6 Hardened Contract (Creation Standard)

This document freezes the merged Engine6 behavior as the required baseline for all future Engine6 tour creation work.

## Mandatory inherited behavior for every new Engine6 tour

Every new Engine6 specimen must inherit these behaviors without custom branching:

- **Hero parity:** detail hero, city/state listing card hero, `/tours?state=...&city=...` card hero, and related slider card hero must be identical.
- **Hero winner policy:** if a resolved Engine6 hero exists, it must win. Placeholder/hiking hero is only allowed when no valid hero exists.
- **CTA policy:** CTA must use the resolved booking target and preserve current monetized Viator query params (`pid`, `mcid`, `medium`).
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
- **FAQ parity:** FAQ schema must match visible FAQ entries.
- **Price contract:** price is "From" minimum price, kept aligned between UI copy and schema (`price`, `priceCurrency`, `priceValidUntil`).

## Forbidden patterns

The following are forbidden in Engine6 work:

- Specimen-specific branching to pass one tour while weakening the general contract.
- Alternate image override paths that bypass resolved Engine6 hero.
- Legacy route coexistence without explicit replacement declaration.
- Silent fallback from structured itinerary to fake timeline behavior.

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
