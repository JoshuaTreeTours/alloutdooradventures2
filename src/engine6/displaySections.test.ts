import { describe, expect, it } from "vitest";

import { buildEngine6DisplaySections } from "./displaySections";

describe("buildEngine6DisplaySections", () => {
  it("deduplicates across Highlights and Additional info and caps both to five", () => {
    const highlights = [
      "Sunset paddle with coastal views",
      "Small-group experience",
      "Duration: 2 hours",
      "Not wheelchair accessible",
      "Travelers should have moderate physical fitness",
      "Sunset paddle with coastal views",
      "Guide shares local marine history",
    ];
    const additional = [
      "Not wheelchair accessible",
      "Travelers should have moderate physical fitness",
      "Meeting point confirmed after booking",
      "Minimum age is 12 years",
      "Bring closed-toe shoes",
      "Cancel up to 24 hours in advance",
      "Service animals allowed",
    ];

    const result = buildEngine6DisplaySections(highlights, additional);

    expect(result.highlights.length).toBeLessThanOrEqual(5);
    expect(result.additionalInfo.length).toBeLessThanOrEqual(5);
    expect(result.highlights).toContain("Sunset paddle with coastal views");
    expect(result.additionalInfo).not.toContain("Not wheelchair accessible");
    expect(result.additionalInfo).toContain("Service animals allowed");
  });

  it("keeps source arrays untouched while returning display subsets", () => {
    const highlights = ["Explore hidden canyon trails", "Duration: 3 hours"];
    const additional = ["Minimum age is 10 years", "Bring water"];

    const originalHighlights = [...highlights];
    const originalAdditional = [...additional];

    const result = buildEngine6DisplaySections(highlights, additional);

    expect(highlights).toEqual(originalHighlights);
    expect(additional).toEqual(originalAdditional);
    expect(result.highlights).toEqual(highlights);
    expect(result.additionalInfo).toEqual(additional);
  });
});
