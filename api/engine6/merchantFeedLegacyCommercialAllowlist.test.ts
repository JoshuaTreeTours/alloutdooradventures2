import { describe, expect, it } from "vitest";

import {
  MERCHANT_FEED_LEGACY_BUNDLED_FALLBACK_ALLOWLIST,
  isMerchantFeedLegacyBundledFallbackGrandfathered,
  passesMerchantFeedLiveCommercialGuardForBuild,
} from "./merchantFeedLegacyCommercialAllowlist";
import {
  passesMerchantFeedLiveCommercialGuard,
  type Engine6ViatorProductCommercialDiagnostic,
} from "./resolveEngine6ViatorProductCommercialExtract";

const bundledFallbackDiagnostic = (
  productCode: string,
  overrides: Partial<Engine6ViatorProductCommercialDiagnostic> = {}
): Engine6ViatorProductCommercialDiagnostic => ({
  productCode,
  commercial: {
    priceAmount: 89,
    priceFormatted: "From $89.00",
    aggregateRating: 5,
    reviewCount: 54,
    source: "bundled-fallback",
  },
  hasViatorApiKey: true,
  attemptedLiveFetch: true,
  upstreamStatus: 200,
  upstreamOk: true,
  failureReason: "live-price-missing-or-zero",
  pricingAvailable: true,
  ratingAvailable: true,
  reviewCountAvailable: true,
  ratingMetadataPresent: true,
  ...overrides,
});

describe("merchant feed legacy bundled-fallback allowlist", () => {
  it("contains exactly the four known production blockers", () => {
    expect([...MERCHANT_FEED_LEGACY_BUNDLED_FALLBACK_ALLOWLIST]).toEqual([
      "191303P1",
      "5559561P1",
      "44152P18",
      "5396BOEING",
    ]);
  });

  it.each(MERCHANT_FEED_LEGACY_BUNDLED_FALLBACK_ALLOWLIST)(
    "grandfathers bundled-fallback build blocker for %s only",
    productCode => {
      const diagnostic = bundledFallbackDiagnostic(productCode);
      const strict = passesMerchantFeedLiveCommercialGuard(diagnostic);
      const build = passesMerchantFeedLiveCommercialGuardForBuild(diagnostic);

      expect(strict.pass).toBe(false);
      expect(build.pass).toBe(true);
      expect(build.reason).toContain("legacy-grandfather-bundled-fallback");
    }
  );

  it("does not grandfather non-allowlisted bundled-fallback products", () => {
    const diagnostic = bundledFallbackDiagnostic("99999P1");
    const build = passesMerchantFeedLiveCommercialGuardForBuild(diagnostic);

    expect(build.pass).toBe(false);
    expect(build.reason).toContain("bundled commercial fallback forbidden");
  });

  it("does not grandfather allowlisted products without commercial price", () => {
    const build = passesMerchantFeedLiveCommercialGuardForBuild(
      bundledFallbackDiagnostic("191303P1", {
        commercial: {
          priceAmount: null,
          priceFormatted: null,
          aggregateRating: 5,
          reviewCount: 54,
          source: "bundled-fallback",
        },
        pricingAvailable: false,
      })
    );

    expect(build.pass).toBe(false);
    expect(build.reason).toContain("legacy grandfather requires existing commercial price");
  });

  it("does not grandfather allowlisted products with incomplete rating extraction", () => {
    const build = passesMerchantFeedLiveCommercialGuardForBuild(
      bundledFallbackDiagnostic("191303P1", {
        failureReason: "live-rating-extraction-failed",
        ratingAvailable: false,
      })
    );

    expect(build.pass).toBe(false);
  });

  it("rejects unknown product codes for legacy grandfather lookup", () => {
    expect(isMerchantFeedLegacyBundledFallbackGrandfathered("5765P7")).toBe(false);
    expect(isMerchantFeedLegacyBundledFallbackGrandfathered("NEWTOUR1")).toBe(
      false
    );
  });
});
