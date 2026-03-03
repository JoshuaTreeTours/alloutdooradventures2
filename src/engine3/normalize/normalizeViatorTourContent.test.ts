import { describe, expect, it } from "vitest";

import { normalizeViatorTourContent } from "./normalizeViatorTourContent";

describe("normalizeViatorTourContent", () => {
  it("strips HTML and trims overview at sentence boundaries", () => {
    const normalized = normalizeViatorTourContent({
      productData: {
        sourceUrl: "https://www.viator.com/tours/example",
        productCode: "EX1",
        description:
          "<p>You'll travel along the San Andreas Fault corridor with a guide. <strong>This route includes geology-focused stops and desert terrain context.</strong> The operator shares on-route commentary during the drive.</p><p>This sentence adds extra detail so the overview can be trimmed cleanly when needed.</p>",
      },
    });

    expect(normalized.overview).not.toContain("<p>");
    expect(normalized.overview).toContain("Travelers will travel along the San Andreas Fault corridor");
    expect(normalized.overview?.split(/\s+/).length).toBeLessThanOrEqual(140);
  });

  it("deduplicates highlights and included/excluded lists", () => {
    const normalized = normalizeViatorTourContent({
      productData: {
        sourceUrl: "https://www.viator.com/tours/example",
        productCode: "EX2",
        highlights: ["Guided fault-zone route", "Guided fault zone route", "  "],
        inclusions: ["Guide", "guide", "Bottled water"],
        exclusions: ["Gratuities", "gratuities"],
      },
    });

    expect(normalized.highlights).toEqual(["Guided fault-zone route"]);
    expect(normalized.inclusions).toEqual(["Guide", "Bottled water"]);
    expect(normalized.exclusions).toEqual(["Gratuities"]);
  });

  it("returns empty outputs when fields are missing", () => {
    const normalized = normalizeViatorTourContent({
      productData: {
        sourceUrl: "https://www.viator.com/tours/example",
        productCode: "EX3",
      },
    });

    expect(normalized.overview).toBeNull();
    expect(normalized.highlights).toEqual([]);
    expect(normalized.inclusions).toEqual([]);
    expect(normalized.exclusions).toEqual([]);
  });
});
