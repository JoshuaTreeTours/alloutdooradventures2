import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { shouldPreserveGuideContent } from "./shouldPreserveGuideContent";

vi.mock("../wiki/wikiRest", () => ({
  getWikipediaSummary: vi.fn(async () => ({
    title: "Rainbow Falls",
    extract:
      "Rainbow Falls is a waterfall located in Hilo, Hawaii, on the Wailuku River. The cascade drops about 80 feet over a natural lava cave system formed by earlier volcanic activity on the island of Hawaiʻi. Local traditions connect the site with the goddess Hina, and the surrounding river gorge has long been part of stories about settlement and land use in eastern Hawaiʻi. The falls sit within Wailuku River State Park, where frequent rain and morning light create the rainbow effect that gives the site its name. Because it is close to downtown Hilo, the location is a common reference point for understanding local geology, rainfall patterns, and the cultural landscape of the district.",
    pageUrl: "https://en.wikipedia.org/wiki/Rainbow_Falls_(Hawaii)",
    imageUrl: "https://upload.wikimedia.org/rainbow-falls.jpg",
  })),
}));

import { wikiSummaryToThing } from "./wikiSummaryToThing";

const HILO_GUIDE_PATH = path.resolve("src/data/guides/us/hawaii/hilo.json");

const BANNED =
  /practical stop|orientation point|high-impact stop|travelers comparing|balanced itinerary|easy recommendation/i;

const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

describe("Hilo tier2 wiki rules", () => {
  it("keeps Hilo eligible for rewrite via preserve-by-images guard", () => {
    const guide = JSON.parse(fs.readFileSync(HILO_GUIDE_PATH, "utf8"));
    expect(guide.tier).toBe("tier2");
    expect(shouldPreserveGuideContent(guide)).toBe(false);
  });

  it("builds wiki-backed long-form entry with wikiUrl and no boilerplate", async () => {
    const item = await wikiSummaryToThing("Rainbow Falls (Hawaii)", "Hilo");

    expect(item).toBeTruthy();
    expect(item?.wikiUrl).toMatch(/^https:\/\/en\.wikipedia\.org\/wiki\//);
    expect(item?.description ?? "").not.toMatch(BANNED);
    expect(wordCount(item?.description ?? "")).toBeGreaterThanOrEqual(120);
  });
});
