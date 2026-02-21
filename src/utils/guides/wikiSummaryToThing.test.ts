import { describe, expect, it, vi } from "vitest";

vi.mock("../wiki/wikiRest", () => ({
  getWikipediaSummary: vi.fn(async () => ({
    title: "Hilo",
    extract:
      "Hilo is a census-designated place in Hawaii County, Hawaii, United States. It sits on the windward side of the island of Hawaiʻi and is the county seat. The community developed around Hilo Bay and became a major regional center for government, shipping, and commerce in eastern Hawaiʻi. Historic districts in downtown Hilo include early twentieth-century commercial architecture and civic buildings tied to plantation-era growth. Nearby Rainbow Falls and Wailuku River landmarks are closely associated with local geology and Hawaiian cultural traditions.",
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
    expect(
      (thing?.description ?? "").split(/\s+/).filter(Boolean).length
    ).toBeGreaterThanOrEqual(40);
  });
});
