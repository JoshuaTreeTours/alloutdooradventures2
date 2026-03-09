import { describe, expect, it } from "vitest";

import { mapViatorToEngine5Tour } from "./mapViatorToEngine5Tour";
import {
  ENGINE5_PROOF_TOUR_PATH,
  ENGINE5_PROOF_TOUR_SLUG,
} from "../routes";
import { engine5ProofViatorRecord } from "./record";

describe("mapViatorToEngine5Tour", () => {
  it("builds one normalized object and reuses canonical hero everywhere", () => {
    const mapped = mapViatorToEngine5Tour(engine5ProofViatorRecord, {
      productCode: "132218P209",
      title: "Yosemite and Kings Canyon 2-Day Tour from LA",
      bookingUrl:
        "https://www.viator.com/tours/Los-Angeles/example/d645-132218P209",
      description: "Two-day guided trip from Los Angeles.",
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
      },
      provenance: {
        apiFetchAttempted: true,
        apiFetchSucceeded: true,
        descriptionSource: "api",
      },
    });

    expect(mapped.normalized.slug).toBe(
      "yosemite-and-kings-canyon-2-day-tour-from-la"
    );
    expect(mapped.page.title).toContain("Yosemite");
    expect(mapped.page.facts.duration).toBeUndefined();
    expect(mapped.page.content.overview).toContain("Two-day guided trip");
    expect(mapped.page.bookingUrl).toContain("132218P209");
    expect(mapped.page.canonicalPath).toBe(
      "/engine5/california/los-angeles/tours/yosemite-and-kings-canyon-2-day-tour-from-la"
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
  });

  it("throws when canonical hero is missing to avoid cross-tour contamination", () => {
    expect(() =>
      mapViatorToEngine5Tour(engine5ProofViatorRecord, {
        productCode: "132218P209",
        title: "Yosemite and Kings Canyon 2-Day Tour from LA",
        bookingUrl:
          "https://www.viator.com/tours/Los-Angeles/example/d645-132218P209",
        description: "Two-day guided trip from Los Angeles.",
        itinerary: [],
        highlights: [],
        faqs: [],
        inclusions: [],
        exclusions: [],
        additionalInfo: [],
        exactProductImages: [],
        canonicalHeroUrl: undefined,
        heroSelectionSource: "missing",
        heroSelectionDiagnostics: { candidateUrls: [] },
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
      "best-yosemite-national-park-and-kings-canyon-national-park-2-day-tour-from-la"
    );
    expect(ENGINE5_PROOF_TOUR_PATH).toBe(
      "/engine5/california/los-angeles/tours/best-yosemite-national-park-and-kings-canyon-national-park-2-day-tour-from-la"
    );
  });
});
