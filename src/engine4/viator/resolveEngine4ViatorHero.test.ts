import { describe, expect, it } from "vitest";

import { resolveEngine4ViatorHero } from "./resolveEngine4ViatorHero";

describe("resolveEngine4ViatorHero", () => {
  it("prefers API primary image over gallery", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "74828P5",
      apiTour: {
        productCode: "74828P5",
        title: "Aspen East End Light Hike",
        sourceUrl: "https://www.viator.com/tours/Aspen/example/d26395-74828P5",
        primaryImageUrl:
          "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/8a/ad/05.jpg",
        galleryImages: [
          "https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg",
        ],
      },
    });

    expect(hero).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/11/8a/ad/05.jpg"
    );
  });

  it("accepts dynamic-media caption.jpg URLs", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "74828P5",
      apiTour: {
        productCode: "74828P5",
        title: "Aspen East End Light Hike",
        sourceUrl: "https://www.viator.com/tours/Aspen/example/d26395-74828P5",
        primaryImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
      },
    });

    expect(hero).toContain("dynamic-media.tacdn.com");
    expect(hero).toContain("caption.jpg");
  });

  it("does not leak per-tour override across other product codes", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "99999P1",
      apiTour: {
        productCode: "99999P1",
        title: "Other Tour",
        sourceUrl: "https://www.viator.com/tours/Other/example/d123-99999P1",
        primaryImageUrl: "https://example.com/other-primary.jpg",
      },
    });

    expect(hero).toBe("https://example.com/other-primary.jpg");
  });
});
