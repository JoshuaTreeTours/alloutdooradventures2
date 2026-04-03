import { describe, expect, it } from "vitest";

import { getTopToursForPlace } from "./tourIndex";

describe("guide top tours for Engine6-only Florida cities", () => {
  it("keeps Miami top tours Engine6-only", () => {
    const topTours = getTopToursForPlace(
      {
        type: "city",
        slug: "miami",
        name: "Miami",
        parentSlug: "florida",
        parentName: "Florida",
        regionType: "state",
      },
      { min: 3, max: 10 }
    );

    expect(topTours.length).toBeGreaterThan(0);
    expect(topTours.every(tour => tour.engine === "engine6")).toBe(true);
  });

  it("keeps Fort Lauderdale top tours Engine6-only", () => {
    const topTours = getTopToursForPlace(
      {
        type: "city",
        slug: "fort-lauderdale",
        name: "Fort Lauderdale",
        parentSlug: "florida",
        parentName: "Florida",
        regionType: "state",
      },
      { min: 3, max: 10 }
    );

    expect(topTours.length).toBeGreaterThan(0);
    expect(topTours.every(tour => tour.engine === "engine6")).toBe(true);
  });

  it("does not change non-target cities", () => {
    const newYorkTopTours = getTopToursForPlace(
      {
        type: "city",
        slug: "new-york",
        name: "New York",
        parentSlug: "new-york",
        parentName: "New York",
        regionType: "state",
      },
      { min: 3, max: 10 }
    );

    expect(newYorkTopTours.length).toBeGreaterThan(0);
    expect(newYorkTopTours.some(tour => tour.engine !== "engine6")).toBe(true);
  });
});
