import { describe, expect, it } from "vitest";

import {
  buildCategoryH1,
  buildCategorySeoTitle,
  buildGuideH1,
  buildGuideSeoTitle,
  buildProductSeoTitle,
  buildToursH1,
  buildToursSeoTitle,
} from "./titleBuilder";

describe("titleBuilder", () => {
  it("builds guide and tours titles", () => {
    expect(buildGuideSeoTitle({ city: "San Diego" })).toBe(
      "Top 10 Things to Do in San Diego (2026 Guide) | Outdoor Adventures"
    );
    expect(buildGuideH1({ city: "San Diego" })).toBe(
      "Top 10 Things to Do in San Diego"
    );
    expect(buildToursSeoTitle({ city: "San Diego" })).toBe(
      "Best Tours in San Diego | Outdoor Adventures"
    );
    expect(buildToursH1({ city: "San Diego" })).toBe(
      "Best Tours in San Diego"
    );
  });

  it("builds category and product titles", () => {
    expect(buildCategorySeoTitle({ city: "Aspen", activity: "Hiking" })).toBe(
      "Hiking Tours in Aspen | Outdoor Adventures"
    );
    expect(buildCategoryH1({ city: "Aspen", activity: "Hiking" })).toBe(
      "Hiking Tours in Aspen"
    );
    expect(
      buildProductSeoTitle({
        city: "Palm Springs",
        productName: "Joshua Tree Backroads Hummer Tour",
      })
    ).toBe(
      "Joshua Tree Backroads Hummer Tour in Palm Springs | Outdoor Adventures"
    );
  });
});
