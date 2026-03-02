import { describe, expect, it } from "vitest";

import { loadViatorCache, parsePriceFrom } from "./viatorCache";

describe("viatorCache", () => {
  it("loads existing 2335P1 cache file", () => {
    const cache = loadViatorCache("2335P1");
    expect(cache?.data.productCode).toBe("2335P1");
  });

  it("parses currency + amount from priceFrom", () => {
    expect(parsePriceFrom("USD 1,234.50")).toEqual({
      currency: "USD",
      amount: 1234.5,
    });
    expect(parsePriceFrom("bad value")).toEqual({});
  });
});
