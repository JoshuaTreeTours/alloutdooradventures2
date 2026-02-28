import { describe, expect, it } from "vitest";

import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import { mapViatorToEngine3ViewModel } from "./mapViatorToEngine3ViewModel";

const LOCKED_HERO_URL_6740 =
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

    expect(viewModel.primaryImageUrl).toBe(LOCKED_HERO_URL_6740);
    expect(viewModel.heroImageUrl).toBe(LOCKED_HERO_URL_6740);
  });

  it("keeps San Andreas 2335P1 hero deterministic and defined", () => {
    const viewModel = mapViatorToEngine3ViewModel(
      {
        ...baseTour,
        id: "2335P1",
        name: "San Andreas Fault Jeep Tour from Palm Springs",
        slug: "san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
        seo: {
          ...baseTour.seo,
          canonicalPath:
            "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
        },
      },
      {
        sourceUrl: "https://www.viator.com/tours/example",
        productCode: "2335P1",
        title: "San Andreas Fault Jeep Tour from Palm Springs",
        duration: "3 hours",
      }
    );

    expect(viewModel.primaryImageUrl).toBeDefined();
    expect(viewModel.heroImageUrl).toBe(viewModel.primaryImageUrl);
  });

  it("applies exactly 5 curated FAQs for 2335P1", () => {
    const viewModel = mapViatorToEngine3ViewModel(
      {
        ...baseTour,
        id: "2335P1",
        name: "San Andreas Fault Jeep Tour from Palm Springs",
        slug: "san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
        seo: {
          ...baseTour.seo,
          canonicalPath:
            "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
        },
      },
      {
        sourceUrl: "https://www.viator.com/tours/example",
        productCode: "2335P1",
        title: "San Andreas Fault Jeep Tour from Palm Springs",
        faqs: [
          { question: "How long is this tour?", answer: "About 3 hours." },
        ],
      }
    );

    expect(viewModel.faqs).toHaveLength(5);
    expect(viewModel.faqs?.[0]?.question).toContain("cancellation policy");
  });

  it("normalizes and limits FAQs to 5 for 3351P15", () => {
    const viewModel = mapViatorToEngine3ViewModel(
      {
        ...baseTour,
        id: "3351P15",
        name: "Palm Springs Indian Canyons Bike and Hike",
        slug: "palm-springs-indian-canyons-bike-and-hike-3351p15",
        seo: {
          ...baseTour.seo,
          canonicalPath:
            "/destinations/california/palm-springs/tours/palm-springs-indian-canyons-bike-and-hike-3351p15",
        },
      },
      {
        sourceUrl: "https://www.viator.com/tours/example",
        productCode: "3351P15",
        title: "Palm Springs Indian Canyons Bike and Hike",
      }
    );

    expect(viewModel.faqs).toHaveLength(5);
  });

  it("generates a 100-120 word overview with itinerary facts", () => {
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
      itinerary: [
        { title: "Keys View" },
        { title: "Barker Dam Trail" },
        { title: "Cap Rock Trail" },
      ],
      meetingPointDescription: "Palm Desert Visitor Center",
    });

    const words = viewModel.description.split(/\s+/).filter(Boolean).length;
    expect(words).toBeGreaterThanOrEqual(100);
    expect(words).toBeLessThanOrEqual(120);
    expect(viewModel.description).toContain("After meeting in Palm Desert");
    expect(viewModel.description).toContain("Keys View");
    expect(viewModel.description.toLowerCase()).not.toContain("confirmation");
  });
});
