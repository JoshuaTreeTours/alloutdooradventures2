# Engine6 Baseline Understanding Audit

**Date:** 2026-06-18  
**Scope:** Read-only analysis of the Engine6 production Viator tour system  
**Purpose:** Establish a complete baseline so future production builds follow existing governance and architecture  

---

## Table of Contents

1. [Engine6 Data Flow](#1-engine6-data-flow)
2. [Routing Architecture](#2-routing-architecture)
3. [Component Inventory](#3-component-inventory)
4. [SEO Governance](#4-seo-governance)
5. [Content Governance](#5-content-governance)
6. [Relationship Governance](#6-relationship-governance)
7. [Paragon Analysis](#7-paragon-analysis)
8. [Risk Analysis](#8-risk-analysis)
9. [Engine6 Build Checklist](#9-engine6-build-checklist)
10. [Executive Summary](#10-executive-summary)

---

## 1. Engine6 Data Flow

### Overview

Engine6 is a governed Viator tour presentation pipeline. It does not use a runtime database. Tour data enters as bundled Viator API snapshots, is validated and mapped at module load, and is optionally enriched at runtime via a serverless API endpoint.

```
data/engine6/viator/{productCode}.exact-product.json
        │
        ▼
validationFixtures.ts  (100 fixtures, source-of-truth policy)
        │
        ▼
registry.ts  (extract → map → filter → assert)
        │
        ├── engine6ResolvedTours: Engine6Tour[]
        │
        ├── listing.ts → engine6ListingTours: Tour[]
        │       └── merged into src/data/tours.ts
        │
        └── Runtime enrichment via /api/engine6/viator-product
                └── liveProductFields.ts → Engine6TourPage / CityTourDetailRoute
```

### Source of Tour Data

| Layer | Path | Role |
|-------|------|------|
| Bundled Viator snapshots | `data/engine6/viator/{productCode}.exact-product.json` | Build-time source of truth (~135 JSON files) |
| Route registry | `src/engine6/routes.ts` | ~100 product codes mapped to explicit canonical paths |
| Validation fixtures | `src/engine6/validationFixtures.ts` | 100 registered fixtures; all use `sourceOfTruth.mode: "api-driven"` |
| Configured product list | `ENGINE6_CONFIGURED_PRODUCT_CODES` in `routes.ts` | Derived from active route entries; build throws if any code lacks a fixture |

**Source-of-truth policy** (`sourceOfTruthPolicy.ts`):

- API-driven fixtures **forbid** authored content fields: `title`, `description`, `overview`, `price`, `itinerary`, `highlights`, etc.
- Only deterministic hero metadata is allowed in fixtures.
- `assertEngine6FixtureSourceOfTruth()` throws at import time on violation.

### API Ingestion Path

**Endpoint:** `api/engine6/viator-product.ts`

```
HTTP GET /api/engine6/viator-product?productCode={code}
        │
        ├─ VIATOR_API_KEY present?
        │     ├─ Yes → fetch https://api.viator.com/partner/products/{code}
        │     │         + optional /availability/schedules/{code} for live fromPrice
        │     └─ No / failure → read data/engine6/viator/{code}.exact-product.json
        │
        ├─ extractEngine6Product()  (api/engine6/viatorExtractors.ts)
        │     └── resolveProductScopedHero()  (api/engine6/heroResolver.ts)
        │
        └─ Return Engine6ApiResponse envelope { source, diagnostics, rawProduct, extracted }
```

Special sanitization: product `447486P2` strips contaminated itinerary/overview from API responses.

### Build Pipeline

**Prebuild** (`package.json` → `prebuild`):

- CSV import and Engine2 generation run before Vite build.
- Engine6 fixtures are **not** regenerated at prebuild; they are committed JSON snapshots.

**Production build** (`scripts/vercel-build.mjs`):

```
production:
  generate-tour-enrichment.mjs  (non-Engine6 tour enrichment)
  vite build
  generate-sitemap.mjs            (imports engine6ResolvedTours directly)
  run-prerender.mjs               (imports engine6ResolvedTours + buildEngine6Seo)
  SEO verification scripts
```

**Registry bootstrap** (`registry.ts`) — runs at module import:

1. Verify every `ENGINE6_CONFIGURED_PRODUCT_CODES` entry has a validation fixture.
2. For each fixture: `extractEngine6Product()` → `mapViatorToEngine6Tour()`.
3. Filter tours passing `hasStrictExactProductHero` (hero must come from `product.media.images` with full provenance).
4. Assert collision policy, replacement mode policy, and no canonical slug collisions.
5. Export `engine6ResolvedTours`.

**Listing projection** (`listing.ts`):

- `engine6ResolvedTours` + `legacyFhMigratedTours` → `engine6ListingTours: Tour[]`
- Dedupes by canonical path (native wins over `legacy-fh-migrated`).
- Maps to unified `Tour` type with `engine: "engine6"`.

### Content Generation Pipeline

**Core mapper:** `mapViatorToEngine6Tour.ts`

- Resolves canonical path via `resolveEngine6PathForProductCode()` or title-slug fallback.
- Derives city/state labels from route slugs when API location is missing.
- Applies per-product override maps (discouraged for new work): SEO titles, meta descriptions, descriptions, overviews, classifications.
- Builds Viator affiliate booking URL via `buildEngine6ViatorBookingUrl.ts`.
- Runs itinerary governance for new builds (`itineraryGovernance.ts`).

**Display curation:** `displaySections.ts` — scores and dedupes highlights and additional-info items (max 5 each).

### Rendering Pipeline

Two entry points render the same component (`Engine6TourPage.tsx`):

| Path | Component | Data strategy |
|------|-----------|---------------|
| Explicit specimen routes | `Engine6SpecimenRoute` | API-first fetch; registry fallback on failure |
| Generic destination URLs | `CityTourDetailRoute` | Registry-first; client-side live enrichment |

**Render dispatch order in `CityTourDetailRoute`:**

1. Native Engine6 tour by canonical path (+ live API enrichment)
2. Legacy FH migrated → Engine6 (`legacyFh/registry.ts`)
3. `isEngine6CanonicalPath()` without native tour → **throw** (no fallthrough to Engine2/1)
4. Engine4 → Engine3 → Engine2 → Engine1

### Static vs Dynamic Behavior

| Surface | Static (bundled fixture) | Dynamic (live API) |
|---------|--------------------------|-------------------|
| Hero image | Always from fixture at build | Not refreshed client-side |
| Title, overview, highlights | From fixture at build | Overview/itinerary optionally refreshed on detail page |
| Price, rating, duration | From fixture at build | Refreshed via `/api/engine6/viator-product` |
| Meeting point | From fixture at build | Refreshed on detail page |
| Listing cards | Fixture hero + description | `useEngine6LiveTourCardHydration.ts` hydrates commercial fields only |
| Prerender HTML | `engine6ResolvedTours` + `buildEngine6Seo` | N/A at build time |
| Sitemap | `engine6ResolvedTours` imported directly | N/A |

### Caching Layers

- **No HTTP cache headers** in Engine6 API code.
- **Bundled JSON** acts as persistent fallback when live API is unavailable.
- **Registry** computed once at module load; missing fixture → build throw.
- **Live hydration failures** are silent; fixture values retained.

---

## 2. Routing Architecture

### Tour URL Generation

**Pattern:** `/destinations/{stateSlug}/{citySlug}/tours/{tourSlug}`

- **Explicit paths:** ~100 `ENGINE6_*_ROUTE` + `ENGINE6_*_PRODUCT_CODE` pairs in `routes.ts`.
- **Helpers:** `resolveEngine6ProductCodeForPath()`, `resolveEngine6PathForProductCode()`, `isEngine6CanonicalPath()`.
- **Slug collisions:** forbidden unless different product codes; enforced by `routeIntegrity.assertEngine6NoCanonicalSlugCollisions()`.
- **Forbidden paths:** routes containing `/united-states/` (`validateEngine6CanonicalRouteIntegrity`).

### Route Registration (`App.tsx`)

- ~37 explicit `<Route path={ENGINE6_*_ROUTE} component={Engine6SpecimenRoute} />` entries.
- **Paragon route registered before generic route** (test-enforced): `ENGINE6_PARAGON_ROUTE` before `/destinations/:stateSlug/:citySlug/tours/:tourSlug`.
- **Generic fallback:** `CityTourDetailRoute` handles all destination tour URLs not matched by explicit routes.

### Destination Relationships

- City listing: `/destinations/{state}/{city}/tours` via `CityToursIndexRoute`.
- State listing: `/destinations/{state}` includes Engine6 tours via `getToursByState()`.
- Filtered catalog: `/tours?state=&city=` — Engine6 tours must appear (creation validator checks).
- **City alias resolution:** `destinationAliases.ts` groups slug variants so tours and destinations align.
- **Engine6-only cities:** `ENGINE6_ONLY_CITY_KEYS` placeholder set (currently empty).

### Guide Relationships

- Engine6 tour pages use breadcrumb chain: Destinations → State → City tours → current title.
- Parent city link: `buildEngine6ParentCityToursPath()` with `data-testid="engine6-back-to-tours"`.
- Guides at `/guides/us/{state}/{city}` link to destination tour pages via `guideResolver.ts`; Engine6 tours surface in guide pages through `getToursByCityUnified()`.

### Activity Relationships

- `listing.getEngine6ActivitySlugs()` maps Viator categories → activity filter slugs.
- Example: `paddle-sports` → `["paddle-sports", "canoeing"]`.
- Activity discovery routes: `/tours/{activitySlug}`, `/tours/{activitySlug}/{stateSlug}`, `/tours/{activitySlug}/{stateSlug}/{citySlug}`.

### Booking Page Relationships

- **Native Engine6:** external Viator affiliate links on detail page; no dedicated `/book` route.
- CTA text: "Check availability" → `tour.bookingUrl` (Viator affiliate URL).
- **Legacy FH migrated:** internal `/book` paths preserved (`mapLegacyFhRecordToEngine6Tour.ts`).
- **Schema split:** `Product.url` = local canonical; `Offer.url` = Viator affiliate URL.

### Canonical URL Determination

1. Explicit route in `routes.ts` wins over title-slug inference.
2. `tour.canonicalPath === tour.pagePath` (enforced).
3. Must match `resolveEngine6PathForProductCode(productCode)`.
4. Overlap replacements: 7 products in `ENGINE6_OVERLAP_REPLACEMENT_CONFIGS` reuse legacy slugs; must be listed in `ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS` or build throws.

---

## 3. Component Inventory

### Core Data Layer

| Module | Path | Purpose | Inputs | Outputs | Dependencies |
|--------|------|---------|--------|---------|--------------|
| **registry** | `src/engine6/registry.ts` | Build-time tour resolution | fixtures, routes | `engine6ResolvedTours`, lookup fns | `mapViatorToEngine6Tour`, collision/route guards |
| **routes** | `src/engine6/routes.ts` | Product ↔ path registry | manual constants | path/code maps, configured codes | `excludedProductCodes` |
| **validationFixtures** | `src/engine6/validationFixtures.ts` | Fixture registry | JSON imports | 100 fixtures | `sourceOfTruthPolicy` |
| **listing** | `src/engine6/listing.ts` | Unified listing adapter | `Engine6Tour[]` | `engine6ListingTours: Tour[]` | `cards`, `legacyFh/registry` |
| **cards** | `src/engine6/cards.ts` | Card view model | `Engine6Tour` | `Engine6Card` | `rating`, `priceDisplay`, `seo` |
| **types** | `src/engine6/types.ts` | Domain types | — | `Engine6Tour`, `Engine6ApiResponse`, diagnostics | — |

### Mapping & Extraction

| Module | Path | Purpose | Inputs | Outputs | Dependencies |
|--------|------|---------|--------|---------|--------------|
| **mapViatorToEngine6Tour** | `src/engine6/mapViatorToEngine6Tour.ts` | API → domain model | `Engine6ApiResponse` | `Engine6Tour` | `seo`, `routes`, `buildEngine6ViatorBookingUrl`, `itineraryGovernance` |
| **viatorExtractors** | `api/engine6/viatorExtractors.ts` | Raw JSON extraction | Viator payload | `Engine6Extracted` + diagnostics | `heroResolver`, `tourCategoryClassifier` |
| **heroResolver** | `api/engine6/heroResolver.ts` | Product-scoped hero selection | media candidates | `Engine6ResolvedHero` | rejects foreign product codes/URLs |
| **viator-product API** | `api/engine6/viator-product.ts` | HTTP handler | productCode | `Engine6ApiResponse` | live API + bundled fallback |

### Rendering

| Module | Path | Purpose | Inputs | Outputs | Dependencies |
|--------|------|---------|--------|---------|--------------|
| **Engine6TourPage** | `src/engine6/components/Engine6TourPage.tsx` | Full tour detail UI | `Engine6Tour` | Rendered page + SEO + schema | `Seo`, `buildEngine6SchemaGraph`, `buildEngine6Seo`, `displaySections`, `liveProductFields` |
| **Engine6SpecimenRoute** | `src/pages/engine6/Engine6SpecimenRoute.tsx` | Live API specimen shell | URL pathname | Fetches API → `Engine6TourPage` | `registry`, `routes`, `mapViatorToEngine6Tour` |
| **Engine6DebugPanel** | `src/engine6/components/Engine6DebugPanel.tsx` | Dev diagnostics overlay | tour diagnostics | Debug UI | env-gated |

### SEO & Schema

| Module | Path | Purpose | Inputs | Outputs | Dependencies |
|--------|------|---------|--------|---------|--------------|
| **seo** | `src/engine6/seo.ts` | Title/description/canonical helpers | tour fields | SEO strings | prose governance, landmark extraction |
| **buildEngine6SchemaGraph** | `src/engine6/schema/buildEngine6SchemaGraph.ts` | JSON-LD graph | `Engine6Tour` | `@graph` nodes | `structuredData` utils, `approvedNarrativeDescriptions` |
| **approvedNarrativeDescriptions** | `src/engine6/approvedNarrativeDescriptions.ts` | Targeted schema descriptions | productCode | override prose | schema graph |
| **buildEngine6ViatorBookingUrl** | `src/engine6/buildEngine6ViatorBookingUrl.ts` | Affiliate URL builder | productCode, overrides | booking URL | affiliate param governance |

### Governance & Validation

| Module | Path | Purpose | Inputs | Outputs | Dependencies |
|--------|------|---------|--------|---------|--------------|
| **hardening** | `src/engine6/hardening.ts` | Runtime assertion helpers | hero/CTA/renderer | throws on contract breach | used in `CityTourDetailRoute` |
| **creationValidation** | `src/engine6/creationValidation.tsx` | Pre-merge contract validator | tour + rawPayload | violation string[] | renders page HTML, checks listings/schema |
| **collisionGuard** | `src/engine6/collisionGuard.ts` | Legacy route collision detection | tours | throws on unmanaged overlap | legacy tour datasets, engine4 paths |
| **routeIntegrity** | `src/engine6/routeIntegrity.ts` | Canonical path validation | tour/path | violations, parent paths | `routes.ts` |
| **sourceOfTruthPolicy** | `src/engine6/sourceOfTruthPolicy.ts` | Fixture content rules | fixture | throws on authored fields | — |
| **itineraryGovernance** | `src/engine6/itineraryGovernance.ts` | Stop description rewriting | itinerary items | rewritten sentences | anti-verbatim rules |
| **displaySections** | `src/engine6/displaySections.ts` | Highlights/requirements curation | raw arrays | top 5 scored items | dedup scoring |

### Live Enrichment

| Module | Path | Purpose | Inputs | Outputs | Dependencies |
|--------|------|---------|--------|---------|--------------|
| **liveProductFields** | `src/engine6/liveProductFields.ts` | Client live enrichment | productCode | price/rating fields | `/api/engine6/viator-product` |
| **useEngine6LiveTourCardHydration** | `src/engine6/useEngine6LiveTourCardHydration.ts` | Hook for listing cards | tour entries | hydrated entries | `liveProductFields` |

### Legacy Migration

| Module | Path | Purpose | Inputs | Outputs | Dependencies |
|--------|------|---------|--------|---------|--------------|
| **legacyFh/registry** | `src/engine6/legacyFh/registry.ts` | FH→Engine6 migrated tours | fixture records | `legacyFhMigratedTours` (1 tour) | `mapLegacyFhRecordToEngine6Tour` |
| **replacementMode** | `src/engine6/replacementMode.ts` | Suppress duplicate FH listings | Tour + engine6 paths | boolean | `tours.ts` merge |

### Test Suite (Governance Enforcement)

| File | Role |
|------|------|
| `engine6.test.tsx` | Integration tests including paragon |
| `creationValidation.test.tsx` | Contract validation across all fixtures |
| `hardening.test.tsx` | Runtime assertion coverage |
| `collisionGuard.test.ts` | Collision policy |
| `routeIntegrity.enforcement.test.ts` | Canonical path rules |
| `engine6JsonLdRegressionGuard.test.tsx` | Schema regression guard |
| `itineraryGovernance.test.ts` | Itinerary rewrite rules |
| `sourceOfTruthPolicy.test.ts` | Fixture content policy |
| `api/engine6/viator-product.test.ts` | API handler |
| `api/engine6/deploy-safe.test.ts` | Deploy safety checks |

---

## 4. SEO Governance

### Metadata Generation

- **Title:** `buildEngine6SeoTitle()` — appends city if not already in title; per-product overrides in `ENGINE6_SEO_TITLE_OVERRIDES`.
- **Meta description:** `buildEngine6SeoDescription()` → `buildEngine6OptimizedDescription()` (135–155 char target, hard max 160).
- **Itinerary-aware SERP descriptions:** `buildEngine6ItinerarySerpDescription()` extracts landmarks from stop titles.
- **Blocked patterns:** operational filler (`confirmation will be received`, wheelchair accessibility, etc.), generic marketing leads, admission artifacts.
- **Page SEO bundle:** `buildEngine6Seo(tour)` prefers itinerary-derived description, falls back to `metaDescription`.

### Canonical Generation

- `tour.canonicalPath === tour.pagePath` (enforced at mapping and validation).
- Must match `resolveEngine6PathForProductCode(productCode)`.
- Schema `Product.url` = `https://www.alloutdooradventures.com{canonicalPath}`.

### Open Graph Generation

- Via shared `Seo` component in `Engine6TourPage`: `title`, `description`, `url`, `image` from `buildEngine6Seo()`.
- OG image = same hero URL as page (hero parity rule).

### Schema Generation

**Builder:** `buildEngine6SchemaGraph.ts`

Graph nodes emitted:

| Node | Content |
|------|---------|
| `BreadcrumbList` | 4 levels: Destinations → State → City tours → Tour |
| Site nodes | `WebSite`, `Organization`, `Brand` |
| `WebPage` | with `primaryImageOfPage` |
| `Place` | destination + optional departure/meeting point |
| `TouristTrip` | `itinerary` ItemList (≥2 stops), `duration` ISO8601, `touristType` |
| `Product` | with `aggregateRating` reference |
| `Offer` | Viator URL, `price`, `priceCurrency`, `priceValidUntil` |
| `FAQPage` | when FAQs present (must match visible FAQ) |

Description source priority:

1. `getEngine6TargetedNarrativeDescription(productCode)` from approved narratives.
2. Else `buildEngine6RichProductDescription()` (75–120 words).

**URL split (mandatory):**

- `Product.url` = local AOA canonical URL.
- `Offer.url` = Viator affiliate booking URL.

### Breadcrumb Generation

- **Visible:** `buildEngine6Breadcrumbs()` in `Engine6TourPage` — Destinations → State → City → current title.
- **Schema:** parallel 4-item `BreadcrumbList`.
- **Parent link:** `buildEngine6ParentCityToursPath()` + `data-testid="engine6-back-to-tours"`.

### Sitemap Participation

- `scripts/generate-sitemap.mjs` imports `engine6ResolvedTours` directly from `registry.ts`.
- Unified tours **exclude** `engine === "engine6"` from generic tour sitemap pass (avoids double-counting).
- Uses `buildEngine6Seo` when available for prerender metadata.
- Import failure logs warning and omits Engine6 URLs.

### Indexing Controls

- All resolved Engine6 tours with strict heroes are indexable canonical destination URLs.
- `isExcludedProductCode()` removes products from active routes and listings.
- Canonical paths that fail native resolution throw (no soft 404 fallthrough to legacy engines).
- `robots.txt` and prerender handle crawlability at site level.

---

## 5. Content Governance

### Hero Image Selection

- Must come from `product.media.images` with full provenance (product code, URL, field path, host).
- Forbidden: `/hero.jpg`, `/images/hiking-hero.jpg`, foreign product heroes.
- **Parity rule:** detail hero = listing card hero = schema image = related slider hero.
- Tours without strict exact-product hero are **excluded** from `engine6ResolvedTours`.

### Itinerary Generation

- **Timeline mode:** ≥2 structured stops → `data-testid="engine6-itinerary-timeline"`.
- **Summary-only mode:** explicit `data-testid="engine6-itinerary-summary-only"` when no timeline.
- **New-build originality:** stop order from Viator; descriptions rewritten to one factual sentence.
- Forbidden: verbatim Viator copy, generic placeholders, supplier voice ("you'll", "your guide"), admission ticket artifacts.
- **447486P2:** itinerary section suppressed (`isEngine6ItinerarySectionSuppressed`) — summary-only boat experience.

### Description Generation

- API-driven for fixtures; merchant overrides in mapper for specific product codes (discouraged for new work).
- `buildAuthoritativeOverview()` synthesizes when API overview is weak.
- Rich product descriptions blocked from generic boilerplate (`guide support`, `clear logistics`, etc.).

### Title Generation

- From Viator API extraction; SEO title may override via `ENGINE6_SEO_TITLE_OVERRIDES`.
- `normalizeEngine6ReadableTitle()` strips stitching artifacts.
- Schema uses city-aware naming: `{title} in {city}` when city not already in title.

### Landmark Handling

- `extractEngine6LandmarkNames()`, `dedupeEngine6Landmarks()` in `seo.ts` drive itinerary-based meta descriptions.
- Landmarks extracted from stop titles for SERP description generation.

### Duplication Prevention

- Listing dedup by canonical path (native over legacy-fh).
- Unified listing dedup by href with `assertUniqueByCanonicalPath`.
- `collisionGuard` blocks unmanaged path overlap with legacy Engine1/Engine4 tours.
- `suppressLegacyFareHarborTour()` removes FH listings when Engine6 owns same path.

### Fallback Behavior

- API failure → bundled fixture (specimen route: registry fallback).
- Missing hero → tour excluded from registry (strict filter, not soft fallback).
- Live hydration failure → silent; fixture values retained.
- Placeholder heroes forbidden; no valid hero → tour not in inventory.

---

## 6. Relationship Governance

| Relationship | Mechanism |
|--------------|-----------|
| **Tour ↔ City/State** | Parsed from canonical path slugs; API city/state as fallback with console warn |
| **Tour ↔ Country** | US states → "United States"; international states (e.g. Switzerland) used as country in listing |
| **Tour ↔ Activities** | `activityCategories` from Viator classifier + `getEngine6ActivitySlugs()` mapping |
| **Tour ↔ Listings** | Must appear in city, state, unified, and `/tours?state&city` surfaces |
| **Tour ↔ Related tours** | Same-city `getToursByCityUnified`, exclude by productCode + slug, min 2 to show slider |
| **Tour ↔ Booking** | Viator CTA for native Engine6; legacy FH keeps `/book` internal path |
| **Tour ↔ Legacy FH** | `suppressLegacyFareHarborTour` when Engine6 owns path; 1 migrated record (Central Park bike) |
| **Tour ↔ Engine4** | `collisionGuard` blocks unmanaged path overlap; 7 explicit replacements |
| **City discoverability** | `getStateCityOptions` must include cities with Engine6 inventory |

**Original merchant cohort:** `ENGINE6_ORIGINAL_MERCHANT_APPROVED_PRODUCT_CODES` = first 55 configured codes (special JSON-LD description repair rules in tests for post-55 cohort).

---

## 7. Paragon Analysis

**Product:** Grand Canyon West 6-in-1 Tour with Helicopter and Landing  
**Code:** `5119P13`  
**Route:** `/destinations/nevada/las-vegas/tours/grand-canyon-west-6-in-1-tour-with-helicopter-and-landing`  
**Fixture:** `data/engine6/viator/5119P13.exact-product.json`

### Layout Standards

- Full-width hero banner with dark overlay.
- Two-column hero grid: content left, hero image right.
- Breadcrumb nav at top of hero.
- Category pill, location label, H1 title.
- Commercial facts block (price, rating, duration, meeting point).
- Operator disclosure copy.
- Primary CTA in hero.

### Section Order

1. Hero (breadcrumbs, category, title, commercial facts, CTA, image)
2. Overview
3. Highlights (scored top 5, 2-column grid)
4. What's included
5. Itinerary timeline (4 stops with stop/pass-by badges)
6. FAQs (expandable details elements)
7. Additional info
8. Bottom CTA banner ("READY TO BOOK?")
9. Related tours slider (same-city, min 2)

### Surfacing Behavior

- Present in Nevada state listing, Las Vegas city listing, unified listing, and `/tours?state=nevada&city=las-vegas`.
- Hero image identical across detail page, city card, filtered catalog card, and schema.
- Registered in `App.tsx` **before** generic city tour route.

### Internal Linking Behavior

- Breadcrumb → `/destinations` → `/destinations/nevada` → `/destinations/nevada/las-vegas/tours`.
- Related tours from unified Las Vegas inventory excluding self (by productCode + slug).
- Related tour cards use same hero parity; commercial fields hydrated live.

### Structured Data Patterns

- Full schema graph: BreadcrumbList, WebPage, Place, TouristTrip with 4-stop ItemList, Product, Offer (affiliate URL), AggregateRating, FAQPage.
- Product.description from targeted narrative or rich description builder.
- Duration in ISO8601 format.
- Price aligned between UI and schema Offer node.

---

## 8. Risk Analysis

### Fragile Areas

1. **Dual render paths** — `Engine6SpecimenRoute` (live-first) vs `CityTourDetailRoute` (fixture-first + enrichment) can diverge if API and fixtures drift.
2. **Strict hero gate** — tours without exact-product hero silently excluded from registry; sitemap/listings shrink without obvious runtime error.
3. **100+ manual route constants** — adding a tour requires synchronized changes in `routes.ts`, fixture JSON, `validationFixtures.ts`, and often `App.tsx`.
4. **Per-product override sprawl** — large override maps in `mapViatorToEngine6Tour.ts` and `seo.ts` create maintenance debt.
5. **Affiliate param hardcoding** — `assertEngine6CtaIntegrity` locks specific `pid`/`uid`/`mcid`; per-product overrides must stay in sync.
6. **Legacy FH subsystem** — single migrated record with different booking model adds edge-case complexity.

### Known Technical Debt

- ~37 explicit specimen routes in `App.tsx` while generic route handles all — redundant registration.
- `ENGINE6_ONLY_CITY_KEYS` empty set (placeholder for future city isolation).
- International tours use state slug as country in some listing paths.
- Some fixture JSON files may be minimal stubs.

### Common Failure Points

| Failure | Behavior |
|---------|----------|
| Missing fixture | Build throws at registry init |
| Unmanaged legacy collision | Build throws |
| Engine6 canonical path without native tour | Runtime throw in `CityTourDetailRoute` |
| API 500 on specimen route | Falls back to registry (may show stale commercial data) |
| Live hydration failure | Silent; keeps fixture values |
| Hero fails strict gate | Tour excluded from inventory |

### SEO Regression Risks

- Itinerary landmark extraction heuristics may produce weak meta for atypical stop titles.
- `buildEngine6Seo` prefers itinerary SERP description — tours without recognizable landmarks fall back to generic meta.
- FAQ schema must match visible FAQ — content edits without paired updates fail creation validator.
- Prerender depends on optional import of registry — failure omits Engine6 URLs from sitemap.
- Product-specific hard-coded review count requirements (e.g. `335698P13`) can throw on data drift.

---

## 9. Engine6 Build Checklist

Use this checklist before every new Engine6 tour build or merge.

### Data & Fixtures

- [ ] Confirm Viator product code and fetch exact-product JSON
- [ ] Save to `data/engine6/viator/{productCode}.exact-product.json`
- [ ] Register fixture in `validationFixtures.ts` with `sourceOfTruth.mode: "api-driven"`
- [ ] Verify no authored content fields in fixture (only hero metadata allowed)
- [ ] Confirm hero resolves from `product.media.images` with full provenance

### Route Wiring

- [ ] Add `ENGINE6_*_PRODUCT_CODE` + `ENGINE6_*_ROUTE` to `routes.ts`
- [ ] Add to `ENGINE6_ROUTE_PRODUCT_CODE_ENTRIES` (or active entries list)
- [ ] If path overlaps legacy Engine1/Engine4, add to `ENGINE6_OVERLAP_REPLACEMENT_CONFIGS` + `ENGINE6_EXPLICIT_ROUTE_REPLACEMENTS`
- [ ] Verify path does not contain `/united-states/`

### Build Verification

- [ ] Run build; confirm tour appears in `engine6ResolvedTours`
- [ ] Confirm tour appears in `engine6ListingTours`
- [ ] Verify no collision guard or route integrity throws

### Optional App Route

- [ ] Add `<Route path={ENGINE6_*_ROUTE} component={Engine6SpecimenRoute} />` before generic route (or rely on `CityTourDetailRoute`)

### Contract Validation

- [ ] Run `validateEngine6CreationContract({ tour, rawPayload, fixture })`
- [ ] Confirm hero/card/schema parity
- [ ] Confirm CTA uses Viator affiliate URL with required params
- [ ] Confirm listing inclusion (city, state, unified, `/tours?state&city`)
- [ ] Confirm related tours section (min 2 same-city tours)
- [ ] Confirm FAQ schema matches visible FAQ
- [ ] Confirm itinerary rendering mode (timeline vs summary-only) is honest

### Test Suite

- [ ] `creationValidation.test.tsx`
- [ ] `engine6.test.tsx`
- [ ] `hardening.test.tsx`
- [ ] `productionRules.validation.test.tsx`
- [ ] `engine6JsonLdRegressionGuard.test.tsx` (if schema changes)

### SEO & Sitemap

- [ ] Confirm meta title and description meet length targets
- [ ] Confirm schema graph: Product.url local, Offer.url affiliate
- [ ] Confirm tour appears in sitemap via `engine6ResolvedTours`
- [ ] Confirm prerender metadata via `buildEngine6Seo`

### Governance Compliance

- [ ] No specimen-specific branching to pass one tour
- [ ] No alternate image override paths bypassing resolved hero
- [ ] No legacy route coexistence without explicit replacement declaration
- [ ] For new builds: itinerary descriptions rewritten (not verbatim Viator copy)
- [ ] Review `ENGINE6_HARDENED_CONTRACT.md` forbidden patterns

---

## 10. Executive Summary

Engine6 is All Outdoor Adventures' production Viator tour engine. It powers roughly 100 destination tour pages across US and international cities, presenting third-party Viator inventory on canonical `/destinations/{state}/{city}/tours/{slug}` URLs while preserving affiliate monetization and SEO structure.

**Architecture in brief:** At build time, `registry.ts` loads bundled Viator exact-product JSON from `data/engine6/viator/`, maps each product through `mapViatorToEngine6Tour.ts`, and exports only tours passing strict hero provenance checks. These feed unified listings via `listing.ts` and `tours.ts`. At runtime, pages enrich commercial fields (price, rating, duration, meeting point) from `/api/engine6/viator-product`, which tries the live Viator API then falls back to the same bundled JSON.

**Two entry points render tours:** `Engine6SpecimenRoute` (explicit App.tsx routes, API-first with registry fallback) and `CityTourDetailRoute` (generic destination URL, registry-first with live enrichment). Both render `Engine6TourPage.tsx`, the single presentation component responsible for hero, sections, CTAs, breadcrumbs, related tours, and structured data.

**Governance is the system's defining characteristic.** The hardened contract (`ENGINE6_HARDENED_CONTRACT.md`) mandates hero parity across detail/cards/schema, Viator CTA integrity, schema URL separation, listing inclusion, collision declarations for legacy overlaps, and honest itinerary rendering (timeline vs summary-only). These rules are enforced programmatically by `creationValidation.tsx`, `collisionGuard.ts`, `routeIntegrity.ts`, `hardening.ts`, and extensive test suites — not by convention alone.

**The Las Vegas paragon (5119P13)** is the reference implementation: rich sections (overview, highlights, included, 4-stop itinerary, FAQ), full JSON-LD graph, related-tours slider, and tested hero parity across all listing surfaces. New tours should match this pattern without custom branching.

**SEO is multi-layered:** `seo.ts` generates titles and descriptions with landmark extraction, boilerplate stripping, and length targeting; `buildEngine6SchemaGraph.ts` emits BreadcrumbList, TouristTrip, Product, Offer, and FAQPage nodes; sitemap generation imports resolved tours directly from the registry.

**Key risks for new developers:**

1. The system fails hard at build time for missing fixtures, collisions, or hero gaps — learn to read registry throw messages.
2. Route/product/fixture triple-registration is manual and error-prone.
3. Per-product overrides exist but are discouraged for new work.
4. Live vs bundled data can diverge on commercial fields.

Always run creation validation before merging.

**Legacy FH migration** (`legacyFh/`) handles FareHarbor-to-Engine6 conversions separately with internal booking paths; only one tour is migrated today. Replacement mode suppresses duplicate FareHarbor listings when Engine6 owns the canonical URL.

**To add a tour:** capture exact-product JSON, wire route constants, register the validation fixture, verify build inclusion in `engine6ResolvedTours`, pass creation contract tests, and confirm listing/schema/CTA parity. The contract document and `validateEngine6CreationContract` are the authoritative checklists — treat them as merge gates, not documentation alone.

**Authoritative references:**

- Contract: `src/engine6/ENGINE6_HARDENED_CONTRACT.md`
- Validator: `src/engine6/creationValidation.tsx` → `validateEngine6CreationContract()`
- Registry: `src/engine6/registry.ts`
- Renderer: `src/engine6/components/Engine6TourPage.tsx`
- API: `api/engine6/viator-product.ts`

Engine6 succeeds when treated as a governed pipeline — data in, validated model out, one renderer — rather than a collection of special-case tour pages.

---

## Appendix: Key File Index

| Concern | Path |
|---------|------|
| Hardened contract | `src/engine6/ENGINE6_HARDENED_CONTRACT.md` |
| Route registry | `src/engine6/routes.ts` |
| Build-time registry | `src/engine6/registry.ts` |
| Listing adapter | `src/engine6/listing.ts` |
| Core mapper | `src/engine6/mapViatorToEngine6Tour.ts` |
| Tour page renderer | `src/engine6/components/Engine6TourPage.tsx` |
| Specimen route shell | `src/pages/engine6/Engine6SpecimenRoute.tsx` |
| Generic detail dispatch | `src/pages/destinations/states/tours/CityTourDetailRoute.tsx` |
| Live API endpoint | `api/engine6/viator-product.ts` |
| Product extraction | `api/engine6/viatorExtractors.ts` |
| Hero resolver | `api/engine6/heroResolver.ts` |
| Schema builder | `src/engine6/schema/buildEngine6SchemaGraph.ts` |
| SEO helpers | `src/engine6/seo.ts` |
| Creation validator | `src/engine6/creationValidation.tsx` |
| Collision guard | `src/engine6/collisionGuard.ts` |
| Route integrity | `src/engine6/routeIntegrity.ts` |
| Runtime hardening | `src/engine6/hardening.ts` |
| Live enrichment | `src/engine6/liveProductFields.ts` |
| Fixture data | `data/engine6/viator/*.exact-product.json` |
| Validation fixtures | `src/engine6/validationFixtures.ts` |
| Sitemap integration | `scripts/generate-sitemap.mjs` |
| Prerender integration | `scripts/prerender.mjs` |
| Unified tour merge | `src/data/tours.ts` |
| Legacy FH migration | `src/engine6/legacyFh/registry.ts` |
| Replacement mode | `src/engine6/replacementMode.ts` |
