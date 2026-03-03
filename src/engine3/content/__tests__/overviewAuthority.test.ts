import { describe, expect, it } from "vitest";

import { normalizeViatorTourContent } from "../../normalize/normalizeViatorTourContent";

const countWords = (value: string): number =>
  value.split(/\s+/).filter(Boolean).length;

describe("overview authority hardening", () => {
  it("generates non-meta overview prose from facts", () => {
    const normalized = normalizeViatorTourContent({
      productData: {
        sourceUrl: "https://www.viator.com/tours/example",
        productCode: "AUTH1",
        title: "Joshua Tree Hummer Adventure from Palm Desert",
        duration: "3 hours",
        highlights: [
          "Travel in an open-air Hummer through Joshua Tree National Park terrain",
          "Stop at geologic landmarks and panoramic viewpoints",
          "Guide commentary on desert ecology and regional history",
        ],
        inclusions: ["Professional guide", "Bottled water"],
        meetingPointDescription: "Departures operate from Palm Desert.",
      },
    });

    const overview = normalized.overview ?? "";
    expect(countWords(overview)).toBeGreaterThanOrEqual(100);

    const lowered = overview.toLowerCase();
    for (const token of ["viator", "published", "normalized", "assembled", "api"]) {
      expect(lowered).not.toContain(token);
    }
  });

  it("forces composer for short low-quality overviews and repairs 6740-style output", () => {
    const normalized = normalizeViatorTourContent({
      productData: {
        sourceUrl: "https://www.viator.com/tours/example",
        productCode: "6740JTREE",
        title: "Joshua Tree Hummer Adventure from Palm Desert",
        description: "Short overview.",
        duration: "3 hours",
        highlights: [
          "Travel in an open-air Hummer through Joshua Tree National Park terrain",
          "Stop at geologic landmarks and panoramic viewpoints",
          "Guide commentary on desert ecology and regional history",
        ],
        inclusions: ["Professional guide", "Bottled water"],
        meetingPointDescription: "Departures operate from Palm Desert.",
      },
    });

    const overview = normalized.overview ?? "";
    expect(countWords(overview)).toBeGreaterThanOrEqual(100);
    expect(overview).toContain("3 hours");
    expect(overview).toContain("open-air Hummer");
    expect(overview).toContain("Professional guide");
    expect(overview).toContain("Palm Desert");
    expect(overview.toLowerCase()).not.toContain("this overview");
  });
});
