import { describe, expect, it } from "vitest";

import { getGuideCountries } from "../../data/guideData";
import { getGeneratedCountryDestinationHref } from "../destinations/liveInternationalDestinations";
import { isUsCountryAlias } from "./usCountryAliases";
import { shouldRetainInternationalCityGuide } from "./internationalGuideRetention";

describe("international live-tour wiring", () => {
  it("keeps the five-live-tour minimum for ordinary city guides", () => {
    expect(
      shouldRetainInternationalCityGuide({
        countrySlug: "costa-rica",
        citySlug: "san-jose",
        activeTourCount: 4,
      }),
    ).toBe(false);

    expect(
      shouldRetainInternationalCityGuide({
        countrySlug: "costa-rica",
        citySlug: "san-jose",
        activeTourCount: 5,
      }),
    ).toBe(true);
  });

  it("keeps explicit retired-guide policy stronger than tour volume", () => {
    expect(
      shouldRetainInternationalCityGuide({
        countrySlug: "australia",
        citySlug: "hyden",
        activeTourCount: 50,
      }),
    ).toBe(false);
  });

  it("gives every live international country a destination route", () => {
    const liveCountries = getGuideCountries().filter(
      country => country.tourCount > 0 && !isUsCountryAlias(country.slug),
    );

    for (const country of liveCountries) {
      const href = getGeneratedCountryDestinationHref(country.slug);
      expect(
        href,
        `${country.name} (${country.slug}) has live tours and must be wired into Destinations`,
      ).toBeTruthy();
      expect(href?.startsWith("/destinations/")).toBe(true);
    }
  });
});
