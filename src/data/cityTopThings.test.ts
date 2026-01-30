import { describe, expect, it } from "vitest";
import {
  applyTopThingsBackfill,
  buildTopThingsToDo,
  filterTopThingsByRules,
  getNearbyDestinations,
  MIN_TIER1_DESCRIPTION_LENGTH,
} from "./cityTopThings";
import { auditCityGuideContent } from "./cityGuideContent";
import { getTier1PoisForCity } from "./cityPois/tier1";
import { normalizePlaceName } from "../utils/geo";

describe("city top things rules", () => {
  it("filters Monterey out of nearby destinations for Joshua Tree", () => {
    const nearby = getNearbyDestinations("california", "joshua-tree");
    const names = nearby.map((destination) => destination.name);
    expect(names).not.toContain("Monterey");
  });

  it("removes denylisted phrases unless explicitly curated", () => {
    const candidates = [
      { name: "Coastal Bluffs", source: "nearby-destination" as const },
    ];
    const filtered = filterTopThingsByRules(candidates, new Set(), "Test City");
    expect(filtered).toHaveLength(0);

    const curatedSet = new Set([normalizePlaceName("Coastal Bluffs")]);
    const allowed = filterTopThingsByRules(
      [{ name: "Coastal Bluffs", source: "local-poi" }],
      curatedSet,
      "Test City",
    );
    expect(allowed).toHaveLength(1);
  });

  it("backfills when the list is too short", () => {
    const fallbackNames = [
      "Hidden Valley",
      "Keys View",
      "Barker Dam",
      "Skull Rock",
      "Cholla Cactus Garden",
      "Ryan Mountain Trailhead",
      "Cap Rock",
      "Indian Cove",
      "Joshua Tree Visitor Center",
      "Palm Springs",
    ];
    const localPoiNames = new Set(
      fallbackNames.map((name) => normalizePlaceName(name)),
    );
    const backfilled = applyTopThingsBackfill(
      [],
      fallbackNames,
      localPoiNames,
      new Set(),
      10,
    );
    expect(backfilled).toHaveLength(10);
  });

  it("returns POI-only Palm Springs top things and passes strict checks", () => {
    const items = buildTopThingsToDo("Palm Springs", "california", "palm-springs");
    const poiNames = new Set(
      getTier1PoisForCity("california", "palm-springs").map((poi) => poi.name),
    );

    items.forEach((item) => {
      expect(poiNames.has(item.title)).toBe(true);
      expect(item.description.length).toBeGreaterThanOrEqual(
        MIN_TIER1_DESCRIPTION_LENGTH,
      );
    });

    const issues = auditCityGuideContent(
      { topThingsToDo: items },
      {
        cityName: "Palm Springs",
        citySlug: "palm-springs",
        parentSlug: "california",
        regionType: "state",
        tier: 1,
      },
    );
    expect(issues.filter((issue) => issue.severity === "error")).toHaveLength(0);
  });

  it("uses only Tier-1 POIs for Newport Beach with rich descriptions", () => {
    const items = buildTopThingsToDo(
      "Newport Beach",
      "california",
      "newport-beach",
    );
    const poiNames = new Set(
      getTier1PoisForCity("california", "newport-beach").map((poi) => poi.name),
    );
    const titles = items.map((item) => item.title);

    items.forEach((item) => {
      expect(poiNames.has(item.title)).toBe(true);
      expect(item.description.length).toBeGreaterThanOrEqual(
        MIN_TIER1_DESCRIPTION_LENGTH,
      );
    });

    expect(titles.join(" ")).not.toMatch(/Monterey|Big Sur|Napa/);
  });
});
