import { describe, expect, it, vi } from "vitest";

import { resolveEngine5Tour } from "./resolveEngine5Tour";
import { engine5ProofViatorRecord } from "./record";

vi.mock("./getEngine5ViatorTourData", () => ({
  getEngine5ViatorTourData: vi.fn(async () => ({
    productCode: "11069P1",
    title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
    bookingUrl:
      "https://www.viator.com/tours/Big-Island-of-Hawaii/example/d669-11069P1",
    description: "Volcanoes eco tour",
    fromPrice: "$299",
    duration: "10 hours",
    rating: 5,
    reviewCount: 44,
    meetingPoint: "Hilo Harbor, Hawaii",
    cancellationPolicy: "Free cancellation up to 24 hours before start",
    highlights: ["Explore volcanoes"],
    faqs: [{ question: "Food included?", answer: "Snacks included" }],
    itinerary: [],
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

describe("resolveEngine5Tour", () => {
  it("returns Engine4 tour contract fields from one Engine5 resolution", async () => {
    const resolved = await resolveEngine5Tour(engine5ProofViatorRecord);

    expect(resolved.tour.tourId).toBe("engine5-11069P1");
    expect(resolved.tour.canonicalPath).toContain(
      "/destinations/hawaii/hilo/tours/"
    );
    expect(resolved.tour.facts.priceFrom).toBe("$299");
    expect(resolved.tour.facts.meetingPointShort).toBe("Hilo Harbor");
    expect(resolved.tour.facts.duration).toBe("10 hours");
    expect(resolved.tour.content.itinerary).toEqual([]);
    expect(resolved.tour.content.faqs.length).toBe(1);
    expect(resolved.apiTour.fromPrice).toBe("$299");
    expect(resolved.listing.productCode).toBe("11069P1");
    expect(resolved.normalized.diagnostics.allImageSurfacesIdentical).toBe(
      true
    );
  });
});
