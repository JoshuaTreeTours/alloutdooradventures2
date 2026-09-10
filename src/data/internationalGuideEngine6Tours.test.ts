import { describe, expect, it } from "vitest";

import {
  getInternationalEngine6CityGuideTours,
  getInternationalEngine6CountryGuideTours,
} from "./internationalGuideEngine6Tours";

const expectEngine6Only = (tours: ReturnType<typeof getInternationalEngine6CityGuideTours>) => {
  expect(tours.length).toBeGreaterThan(0);
  expect(tours.every(tour => tour.engine === "engine6")).toBe(true);
  expect(tours.some(tour => tour.id.startsWith("engine2-guide-"))).toBe(false);
};

describe("international guide Engine6 top-tour governance", () => {
  it("uses only Engine6 inventory for Paris top tours", () => {
    const tours = getInternationalEngine6CityGuideTours("france", "paris");

    expectEngine6Only(tours);
    expect(tours.every(tour => tour.destination.citySlug === "paris")).toBe(true);
    expect(tours.every(tour => tour.destination.stateSlug === "france")).toBe(true);
  });

  it("uses only Engine6 inventory for other flagship international cities", () => {
    const cases = [
      ["italy", "rome"],
      ["italy", "venice"],
      ["united-kingdom", "london"],
      ["spain", "barcelona"],
      ["germany", "berlin"],
    ] as const;

    for (const [countrySlug, citySlug] of cases) {
      expectEngine6Only(
        getInternationalEngine6CityGuideTours(countrySlug, citySlug),
      );
    }
  });

  it("maps the United Kingdom Edinburgh guide to the Scotland Engine6 route cohort", () => {
    const tours = getInternationalEngine6CityGuideTours(
      "united-kingdom",
      "edinburgh",
    );

    expectEngine6Only(tours);
    expect(tours.every(tour => tour.destination.stateSlug === "scotland")).toBe(
      true,
    );
  });

  it("uses only Engine6 inventory for international country guide top tours", () => {
    const franceTours = getInternationalEngine6CountryGuideTours("france");
    const ukTours = getInternationalEngine6CountryGuideTours("united-kingdom");

    expect(franceTours.length).toBeGreaterThan(0);
    expect(franceTours.every(tour => tour.engine === "engine6")).toBe(true);
    expect(ukTours.length).toBeGreaterThan(0);
    expect(ukTours.every(tour => tour.engine === "engine6")).toBe(true);
  });
});
