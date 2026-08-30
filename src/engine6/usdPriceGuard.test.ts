import { describe, expect, it } from "vitest";

import {
  preferUsdCommercialPrice,
  shouldAcceptLiveAmountAsUsd,
} from "./usdPriceGuard";

describe("shouldAcceptLiveAmountAsUsd", () => {
  it("rejects yen-scale live amounts against a USD From$ reference", () => {
    expect(shouldAcceptLiveAmountAsUsd(16500, 156.6)).toBe(false);
    expect(shouldAcceptLiveAmountAsUsd(51500, 659.84)).toBe(false);
  });

  it("accepts ordinary USD live amounts", () => {
    expect(shouldAcceptLiveAmountAsUsd(156.75, 129)).toBe(true);
    expect(shouldAcceptLiveAmountAsUsd(160, 156.6)).toBe(true);
  });
});

describe("preferUsdCommercialPrice", () => {
  it("keeps the bundled USD From$ when live is supplier currency", () => {
    expect(
      preferUsdCommercialPrice(
        { priceAmount: 16500, priceFormatted: "From $16500.00" },
        { priceAmount: 156.6, priceFormatted: "From $156.60" }
      )
    ).toEqual({
      priceAmount: 156.6,
      priceFormatted: "From $156.60",
    });
  });
});
