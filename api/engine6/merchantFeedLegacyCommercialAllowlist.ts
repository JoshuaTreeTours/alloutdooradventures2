import {
  passesMerchantFeedLiveCommercialGuard,
  type Engine6ViatorProductCommercialDiagnostic,
} from "./resolveEngine6ViatorProductCommercialExtract.js";

/**
 * TODO(legacy-grandfather): Emergency production unblock for four pre-existing Merchant
 * Feed products that still resolve bundled-fallback during Vercel live-commercial validation.
 * Remove each code once it reliably resolves as live-api in production. Do not add new
 * products here — this is not a policy change and must not weaken general governance.
 */
export const MERCHANT_FEED_LEGACY_BUNDLED_FALLBACK_ALLOWLIST = [
  "191303P1",
  "5559561P1",
  "44152P18",
  "5396BOEING",
] as const;

const LEGACY_ALLOWLIST_SET = new Set<string>(
  MERCHANT_FEED_LEGACY_BUNDLED_FALLBACK_ALLOWLIST.map(code => code.toUpperCase())
);

export const isMerchantFeedLegacyBundledFallbackGrandfathered = (
  productCode?: string | null
): boolean =>
  Boolean(productCode) &&
  LEGACY_ALLOWLIST_SET.has(productCode!.trim().toUpperCase());

/**
 * Production merchant-feed build guard. Applies strict live-commercial rules first, then
 * allows a narrow bundled-fallback exemption only for {@link MERCHANT_FEED_LEGACY_BUNDLED_FALLBACK_ALLOWLIST}.
 */
export const passesMerchantFeedLiveCommercialGuardForBuild = (
  diagnostic: Engine6ViatorProductCommercialDiagnostic
): { pass: boolean; reason?: string } => {
  const strict = passesMerchantFeedLiveCommercialGuard(diagnostic);
  if (strict.pass) {
    return strict;
  }

  if (!isMerchantFeedLegacyBundledFallbackGrandfathered(diagnostic.productCode)) {
    return strict;
  }

  if (diagnostic.commercial.source !== "bundled-fallback") {
    return strict;
  }

  if (!diagnostic.pricingAvailable) {
    return {
      pass: false,
      reason: `legacy grandfather requires existing commercial price (price=${diagnostic.commercial.priceAmount ?? "null"})`,
    };
  }

  if (
    diagnostic.ratingMetadataPresent &&
    (!diagnostic.ratingAvailable || !diagnostic.reviewCountAvailable)
  ) {
    return strict;
  }

  return {
    pass: true,
    reason:
      "legacy-grandfather-bundled-fallback (TODO: remove after live-api resolution verified in production)",
  };
};
