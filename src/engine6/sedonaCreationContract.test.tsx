import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import type { Engine6ApiResponse } from "./types";
import { validateEngine6CreationContract } from "./creationValidation";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";
import { SEDONA_VIATOR_PUBLIC_PRODUCT_CODES } from "./sedonaViatorPublicRatings";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const SEDONA_CREATION_CONTRACT_ALLOWED_WARNINGS: Record<string, RegExp[]> = {
  "115255P2": [
    /overview governance validation failed: named location "Colorado Plateau" from source material is missing from overview/,
  ],
};

const sedonaFixtures = ENGINE6_VALIDATION_FIXTURES.filter(fixture =>
  SEDONA_VIATOR_PUBLIC_PRODUCT_CODES.includes(fixture.productCode)
);

const toPayload = (
  fixture: (typeof ENGINE6_VALIDATION_FIXTURES)[number]
): Engine6ApiResponse => {
  const extraction = extractEngine6Product(fixture.rawPayload);

  return {
    source: "live-api",
    rawProductCode: fixture.productCode,
    rawProduct: extraction.product,
    diagnostics: {
      source: "live-api",
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: "text/html fixture derived from public viator page",
      upstreamOk: null,
      usedBundledFallbackBecause: "validation-fixture-from-public-page",
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

describe("Sedona Engine6 creation contract", () => {
  it.each(sedonaFixtures)(
    "validates hardened contract for %s",
    fixture => {
      const payload = toPayload(fixture);
      const tour = mapViatorToEngine6Tour(payload);
      const report = validateEngine6CreationContract({
        tour,
        rawPayload: fixture.rawPayload,
        fixture,
      });

      const allowedWarnings =
        SEDONA_CREATION_CONTRACT_ALLOWED_WARNINGS[fixture.productCode] ?? [];
      const blockingViolations = report.violations.filter(
        violation =>
          !allowedWarnings.some(pattern => pattern.test(violation))
      );

      expect(blockingViolations).toEqual([]);
    }
  );
});
