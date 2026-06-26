import { describe, expect, it } from "vitest";

import {
  ENGINE6_GLOBAL_FALLBACK_HERO_URL,
  ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL,
  isDisplayableEngine6HeroUrl,
  resolveEngine6DisplayHero,
} from "./displayHero";

describe("resolveEngine6DisplayHero", () => {
  it("uses the product hero when it is displayable", () => {
    const productHero =
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/bb/cc/dd.jpg";

    expect(
      resolveEngine6DisplayHero({
        productHeroUrl: productHero,
        stateSlug: "california",
        citySlug: "monterey",
      })
    ).toBe(productHero);
  });

  it("falls back to the Monterey canonical city hero for unavailable product heroes", () => {
    expect(
      resolveEngine6DisplayHero({
        productHeroUrl:
          "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/2e/41/ec.jpg",
        stateSlug: "california",
        citySlug: "monterey",
      })
    ).toBe(ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL);

    expect(
      resolveEngine6DisplayHero({
        productHeroUrl:
          "https://media.tacdn.com/media/attractions-splice-spp-674x446/31/d9/f9/af.jpg",
        stateSlug: "california",
        citySlug: "monterey",
      })
    ).toBe(ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL);
  });

  it("uses the global Engine6 fallback when no city hero is configured", () => {
    expect(
      resolveEngine6DisplayHero({
        productHeroUrl: "",
        stateSlug: "nevada",
        citySlug: "las-vegas",
      })
    ).toBe(ENGINE6_GLOBAL_FALLBACK_HERO_URL);
  });

  it("rejects invalid and placeholder hero URLs", () => {
    expect(isDisplayableEngine6HeroUrl("")).toBe(false);
    expect(isDisplayableEngine6HeroUrl("/logo.svg")).toBe(false);
    expect(isDisplayableEngine6HeroUrl("/hero.jpg")).toBe(false);
    expect(
      isDisplayableEngine6HeroUrl(
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/6e/e7/f6.jpg"
      )
    ).toBe(true);
  });
});
