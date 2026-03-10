import { describe, expect, it } from "vitest";

import {
  buildCityGuideDisplayTitle,
  buildCityGuideH1,
  buildCityGuideIntroParagraphs,
  buildCityGuideMetaTitle,
} from "./cityGuideTitles";

describe("cityGuideTitles", () => {
  it("builds display, meta, and h1 titles using the city token", () => {
    expect(buildCityGuideDisplayTitle("San Diego")).toBe(
      "10 Best Things to Do in San Diego (2026 Guide) | Outdoor Adventures"
    );
    expect(buildCityGuideMetaTitle("San Diego")).toBe(
      "10 Best Things to Do in San Diego (2026 Guide) | Outdoor Adventures"
    );
    expect(buildCityGuideH1("San Diego")).toBe(
      "10 Best Things to Do in San Diego"
    );
  });

  it("preserves long and international city names", () => {
    expect(buildCityGuideDisplayTitle("New York City")).toContain(
      "New York City"
    );
    expect(buildCityGuideH1("Zürich")).toBe("10 Best Things to Do in Zürich");
  });
  it("builds intro paragraphs with 2026 best-things phrasing", () => {
    const intro = buildCityGuideIntroParagraphs("Rome");
    expect(intro.primary).toBe(
      "Discover the 10 best things to do in Rome, from outdoor adventures and guided tours to unique local experiences. Explore top activities and unforgettable excursions in this 2026 travel guide."
    );
    expect(intro.secondary).toBe("");
  });
});
