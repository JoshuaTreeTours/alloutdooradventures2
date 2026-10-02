import { describe, expect, it } from "vitest";

import {
  canonicalMerchantPriceLabel,
  formatMerchantPrice,
} from "./merchantPricing";

describe("canonicalMerchantPriceLabel", () => {
  it("treats dropped trailing zeros as the same merchant price label", () => {
    expect(canonicalMerchantPriceLabel("189.5 USD")).toBe("189.50 USD");
    expect(canonicalMerchantPriceLabel("189.50 USD")).toBe(
      formatMerchantPrice(189.5, "USD")
    );
    expect(canonicalMerchantPriceLabel("99 USD")).toBe("99 USD");
    expect(canonicalMerchantPriceLabel("99.00 USD")).toBe("99 USD");
  });
});
