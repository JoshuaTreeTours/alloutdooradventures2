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
  it("removes final aggressive prune slugs across targeted states", () => {
    const alaska = getGuidesByState("alaska").map(record => record.citySlug);
    const utah = getGuidesByState("utah").map(record => record.citySlug);
    const newYork = getGuidesByState("new-york").map(record => record.citySlug);
    const wisconsin = getGuidesByState("wisconsin").map(
      record => record.citySlug
    );
    const florida = getGuidesByState("florida").map(record => record.citySlug);
    const texas = getGuidesByState("texas").map(record => record.citySlug);
    const massachusetts = getGuidesByState("massachusetts").map(
      record => record.citySlug
    );

    expect(alaska).not.toContain("homer");
    expect(alaska).not.toContain("palmer");
    expect(alaska).not.toContain("seward");

    expect(alaska).not.toContain("ketchikan");

    expect(utah).not.toContain("hurricane");
    expect(utah).not.toContain("bryce-canyon-city");
    expect(utah).not.toContain("springdale");
    expect(utah).not.toContain("st-george");

    expect(newYork).not.toContain("catskill");
    expect(newYork).not.toContain("ithaca");
    expect(newYork).not.toContain("montauk");
    expect(newYork).not.toContain("napanach");

    expect(wisconsin).not.toContain("fish-creek");
    expect(wisconsin).not.toContain("sister-bay");
    expect(wisconsin).not.toContain("sturgeon-bay");

    expect(florida).not.toContain("naples");
    expect(florida).not.toContain("islamorada");
    expect(florida).not.toContain("key-largo");
    expect(florida).not.toContain("panama-city-beach");
    expect(florida).not.toContain("sarasota");

    expect(texas).not.toContain("aransas-pass");
    expect(texas).not.toContain("port-aransas");
    expect(texas).not.toContain("spring");
    expect(texas).not.toContain("the-colony");

    expect(massachusetts).not.toContain("falmouth");
    expect(massachusetts).not.toContain("oak-bluffs");
  });
});
