import { describe, expect, it } from "vitest";

import {
  CITY_PLACEHOLDER_HERO_IMAGE,
  HOME_HERO_IMAGE,
  resolveHeroImageForRoute,
} from "./hero";
import { buildImageUrl } from "./seo";

describe("resolveHeroImageForRoute city-page hard lock", () => {
  it("uses city guide image for US city guides", () => {
    const image = resolveHeroImageForRoute({
      route: "/guides/us/colorado/denver",
      guide: {
        type: "city",
        guideImages: [{ src: "https://cdn.example.com/denver-guide.jpg" }],
      },
      state: { heroImage: "https://cdn.example.com/colorado-state.jpg" },
      city: { heroImages: ["https://cdn.example.com/denver-city.jpg"] },
    });

    expect(image).toBe("https://cdn.example.com/denver-guide.jpg");
  });

  it("never falls back to state or home hero on US city guides", () => {
    const image = resolveHeroImageForRoute({
      route: "/guides/us/colorado/denver",
      guide: { type: "city", guideImages: [] },
      state: { heroImage: "https://cdn.example.com/colorado-state.jpg" },
      city: { heroImages: [HOME_HERO_IMAGE] },
    });

    expect(image).toBe(buildImageUrl(CITY_PLACEHOLDER_HERO_IMAGE));
    expect(image).not.toBe("https://cdn.example.com/colorado-state.jpg");
    expect(image).not.toContain(HOME_HERO_IMAGE);
  });

  it("never falls back to state hero on destination city routes", () => {
    const image = resolveHeroImageForRoute({
      route: "/destinations/states/colorado/cities/denver",
      city: { heroImages: [] },
      state: { heroImage: "https://cdn.example.com/colorado-state.jpg" },
    });

    expect(image).toBe(buildImageUrl(CITY_PLACEHOLDER_HERO_IMAGE));
    expect(image).not.toBe("https://cdn.example.com/colorado-state.jpg");
  });

  it("never resolves homepage hero for non-home city routes", () => {
    const image = resolveHeroImageForRoute({
      route: "/destinations/world/france/cities/paris",
      city: { heroImages: [HOME_HERO_IMAGE] },
      state: { heroImage: "https://cdn.example.com/france-state.jpg" },
    });

    expect(image).toBe(buildImageUrl(CITY_PLACEHOLDER_HERO_IMAGE));
    expect(image).not.toContain(HOME_HERO_IMAGE);
  });
});
