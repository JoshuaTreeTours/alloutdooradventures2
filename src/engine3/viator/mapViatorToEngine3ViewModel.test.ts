import { describe, expect, it } from "vitest";

import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import { mapViatorToEngine3ViewModel } from "./mapViatorToEngine3ViewModel";

const baseTour: Engine2Tour = {
  id: "6740JTREE",
  engine: "engine3",
  bookingProvider: "viator",
  sourceCitySlug: "palm-springs",
  slug: "joshua-tree-hummer-adventure-from-palm-desert-6740jtree",
  name: "Joshua Tree Hummer Adventure from Palm Desert",
  provider: { name: "Viator Partner", shortName: "viator" },
  geo: {
    country: "United States",
    region: "California",
    city: "Palm Springs",
    lat: null,
    lng: null,
  },
  seo: {
    title: "Joshua Tree Hummer Adventure",
    description: "desc",
    canonicalPath:
      "/destinations/california/palm-springs/tours/joshua-tree-hummer-adventure-from-palm-desert-6740jtree",
    ogImage: "https://cdn.example.com/seo.jpg",
  },
  content: {
    experienceText: "text",
    highlights: ["Guided Hummer ride into Joshua Tree region"],
  },
  images: {
    hero: "https://cdn.example.com/fallback.jpg",
    gallery: [],
  },
  booking: {
    bookingUrl: "https://www.viator.com/tours/example",
  },
};

describe("mapViatorToEngine3ViewModel", () => {
  it("prefers TACDN hero image and builds alt text with city/state", () => {
    const model = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl: "https://www.viator.com/tours/example",
      productCode: "6740JTREE",
      title: "Joshua Tree Hummer Adventure from Palm Desert",
      supplierImage:
        "https://cache.vtrcdn.com/orion/images/globalNav/fallback-top-activities_100x100.webp",
      imageUrls: [
        "https://media.tacdn.com/media/attractions-splice-spp-360x240/06/e0/2f/52.jpg",
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e0/2f/52.jpg",
      ],
    });

    expect(model.primaryImageUrl).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e0/2f/52.jpg"
    );
    expect(model.primaryImageAlt).toBe(
      "Joshua Tree Hummer Adventure from Palm Desert — Palm Springs, California"
    );
  });

  it("flattens srcSet style image strings", () => {
    const model = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl: "https://www.viator.com/tours/example",
      productCode: "6740JTREE",
      title: "Joshua Tree Hummer Adventure from Palm Desert",
      imageUrls: [
        "https://media.tacdn.com/media/attractions-splice-spp-360x240/06/e0/2f/52.jpg 1x, https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e0/2f/52.jpg 2x",
      ],
    });

    expect(model.primaryImageUrl).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/e0/2f/52.jpg"
    );
  });
});
