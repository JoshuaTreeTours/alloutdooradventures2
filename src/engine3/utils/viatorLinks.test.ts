import { describe, expect, it } from "vitest";

import { buildViatorAffiliateUrl } from "./viatorLinks";

describe("buildViatorAffiliateUrl", () => {
  it("prefers canonical baseUrl when available", () => {
    const url = buildViatorAffiliateUrl({
      baseUrl:
        "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Hummer-Adventure-from-Palm-Desert/d648-6740JTREE",
      fallbackUrl: "https://www.viator.com/tours/Palm-Springs/example",
    });

    expect(url).toBe(
      "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Hummer-Adventure-from-Palm-Desert/d648-6740JTREE?pid=P00290915&mcid=42383&medium=link"
    );
  });

  it("uses canonical fallbackUrl when baseUrl is not canonical", () => {
    const url = buildViatorAffiliateUrl({
      baseUrl: "https://www.viator.com/tours/Palm-Springs/example",
      fallbackUrl:
        "https://www.viator.com/tours/Palm-Springs/San-Andreas/d648-2335P1?foo=bar",
    });

    expect(url).toBe(
      "https://www.viator.com/tours/Palm-Springs/San-Andreas/d648-2335P1?foo=bar&pid=P00290915&mcid=42383&medium=link"
    );
  });

  it("returns null when no URL candidate exists", () => {
    expect(buildViatorAffiliateUrl({ baseUrl: null, fallbackUrl: undefined })).toBeNull();
  });
});
