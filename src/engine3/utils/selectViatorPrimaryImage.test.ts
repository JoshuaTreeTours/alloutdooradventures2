import { describe, expect, it } from "vitest";

import {
  scoreViatorPrimaryImage,
  selectViatorPrimaryImage,
} from "./selectViatorPrimaryImage";

describe("selectViatorPrimaryImage", () => {
  it("picks larger TACDN image over smaller TACDN image", () => {
    const selected = selectViatorPrimaryImage({
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

    expect(scoreViatorPrimaryImage(junk)).toBe(-9999);

    const selected = selectViatorPrimaryImage({
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
    const selected = selectViatorPrimaryImage({
      imageUrls: [
        "https://cache.vtrcdn.com/orion/images/globalNav/fallback-top-activities_100x100.webp",
      ],
      fallbackImageUrl: "/hero.jpg",
    });

    expect(selected).toBe("/hero.jpg");
  });

  it("normalizes protocol-relative TACDN URLs", () => {
    const selected = selectViatorPrimaryImage({
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
