import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import { assertEngine6FixtureSourceOfTruth } from "./sourceOfTruthPolicy";
import type { Engine6ApiResponse, Engine6Tour } from "./types";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";
import {
  assertEngine6CollisionPolicy,
  assertEngine6ReplacementModePolicy,
} from "./collisionGuard";
import {
  assertEngine6NoCanonicalSlugCollisions,
  assertEngine6RequestedPathMatchesResolvedTour,
} from "./routeIntegrity";
import { ENGINE6_CONFIGURED_PRODUCT_CODES } from "./routes";

const toEngine6FixturePayload = (
  fixture: (typeof ENGINE6_VALIDATION_FIXTURES)[number]
): Engine6ApiResponse => {
  assertEngine6FixtureSourceOfTruth(fixture);
  const extraction = extractEngine6Product(fixture.rawPayload, {
    payloadSource: "bundled-exact-product-fixture",
  });

  return {
    source: "bundled-fallback",
    rawProductCode: fixture.productCode,
    rawProduct: extraction.product,
    diagnostics: {
      source: "bundled-fallback",
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: "application/json fixture",
      upstreamOk: null,
      usedBundledFallbackBecause: "engine6-validation-fixture",
      ...extraction.diagnostics,
      bookingUrlSource:
        extraction.diagnostics.productUrlFieldPath ??
        "generated:viator-search-product-code",
      fieldLevelFallbackUsed: false,
      fallbackFieldNames: [],
    },
    extracted: extraction.extracted,
  };
};

const hasStrictExactProductHero = (tour: Engine6Tour) =>
  Boolean(tour.heroImageUrl?.trim()) &&
  Boolean(tour.diagnostics.heroSourceProductCode?.trim()) &&
  Boolean(tour.diagnostics.heroSourceProductUrl?.trim()) &&
  Boolean(tour.diagnostics.heroSourceFieldPath?.trim()) &&
  Boolean(tour.diagnostics.heroHost?.trim()) &&
  tour.diagnostics.heroSourceFieldPath?.startsWith("product.media.images");

const fixtureByProductCode = new Map(
  ENGINE6_VALIDATION_FIXTURES.map(fixture => [fixture.productCode, fixture])
);

const missingFixtureProductCodes = ENGINE6_CONFIGURED_PRODUCT_CODES.filter(
  productCode => !fixtureByProductCode.has(productCode)
);

if (missingFixtureProductCodes.length > 0) {
  throw new Error(
    `Engine6 exact-product fixture missing for configured products: ${missingFixtureProductCodes.join(
      ", "
    )}`
  );
}

const configuredFixtures = ENGINE6_CONFIGURED_PRODUCT_CODES.map(productCode => {
  const fixture = fixtureByProductCode.get(productCode);
  if (!fixture) {
    throw new Error(
      `Engine6 fixture lookup failed unexpectedly for ${productCode}`
    );
  }
  return fixture;
});

const tryResolveTour = (
  fixture: (typeof ENGINE6_VALIDATION_FIXTURES)[number]
) => {
  try {
    return mapViatorToEngine6Tour(toEngine6FixturePayload(fixture));
  } catch {
    return null;
  }
};

const resolvedTours: Engine6Tour[] = configuredFixtures
  .map(tryResolveTour)
  .filter((tour): tour is Engine6Tour => Boolean(tour))
  .filter(hasStrictExactProductHero);

assertEngine6CollisionPolicy(resolvedTours);
assertEngine6ReplacementModePolicy(resolvedTours);
assertEngine6NoCanonicalSlugCollisions(resolvedTours);

export const engine6ResolvedTours: Engine6Tour[] = resolvedTours;

export const getEngine6NativeTourBySlugs = (
  stateSlug: string,
  citySlug: string,
  tourSlug: string
) =>
  getEngine6NativeTourByCanonicalPath(
    `/destinations/${stateSlug}/${citySlug}/tours/${tourSlug}`
  );


export const getEngine6NativeTourByCanonicalPath = (requestedPath: string) => {
  const matchedTour = engine6ResolvedTours.find(
    tour => tour.canonicalPath === requestedPath
  );

  if (!matchedTour) {
    return null;
  }

  assertEngine6RequestedPathMatchesResolvedTour({
    requestedPath,
    resolvedTour: matchedTour,
  });

  return matchedTour;
};
