import { describe, expect, it } from "vitest";

import { buildEngine6SerpMetaDescription, buildEngine6Seo } from "./seo";
import { engine6ResolvedTours } from "./registry";

const assertSerpSafeDescription = (description: string) => {
  expect(description.length).toBeGreaterThanOrEqual(110);
  expect(description.length).toBeLessThanOrEqual(155);
  expect(description).toMatch(/[.!?]$/);
  expect(description).not.toMatch(/\.\.\.$/);
};

describe("Engine6 SERP meta description governance", () => {
  it("builds concise complete meta copy separate from rich merchant prose", () => {
    const merchantStyleSource =
      "Explore Joshua Tree National Park with an expert guide on a sightseeing adventure through dramatic desert landscapes, towering rock formations, and iconic Joshua trees. Visit Hidden Valley, Keys View, and Cap Rock while learning about geology, wildlife, and cultural history.";

    const description = buildEngine6SerpMetaDescription({
      title: "Joshua Tree National Park Sightseeing Tour",
      city: "Joshua Tree",
      categoryLabel: "Sightseeing Tour",
      sourceDescription: merchantStyleSource,
    });

    assertSerpSafeDescription(description);
    expect(description).toContain("Joshua Tree");
    expect(description).toMatch(/Joshua Tree|sightseeing|desert|guide/i);
    expect(description).not.toBe(merchantStyleSource);
    expect(description).not.toContain(
      "Joshua Tree National Park Sightseeing Tour"
    );
    expect(description).not.toMatch(
      /^Explore Joshua Tree National Park Sightseeing Tour/i
    );
  });

  it("applies SERP-safe meta descriptions to every resolved Engine6 tour", () => {
    for (const tour of engine6ResolvedTours) {
      assertSerpSafeDescription(tour.metaDescription);
      expect(tour.metaDescription).toContain(tour.city);
      expect(tour.metaDescription).not.toContain(tour.title);
      expect(tour.metaDescription).not.toMatch(
        /^Explore [A-Z][^.!?]{20,90} (?:in|from|near|around|on|through|at) [A-Z]/
      );
      expect(tour.metaDescription).not.toMatch(
        /\b(?:route includes|itinerary includes|stops include|This route)\b/i
      );
      expect(buildEngine6Seo(tour).description).toBe(tour.metaDescription);
    }
  });
});
