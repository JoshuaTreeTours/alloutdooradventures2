import { describe, expect, it } from "vitest";

import {
  buildCityGuide,
  buildCountryGuide,
  getGuideCountries,
} from "../../data/guideData";
import { tours } from "../../data/tours";
import { US_STATES, slugify } from "../../data/tourCatalog";
import { isUsCountryAlias } from "./usCountryAliases";
import {
  isRetiredInternationalCityGuide,
  shouldRetainInternationalCityGuide,
} from "./internationalGuideRetention";

const usStateSlugs = new Set(US_STATES.map(state => slugify(state)));

const getInternationalCountrySlug = (tour: (typeof tours)[number]) => {
  if (tour.destination.stateSlug === "scotland") return "scotland";

  if (tour.destination.country) {
    const countrySlug = slugify(tour.destination.country);
    return isUsCountryAlias(countrySlug) ? null : countrySlug;
  }

  const stateSlug =
    tour.destination.stateSlug || slugify(tour.destination.state || "");
  if (!stateSlug || usStateSlugs.has(stateSlug)) return null;

  return stateSlug;
};

const liveInternationalCities = () => {
  const counts = new Map<
    string,
    { countrySlug: string; citySlug: string; activeTourCount: number }
  >();

  for (const tour of tours) {
    const countrySlug = getInternationalCountrySlug(tour);
    const citySlug = tour.destination.citySlug;
    if (!countrySlug || !citySlug) continue;

    const key = `${countrySlug}/${citySlug}`;
    const existing = counts.get(key);
    if (existing) {
      existing.activeTourCount += 1;
    } else {
      counts.set(key, { countrySlug, citySlug, activeTourCount: 1 });
    }
  }

  return Array.from(counts.values());
};

describe("international guide live-tour wiring", () => {
  it("uses one live tour as the normal international guide threshold", () => {
    expect(
      shouldRetainInternationalCityGuide({
        countrySlug: "costa-rica",
        citySlug: "san-jose",
        activeTourCount: 1,
      }),
    ).toBe(true);

    expect(
      shouldRetainInternationalCityGuide({
        countrySlug: "costa-rica",
        citySlug: "san-jose",
        activeTourCount: 0,
      }),
    ).toBe(false);
  });

  it("keeps explicit retired-guide policy stronger than live inventory", () => {
    expect(
      shouldRetainInternationalCityGuide({
        countrySlug: "australia",
        citySlug: "hyden",
        activeTourCount: 50,
      }),
    ).toBe(false);
  });

  it("wires every non-retired live international city into country and city guides", () => {
    const countryIndex = new Map(
      getGuideCountries().map(country => [country.slug, country]),
    );

    for (const liveCity of liveInternationalCities()) {
      if (
        isRetiredInternationalCityGuide(
          liveCity.countrySlug,
          liveCity.citySlug,
        )
      ) {
        continue;
      }

      const country = countryIndex.get(liveCity.countrySlug);
      expect(
        country,
        `${liveCity.countrySlug} should be discoverable from live tour inventory`,
      ).toBeTruthy();
      expect(
        country?.cities.some(city => city.slug === liveCity.citySlug),
        `${liveCity.countrySlug}/${liveCity.citySlug} should be listed by its country guide`,
      ).toBe(true);
      expect(
        buildCountryGuide(liveCity.countrySlug),
        `${liveCity.countrySlug} should build a country guide`,
      ).toBeTruthy();
      expect(
        buildCityGuide({
          parentSlug: liveCity.countrySlug,
          citySlug: liveCity.citySlug,
          regionType: "country",
        }),
        `${liveCity.countrySlug}/${liveCity.citySlug} should build a city guide`,
      ).toBeTruthy();
    }
  });
});