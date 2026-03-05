import { describe, expect, it } from "vitest";

import { buildViatorAffiliateUrl } from "./buildViatorAffiliateUrl";

describe("buildViatorAffiliateUrl", () => {
  it("adds required affiliate attribution params", () => {
    const url = new URL(buildViatorAffiliateUrl("172188P151"));

    expect(url.searchParams.get("pid")).toBe("P00290915");
    expect(url.searchParams.get("mcid")).toBe("42383");
    expect(url.searchParams.get("medium")).toBe("link");
    expect(url.pathname).toContain("172188P151");
  });

  it("normalizes existing viator query params", () => {
    const url = new URL(buildViatorAffiliateUrl("74828P3"));

    expect(url.searchParams.get("pid")).toBe("P00290915");
    expect(url.searchParams.get("mcid")).toBe("42383");
    expect(url.searchParams.get("medium")).toBe("link");
  });
});
