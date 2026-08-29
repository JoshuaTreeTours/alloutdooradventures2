import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import type { Engine6ApiResponse } from "./types";
import { validateEngine6CreationContract } from "./creationValidation";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";
import { PUERTO_VALLARTA_VIATOR_PUBLIC_PRODUCT_CODES } from "./puertoVallartaViatorPublicRatings";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const puertoVallartaFixtures = ENGINE6_VALIDATION_FIXTURES.filter(fixture =>
  PUERTO_VALLARTA_VIATOR_PUBLIC_PRODUCT_CODES.includes(
    fixture.productCode
  )
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
    },
    extracted: extraction.extracted,
  };
};

describe("Puerto Vallarta Engine6 creation contract", () => {
  it("covers every selected Puerto Vallarta product code", () => {
    expect(puertoVallartaFixtures.map(fixture => fixture.productCode).sort()).toEqual(
      [...PUERTO_VALLARTA_VIATOR_PUBLIC_PRODUCT_CODES].sort()
    );
  });

  it.each(puertoVallartaFixtures)("validates hardened contract for %s", fixture => {
    const payload = toPayload(fixture);
    const tour = mapViatorToEngine6Tour(payload);
    const report = validateEngine6CreationContract({
      tour,
      rawPayload: fixture.rawPayload,
      fixture,
    });

    expect(report.violations).toEqual([]);
  });
});
