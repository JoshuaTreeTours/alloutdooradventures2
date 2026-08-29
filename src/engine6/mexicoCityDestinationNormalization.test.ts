import { describe, expect, it } from "vitest";

import { getCanonicalDestinationCitySlug } from "../data/destinationAliases";
import { getCityBySlugs, getStateBySlug } from "../data/destinations";
import { getEngine2MexicoTours } from "../engine2/data/loadEngine2";
import {
  buildInternationalCityOptions,
  CANONICAL_MEXICO_CITY_NAME,
  CANONICAL_MEXICO_CITY_SLUG,
  getMexicoCityKey,
  normalizeMexicoCityName,
  resolveInternationalCitySelectionRoute,
} from "../pages/tours/internationalSelectorData";
import { tours } from "../data/tours";

describe("Mexico City destination identity normalization", () => {
  it("canonicalizes all Mexico City name variants to Mexico City", () => {
    expect(normalizeMexicoCityName("Ciudad De México")).toBe(
      CANONICAL_MEXICO_CITY_NAME
    );
    expect(normalizeMexicoCityName("Ciudad de México")).toBe(
      CANONICAL_MEXICO_CITY_NAME
    );
    expect(normalizeMexicoCityName("Ciudad De Mexico")).toBe(
      CANONICAL_MEXICO_CITY_NAME
    );
    expect(normalizeMexicoCityName("Mexico City")).toBe(
      CANONICAL_MEXICO_CITY_NAME
    );
    expect(normalizeMexicoCityName("CDMX")).toBe(CANONICAL_MEXICO_CITY_NAME);
  });

  it("maps all Mexico City slugs to mexico-city", () => {
    expect(getMexicoCityKey("Ciudad De México", "ciudad-de-mexico")).toBe(
      CANONICAL_MEXICO_CITY_SLUG
    );
    expect(getMexicoCityKey("Mexico City", "mexico-city")).toBe(
      CANONICAL_MEXICO_CITY_SLUG
    );
    expect(getMexicoCityKey("CDMX")).toBe(CANONICAL_MEXICO_CITY_SLUG);
    expect(
      getCanonicalDestinationCitySlug("mexico", "ciudad-de-mexico")
    ).toBe(CANONICAL_MEXICO_CITY_SLUG);
  });

  it("registers one Mexico City destination in the Mexico selector", () => {
    const mexicoCities = buildInternationalCityOptions({
      selectedCountry: "Mexico",
      selectedCanadaProvinceSlug: "",
      internationalTours: tours,
      canadaProvinces: [],
      mexicoTours: getEngine2MexicoTours(),
    });
    const mexicoCityEntries = mexicoCities.filter(
      city =>
        city.slug === "mexico-city" ||
        city.slug === "ciudad-de-mexico" ||
        /ciudad de m[eé]xico/i.test(city.name) ||
        /mexico city/i.test(city.name)
    );

    expect(mexicoCityEntries).toEqual([
      {
        name: CANONICAL_MEXICO_CITY_NAME,
        slug: CANONICAL_MEXICO_CITY_SLUG,
      },
    ]);
  });

  it("registers Mexico City in destination registry", () => {
    expect(getStateBySlug("mexico")?.name).toBe("Mexico");
    expect(getCityBySlugs("mexico", "mexico-city")?.name).toBe(
      CANONICAL_MEXICO_CITY_NAME
    );
    expect(getCityBySlugs("mexico", "ciudad-de-mexico")).toBeUndefined();
  });

  it("keeps canonical routing on Mexico City", () => {
    expect(
      resolveInternationalCitySelectionRoute({
        selectedCountry: "Mexico",
        citySlug: "mexico-city",
      })
    ).toBe("/destinations/mexico/mexico-city/tours");
  });
});
