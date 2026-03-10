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
      "Top 10 Things to Do in San Diego"
    );
    expect(buildCityGuideMetaTitle("San Diego")).toBe(
      "Top 10 Things to Do in San Diego (2026 Guide) | Outdoor Adventures"
    );
    expect(buildCityGuideH1("San Diego")).toBe(
      "Top 10 Things to Do in San Diego"
    );
  });

  it("preserves long and international city names", () => {
    expect(buildCityGuideDisplayTitle("New York City")).toContain(
      "New York City"
    );
    expect(buildCityGuideH1("Zürich")).toBe("Top 10 Things to Do in Zürich");
  });

  it("builds intro paragraphs with top 10 phrasing", () => {
    const intro = buildCityGuideIntroParagraphs("Rome");
    expect(intro.primary).toContain("top 10 things to do");
    expect(intro.secondary).toContain("Rome");
  });
});
