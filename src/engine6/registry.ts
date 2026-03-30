import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import type { Engine6ApiResponse, Engine6Tour } from "./types";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";
import {
  assertEngine6CollisionPolicy,
  assertEngine6ReplacementModePolicy,
} from "./collisionGuard";

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

const resolvedTours: Engine6Tour[] = ENGINE6_VALIDATION_FIXTURES.map(
  toEngine6FixturePayload
).map(mapViatorToEngine6Tour);

assertEngine6CollisionPolicy(resolvedTours);
assertEngine6ReplacementModePolicy(resolvedTours);

export const engine6ResolvedTours: Engine6Tour[] = resolvedTours;
