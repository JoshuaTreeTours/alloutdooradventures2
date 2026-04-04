import { describe, expect, it } from "vitest";

import { getTopToursForPlace } from "./tourIndex";

describe("guide top tours prioritize Engine6 first", () => {
  it("keeps Miami top tours Engine6-first", () => {
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
    expect(topTours[0]?.engine).toBe("engine6");
  });

  it("keeps Fort Lauderdale top tours Engine6-first", () => {
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
    expect(topTours[0]?.engine).toBe("engine6");
  });

  it("fills New York top 10 from Engine6 first and only falls back after Engine6", () => {
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
    const firstNonEngine6Index = newYorkTopTours.findIndex(
      tour => tour.engine !== "engine6"
    );

    if (firstNonEngine6Index > -1) {
      expect(
        newYorkTopTours.slice(0, firstNonEngine6Index).every(
          tour => tour.engine === "engine6"
        )
      ).toBe(true);
      expect(
        newYorkTopTours.slice(firstNonEngine6Index).some(
          tour => tour.engine !== "engine6"
        )
      ).toBe(true);
    } else {
      expect(newYorkTopTours.every(tour => tour.engine === "engine6")).toBe(
        true
      );
    }
  });
});
