import { describe, expect, it } from "vitest";

import {
  ENGINE6_GRAND_CANYON_CANONICAL_CITY_HERO_URL,
  ENGINE6_LAKE_TAHOE_CANONICAL_CITY_HERO_URL,
  ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL,
  ENGINE6_NAPA_CANONICAL_CITY_HERO_URL,
  ENGINE6_YELLOWSTONE_CANONICAL_CITY_HERO_URL,
  ENGINE6_YOSEMITE_CANONICAL_CITY_HERO_URL,
  ENGINE6_ZION_CANONICAL_CITY_HERO_URL,
  ENGINE6_GSM_CANONICAL_CITY_HERO_URL,
  ENGINE6_MAUI_CANONICAL_CITY_HERO_URL,
  ENGINE6_HAWAII_VOLCANOES_CANONICAL_CITY_HERO_URL,
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

const yosemiteListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "california" &&
    tour.destination.citySlug === "yosemite"
);

const grandCanyonListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "arizona" &&
    tour.destination.citySlug === "grand-canyon-national-park"
);

const yellowstoneListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "wyoming" &&
    tour.destination.citySlug === "yellowstone-national-park"
);

const zionListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "utah" &&
    tour.destination.citySlug === "zion-national-park"
);

const greatSmokyMountainsListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "tennessee" &&
    tour.destination.citySlug === "great-smoky-mountains-national-park"
);

const mauiListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "hawaii" &&
    tour.destination.citySlug === "maui"
);

const hawaiiVolcanoesListingTours = engine6ListingTours.filter(
  tour =>
    tour.engine === "engine6" &&
    tour.destination.stateSlug === "hawaii" &&
    tour.destination.citySlug === "hawaii-volcanoes-national-park"
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

  it("uses Yosemite as the validation cohort for unique listing-card heroes", () => {
    expect(yosemiteListingTours).toHaveLength(16);

    const heroCounts = yosemiteListingTours.reduce<Map<string, number>>(
      (counts, tour) => {
        counts.set(tour.heroImage, (counts.get(tour.heroImage) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    expect(
      heroCounts.get(ENGINE6_YOSEMITE_CANONICAL_CITY_HERO_URL) ?? 0
    ).toBeLessThanOrEqual(1);
    expect(heroCounts.size).toBe(yosemiteListingTours.length);
  });

  it("uses Grand Canyon as the validation cohort for unique listing-card heroes", () => {
    expect(grandCanyonListingTours).toHaveLength(21);

    const heroCounts = grandCanyonListingTours.reduce<Map<string, number>>(
      (counts, tour) => {
        counts.set(tour.heroImage, (counts.get(tour.heroImage) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    expect(
      heroCounts.get(ENGINE6_GRAND_CANYON_CANONICAL_CITY_HERO_URL) ?? 0
    ).toBeLessThanOrEqual(1);
    expect(heroCounts.size).toBe(grandCanyonListingTours.length);
  });

  it("uses Yellowstone as the validation cohort for unique listing-card heroes", () => {
    expect(yellowstoneListingTours).toHaveLength(23);

    const heroCounts = yellowstoneListingTours.reduce<Map<string, number>>(
      (counts, tour) => {
        counts.set(tour.heroImage, (counts.get(tour.heroImage) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    expect(
      heroCounts.get(ENGINE6_YELLOWSTONE_CANONICAL_CITY_HERO_URL) ?? 0
    ).toBeLessThanOrEqual(1);
    expect(heroCounts.size).toBe(yellowstoneListingTours.length);
  });

  it("uses Zion as the validation cohort for unique listing-card heroes", () => {
    expect(zionListingTours).toHaveLength(16);

    const heroCounts = zionListingTours.reduce<Map<string, number>>(
      (counts, tour) => {
        counts.set(tour.heroImage, (counts.get(tour.heroImage) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    expect(
      heroCounts.get(ENGINE6_ZION_CANONICAL_CITY_HERO_URL) ?? 0
    ).toBeLessThanOrEqual(1);
    expect(heroCounts.size).toBe(zionListingTours.length);
  });

  it("uses Great Smoky Mountains as the validation cohort for unique listing-card heroes", () => {
    expect(greatSmokyMountainsListingTours).toHaveLength(8);

    const heroCounts = greatSmokyMountainsListingTours.reduce<Map<string, number>>(
      (counts, tour) => {
        counts.set(tour.heroImage, (counts.get(tour.heroImage) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    expect(
      heroCounts.get(ENGINE6_GSM_CANONICAL_CITY_HERO_URL) ?? 0
    ).toBeLessThanOrEqual(1);
    expect(heroCounts.size).toBe(greatSmokyMountainsListingTours.length);
  });

  it("uses Maui as the validation cohort for unique listing-card heroes", () => {
    expect(mauiListingTours.length).toBeGreaterThan(0);

    const heroCounts = mauiListingTours.reduce<Map<string, number>>(
      (counts, tour) => {
        counts.set(tour.heroImage, (counts.get(tour.heroImage) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    expect(
      heroCounts.get(ENGINE6_MAUI_CANONICAL_CITY_HERO_URL) ?? 0
    ).toBeLessThanOrEqual(1);
    expect(heroCounts.size).toBe(mauiListingTours.length);
  });

  it("uses Hawaii Volcanoes National Park as the validation cohort for unique listing-card heroes", () => {
    expect(hawaiiVolcanoesListingTours.length).toBeGreaterThan(0);

    const heroCounts = hawaiiVolcanoesListingTours.reduce<Map<string, number>>(
      (counts, tour) => {
        counts.set(tour.heroImage, (counts.get(tour.heroImage) ?? 0) + 1);
        return counts;
      },
      new Map()
    );

    expect(
      heroCounts.get(ENGINE6_HAWAII_VOLCANOES_CANONICAL_CITY_HERO_URL) ?? 0
    ).toBeLessThanOrEqual(1);
    expect(heroCounts.size).toBe(hawaiiVolcanoesListingTours.length);
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
          productCode: "9345P24",
          heroImageUrl:
            "https://media.tacdn.com/media/attractions-splice-spp-674x446/15/46/2a/0e.jpg",
        },
      ],
    });

    expect(resolvedHeroes.get("53254P1")).toBe(
      ENGINE6_MONTEREY_CANONICAL_CITY_HERO_URL
    );
    expect(resolvedHeroes.get("53254P8")).toBe(curatedSunsetWhaleWatchHero);
    expect(resolvedHeroes.get("9345P24")).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/15/46/2a/0e.jpg"
    );
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
