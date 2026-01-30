import { describe, expect, it } from "vitest";
import {
  applyTopThingsBackfill,
  filterTopThingsByRules,
  getNearbyDestinations,
} from "./cityTopThings";
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
    const filtered = filterTopThingsByRules(candidates, new Set());
    expect(filtered).toHaveLength(0);

    const curatedSet = new Set([normalizePlaceName("Coastal Bluffs")]);
    const allowed = filterTopThingsByRules(
      [{ name: "Coastal Bluffs", source: "local-poi" }],
      curatedSet,
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
});
