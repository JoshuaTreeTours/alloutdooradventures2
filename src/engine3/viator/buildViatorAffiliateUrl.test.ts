import { describe, expect, it } from "vitest";

import { buildViatorAffiliateUrl } from "./buildViatorAffiliateUrl";

describe("buildViatorAffiliateUrl", () => {
  it("adds affiliate params when no query string exists", () => {
    const url = buildViatorAffiliateUrl(
      "https://www.viator.com/tours/Palm-Springs/San-Andreas/d648-2335P1"
    );

    expect(url).toBe("https://www.viator.com/d648-2335P1?pid=P00290915&mcid=42383&medium=link");
  });

  it("preserves existing query params and appends affiliate params", () => {
    const url = buildViatorAffiliateUrl(
      "https://www.viator.com/tours/Palm-Springs/San-Andreas/d648-2335P1?foo=bar"
    );

    expect(url).toBe("https://www.viator.com/d648-2335P1?foo=bar&pid=P00290915&mcid=42383&medium=link");
  });

  it("overrides conflicting affiliate params without duplicating", () => {
    const url = buildViatorAffiliateUrl(
      "https://www.viator.com/tours/Palm-Springs/San-Andreas/d648-2335P1?pid=old&mcid=1&medium=email"
    );

    expect(url).toBe("https://www.viator.com/d648-2335P1?pid=P00290915&mcid=42383&medium=link");
  });

  it("converts travelagents hostname to www.viator.com", () => {
    const url = buildViatorAffiliateUrl(
      "https://travelagents.viator.com/tours/Palm-Springs/San-Andreas/d648-2335P1"
    );

    expect(url).toBe("https://www.viator.com/d648-2335P1?pid=P00290915&mcid=42383&medium=link");
  });

  it("returns null for invalid URL input", () => {
    expect(buildViatorAffiliateUrl("not a url")).toBeNull();
    expect(buildViatorAffiliateUrl("" as string)).toBeNull();
  });
});
