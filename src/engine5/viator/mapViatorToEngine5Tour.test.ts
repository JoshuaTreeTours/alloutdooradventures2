import { describe, expect, it } from "vitest";

import { mapViatorToEngine5Tour } from "./mapViatorToEngine5Tour";
import { engine5ProofViatorRecord } from "./record";

describe("mapViatorToEngine5Tour", () => {
  it("uses title-derived slug and api media for page and listing", () => {
    const mapped = mapViatorToEngine5Tour(engine5ProofViatorRecord, {
      productCode: "132218P209",
      title: "Yosemite and Kings Canyon 2-Day Tour from LA",
      sourceUrl:
        "https://www.viator.com/tours/Los-Angeles/example/d645-132218P209",
      description: "Two-day guided trip from Los Angeles.",
      primaryImageUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/11/22/caption.jpg",
      galleryImages: [
        "https://dynamic-media.tacdn.com/media/photo-o/11/22/caption.jpg",
      ],
      itinerary: [],
      inclusions: [],
      exclusions: [],
      additionalInfo: [],
      provenance: {
        apiFetchAttempted: true,
        apiFetchSucceeded: true,
        heroImageSource: "api",
        listingImageSource: "api",
        descriptionSource: "api",
      },
    });

    expect(mapped.page.slug).toBe(
      "yosemite-and-kings-canyon-2-day-tour-from-la"
    );
    expect(mapped.page.canonicalPath).toBe(
      "/destinations/california/los-angeles/tours/yosemite-and-kings-canyon-2-day-tour-from-la"
    );
    expect(mapped.page.heroImage).toContain("dynamic-media.tacdn.com");
    expect(mapped.listing.heroImage).toContain("dynamic-media.tacdn.com");
  });
});
