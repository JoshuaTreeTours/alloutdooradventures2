import { describe, expect, it, vi } from "vitest";

import {
  getEngine5LiveListingsByCity,
  isEngine5CanonicalTourSlug,
} from "./liveTours";

vi.mock("./getEngine5ViatorTourData", () => ({
  getEngine5ViatorTourData: vi.fn(async () => ({
    productCode: "11069P1",
    title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
    bookingUrl:
      "https://www.viator.com/tours/Big-Island-of-Hawaii/example/d669-11069P1",
    description: "Volcanoes eco tour",
    duration: "10 hours",
    startTime: "7:00 AM",
    fromPrice: "$299",
    priceCurrency: "USD",
    rating: 5,
    reviewCount: 44,
    meetingPoint: "Hilo Harbor, Hawaii",
    cancellationPolicy: "Free cancellation up to 24 hours before start",
    itinerary: [],
    highlights: ["Explore volcanoes"],
    faqs: [{ question: "Food included?", answer: "Snacks included" }],
    inclusions: [],
    exclusions: [],
    additionalInfo: [],
    exactProductImages: [
      {
        isCover: true,
        variants: [
          {
            url: "https://dynamic-media.tacdn.com/media/photo-o/cover-wide.jpg",
            width: 1600,
            height: 900,
          },
        ],
      },
    ],
    canonicalHeroUrl:
      "https://dynamic-media.tacdn.com/media/photo-o/cover-wide.jpg",
    heroSelectionSource: "api-images-payload",
    heroSelectionDiagnostics: {
      candidateUrls: [
        "https://dynamic-media.tacdn.com/media/photo-o/cover-wide.jpg",
      ],
      overrideUsed: false,
    },
    provenance: {
      apiFetchAttempted: true,
      apiFetchSucceeded: true,
      descriptionSource: "api",
    },
  })),
}));

describe("engine5 live tours", () => {
  it("detects canonical engine5 slug by state/city/product-code suffix", () => {
    expect(
      isEngine5CanonicalTourSlug(
        "hawaii",
        "hilo",
        "private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1"
      )?.productCode
    ).toBe("11069P1");
  });

  it("returns mapped listing entries for matching city", async () => {
    const entries = await getEngine5LiveListingsByCity("hawaii", "hilo");
    expect(entries.length).toBe(1);
    expect(entries[0].tour.productCode).toBe("11069P1");
    expect(entries[0].href).toContain("/destinations/hawaii/hilo/tours/");
  });
});
