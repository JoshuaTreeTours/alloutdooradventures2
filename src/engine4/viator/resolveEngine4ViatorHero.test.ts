import { describe, expect, it } from "vitest";

import {
  ENGINE4_VIATOR_PLACEHOLDER_HERO,
  resolveEngine4ViatorHero,
} from "./resolveEngine4ViatorHero";

describe("resolveEngine4ViatorHero", () => {
  it("uses Viator page source caption image before API primary and gallery", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "74828P4",
      apiTour: {
        productCode: "74828P4",
        title: "Aspen’s Off the Beaten Path Tour",
        sourceUrl:
          "https://www.viator.com/tours/Aspen/Aspens-Off-the-Beaten-Path-Tour/d26395-74828P4",
        sourceDerivedImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
        primaryImageUrl:
          "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/8a/ad/05.jpg",
        galleryImages: [
          "https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg",
        ],
      },
    });

    expect(hero).toContain("tacdn");
    expect(hero).toContain("caption.jpg");
    expect(hero).toContain("dynamic-media.tacdn.com");
  });

  it("accepts media.tacdn caption.jpg URLs from source HTML", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "74828P4",
      apiTour: {
        productCode: "74828P4",
        title: "Aspen’s Off the Beaten Path Tour",
        sourceUrl: "https://www.viator.com/tours/Aspen/example/d26395-74828P4",
        sourceDerivedImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
      },
    });

    expect(hero).toContain("caption.jpg");
  });

  it("does not leak Palm Springs-style hero onto Aspen tours", () => {
    const palmSpringsImage =
      "https://cdn.example.com/images/palm-springs-desert-jeep.jpg";

    const hero = resolveEngine4ViatorHero({
      productCode: "74828P4",
      apiTour: {
        productCode: "74828P4",
        title: "Aspen’s Off the Beaten Path Tour",
        sourceUrl:
          "https://www.viator.com/tours/Aspen/Aspens-Off-the-Beaten-Path-Tour/d26395-74828P4",
        sourceDerivedImageUrl:
          "https://media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg",
        primaryImageUrl: palmSpringsImage,
      },
    });

    expect(hero).not.toBe(palmSpringsImage);
    expect(hero).toContain("tacdn");
    expect(hero).toContain("caption.jpg");
  });

  it("falls back to placeholder when all sources are invalid", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "99999P1",
      apiTour: {
        productCode: "99999P1",
        title: "Other Tour",
        sourceUrl: "https://www.viator.com/tours/Other/example/d123-99999P1",
        sourceDerivedImageUrl: "https://example.com/not-caption.jpg",
      },
    });

    expect(hero).toBe(ENGINE4_VIATOR_PLACEHOLDER_HERO);
  });
});
