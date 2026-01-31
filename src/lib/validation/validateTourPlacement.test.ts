import { describe, expect, it } from "vitest";

import { validateTourPlacement } from "./validateTourPlacement";

describe("validateTourPlacement", () => {
  it("rejects marine titles in landlocked regions", () => {
    const result = validateTourPlacement(
      { title: "Dolphin snorkeling adventure" },
      {
        source: "heartland/montana.csv",
        region: {
          kind: "city",
          slug: "bozeman",
          isLandlocked: true,
        },
      },
    );

    expect(result).toEqual(
      expect.objectContaining({ ok: false, code: "LANDLOCKED_MARINE_MISMATCH" }),
    );
  });

  it("rejects points outside bounds", () => {
    const result = validateTourPlacement(
      { title: "Desert hike", lat: 50, lng: -120 },
      {
        source: "west/california.csv",
        region: {
          kind: "state",
          slug: "california",
          bounds: { minLat: 32, maxLat: 42, minLng: -124, maxLng: -114 },
        },
      },
    );

    expect(result).toEqual(
      expect.objectContaining({ ok: false, code: "OUTSIDE_BOUNDS" }),
    );
  });

  it("rejects points too far from center", () => {
    const result = validateTourPlacement(
      { title: "City paddle", lat: 0, lng: 2 },
      {
        source: "coastal/florida.csv",
        region: {
          kind: "city",
          slug: "miami",
          center: { lat: 0, lng: 0 },
        },
      },
    );

    expect(result).toEqual(
      expect.objectContaining({ ok: false, code: "TOO_FAR" }),
    );
  });

  it("passes points within bounds and distance", () => {
    const result = validateTourPlacement(
      { title: "Local hike", lat: 0, lng: 0.5 },
      {
        source: "west/oregon.csv",
        region: {
          kind: "city",
          slug: "bend",
          center: { lat: 0, lng: 0 },
          bounds: { minLat: -1, maxLat: 1, minLng: -1, maxLng: 1 },
        },
      },
    );

    expect(result).toEqual({ ok: true });
  });
});
