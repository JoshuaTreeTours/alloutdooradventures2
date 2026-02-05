import { describe, expect, it } from "vitest";

import {
  CITY_NEUTRAL_BRAND_IMAGE,
  HOME_HERO_IMAGE,
  isImageInCityTour,
  resolveCityHeroImage,
  resolveHeroImageForRoute,
} from "./hero";
import { buildImageUrl } from "./seo";

describe("resolveCityHeroImage", () => {
  it("prefers a city-bound tour hero image", () => {
    const image = resolveCityHeroImage({
      citySlug: "joshua-tree",
      stateSlug: "california",
      countryCode: "US",
      cityTours: [
        {
          id: "1",
          title: "Joshua Tree Sunset Hike",
          heroImage: "https://cdn.example.com/joshua-tree-tour.jpg",
          destination: {
            citySlug: "joshua-tree",
            stateSlug: "california",
            countryCode: "US",
          },
          badges: { reviewCount: 120, rating: 4.9 },
        },
      ],
    });

    expect(image).toBe("https://cdn.example.com/joshua-tree-tour.jpg");
  });

  it("joshua-tree: rejects other-city and other-country tour images", () => {
    const image = resolveCityHeroImage({
      citySlug: "joshua-tree",
      stateSlug: "california",
      countryCode: "US",
      cityTours: [
        {
          id: "2",
          title: "Paris Day Tour",
          heroImage: "https://cdn.example.com/paris-tour.jpg",
          destination: {
            citySlug: "paris",
            stateSlug: "ile-de-france",
            countryCode: "FR",
          },
          badges: { reviewCount: 500, rating: 5 },
        },
        {
          id: "3",
          title: "Palm Springs Jeep",
          heroImage: "https://cdn.example.com/palm-springs-tour.jpg",
          destination: {
            citySlug: "palm-springs",
            stateSlug: "california",
            countryCode: "US",
          },
          badges: { reviewCount: 200, rating: 4.8 },
        },
      ],
    });

    expect(image).toBe(buildImageUrl(CITY_NEUTRAL_BRAND_IMAGE));
  });

  it("never falls back to activity default images like canoe-hero", () => {
    const image = resolveCityHeroImage({
      citySlug: "joshua-tree",
      stateSlug: "california",
      countryCode: "US",
      cityTours: [
        {
          id: "4",
          title: "Default Image Tour",
          heroImage: "/images/canoe-hero.jpg",
          destination: {
            citySlug: "joshua-tree",
            stateSlug: "california",
            countryCode: "US",
          },
          badges: { reviewCount: 1000, rating: 5 },
        },
      ],
    });

    expect(image).toBe(buildImageUrl(CITY_NEUTRAL_BRAND_IMAGE));
    expect(image).not.toContain("/images/canoe-hero.jpg");
  });
});

describe("isImageInCityTour", () => {
  it("requires explicit tour/city binding and rejects defaults", () => {
    expect(
      isImageInCityTour(
        {
          src: "https://cdn.example.com/jt.jpg",
          tourCitySlug: "joshua-tree",
          citySlug: "joshua-tree",
          stateSlug: "california",
          countryCode: "US",
        },
        { citySlug: "joshua-tree", stateSlug: "california", countryCode: "US" },
      ),
    ).toBe(true);

    expect(
      isImageInCityTour(
        {
          src: "/images/canoe-hero.jpg",
          tourCitySlug: "joshua-tree",
          citySlug: "joshua-tree",
        },
        { citySlug: "joshua-tree", stateSlug: "california", countryCode: "US" },
      ),
    ).toBe(false);

    expect(
      isImageInCityTour(
        { src: "https://cdn.example.com/unbound.jpg" },
        { citySlug: "joshua-tree", stateSlug: "california", countryCode: "US" },
      ),
    ).toBe(false);
  });
});

describe("resolveHeroImageForRoute city hub", () => {


  it("keeps city hub and city tours routes on the exact same hero URL", () => {
    const cityTours = [
      {
        id: "jt-city-1",
        title: "Joshua Tree Morning Hike",
        heroImage: "https://cdn.example.com/joshua-tree-shared.jpg",
        destination: {
          citySlug: "joshua-tree",
          stateSlug: "california",
          countryCode: "US",
        },
        badges: { reviewCount: 350, rating: 4.9 },
      },
    ];

    const cityHubHero = resolveHeroImageForRoute({
      route: "/destinations/states/california/cities/joshua-tree",
      city: { slug: "joshua-tree", stateSlug: "california" },
      state: { slug: "california" },
      cityTours,
    });

    const cityToursHero = resolveHeroImageForRoute({
      route: "/destinations/states/california/cities/joshua-tree/tours",
      city: { slug: "joshua-tree", stateSlug: "california" },
      state: { slug: "california" },
      cityTours,
    });

    expect(cityHubHero).toBe("https://cdn.example.com/joshua-tree-shared.jpg");
    expect(cityToursHero).toBe(cityHubHero);
    expect(cityToursHero).not.toContain("canoe-hero");
  });
  it("uses same city-tour resolver for destination city routes", () => {
    const image = resolveHeroImageForRoute({
      route: "/destinations/states/california/cities/joshua-tree",
      city: { slug: "joshua-tree", stateSlug: "california", heroImages: [HOME_HERO_IMAGE] },
      state: { heroImage: "https://cdn.example.com/california-state.jpg", slug: "california" },
      cityTours: [
        {
          id: "jt-city",
          title: "Joshua Tree Stargazing",
          heroImage: "https://cdn.example.com/joshua-tree-city-tour.jpg",
          destination: {
            citySlug: "joshua-tree",
            stateSlug: "california",
            countryCode: "US",
          },
          badges: { reviewCount: 400, rating: 4.9 },
        },
      ],
    });

    expect(image).toBe("https://cdn.example.com/joshua-tree-city-tour.jpg");
    expect(image).not.toContain("canoe-hero");
  });
});
