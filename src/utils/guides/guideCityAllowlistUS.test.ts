import { describe, expect, it } from "vitest";

import { getToursByCity } from "../../data/tours";
import {
  GUIDE_CITY_ALLOWLIST_US,
  isGuideCityAllowedUS,
} from "./guideCityAllowlistUS";
import { getGuidesByState } from "./guideRegistry";

describe("guideCityAllowlistUS", () => {
  it("keeps Hawaii guides unpruned", () => {
    expect(GUIDE_CITY_ALLOWLIST_US.hawaii).toBe("ALL");
    expect(isGuideCityAllowedUS("hawaii", "honolulu")).toBe(true);
    expect(isGuideCityAllowedUS("hawaii", "hilo")).toBe(true);
  });

  it("removes low-tour city guides from filtered states", () => {
    const floridaGuideSlugs = getGuidesByState("florida").map(
      record => record.citySlug
    );

    expect(floridaGuideSlugs).toContain("miami-beach");
    expect(floridaGuideSlugs).toContain("orlando");

    expect(floridaGuideSlugs).not.toContain("canal-point");
    expect(floridaGuideSlugs).not.toContain("daytona-beach");
    expect(floridaGuideSlugs).not.toContain("tampa");
  });

  it("keeps only guides with at least five tours in Tennessee and Connecticut", () => {
    const tennesseeGuideSlugs = getGuidesByState("tennessee").map(
      record => record.citySlug
    );
    const connecticutGuideSlugs = getGuidesByState("connecticut").map(
      record => record.citySlug
    );

    expect(tennesseeGuideSlugs).toEqual(["chattanooga", "nashville"]);
    expect(connecticutGuideSlugs).toEqual(["essex"]);

    for (const citySlug of [...tennesseeGuideSlugs, ...connecticutGuideSlugs]) {
      const stateSlug = tennesseeGuideSlugs.includes(citySlug)
        ? "tennessee"
        : "connecticut";
      expect(getToursByCity(stateSlug, citySlug).length).toBeGreaterThanOrEqual(
        5
      );
    }
  });
});
