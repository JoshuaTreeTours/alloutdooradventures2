import { describe, expect, it } from "vitest";

import { buildViatorAffiliateUrl } from "./viatorLinks";

describe("buildViatorAffiliateUrl", () => {
  it("prefers canonical baseUrl when available", () => {
    const url = buildViatorAffiliateUrl({
      baseUrl:
        "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Backroads-Hummer-H2-Tour/d648-6740P7",
      fallbackUrl: "https://www.viator.com/tours/Palm-Springs/example",
      productCode: "6740P7",
    });

    expect(url).toBe(
      "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Backroads-Hummer-H2-Tour/d648-6740P7?pid=P00290915&mcid=42383&medium=link"
    );
  });

  it("normalizes broken fallback URLs to canonical /d segment", () => {
    const url = buildViatorAffiliateUrl({
      baseUrl:
        "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Backroads-Hummer-H2-Tour",
      fallbackUrl: "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Backroads-Hummer-H2-Tour",
      productCode: "6740P7",
    });

    expect(url).toBe(
      "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Backroads-Hummer-H2-Tour/d648-6740P7?pid=P00290915&mcid=42383&medium=link"
    );
  });

  it("returns null when no URL candidate exists", () => {
    expect(
      buildViatorAffiliateUrl({ baseUrl: null, fallbackUrl: undefined })
    ).toBeNull();
  });
});
