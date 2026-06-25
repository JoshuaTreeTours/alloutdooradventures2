import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "./viatorExtractors";
import {
  detectLiveViatorProductRatingMetadata,
  passesMerchantFeedLiveCommercialGuard,
  resolveEngine6ViatorProductCommercialExtract,
  type Engine6ViatorProductCommercialDiagnostic,
} from "./resolveEngine6ViatorProductCommercialExtract";

describe("resolveEngine6ViatorProductCommercialExtract", () => {
  it("reads bundled Santa Barbara trolley commercial fields when no API key is configured", async () => {
    const previousApiKey = process.env.VIATOR_API_KEY;
    const previousEngine6ApiKey = process.env.ENGINE6_VIATOR_API_KEY;
    const previousPartnerApiKey = process.env.VIATOR_PARTNER_API_KEY;

    delete process.env.VIATOR_API_KEY;
    delete process.env.ENGINE6_VIATOR_API_KEY;
    delete process.env.VIATOR_PARTNER_API_KEY;

    try {
      const commercial =
        await resolveEngine6ViatorProductCommercialExtract("163975P1");

      expect(commercial.source).toBe("bundled-fallback");
      expect(commercial.priceAmount).toBe(37);
      expect(commercial.aggregateRating).toBe(4.6);
      expect(commercial.reviewCount).toBe(853);
    } finally {
      if (previousApiKey === undefined) {
        delete process.env.VIATOR_API_KEY;
      } else {
        process.env.VIATOR_API_KEY = previousApiKey;
      }
      if (previousEngine6ApiKey === undefined) {
        delete process.env.ENGINE6_VIATOR_API_KEY;
      } else {
        process.env.ENGINE6_VIATOR_API_KEY = previousEngine6ApiKey;
      }
      if (previousPartnerApiKey === undefined) {
        delete process.env.VIATOR_PARTNER_API_KEY;
      } else {
        process.env.VIATOR_PARTNER_API_KEY = previousPartnerApiKey;
      }
    }
  });

  it("matches bundled fixture extraction for 163975P1 commercial fields", () => {
    const payloadPath = path.join(
      process.cwd(),
      "data/engine6/viator/163975P1.exact-product.json"
    );
    const payload = JSON.parse(readFileSync(payloadPath, "utf8")) as Record<
      string,
      unknown
    >;
    const extracted = extractEngine6Product(payload).extracted;

    expect(extracted.priceAmount).toBe(37);
    expect(extracted.reviewCount).toBe(853);
    expect(extracted.aggregateRating).toBe(4.6);
  });
});

describe("merchant feed live commercial guard", () => {
  const unratedSuccess = (
    overrides: Partial<Engine6ViatorProductCommercialDiagnostic> = {}
  ): Engine6ViatorProductCommercialDiagnostic => ({
    productCode: "447486P2",
    commercial: {
      priceAmount: 45,
      priceFormatted: "From $45.00",
      aggregateRating: null,
      reviewCount: null,
      source: "live-api",
    },
    hasViatorApiKey: true,
    attemptedLiveFetch: true,
    upstreamStatus: 200,
    upstreamOk: true,
    failureReason: "live-api-success",
    pricingAvailable: true,
    ratingAvailable: false,
    reviewCountAvailable: false,
    ratingMetadataPresent: false,
    ...overrides,
  });

  it("passes when live price resolves and Viator provides no rating metadata", () => {
    expect(passesMerchantFeedLiveCommercialGuard(unratedSuccess()).pass).toBe(
      true
    );
  });

  it("fails when bundled commercial fallback is used", () => {
    const result = passesMerchantFeedLiveCommercialGuard(
      unratedSuccess({
        commercial: {
          priceAmount: 45,
          priceFormatted: "From $45.00",
          aggregateRating: 5,
          reviewCount: 54,
          source: "bundled-fallback",
        },
        failureReason: "live-price-missing-or-zero",
      })
    );

    expect(result.pass).toBe(false);
    expect(result.reason).toContain("bundled commercial fallback forbidden");
  });

  it("fails when live rating metadata exists but extraction is incomplete", () => {
    const result = passesMerchantFeedLiveCommercialGuard(
      unratedSuccess({
        failureReason: "live-rating-extraction-failed",
        ratingMetadataPresent: true,
      })
    );

    expect(result.pass).toBe(false);
  });

  it("detects absent rating metadata when Viator only reports totalReviews zero", () => {
    expect(
      detectLiveViatorProductRatingMetadata({
        productCode: "447486P2",
        reviews: { totalReviews: 0 },
      })
    ).toBe(false);
  });

  it("detects rating metadata when combinedAverageRating is present", () => {
    expect(
      detectLiveViatorProductRatingMetadata({
        productCode: "191303P1",
        reviews: { combinedAverageRating: 5, totalReviews: 54 },
      })
    ).toBe(true);
  });
});
