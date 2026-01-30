import { describe, expect, it } from "vitest";
import {
  applyTopThingsBackfill,
  buildTopThingsToDo,
  filterTopThingsByRules,
  getNearbyDestinations,
  getAllowedNeighborStates,
  isGenericPlaceholderName,
  MAX_NEARBY_DESTINATION_MILES,
  MIN_TIER1_DESCRIPTION_LENGTH,
  MIN_TIER1_ITEMS,
  TOP_THINGS_BANNED_PHRASES,
} from "./cityTopThings";
import { auditCityGuideContent } from "./cityGuideContent";
import { getTier1PoisForCity } from "./cityPois/tier1";
import { getTier1IntlPoisForCity } from "./cityPois/tier1/world";
import { normalizePlaceName } from "../utils/geo";

describe("city top things rules", () => {
  it("filters Monterey out of nearby destinations for Joshua Tree", () => {
    const nearby = getNearbyDestinations("california", "joshua-tree");
    const names = nearby.map(destination => destination.name);
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
      "Test City"
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
      fallbackNames.map(name => normalizePlaceName(name))
    );
    const backfilled = applyTopThingsBackfill(
      [],
      fallbackNames,
      localPoiNames,
      new Set(),
      10
    );
    expect(backfilled).toHaveLength(10);
  });

  it("keeps Brick Township nearby destinations in-state and avoids banned phrases", () => {
    const items = buildTopThingsToDo(
      "Brick Township",
      "new-jersey",
      "brick-township"
    );
    const nearby = getNearbyDestinations("new-jersey", "brick-township");
    const allowedStates = getAllowedNeighborStates("new-jersey");

    nearby.forEach(destination => {
      expect(allowedStates.has(destination.stateSlug)).toBe(true);
      expect(destination.distanceMiles).toBeLessThanOrEqual(
        MAX_NEARBY_DESTINATION_MILES
      );
    });

    items.forEach(item => {
      const lower = item.description.toLowerCase();
      TOP_THINGS_BANNED_PHRASES.forEach(phrase => {
        expect(lower).not.toContain(phrase);
      });
    });

    const titles = items.map(item => item.title).join(" ");
    expect(titles).not.toMatch(/Natick|Nantucket|Quincy/);
  });

  it("allows neighbor-state destinations near New York within the max distance", () => {
    const nearby = getNearbyDestinations("new-york", "new-york");
    const allowedStates = getAllowedNeighborStates("new-york");

    expect(nearby.length).toBeGreaterThan(0);

    nearby.forEach(destination => {
      expect(allowedStates.has(destination.stateSlug)).toBe(true);
      expect(destination.distanceMiles).toBeLessThanOrEqual(
        MAX_NEARBY_DESTINATION_MILES
      );
    });

    expect(
      nearby.some(destination => destination.stateSlug !== "new-york")
    ).toBe(true);
  });

  it("returns POI-only Palm Springs top things and passes strict checks", () => {
    const items = buildTopThingsToDo(
      "Palm Springs",
      "california",
      "palm-springs"
    );
    const poiNames = new Set(
      getTier1PoisForCity("california", "palm-springs").map(poi => poi.name)
    );

    items.forEach(item => {
      expect(poiNames.has(item.title)).toBe(true);
      expect(item.description.length).toBeGreaterThanOrEqual(
        MIN_TIER1_DESCRIPTION_LENGTH
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
      }
    );
    expect(issues.filter(issue => issue.severity === "error")).toHaveLength(0);
  });

  it("uses only Tier-1 POIs for Newport Beach with rich descriptions", () => {
    const items = buildTopThingsToDo(
      "Newport Beach",
      "california",
      "newport-beach"
    );
    const poiNames = new Set(
      getTier1PoisForCity("california", "newport-beach").map(poi => poi.name)
    );
    const titles = items.map(item => item.title);

    items.forEach(item => {
      expect(poiNames.has(item.title)).toBe(true);
      expect(item.description.length).toBeGreaterThanOrEqual(
        MIN_TIER1_DESCRIPTION_LENGTH
      );
    });

    expect(titles.join(" ")).not.toMatch(/Monterey|Big Sur|Napa/);
  });

  it("uses only Tier-1 POIs for Rome with rich descriptions", () => {
    const items = buildTopThingsToDo("Rome", "italy", "rome", {
      regionType: "country",
    });
    const poiNames = new Set(
      getTier1IntlPoisForCity("italy", "rome").map(poi => poi.name)
    );

    expect(items.length).toBeGreaterThanOrEqual(MIN_TIER1_ITEMS);
    items.forEach(item => {
      expect(poiNames.has(item.title)).toBe(true);
      expect(isGenericPlaceholderName(item.title, "Rome")).toBe(false);
      expect(item.description.length).toBeGreaterThanOrEqual(
        MIN_TIER1_DESCRIPTION_LENGTH
      );
    });

    const issues = auditCityGuideContent(
      { topThingsToDo: items },
      {
        cityName: "Rome",
        citySlug: "rome",
        parentSlug: "italy",
        regionType: "country",
        tier: 1,
      }
    );
    expect(
      issues.filter(issue => issue.issueType === "Tier-1 archetype token")
    ).toHaveLength(0);
  });

  it("uses only Tier-1 POIs for Sydney with rich descriptions", () => {
    const items = buildTopThingsToDo("Sydney", "australia", "sydney", {
      regionType: "country",
    });
    const poiNames = new Set(
      getTier1IntlPoisForCity("australia", "sydney").map(poi => poi.name)
    );

    expect(items.length).toBeGreaterThanOrEqual(MIN_TIER1_ITEMS);
    items.forEach(item => {
      expect(poiNames.has(item.title)).toBe(true);
      expect(isGenericPlaceholderName(item.title, "Sydney")).toBe(false);
      expect(item.description.length).toBeGreaterThanOrEqual(
        MIN_TIER1_DESCRIPTION_LENGTH
      );
    });

    const issues = auditCityGuideContent(
      { topThingsToDo: items },
      {
        cityName: "Sydney",
        citySlug: "sydney",
        parentSlug: "australia",
        regionType: "country",
        tier: 1,
      }
    );
    expect(
      issues.filter(issue => issue.issueType === "Tier-1 archetype token")
    ).toHaveLength(0);
  });
});
