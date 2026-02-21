import { describe, expect, it, vi } from "vitest";

vi.mock("../wiki/wikiSummary", () => ({
  fetchWikiSummary: vi.fn(async () => ({
    extract:
      "Original Tier-1 text with coverage for the area. It includes source-style wording that should remain untouched for protected guides.",
    url: "https://en.wikipedia.org/wiki/Test",
    imageUrl: "https://upload.wikimedia.org/test.jpg",
  })),
}));

import { buildWikiLandmarkDescription } from "./buildWikiLandmarkDescription";

describe("buildWikiLandmarkDescription tier protection", () => {
  it("does not rewrite tier1 text and keeps wiki image/url unchanged", async () => {
    const result = await buildWikiLandmarkDescription({
      landmarkName: "Test Landmark",
      cityName: "Los Angeles",
      stateName: "California",
      tier: "tier1",
      existingDescriptions: [],
    });

    expect(result.description).toContain("coverage for the area");
    expect(result.description).toContain("source-style wording");
    expect(result.wikiUrl).toBe("https://en.wikipedia.org/wiki/Test");
    expect(result.imageUrl).toBe("https://upload.wikimedia.org/test.jpg");
    expect(result.usedWiki).toBe(true);
  });
});
