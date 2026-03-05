import { describe, expect, it } from "vitest";

import { resolveEngine4ViatorHero } from "./resolveEngine4ViatorHero";

describe("resolveEngine4ViatorHero", () => {
  it("prefers stored per-tour hero first", () => {
    const hero = resolveEngine4ViatorHero({ productCode: "74828P5" });
    expect(hero).toContain("11/8a/ad/05.jpg");
  });

  it("accepts dynamic-media caption.jpg URLs", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "99999P1",
      apiTour: {
        productCode: "99999P1",
        title: "Other Tour",
        sourceUrl: "https://www.viator.com/tours/Other/example/d123-99999P1",
        primaryImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
      },
    });

    expect(hero).toContain("dynamic-media.tacdn.com");
  });

  it("accepts media.tacdn.com image URLs", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "99999P3",
      apiTour: {
        productCode: "99999P3",
        title: "Other Tour",
        sourceUrl: "https://www.viator.com/tours/Other/example/d123-99999P3",
        primaryImageUrl:
          "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/e2/6e.jpg",
      },
    });

    expect(hero).toContain("media.tacdn.com");
  });

  it("rejects non-http or tracker pixel values", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "99999P2",
      apiTour: {
        productCode: "99999P2",
        title: "Other Tour",
        sourceUrl: "https://www.viator.com/tours/Other/example/d123-99999P2",
        primaryImageUrl: "javascript:alert(1)",
        galleryImages: [
          "https://media.tacdn.com/media/photo-o/1x1.jpg?w=1&h=1",
        ],
      },
    });

    expect(hero).toContain("data:image/svg+xml");
  });
});
