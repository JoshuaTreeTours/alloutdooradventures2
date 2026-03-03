import { describe, expect, it } from "vitest";

import { viatorProductCacheByCode } from "../data/viatorProductCache";
import { normalizeViatorTourContent } from "../normalize/normalizeViatorTourContent";

const countWords = (value: string): number =>
  value.split(/\s+/).filter(Boolean).length;

describe("normalizeViatorTourContent fact overview fallback", () => {
  it("builds a 100+ word fact-only overview when source overview is missing", () => {
    const normalized = normalizeViatorTourContent({
      productData: {
        sourceUrl: "https://www.viator.com/tours/example",
        productCode: "EX-FACT",
        title: "Joshua Tree Hummer Adventure from Palm Desert",
        duration: "3 hours",
        highlights: [
          "Travel in an open-air Hummer through Joshua Tree National Park terrain",
          "Guide commentary on desert ecology and regional history",
        ],
        inclusions: ["Professional guide", "Bottled water"],
        meetingPointDescription: "Departures operate from Palm Desert.",
      },
    });

    expect(normalized.overview).toBeTruthy();
    expect(countWords(normalized.overview ?? "")).toBeGreaterThanOrEqual(100);
    expect(normalized.overview).toContain("Joshua Tree Hummer Adventure");
    expect(normalized.overview).toContain("3 hours");
    expect(normalized.overview).toContain("open-air Hummer");
    expect(normalized.overview?.toLowerCase()).not.toContain("art museum pickup");
    expect(normalized.overview?.toLowerCase()).not.toContain("8:30 am");
  });

  it("keeps 6740JTREE overview above 100 words and grounded in normalized fields", () => {
    const normalized = normalizeViatorTourContent({
      productData: viatorProductCacheByCode["6740JTREE"],
    });

    expect(normalized.overview).toBeTruthy();
    expect(countWords(normalized.overview ?? "")).toBeGreaterThanOrEqual(100);
    expect(normalized.overview).toContain("Joshua Tree Hummer Adventure");
    expect(normalized.overview).toContain("3 hours");
    expect(normalized.overview).toContain("Professional guide");
    expect(normalized.overview?.toLowerCase()).not.toContain("art museum pickup");
    expect(normalized.overview?.toLowerCase()).not.toContain("8:30 am");
  });
});
