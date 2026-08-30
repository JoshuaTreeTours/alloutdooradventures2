import { describe, expect, it } from "vitest";

import {
  isUsdCommercialSource,
  looksLikeCurrencyMismatch,
  resolveEngine6ListingPriceFields,
  shouldApplyLivePriceAsUsd,
} from "./priceCurrency";

describe("Engine6 commercial USD currency guard", () => {
  it("never treats a JPY source amount as USD", () => {
    expect(
      isUsdCommercialSource({
        priceCurrency: "JPY",
        priceFormatted: "From ¥16,500.00",
      })
    ).toBe(false);
    expect(
      shouldApplyLivePriceAsUsd({
        priceAmount: 16500,
        priceCurrency: "JPY",
        priceFormatted: "From ¥16,500.00",
      })
    ).toBe(false);
    expect(
      resolveEngine6ListingPriceFields({
        priceAmount: 16500,
        priceFormatted: "From $16,500.00",
        priceCurrency: "JPY",
      })
    ).toEqual({
      startingPrice: undefined,
      currency: undefined,
      priceFrom: undefined,
    });
  });

  it("keeps USD merchant-feed commercial amounts as USD", () => {
    expect(
      resolveEngine6ListingPriceFields({
        priceAmount: 106.77,
        priceFormatted: "From $106.77",
        priceCurrency: "USD",
      })
    ).toEqual({
      startingPrice: 106.77,
      currency: "USD",
      priceFrom: "From $106.77",
    });
  });

  it("detects a local-currency live amount overwriting a USD commercial price", () => {
    expect(looksLikeCurrencyMismatch(106.77, 16500)).toBe(true);
    expect(looksLikeCurrencyMismatch(129, 156.75)).toBe(false);
  });
});
