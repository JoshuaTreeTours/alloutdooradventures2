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
      "Best Tours in San Diego – Outdoor Adventures & Experiences"
    );
    expect(buildCityGuideMetaTitle("San Diego")).toBe(
      "Best Tours in San Diego | Top Outdoor Adventures"
    );
    expect(buildCityGuideH1("San Diego")).toBe("Best Tours in San Diego");
  });

  it("preserves long and international city names", () => {
    expect(buildCityGuideDisplayTitle("New York City")).toContain(
      "New York City"
    );
    expect(buildCityGuideH1("Zürich")).toBe("Best Tours in Zürich");
  });
  it("builds intro paragraphs with best tours phrasing", () => {
    const intro = buildCityGuideIntroParagraphs("Rome");
    expect(intro.primary).toContain("best tours in Rome");
    expect(intro.secondary).toContain("best of Rome");
  });
});
