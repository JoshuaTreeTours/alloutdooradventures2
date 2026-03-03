import { describe, expect, it } from "vitest";

import { withViatorAffiliateParams } from "./viatorAffiliate";

describe("withViatorAffiliateParams", () => {
  it("forces canonical Viator path and preserves existing query params", () => {
    const output = withViatorAffiliateParams(
      "https://www.viator.com/tours/Palm-Springs/San-Andreas/d648-2335P1?foo=bar"
    );

    expect(output).toBe(
      "https://www.viator.com/d648-2335P1?foo=bar&pid=P00290915&mcid=42383&medium=link"
    );
  });

  it("returns the original URL for non-Viator hosts", () => {
    const input = "https://example.com/d648-2335P1?foo=bar";

    expect(withViatorAffiliateParams(input)).toBe(input);
  });
});
