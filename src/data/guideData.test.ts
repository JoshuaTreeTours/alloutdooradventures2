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

describe("international guide data", () => {
  it("builds Mexico country and major city guides from Engine2 international tours", async () => {
    const { buildCountryGuide, buildCityGuide } = await import("./guideData");
    const mexicoGuide = buildCountryGuide("mexico");
    const caboGuide = buildCityGuide({
      regionType: "country",
      parentSlug: "mexico",
      citySlug: "cabo-san-lucas",
    });
    const puertoVallartaGuide = buildCityGuide({
      regionType: "country",
      parentSlug: "mexico",
      citySlug: "puerto-vallarta",
    });

    expect(mexicoGuide?.topCities?.map(city => city.slug)).toEqual(
      expect.arrayContaining(["cabo-san-lucas", "puerto-vallarta"])
    );
    expect(caboGuide?.breadcrumbs.at(-1)?.href).toBe(
      "/guides/world/mexico/cabo-san-lucas"
    );
    expect(puertoVallartaGuide?.breadcrumbs.at(-1)?.href).toBe(
      "/guides/world/mexico/puerto-vallarta"
    );
  });
});
