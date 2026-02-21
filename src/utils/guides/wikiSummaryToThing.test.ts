import { describe, expect, it, vi } from "vitest";

vi.mock("../wiki/wikiRest", () => ({
  getWikipediaSummary: vi.fn(async () => ({
    title: "Hilo",
    extract:
      "Hilo is a census-designated place in Hawaii County, Hawaii, United States. It is known for waterfalls, bayfront views, and rainforest surroundings on the eastern side of the island.",
    pageUrl: undefined,
    imageUrl: "https://upload.wikimedia.org/hilo.jpg",
  })),
}));

import { wikiSummaryToThing } from "./wikiSummaryToThing";

describe("wikiSummaryToThing", () => {
  it("returns factual text without boilerplate and always includes wikiUrl", async () => {
    const thing = await wikiSummaryToThing("Hilo", "Hilo");

    expect(thing).toBeTruthy();
    expect(thing?.wikiUrl).toBe("https://en.wikipedia.org/wiki/Hilo");
    expect(thing?.description).not.toMatch(
      /practical stop|easy recommendation|travelers? rank|coverage for|article set|according to/i
    );
    expect(thing?.description.split(/(?<=[.!?])\s+/).filter(Boolean).length).toBeLessThanOrEqual(3);
  });
});
