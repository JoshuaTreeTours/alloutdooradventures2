import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
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

const toEngine6FixturePayload = (
  fixture: (typeof ENGINE6_VALIDATION_FIXTURES)[number]
): Engine6ApiResponse => {
  const extraction = extractEngine6Product(fixture.rawPayload);

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

const tryMapFixtureToTour = (
  fixture: (typeof ENGINE6_VALIDATION_FIXTURES)[number]
) => {
  try {
    return mapViatorToEngine6Tour(toEngine6FixturePayload(fixture));
  } catch {
    return null;
  }
};

const collectFixtureMediaUrls = (payload: Record<string, unknown>) => {
  const product =
    payload && typeof payload.product === "object" && payload.product !== null
      ? (payload.product as Record<string, unknown>)
      : payload;
  const media =
    product && typeof product.media === "object" && product.media !== null
      ? (product.media as Record<string, unknown>)
      : null;
  const images = Array.isArray(media?.images) ? media.images : [];
  const urls = new Set<string>();

  for (const image of images) {
    if (!image || typeof image !== "object") continue;
    const record = image as Record<string, unknown>;
    const directUrl = typeof record.url === "string" ? record.url : null;
    if (directUrl) urls.add(directUrl);
    const variants = record.variants;
    if (Array.isArray(variants)) {
      for (const variant of variants) {
        if (
          variant &&
          typeof variant === "object" &&
          typeof (variant as Record<string, unknown>).url === "string"
        ) {
          urls.add((variant as Record<string, unknown>).url as string);
        }
      }
    } else if (variants && typeof variants === "object") {
      for (const variant of Object.values(variants)) {
        if (
          variant &&
          typeof variant === "object" &&
          typeof (variant as Record<string, unknown>).url === "string"
        ) {
          urls.add((variant as Record<string, unknown>).url as string);
        }
      }
    }
  }

  return urls;
};

const resolvedTours: Engine6Tour[] = ENGINE6_VALIDATION_FIXTURES.map(
  tryMapFixtureToTour
)
  .filter((tour): tour is Engine6Tour => Boolean(tour))
  .filter(hasStrictExactProductHero);

const fixtureMediaUrlsByProductCode = new Map(
  ENGINE6_VALIDATION_FIXTURES.map(fixture => [
    fixture.productCode,
    collectFixtureMediaUrls(fixture.rawPayload),
  ])
);
for (const tour of resolvedTours) {
  if (tour.productCode !== "89173P10" || !tour.heroImageUrl) {
    continue;
  }
  for (const [
    productCode,
    mediaUrls,
  ] of fixtureMediaUrlsByProductCode.entries()) {
    if (productCode === tour.productCode) {
      continue;
    }
    if (mediaUrls.has(tour.heroImageUrl)) {
      throw new Error(
        `Engine6 strict hero isolation violation for ${tour.productCode}: hero URL is present in foreign payload ${productCode}`
      );
    }
  }
}

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
