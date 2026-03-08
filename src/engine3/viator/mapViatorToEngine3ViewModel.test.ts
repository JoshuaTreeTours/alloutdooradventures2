import { describe, expect, it } from "vitest";

import type { Engine2Tour } from "../../engine2/data/loadEngine2";
import { mapViatorToEngine3ViewModel } from "./mapViatorToEngine3ViewModel";

const LARGEST_VIATOR_IMAGE =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1600&h=1200&s=1";

const baseTour: Engine2Tour = {
  id: "6740P7",
  engine: "engine3",
  bookingProvider: "viator",
  bookingUrl: "https://www.viator.com/tours/example",
  sourceCitySlug: "palm-springs",
  slug: "joshua-tree-backroads-hummer-h2-tour-6740p7",
  name: "Joshua Tree Backroads Hummer H2 Tour",
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
      "/destinations/california/palm-springs/tours/joshua-tree-backroads-hummer-h2-tour-6740p7",
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
  it("uses the largest Viator image as the primary hero for 6740P7", () => {
    const viewModel = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl: "https://www.viator.com/tours/example",
      productCode: "6740P7",
      title: "Joshua Tree Backroads Hummer H2 Tour",
      imageCandidates: [
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=800&h=600&s=1",
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1600&h=1200&s=1",
        "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/38/e2/6e.jpg",
      ],
      supplierImage:
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
      duration: "3 hours",
      highlights: [
        "Drive through desert washes",
        "Stop at Joshua Tree viewpoints",
        "Learn geology with a guide",
      ],
      included: ["Professional guide", "Bottled water"],
    });

    expect(viewModel.primaryImageUrl).toBe(LARGEST_VIATOR_IMAGE);
    expect(viewModel.content?.images?.[0]).toBe(LARGEST_VIATOR_IMAGE);
    expect(viewModel.heroImageUrl).toBe(LARGEST_VIATOR_IMAGE);
    expect(viewModel.heroImage).toBe(LARGEST_VIATOR_IMAGE);
    expect(viewModel.bookingUrl).toContain("pid=P00290915");
    expect(viewModel.bookingUrl).toContain("mcid=42383");
    expect(viewModel.bookingUrl).toContain("medium=link");
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

  it("uses 6740P7 meeting/pickup override when API meeting fields are missing", () => {
    const viewModel = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl:
        "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Backroads-Hummer-H2-Tour/d648-6740P7",
      productCode: "6740P7",
      title: "Joshua Tree Backroads Hummer H2 Tour",
    });

    expect(viewModel.meetingPointDescription).toBe(
      "Palm Springs Art Museum (101 N Museum Dr) — daily at 8:30 a.m."
    );
    expect(viewModel.meetingPointName).toBe("Palm Springs Art Museum");
    expect(viewModel.meetingPointAddress).toBe("101 N Museum Dr");
    expect(viewModel.departureTimeLabel).toBe("daily at 8:30 a.m.");
  });

  it("maps normalized overview/highlights/inclusions/exclusions from Viator content", () => {
    const viewModel = mapViatorToEngine3ViewModel(baseTour, {
      sourceUrl: "https://www.viator.com/tours/example",
      productCode: "6740P7",
      title: "Joshua Tree Backroads Hummer H2 Tour",
      description:
        "<p>You'll travel with a guide through desert terrain and geology-focused areas near Palm Springs.</p><p>The operator provides route context and scheduled stops during the experience.</p>",
      highlights: [
        "Drive through desert washes",
        "Drive through desert washes",
        "Stop at Joshua Tree viewpoints",
      ],
      inclusions: ["Guide", "Guide", "Bottled water"],
      exclusions: ["Gratuities", "Gratuities"],
    });

    expect(viewModel.overview).toContain(
      "Joshua Tree Backroads Hummer H2 Tour"
    );
    expect(viewModel.overview?.split(/\s+/).length).toBeGreaterThanOrEqual(100);
    expect(viewModel.highlights).toEqual([
      "Drive through desert washes",
      "Stop at Joshua Tree viewpoints",
      "Scenic desert views",
    ]);
    expect(viewModel.inclusions).toEqual(["Guide", "Bottled water"]);
    expect(viewModel.exclusions).toEqual(["Gratuities"]);
  });
});
