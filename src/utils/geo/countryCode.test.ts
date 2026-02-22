import { describe, expect, it } from "vitest";

import { extractCountrySlugFromDestinationsPath } from "./countryCode";

describe("extractCountrySlugFromDestinationsPath", () => {
  it("extracts country after region container", () => {
    expect(
      extractCountrySlugFromDestinationsPath(
        "https://www.alloutdooradventures.com/destinations/europe/france/cities/paris"
      )
    ).toBe("france");
  });

  it("extracts country from /destinations/<countrySlug>/...", () => {
    expect(
      extractCountrySlugFromDestinationsPath(
        "https://www.alloutdooradventures.com/destinations/france/paris/tours/x-195968"
      )
    ).toBe("france");
  });

  it("maps US state slug to united-states", () => {
    expect(
      extractCountrySlugFromDestinationsPath(
        "https://www.alloutdooradventures.com/destinations/california/joshua-tree/tours/x"
      )
    ).toBe("united-states");
  });

  it("keeps united-states slug route", () => {
    expect(
      extractCountrySlugFromDestinationsPath(
        "https://www.alloutdooradventures.com/destinations/united-states/hawaii/hilo/tours/x"
      )
    ).toBe("united-states");
  });
});
