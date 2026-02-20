import { describe, expect, it } from "vitest";

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

  it("keeps only allowlisted Florida city guides in the registry", () => {
    const floridaGuideSlugs = getGuidesByState("florida").map(
      record => record.citySlug
    );

    expect(floridaGuideSlugs).toContain("miami-beach");
    expect(floridaGuideSlugs).toContain("orlando");
    expect(floridaGuideSlugs).toContain("daytona-beach");

    expect(floridaGuideSlugs).not.toContain("canal-point");
    expect(floridaGuideSlugs).not.toContain("hobe-sound");
    expect(floridaGuideSlugs).not.toContain("sanford");
  });

  it("keeps only allowlisted Tennessee and Connecticut city guides", () => {
    const tennesseeGuideSlugs = getGuidesByState("tennessee").map(
      record => record.citySlug
    );
    const connecticutGuideSlugs = getGuidesByState("connecticut").map(
      record => record.citySlug
    );

    expect(tennesseeGuideSlugs).toEqual([
      "chattanooga",
      "franklin",
      "johnson-city",
      "nashville",
      "sevierville",
    ]);
    expect(tennesseeGuideSlugs).not.toContain("christiana");

    expect(connecticutGuideSlugs).toEqual(["east-lyme", "essex", "new-london"]);
    expect(connecticutGuideSlugs).not.toContain("plainville");
  });
});
