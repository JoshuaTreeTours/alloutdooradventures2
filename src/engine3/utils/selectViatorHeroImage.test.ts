import { describe, expect, it } from "vitest";

import { scoreImage, selectViatorHeroImage } from "./selectViatorHeroImage";

describe("selectViatorHeroImage", () => {
  it("picks larger TACDN image over smaller TACDN image", () => {
    const selected = selectViatorHeroImage({
      title: "Joshua Tree Hummer Adventure",
      city: "Palm Springs",
      state: "California",
      imageUrls: [
        "https://media.tacdn.com/media/attractions-splice-spp-360x240/06/e0/2f/52.jpg",
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e0/2f/52.jpg",
      ],
      fallbackImageUrl: "/hero.jpg",
    });

    expect(selected).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e0/2f/52.jpg"
    );
  });

  it("rejects global nav junk image", () => {
    const junk =
      "https://cache.vtrcdn.com/orion/images/globalNav/fallback-top-activities_100x100.webp";

    expect(scoreImage(junk)).toBe(-9999);

    const selected = selectViatorHeroImage({
      title: "Joshua Tree Hummer Adventure",
      primaryImageUrl: junk,
      imageUrls: [
        junk,
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e0/2f/52.jpg",
      ],
      fallbackImageUrl: "/hero.jpg",
    });

    expect(selected).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e0/2f/52.jpg"
    );
  });

  it("returns fallback when only junk candidates exist", () => {
    const selected = selectViatorHeroImage({
      title: "Joshua Tree Hummer Adventure",
      imageUrls: [
        "https://cache.vtrcdn.com/orion/images/globalNav/fallback-top-activities_100x100.webp",
      ],
      fallbackImageUrl: "/hero.jpg",
    });

    expect(selected).toBe("/hero.jpg");
  });

  it("normalizes protocol-relative TACDN URLs", () => {
    const selected = selectViatorHeroImage({
      title: "Joshua Tree Hummer Adventure",
      imageUrls: [
        "//media.tacdn.com/media/attractions-splice-spp-674x446/06/e0/2f/52.jpg",
      ],
      fallbackImageUrl: "/hero.jpg",
    });

    expect(selected).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e0/2f/52.jpg"
    );
  });
});
