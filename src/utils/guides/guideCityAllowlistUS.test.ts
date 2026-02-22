import { describe, expect, it } from "vitest";

import { isGuideCityAllowedUS } from "./guideCityAllowlistUS";
import { getGuidesByState } from "./guideRegistry";

describe("guideCityAllowlistUS", () => {
  it("keeps Hawaii guides available", () => {
    expect(isGuideCityAllowedUS("hawaii", "honolulu")).toBe(true);
    expect(isGuideCityAllowedUS("hawaii", "hilo")).toBe(true);
  });

  it("removes the final-prune city slugs from Florida guides", () => {
    const floridaGuideSlugs = getGuidesByState("florida").map(
      record => record.citySlug
    );

    expect(floridaGuideSlugs).toContain("miami");
    expect(floridaGuideSlugs).toContain("orlando");

    expect(floridaGuideSlugs).not.toContain("miami-beach");
    expect(floridaGuideSlugs).not.toContain("daytona-beach");
    expect(floridaGuideSlugs).not.toContain("st-augustine");
  });

  it("removes blocked cities from states without explicit allowlists", () => {
    const newYorkGuideSlugs = getGuidesByState("new-york").map(
      record => record.citySlug
    );
    const vermontGuideSlugs = getGuidesByState("vermont").map(
      record => record.citySlug
    );

    expect(newYorkGuideSlugs).not.toContain("queens");
    expect(newYorkGuideSlugs).not.toContain("staten-island");
    expect(vermontGuideSlugs).not.toContain("waterbury");
    expect(vermontGuideSlugs).not.toContain("woodford");
  });
  it("removes all Virginia guides from the registry", () => {
    const virginiaGuideSlugs = getGuidesByState("virginia").map(
      record => record.citySlug
    );

    expect(virginiaGuideSlugs).toEqual([]);
  });
});
