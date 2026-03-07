import { describe, expect, it } from "vitest";

import { resolveEngine4ViatorHero } from "./resolveEngine4ViatorHero";

describe("resolveEngine4ViatorHero", () => {
  it("prefers explicit API primary/cover image fields first", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "74828P5",
      apiTour: {
        productCode: "74828P5",
        title: "Aspen East End Light Hike",
        sourceUrl:
          "https://www.viator.com/tours/Aspen/Aspen-East-End-Light-Hike/d26395-74828P5",
        primaryImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/31/aa/bb/cc/official-primary.jpg?w=1100&h=800&s=1",
        rawProductPayload: {
          coverImageUrl:
            "https://dynamic-media.tacdn.com/media/photo-o/31/aa/bb/cc/cover.jpg?w=1100&h=800&s=1",
        },
      },
    });

    expect(hero).toContain("official-primary.jpg");
  });

  it("rejects steering-wheel/review/traveler images and picks official product image", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "335698P13",
      apiTour: {
        productCode: "335698P13",
        title: "Rock Scrambling Adventures in Joshua Tree National Park",
        sourceUrl:
          "https://www.viator.com/tours/Palm-Springs/Rock-Scrambling-Adventures-in-Joshua-Tree-National-Park/d648-335698P13",
        primaryImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/11/22/33/44/traveler-steering-wheel.jpg?w=1100&h=800&s=1",
        rawProductPayload: {
          images: [
            {
              imageType: "TravelerPhoto",
              variants: {
                large: {
                  url: "https://dynamic-media.tacdn.com/media/photo-o/11/22/33/45/review-photo.jpg?w=1100&h=800&s=1",
                },
              },
            },
            {
              imageType: "Product",
              variants: {
                large: {
                  url: "https://dynamic-media.tacdn.com/media/photo-o/2f/3a/6c/2d/caption.jpg?w=1100&h=800&s=1",
                },
              },
            },
          ],
        },
      },
    });

    expect(hero).toContain("/2f/3a/6c/2d/caption.jpg");
    expect(hero).not.toContain("steering-wheel");
    expect(hero).not.toContain("review-photo");
  });

  it("uses source-derived hero when API images are invalid", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "335698P13",
      apiTour: {
        productCode: "335698P13",
        title: "Rock Scrambling Adventures in Joshua Tree National Park",
        sourceUrl:
          "https://www.viator.com/tours/Palm-Springs/Rock-Scrambling-Adventures-in-Joshua-Tree-National-Park/d648-335698P13",
        primaryImageUrl: "https://example.com/not-tacdn.jpg",
        galleryImages: [
          "https://dynamic-media.tacdn.com/media/photo-l/11/22/33/44/thumb.jpg?w=100&h=100",
        ],
        sourceDerivedImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/2f/3a/6c/2d/caption.jpg?w=1100&h=800&s=1",
      },
    });

    expect(hero).toContain("/2f/3a/6c/2d/caption.jpg");
  });

  it("falls back to inline placeholder when no valid product hero exists", () => {
    const hero = resolveEngine4ViatorHero({
      productCode: "99999P2",
      apiTour: {
        productCode: "99999P2",
        title: "Other Tour",
        sourceUrl: "https://www.viator.com/tours/Other/example/d123-99999P2",
        primaryImageUrl: "javascript:alert(1)",
        galleryImages: [
          "https://media.tacdn.com/media/photo-s/1x1.jpg?w=1&h=1",
          "https://media.tacdn.com/media/photo-l/abc/def/thumb.jpg?w=99&h=99",
        ],
      },
    });

    expect(hero).toContain("data:image/svg+xml");
  });
});
