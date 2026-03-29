import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import type { Engine6ApiResponse } from "./types";
import { validateEngine6CreationContract } from "./creationValidation";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

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

describe("engine6 creation contract validator", () => {
  it.each(ENGINE6_VALIDATION_FIXTURES)(
    "validates hardened contract for %s",
    fixture => {
      const payload = toPayload(fixture);
      const tour = mapViatorToEngine6Tour(payload);
      const report = validateEngine6CreationContract({
        tour,
        rawPayload: fixture.rawPayload,
      });

      expect(report.violations).toEqual([]);
    }
  );

  it("fails loudly when hero/card parity drifts", () => {
    const payload = toPayload(ENGINE6_VALIDATION_FIXTURES[0]!);
    const tour = mapViatorToEngine6Tour(payload);
    const report = validateEngine6CreationContract({
      tour: { ...tour, heroImageUrl: "https://cdn.example.com/different.jpg" },
      rawPayload: ENGINE6_VALIDATION_FIXTURES[0]!.rawPayload,
    });

    expect(report.violations).toEqual(
      expect.arrayContaining([
        "resolved Engine6 hero is not used as winning hero",
        "unified listing hero differs from detail hero",
      ])
    );
  });

  it("fails loudly when Offer.url and route ownership drift", () => {
    const payload = toPayload(ENGINE6_VALIDATION_FIXTURES[1]!);
    const tour = mapViatorToEngine6Tour(payload);
    const report = validateEngine6CreationContract({
      tour: {
        ...tour,
        bookingUrl: "https://www.viator.com/search/invalid",
        canonicalPath: "/destinations/nevada/las-vegas/tours/changed-slug",
      },
      rawPayload: ENGINE6_VALIDATION_FIXTURES[1]!.rawPayload,
    });

    expect(report.violations).toEqual(
      expect.arrayContaining([
        "route ownership drifted from product-code contract",
        "booking CTA lost required Viator monetization parameters",
        "schema Offer.url drifted from resolved booking target",
        "unified listing href differs from canonical path",
      ])
    );
  });
});
