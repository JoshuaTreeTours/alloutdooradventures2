import { describe, expect, it } from "vitest";

import { mapViatorToEngine5Tour } from "./mapViatorToEngine5Tour";
import { ENGINE5_PROOF_TOUR_PATH, ENGINE5_PROOF_TOUR_SLUG } from "../routes";
import { engine5ProofViatorRecord } from "./record";

describe("mapViatorToEngine5Tour", () => {
  it("builds one normalized object and reuses canonical hero everywhere", () => {
    const mapped = mapViatorToEngine5Tour(engine5ProofViatorRecord, {
      productCode: "11069P1",
      title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
      bookingUrl:
        "https://www.viator.com/tours/Big-Island-of-Hawaii/example/d669-11069P1",
      description: "Explore Hawaii Volcanoes National Park with a guide.",
      duration: "10 hours",
      fromPrice: "$299",
      rating: 4.9,
      reviewCount: 44,
      meetingPoint: "Hilo Harbor, Hawaii",
      cancellationPolicy: "Free cancellation up to 24 hours before start",
      itinerary: [
        {
          title: "Hawaii Volcanoes National Park",
          description: "Explore volcanic landscapes",
        },
      ],
      highlights: ["Walk through lava tubes"],
      faqs: [{ question: "Meals?", answer: "Lunch not included" }],
      inclusions: ["Expert guide"],
      exclusions: ["Lunch"],
      additionalInfo: ["Wear sturdy shoes"],
      exactProductImages: [
        {
          isCover: true,
          variants: [
            {
              url: "https://dynamic-media.tacdn.com/media/photo-o/11/22/caption.jpg",
              width: 1600,
              height: 900,
            },
          ],
        },
      ],
      canonicalHeroUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/11/22/caption.jpg",
      heroSelectionSource: "api-images-payload",
      heroSelectionSize: {
        width: 1600,
        height: 900,
      },
      heroSelectionDiagnostics: {
        candidateUrls: [
          "https://dynamic-media.tacdn.com/media/photo-o/11/22/caption.jpg",
        ],
        overrideUsed: false,
      },
      provenance: {
        apiFetchAttempted: true,
        apiFetchSucceeded: true,
        descriptionSource: "api",
      },
    });

    expect(mapped.normalized.slug).toBe(
      "private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1"
    );
    expect(mapped.page.title).toContain("Hawaii Volcanoes");
    expect(mapped.page.content.overview).toContain(
      "Hawaii Volcanoes National Park"
    );
    expect(mapped.page.facts.priceFrom).toBe("$299");
    expect(mapped.page.facts.ratingValue).toBe(4.9);
    expect(mapped.page.facts.reviewCount).toBe(44);
    expect(mapped.page.facts.meetingPointShort).toBe("Hilo Harbor");
    expect(mapped.page.facts.duration).toBe("10 hours");
    expect(mapped.page.facts.cancellationPolicy).toContain("Free cancellation");
    expect(mapped.page.content.highlights).toContain("Walk through lava tubes");
    expect(mapped.page.content.faqs.length).toBeGreaterThan(0);
    expect(mapped.page.content.itinerary.length).toBeGreaterThan(0);
    expect(mapped.page.content.inclusions).toContain("Expert guide");
    expect(mapped.page.content.exclusions).toContain("Lunch");
    expect(mapped.page.content.additionalInfo).toContain("Wear sturdy shoes");
    expect(mapped.page.bookingUrl).toContain("11069P1");
    expect(mapped.page.canonicalPath).toBe(
      "/destinations/hawaii/hilo/tours/private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1"
    );
    expect(mapped.page.engine).toBe("engine4");
    expect(mapped.listing.engine).toBe("engine4");
    expect(mapped.page.heroImage).toBe(mapped.normalized.canonicalHeroUrl);
    expect(mapped.listing.heroImage).toBe(mapped.normalized.canonicalHeroUrl);
    expect(mapped.normalized.diagnostics.ogImageUrl).toBe(
      mapped.normalized.canonicalHeroUrl
    );
    expect(mapped.normalized.diagnostics.schemaImageUrl).toBe(
      mapped.normalized.canonicalHeroUrl
    );
    expect(mapped.normalized.diagnostics.allImageSurfacesIdentical).toBe(true);
    expect(mapped.normalized.diagnostics.heroSelectionSource).toBe(
      "api-images-payload"
    );
    expect(mapped.normalized.diagnostics.overrideUsed).toBe(false);
  });

  it("throws when canonical hero is missing to avoid cross-tour contamination", () => {
    expect(() =>
      mapViatorToEngine5Tour(engine5ProofViatorRecord, {
        productCode: "11069P1",
        title: "Private Tour: Hawaii Volcanoes National Park Eco Tour",
        bookingUrl:
          "https://www.viator.com/tours/Big-Island-of-Hawaii/example/d669-11069P1",
        description: "Explore Hawaii Volcanoes National Park with a guide.",
        itinerary: [],
        highlights: [],
        faqs: [],
        inclusions: [],
        exclusions: [],
        additionalInfo: [],
        exactProductImages: [],
        canonicalHeroUrl: undefined,
        heroSelectionSource: "missing",
        heroSelectionDiagnostics: { candidateUrls: [], overrideUsed: false },
        provenance: {
          apiFetchAttempted: true,
          apiFetchSucceeded: true,
          descriptionSource: "api",
        },
      })
    ).toThrow("missing canonical hero");
  });
});

describe("engine5 proof route constants", () => {
  it("exposes a real route URL for reviewers", () => {
    expect(ENGINE5_PROOF_TOUR_SLUG).toBe(
      "private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1"
    );
    expect(ENGINE5_PROOF_TOUR_PATH).toBe(
      "/destinations/hawaii/hilo/tours/private-tour-hawaii-volcanoes-national-park-eco-tour-11069p1"
    );
  });
});
