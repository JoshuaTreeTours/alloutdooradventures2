import { describe, expect, it } from "vitest";

import { getStateCityOptions } from "./stateCityOptions";
import { getToursByCityUnified } from "./tours";
import { resolveToursLandingInitialSelection } from "../pages/tours/ToursLanding";

describe("state city options", () => {
  it("adds Avalon dynamically for California from Engine6 inventory", () => {
    const californiaCities = getStateCityOptions("california");
    const avalon = californiaCities.find(city => city.slug === "avalon");

    expect(avalon).toBeDefined();
    expect(avalon?.name).toBe("Avalon");
    expect(
      californiaCities.filter(city => city.slug === "avalon")
    ).toHaveLength(1);
  });

  it("keeps city options sorted and preserves existing cities", () => {
    const californiaCities = getStateCityOptions("california");
    const names = californiaCities.map(city => city.name);
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b));

    expect(names).toEqual(sortedNames);
    expect(californiaCities.some(city => city.slug === "los-angeles")).toBe(true);
    expect(californiaCities.some(city => city.slug === "santa-barbara")).toBe(
      true
    );
  });

  it("accepts Avalon in /tours query selection and returns Catalina results", () => {
    const initialSelection = resolveToursLandingInitialSelection(
      "?state=california&city=avalon"
    );

    expect(initialSelection).toEqual({
      stateSlug: "california",
      citySlug: "avalon",
      type: "tours",
    });

    const avalonTours = getToursByCityUnified("california", "avalon");
    expect(
      avalonTours.some(entry => entry.tour.productCode === "32779P2")
    ).toBe(true);
  });
});
