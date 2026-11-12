import { describe, expect, it } from "vitest";

import { mapViatorToEngine5Tour } from "./mapViatorToEngine5Tour";
import { ENGINE5_PROOF_TOUR_PATH, ENGINE5_PROOF_TOUR_SLUG } from "../routes";
import { engine5ProofViatorRecord } from "./record";

describe("mapViatorToEngine5Tour", () => {
  it("builds one normalized object and reuses canonical hero everywhere", () => {
    const mapped = mapViatorToEngine5Tour(engine5ProofViatorRecord, {
      productCode: "163873P16",
      title: "East Zion Top of the World Jeep Tour",
      bookingUrl:
        "https://www.viator.com/tours/Utah/East-Zion-Top-of-the-World-Jeep-Tour/d785-163873P16",
      description: "Guided East Zion backcountry jeep tour.",
      itinerary: [],
      highlights: ["Top of the World overlook"],
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

    expect(mapped.normalized.slug).toBe("east-zion-top-of-the-world-jeep-tour");
    expect(mapped.page.title).toContain("East Zion");
    expect(mapped.page.facts.duration).toBeUndefined();
    expect(mapped.page.content.overview).toContain("backcountry jeep tour");
    expect(mapped.page.bookingUrl).toContain("163873P16");
    expect(mapped.page.canonicalPath).toBe(
      "/engine5/utah/springdale/tours/east-zion-top-of-the-world-jeep-tour"
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
        productCode: "163873P16",
        title: "East Zion Top of the World Jeep Tour",
        bookingUrl:
          "https://www.viator.com/tours/Utah/East-Zion-Top-of-the-World-Jeep-Tour/d785-163873P16",
        description: "Guided East Zion backcountry jeep tour.",
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
      "east-zion-top-of-the-world-jeep-tour"
    );
    expect(ENGINE5_PROOF_TOUR_PATH).toBe(
      "/engine5/utah/springdale/tours/east-zion-top-of-the-world-jeep-tour"
    );
  });
});
