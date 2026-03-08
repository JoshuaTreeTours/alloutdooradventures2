# Engine4 Viator Hero Governance Template

This is the reusable onboarding contract for adding new Engine4 Viator tours.

## Canonical hero precedence (strict)

1. Exact-product API image from this product's `images[]` payload (`selectionSource = "api-images-payload"`)
2. Exact-product override from `ENGINE4_VIATOR_CANONICAL_HERO_BY_PRODUCT_CODE` (`selectionSource = "override"`)
3. Missing with diagnostics (`selectionSource = "missing"`)

Never use destination scenic fallbacks or cross-product image inheritance.

## Provenance requirement (hardened)

- API image candidates must be tied to the exact `productCode` being resolved and extracted from that product's `images[]` payload.
- Resolver prefers `images[].isCover === true`, then selects the best landscape variant with width >= 1100, otherwise the largest available variant from that same product image payload.
- For strict-provenance products, API candidates are rejected unless they can be traced to that product's raw payload image graph.
- If candidate provenance is uncertain, reject the candidate and prefer override/missing over wrong.
- Diagnostics must include rejected candidates and acceptance reason.

## Add New Tour workflow

1. Add a product record to `engine4ViatorTours`.
2. Add/update API source mapping in `engine4ViatorApiFallbackByProductCode`.
3. If API image is unstable, add a product-locked vaccine override to `ENGINE4_VIATOR_CANONICAL_HERO_BY_PRODUCT_CODE`.
4. Route/listing exposure should always use `mapViatorToEngine4Tour`.
5. Validate image consistency across:
   - page hero
   - listing card
   - `og:image`
   - schema `Product.image`
   - schema `TouristTrip.image`
6. Verify diagnostics from `resolveEngine4ViatorHeroWithDiagnostics` and run missing-hero report from `buildEngine4ViatorMissingHeroReport`.

## Guardrails

- Resolver rejects non-http URLs and tracker pixels.
- Resolver rejects API tour payloads whose `apiTour.productCode` does not match the target product.
- Resolver is conservative: missing is preferred over wrong.
