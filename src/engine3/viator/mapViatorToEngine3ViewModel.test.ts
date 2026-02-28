import { describe, expect, it } from "vitest";

import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import { mapViatorToEngine3ViewModel } from "./mapViatorToEngine3ViewModel";

const LOCKED_HERO_URL =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1";

const baseTour: Engine2Tour = {
  id: "6740JTREE",
  engine: "engine3",
  bookingProvider: "viator",
  bookingUrl: "https://www.viator.com/tours/example",
  sourceCitySlug: "palm-springs",
  slug: "joshua-tree-hummer-adventure-from-palm-desert-6740jtree",
  name: "Joshua Tree Hummer Adventure from Palm Desert",
  provider: {
    name: "Desert Adventures",
    shortName: "desert-adventures",
  },
  geo: {
    country: "United States",
    region: "California",
    city: "Palm Springs",
    lat: 33.7,
    lng: -116.3,
  },
  seo: {
    title: "Joshua Tree Hummer Adventure",
    description: "",
    canonicalPath:
      "/destinations/california/palm-springs/tours/joshua-tree-hummer-adventure-from-palm-desert-6740jtree",
    ogImage: "",
  },
  content: {
    experienceText: "",
    highlights: ["Scenic desert views"],
    duration: "3 hours",
  },
  images: {
    hero: "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/e2/6e.jpg",
    gallery: [],
  },
  booking: {
    bookingUrl: "https://www.viator.com/tours/example",
  },
};

describe("mapViatorToEngine3ViewModel", () => {
  it("locks 6740JTREE primary/hero image to the known-good override URL", () => {
    const viewModel = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl: "https://www.viator.com/tours/example",
      productCode: "6740JTREE",
      title: "Joshua Tree Hummer Adventure from Palm Desert",
      imageCandidates: [
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/e2/6e.jpg",
        "https://cache.vtrcdn.com/pictures/12345.jpg",
      ],
      supplierImage:
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/e2/6e.jpg",
      duration: "3 hours",
      highlights: [
        "Drive through desert washes",
        "Stop at Joshua Tree viewpoints",
        "Learn geology with a guide",
      ],
      included: ["Professional guide", "Bottled water"],
    });

    expect(viewModel.primaryImageUrl).toBe(LOCKED_HERO_URL);
    expect(viewModel.heroImageUrl).toBe(LOCKED_HERO_URL);
  });

  it("generates a 100-120 word overview", () => {
    const viewModel = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl: "https://www.viator.com/tours/example",
      productCode: "6740JTREE",
      title: "Joshua Tree Hummer Adventure from Palm Desert",
      duration: "3 hours",
      highlights: [
        "Drive through desert washes",
        "Stop at Joshua Tree viewpoints",
        "Learn geology with a guide",
      ],
      included: ["Professional guide", "Bottled water"],
      meetingPointDescription:
        "Palm Desert departure details appear in booking confirmation",
    });

    const words = viewModel.description.split(/\s+/).filter(Boolean).length;
    expect(words).toBeGreaterThanOrEqual(100);
    expect(words).toBeLessThanOrEqual(120);
  });
});
