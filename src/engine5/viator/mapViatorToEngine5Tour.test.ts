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
      itinerary: [],
      highlights: ["Visit Yosemite Valley"],
      faqs: [{ question: "Meals?", answer: "Not included" }],
      inclusions: [],
      exclusions: [],
      additionalInfo: [],
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
    expect(mapped.page.facts.duration).toBeUndefined();
    expect(mapped.page.content.overview).toContain(
      "Hawaii Volcanoes National Park"
    );
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
