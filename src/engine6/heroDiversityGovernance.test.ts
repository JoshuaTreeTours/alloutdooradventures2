import { describe, expect, it } from "vitest";

import {
  ENGINE6_LAKE_TAHOE_CANONICAL_CITY_HERO_URL,
  ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL,
  ENGINE6_NAPA_CANONICAL_CITY_HERO_URL,
  resolveEngine6CityDisplayHeroes,
} from "./displayHero";
import { engine6ListingTours } from "./listing";

const productHeroA =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/aa/bb/cc/dd.jpg";
const productHeroB =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/22/33/44.jpg";
const curatedSunsetWhaleWatchHero =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/7f/49/38.jpg";
const aquariumFallbackHero =
  "https://media.tacdn.com/media/attractions-splice-spp-674x446/10/17/30/28.jpg";

const montereyListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "california" &&
    tour.destination.citySlug === "monterey"
);

const napaListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "california" &&
    tour.destination.citySlug === "napa"
);

const lakeTahoeListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "california" &&
    tour.destination.citySlug === "lake-tahoe"
);

describe("Engine6 hero diversity governance", () => {
  it("uses Monterey as the validation cohort for unique listing-card heroes", () => {
    expect(montereyListingTours.length).toBeGreaterThan(0);

    const heroCounts = montereyListingTours.reduce<Map<string, number>>(
      (counts, tour) => {
        counts.set(tour.heroImage, (counts.get(tour.heroImage) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    expect(
      heroCounts.get(ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL) ?? 0
    ).toBeLessThanOrEqual(1);
    expect(heroCounts.size).toBe(montereyListingTours.length);
  });

  it("uses Napa as the validation cohort for unique listing-card heroes", () => {
    expect(napaListingTours).toHaveLength(12);

    const heroCounts = napaListingTours.reduce<Map<string, number>>(
      (counts, tour) => {
        counts.set(tour.heroImage, (counts.get(tour.heroImage) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    expect(
      heroCounts.get(ENGINE6_NAPA_CANONICAL_CITY_HERO_URL) ?? 0
    ).toBeLessThanOrEqual(1);
    expect(heroCounts.size).toBe(napaListingTours.length);
  });

  it("uses Lake Tahoe as the validation cohort for unique listing-card heroes", () => {
    expect(lakeTahoeListingTours).toHaveLength(9);

    const heroCounts = lakeTahoeListingTours.reduce<Map<string, number>>(
      (counts, tour) => {
        counts.set(tour.heroImage, (counts.get(tour.heroImage) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    expect(
      heroCounts.get(ENGINE6_LAKE_TAHOE_CANONICAL_CITY_HERO_URL) ?? 0
    ).toBeLessThanOrEqual(1);
    expect(heroCounts.size).toBe(lakeTahoeListingTours.length);
  });

  it("newly generated Engine6 cities prefer unique product heroes before fallbacks", () => {
    const resolvedHeroes = resolveEngine6CityDisplayHeroes({
      stateSlug: "california",
      citySlug: "monterey",
      tours: [
        { productCode: "PRODUCT_A", heroImageUrl: productHeroA },
        { productCode: "PRODUCT_B", heroImageUrl: productHeroB },
      ],
    });

    expect(resolvedHeroes.get("PRODUCT_A")).toBe(productHeroA);
    expect(resolvedHeroes.get("PRODUCT_B")).toBe(productHeroB);
  });

  it("uses curated product/POI fallbacks instead of repeating a city hero when available", () => {
    const resolvedHeroes = resolveEngine6CityDisplayHeroes({
      stateSlug: "california",
      citySlug: "monterey",
      tours: [
        {
          productCode: "53254P1",
          heroImageUrl: ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL,
        },
        {
          productCode: "53254P8",
          heroImageUrl: ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL,
        },
        {
          productCode: "6021MBA",
          heroImageUrl:
            "https://media.tacdn.com/media/attractions-splice-spp-674x446/12/2e/41/ec.jpg",
        },
      ],
    });

    expect(resolvedHeroes.get("53254P1")).toBe(
      ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL
    );
    expect(resolvedHeroes.get("53254P8")).toBe(curatedSunsetWhaleWatchHero);
    expect(resolvedHeroes.get("6021MBA")).toBe(aquariumFallbackHero);
  });

  it("allows duplicate city-canonical heroes only when no valid unique alternative exists", () => {
    const resolvedHeroes = resolveEngine6CityDisplayHeroes({
      stateSlug: "california",
      citySlug: "monterey",
      tours: [
        { productCode: "NO_IMAGE_A", heroImageUrl: null },
        { productCode: "NO_IMAGE_B", heroImageUrl: null },
      ],
    });

    expect([...resolvedHeroes.values()]).toEqual([
      ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL,
      ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL,
    ]);
  });
});
