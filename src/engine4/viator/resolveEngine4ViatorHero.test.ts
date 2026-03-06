import { describe, expect, it } from "vitest";

import { resolveEngine4ViatorHero } from "./resolveEngine4ViatorHero";

describe("resolveEngine4ViatorHero", () => {
  it("prefers source-code TACDN image over API media fields", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "74828P5",
      apiTour: {
        productCode: "74828P5",
        title: "Aspen East End Light Hike",
        sourceUrl:
          "https://www.viator.com/tours/Aspen/Aspen-East-End-Light-Hike/d26395-74828P5",
        sourceDerivedImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/30/70/d3/6d/caption.jpg?w=1100&h=800&s=1",
        primaryImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/11/99/80/41/api-primary.jpg?w=1100&h=800&s=1",
        galleryImages: [
          "https://dynamic-media.tacdn.com/media/photo-o/11/99/80/42/api-gallery.jpg?w=1100&h=800&s=1",
        ],
      },
    });
    expect(hero).toContain("30/70/d3/6d/caption.jpg");
    expect(hero).not.toContain("api-primary.jpg");
  });

  it("falls back to approved record hero when source-code TACDN image is missing", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "74828P5",
      apiTour: {
        productCode: "74828P5",
        title: "Aspen East End Light Hike",
        sourceUrl:
          "https://www.viator.com/tours/Aspen/Aspen-East-End-Light-Hike/d26395-74828P5",
        primaryImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/11/99/80/41/api-primary.jpg?w=1100&h=800&s=1",
      },
    });

    expect(hero).toContain("11/8a/ad/05.jpg");
  });

  it("rejects non-http or tracker pixel values", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "99999P2",
      apiTour: {
        productCode: "99999P2",
        title: "Other Tour",
        sourceUrl: "https://www.viator.com/tours/Other/example/d123-99999P2",
        sourceDerivedImageUrl: "javascript:alert(1)",
      },
    });

    expect(hero).toContain("data:image/svg+xml");
  });
});
