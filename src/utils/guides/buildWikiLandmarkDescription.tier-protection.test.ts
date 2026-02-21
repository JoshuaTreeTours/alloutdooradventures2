import { describe, expect, it, vi } from "vitest";

vi.mock("../wiki/wikiSummary", () => ({
  fetchWikiSummary: vi.fn(async () => ({
    extract:
      "Test Landmark is a historic site in Los Angeles, California. It dates to the early twentieth century and is associated with major local civic events. The site includes notable architectural features and remains a visible part of regional cultural identity. It sits in a district with strong transit access and documented preservation work.",
    url: "https://en.wikipedia.org/wiki/Test",
    imageUrl: "https://upload.wikimedia.org/test.jpg",
  })),
}));

import { buildWikiLandmarkDescription } from "./buildWikiLandmarkDescription";

describe("buildWikiLandmarkDescription authority rewrite", () => {
  it("returns concise wiki-grounded output with source url", async () => {
    const result = await buildWikiLandmarkDescription({
      landmarkName: "Test Landmark",
      cityName: "Los Angeles",
      stateName: "California",
      tier: "tier1",
      existingDescriptions: [],
    });

    expect(result).not.toBeNull();
    expect(result?.description).toContain("Source: Wikipedia → https://en.wikipedia.org/wiki/Test");
    expect(result?.description).not.toMatch(/is a landmark in/i);
    expect(result?.wikiUrl).toBe("https://en.wikipedia.org/wiki/Test");
    expect(result?.imageUrl).toBe("https://upload.wikimedia.org/test.jpg");
    expect(result?.usedWiki).toBe(true);
  });

  it("returns null when generated summary repeats existing description", async () => {
    const result = await buildWikiLandmarkDescription({
      landmarkName: "Test Landmark",
      cityName: "Los Angeles",
      stateName: "California",
      existingDescriptions: [
        "Test Landmark is a historic site in Los Angeles, California. It dates to the early twentieth century and is associated with major local civic events. The site includes notable architectural features and remains a visible part of regional cultural identity",
      ],
    });

    expect(result).toBeNull();
  });
});
