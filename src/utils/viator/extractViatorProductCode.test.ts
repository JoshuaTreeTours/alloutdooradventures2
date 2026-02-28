import { describe, expect, it } from "vitest";

import { extractViatorProductCode } from "./extractViatorProductCode";

describe("extractViatorProductCode", () => {
  it("extracts product code from Viator affiliate URL", () => {
    expect(
      extractViatorProductCode(
        "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Hummer-Adventure/d648-6740JTREE"
      )
    ).toBe("6740JTREE");
  });

  it("normalizes lowercase code to uppercase", () => {
    expect(
      extractViatorProductCode(
        "https://www.viator.com/tours/Example/d648-2335p1"
      )
    ).toBe("2335P1");
  });

  it("returns null for missing or invalid code", () => {
    expect(extractViatorProductCode(undefined)).toBeNull();
    expect(extractViatorProductCode("not-a-url")).toBeNull();
    expect(
      extractViatorProductCode("https://www.viator.com/tours/Palm-Springs/d648-")
    ).toBeNull();
    expect(
      extractViatorProductCode(
        "https://www.viator.com/tours/Palm-Springs/d648-jtree"
      )
    ).toBeNull();
  });
});
