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

describe("buildWikiLandmarkDescription extended depth", () => {
  it("returns factual 4-6 sentence extended description with wiki url/image", async () => {
    const result = await buildWikiLandmarkDescription({
      landmarkName: "Test Landmark",
      cityName: "Los Angeles",
      stateName: "California",
      tier: "tier1",
      existingDescriptions: [],
    });

    const sentences = result.description.split(/(?<=[.!?])\s+/).filter(Boolean);
    const words = result.description.split(/\s+/).filter(Boolean).length;

    expect(result.description).not.toMatch(
      /prominent landmark|visitors experience|site-specific details|easy recommendation/i
    );
    expect(sentences.length).toBeGreaterThanOrEqual(4);
    expect(sentences.length).toBeLessThanOrEqual(6);
    expect(words).toBeGreaterThanOrEqual(80);
    expect(words).toBeLessThanOrEqual(140);
    expect(result.wikiUrl).toBe("https://en.wikipedia.org/wiki/Test");
    expect(result.imageUrl).toBe("https://upload.wikimedia.org/test.jpg");
    expect(result.usedWiki).toBe(true);
  });
});
