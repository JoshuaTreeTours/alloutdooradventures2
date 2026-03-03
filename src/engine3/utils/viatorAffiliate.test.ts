import { describe, expect, it } from "vitest";

import { withViatorAffiliateParams } from "./viatorAffiliate";

describe("withViatorAffiliateParams", () => {
  it("adds required affiliate params", () => {
    const url = withViatorAffiliateParams(
      "https://www.viator.com/tours/Palm-Springs/Example/d648-6740JTREE"
    );

    expect(url).toContain("pid=P00290915");
    expect(url).toContain("mcid=42383");
    expect(url).toContain("medium=link");
  });

  it("replaces incorrect affiliate params", () => {
    const url = withViatorAffiliateParams(
      "https://www.viator.com/tours/Palm-Springs/Example/d648-6740JTREE?pid=wrong&mcid=1&medium=email"
    );

    expect(url).toBe(
      "https://www.viator.com/tours/Palm-Springs/Example/d648-6740JTREE?pid=P00290915&mcid=42383&medium=link"
    );
  });
});
