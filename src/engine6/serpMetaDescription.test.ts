import { describe, expect, it } from "vitest";

import { buildEngine6SerpMetaDescription, buildEngine6Seo } from "./seo";
import { engine6ResolvedTours } from "./registry";

const assertSerpSafeDescription = (description: string) => {
  expect(description.length).toBeGreaterThanOrEqual(145);
  expect(description.length).toBeLessThanOrEqual(160);
  expect(description).toMatch(/[.!?]$/);
  expect(description).not.toMatch(/\.\.\.$/);
  expect(description).not.toMatch(/\s[\w'’-]*$/);
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
    expect(description).toMatch(/Explore|Visit|Discover|Tour|Sightseeing/i);
    expect(description).not.toBe(merchantStyleSource);
  });

  it("applies SERP-safe meta descriptions to every resolved Engine6 tour", () => {
    for (const tour of engine6ResolvedTours) {
      assertSerpSafeDescription(tour.metaDescription);
      expect(buildEngine6Seo(tour).description).toBe(tour.metaDescription);
    }
  });
});
