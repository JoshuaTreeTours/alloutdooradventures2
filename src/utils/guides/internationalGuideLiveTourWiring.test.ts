import { describe, expect, it } from "vitest";

import { getGuideCountries } from "../../data/guideData";
import type { Tour } from "../../data/tours.types";
import { buildInternationalCityOptions } from "../../pages/tours/internationalSelectorData";
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

  it("shows a city in destination search with one live tour and omits cities with zero", () => {
    const oneTourCity = {
      id: "one-tour-destination-test",
      slug: "single-live-tour",
      title: "Single live tour",
      operator: "Test operator",
      categories: ["adventure"],
      activitySlugs: ["adventure"],
      destination: {
        country: "Testland",
        state: "Testland",
        stateSlug: "testland",
        city: "One Tour City",
        citySlug: "one-tour-city",
      },
    } as Tour;

    const withOneTour = buildInternationalCityOptions({
      selectedCountry: "Testland",
      selectedCanadaProvinceSlug: "",
      internationalTours: [oneTourCity],
      canadaProvinces: [],
      mexicoTours: [],
    });
    expect(withOneTour).toEqual([
      { name: "One Tour City", slug: "one-tour-city" },
    ]);

    const withZeroTours = buildInternationalCityOptions({
      selectedCountry: "Testland",
      selectedCanadaProvinceSlug: "",
      internationalTours: [],
      canadaProvinces: [],
      mexicoTours: [],
    });
    expect(withZeroTours).toEqual([]);
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
