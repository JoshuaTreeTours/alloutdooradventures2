import { describe, expect, it, vi } from "vitest";

import { extractEngine6Product } from "./viatorExtractors";

describe("Engine6 pricing integrity", () => {
  it("extracts pricingInfo.price and avoids fallback price label", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "PRICE_INFO_1",
        title: "Zurich Lindt tour",
        pricingInfo: {
          price: 241.82,
        },
      },
    });

    expect(result.extracted.priceAmount).toBe(241.82);
    expect(result.extracted.priceFormatted).toBe("From $241.82");
    expect(result.extracted.priceFormatted).not.toBe("Check latest price");
    expect(result.diagnostics.priceIntegrityViolation).toBe(false);
  });

  it("extracts pricing.summary.fromPrice with primary precedence", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "PRIMARY_1",
        title: "Mount Titlis Day Tour",
        pricing: {
          summary: {
            fromPrice: 523.92,
          },
        },
      },
    });

    expect(result.extracted.priceAmount).toBe(523.92);
    expect(result.extracted.priceFormatted).toBe("From $523.92");
    expect(result.diagnostics.commercialPriceFieldPath).toBe(
      "product.pricing.summary.fromPrice"
    );
  });

  it("keeps null pricing when no valid numeric price exists", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "NO_PRICE_1",
        title: "No price tour",
        pricingInfo: {
          price: "Contact us",
        },
      },
    });

    expect(result.extracted.priceAmount).toBeNull();
    expect(result.extracted.priceFormatted).toBeNull();
    expect(result.diagnostics.hasAnyViablePriceCandidate).toBe(false);
  });

  it("flags diagnostics when viable price exists but extraction misses it", () => {
    let reads = 0;
    const pricingInfo: Record<string, unknown> = {};
    Object.defineProperty(pricingInfo, "price", {
      enumerable: true,
      get() {
        reads += 1;
        return reads === 1 ? 241.82 : null;
      },
    });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = extractEngine6Product({
      product: {
        productCode: "FAIL_CASE_1",
        title: "Fail case",
        pricingInfo,
      },
    });

    expect(result.extracted.priceAmount).toBeNull();
    expect(result.diagnostics.hasAnyViablePriceCandidate).toBe(true);
    expect(result.diagnostics.priceIntegrityViolation).toBe(true);
    expect(result.diagnostics.extractionFailure).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(
      "Engine6 pricing integrity violation: viable price exists but not extracted",
      expect.objectContaining({
        productCode: "FAIL_CASE_1",
        detectedFields: ["product.pricingInfo.price"],
      })
    );

    warnSpy.mockRestore();
  });
});
