import { describe, expect, it } from "vitest";

import { buildStateGuide } from "./guideData";
import { getGuidesByState } from "../utils/guides/guideRegistry";

describe("buildStateGuide", () => {
  it("syncs California top cities from existing US city guide pages", () => {
    const guide = buildStateGuide("california");
    const expectedCitySlugs = getGuidesByState("california").map(
      record => record.citySlug
    );

    expect(guide).toBeTruthy();
    expect(guide?.topCities.map(city => city.slug)).toEqual(expectedCitySlugs);
    expect(guide?.topCities.map(city => city.name)).toContain("Palm Springs");
  });

  it("syncs Colorado top cities from existing US city guide pages", () => {
    const guide = buildStateGuide("colorado");
    const expectedCitySlugs = getGuidesByState("colorado").map(
      record => record.citySlug
    );

    expect(guide).toBeTruthy();
    expect(guide?.topCities.map(city => city.slug)).toEqual(expectedCitySlugs);
  });
});
