import { describe, expect, it } from "vitest";

import {
  CITY_PLACEHOLDER_HERO_IMAGE,
  HOME_HERO_IMAGE,
  isImageInCity,
  resolveCityHeroImage,
  resolveHeroImageForRoute,
} from "./hero";
import { buildImageUrl } from "./seo";

describe("resolveCityHeroImage", () => {
  it("uses explicit city hero before other candidates", () => {
    const image = resolveCityHeroImage({
      city: {
        slug: "joshua-tree",
        stateSlug: "california",
        countryCode: "US",
        heroImage: "https://cdn.example.com/jt-explicit.jpg",
        images: [
          {
            src: "https://cdn.example.com/jt-city-image.jpg",
            citySlug: "joshua-tree",
            stateSlug: "california",
            countryCode: "US",
          },
        ],
      },
      citySlug: "joshua-tree",
      stateSlug: "california",
      countryCode: "US",
    });

    expect(image).toBe("https://cdn.example.com/jt-explicit.jpg");
  });

  it("returns neutral fallback when city bound metadata is missing", () => {
    const image = resolveCityHeroImage({
      city: {
        slug: "joshua-tree",
        stateSlug: "california",
        countryCode: "US",
        images: [{ src: "https://cdn.example.com/unbound.jpg" }],
      },
      citySlug: "joshua-tree",
      stateSlug: "california",
      countryCode: "US",
    });

    expect(image).toBe(buildImageUrl(CITY_PLACEHOLDER_HERO_IMAGE));
  });

  it("joshua-tree: never resolves image from another city/country", () => {
    const image = resolveCityHeroImage({
      city: {
        slug: "joshua-tree",
        stateSlug: "california",
        countryCode: "US",
        images: [
          {
            src: "https://cdn.example.com/paris.jpg",
            citySlug: "paris",
            countryCode: "FR",
            stateSlug: "ile-de-france",
          },
          {
            src: "https://cdn.example.com/palm-springs.jpg",
            citySlug: "palm-springs",
            countryCode: "US",
            stateSlug: "california",
          },
        ],
      },
      citySlug: "joshua-tree",
      stateSlug: "california",
      countryCode: "US",
    });

    expect(image).toBe(buildImageUrl(CITY_PLACEHOLDER_HERO_IMAGE));
    expect(image).not.toContain("paris");
    expect(image).not.toContain("palm-springs");
  });
});

describe("isImageInCity", () => {
  it("requires a strong city match and rejects state/country mismatch", () => {
    const cityCtx = {
      cityId: "jt-1",
      citySlug: "joshua-tree",
      stateSlug: "california",
      countryCode: "US",
    };

    expect(
      isImageInCity(
        {
          src: "https://cdn.example.com/jt.jpg",
          cityId: "jt-1",
          citySlug: "joshua-tree",
          stateSlug: "california",
          countryCode: "US",
        },
        cityCtx,
      ),
    ).toBe(true);

    expect(
      isImageInCity(
        {
          src: "https://cdn.example.com/paris.jpg",
          citySlug: "joshua-tree",
          stateSlug: "california",
          countryCode: "FR",
        },
        cityCtx,
      ),
    ).toBe(false);

    expect(isImageInCity({ src: "https://cdn.example.com/unbound.jpg" }, cityCtx)).toBe(
      false,
    );
  });
});

describe("resolveHeroImageForRoute city-page hard lock", () => {
  it("never falls back to state or home hero on US city guides", () => {
    const image = resolveHeroImageForRoute({
      route: "/guides/us/california/joshua-tree",
      guide: { type: "city", guideImages: [] },
      state: { heroImage: "https://cdn.example.com/california-state.jpg" },
      city: { slug: "joshua-tree", stateSlug: "california", heroImages: [HOME_HERO_IMAGE] },
    });

    expect(image).toBe(buildImageUrl(CITY_PLACEHOLDER_HERO_IMAGE));
    expect(image).not.toBe("https://cdn.example.com/california-state.jpg");
    expect(image).not.toContain(HOME_HERO_IMAGE);
  });

  it("never falls back to state hero on destination city routes", () => {
    const image = resolveHeroImageForRoute({
      route: "/destinations/states/california/cities/joshua-tree",
      city: { slug: "joshua-tree", stateSlug: "california", heroImages: [] },
      state: { heroImage: "https://cdn.example.com/california-state.jpg" },
    });

    expect(image).toBe(buildImageUrl(CITY_PLACEHOLDER_HERO_IMAGE));
    expect(image).not.toBe("https://cdn.example.com/california-state.jpg");
  });
});
