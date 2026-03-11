import { describe, expect, it } from "vitest";

import {
  buildEngine4ViatorMissingHeroReport,
  ENGINE4_VIATOR_CANONICAL_HERO_BY_PRODUCT_CODE,
  resolveEngine4ViatorHero,
  resolveEngine4ViatorHeroWithDiagnostics,
} from "./resolveEngine4ViatorHero";

describe("Engine4 Viator hero governance resolver", () => {
  it("uses API image first for an exact product match", () => {
    const selectedHero = resolveEngine4ViatorHero({
      productCode: "74828P5",
      apiTour: {
        productCode: "74828P5",
        title: "Aspen East End Light Hike",
        sourceUrl:
          "https://www.viator.com/tours/Aspen/Aspen-East-End-Light-Hike/d26395-74828P5",
        primaryImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/30/70/d3/6d/caption.jpg?w=1100&h=800&s=1",
        rawProductPayload: {
          images: [
            {
              isCover: true,
              variants: [
                {
                  name: "large",
                  url: "https://dynamic-media.tacdn.com/media/photo-o/30/70/d3/6d/caption.jpg?w=1100&h=800&s=1",
                },
              ],
            },
          ],
        },
      },
    });

    const diagnostics = resolveEngine4ViatorHeroWithDiagnostics({
      productCode: "74828P5",
      apiTour: {
        productCode: "74828P5",
        title: "Aspen East End Light Hike",
        sourceUrl:
          "https://www.viator.com/tours/Aspen/Aspen-East-End-Light-Hike/d26395-74828P5",
        primaryImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/30/70/d3/6d/caption.jpg?w=1100&h=800&s=1",
        rawProductPayload: {
          images: [
            {
              isCover: true,
              variants: [
                {
                  name: "large",
                  url: "https://dynamic-media.tacdn.com/media/photo-o/30/70/d3/6d/caption.jpg?w=1100&h=800&s=1",
                },
              ],
            },
          ],
        },
      },
    });

    expect(selectedHero).toContain("30/70/d3/6d/caption.jpg");
    expect(diagnostics.selectionSource).toBe("api-images-payload");
    expect(diagnostics.overrideUsed).toBe(false);
    expect(diagnostics.resolutionStatus).toBe("ok");
  });

  it("selects the 36001P1 cover variant from exactProductImages and avoids overrides", () => {
    const diagnostics = resolveEngine4ViatorHeroWithDiagnostics({
      productCode: "36001P1",
      apiTour: {
        productCode: "36001P1",
        title: "Yosemite In A Day Tour from San Francisco",
        sourceUrl:
          "https://www.viator.com/tours/San-Francisco/Yosemite-In-A-Day-Tour-from-San-Francisco/d651-36001P1",
        exactProductImages: [
          {
            isCover: true,
            variants: [
              {
                url: "https://dynamic-media.tacdn.com/media/photo-o/2f/38/df/f6/caption.jpg?w=1100&h=800&s=1",
                width: 1100,
                height: 800,
              },
              {
                url: "https://dynamic-media.tacdn.com/media/photo-o/2f/38/df/f6/caption.jpg?w=1600&h=900&s=1",
                width: 1600,
                height: 900,
              },
            ],
          },
        ],
        primaryImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/00/00/00/00/caption.jpg?w=1100&h=800&s=1",
      },
    });

    expect(diagnostics.selectionSource).toBe("api-images-payload");
    expect(diagnostics.selectedHeroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/df/f6/caption.jpg?w=1600&h=900&s=1"
    );
    expect(diagnostics.overrideUsed).toBe(false);
    expect(diagnostics.coverImagePresent).toBe(true);
    expect(diagnostics.selectedVariantWidth).toBe(1600);
  });

  it("uses exact product override when API image is missing", () => {
    const selectedHero = resolveEngine4ViatorHero({
      productCode: "335698P13",
      apiTour: {
        productCode: "335698P13",
        title: "Rock Scrambling Adventures in Joshua Tree National Park",
        sourceUrl:
          "https://www.viator.com/tours/Palm-Springs/Rock-Scrambling-Adventures-in-Joshua-Tree-National-Park/d648-335698P13",
      },
    });

    const diagnostics = resolveEngine4ViatorHeroWithDiagnostics({
      productCode: "335698P13",
      apiTour: {
        productCode: "335698P13",
        title: "Rock Scrambling Adventures in Joshua Tree National Park",
        sourceUrl:
          "https://www.viator.com/tours/Palm-Springs/Rock-Scrambling-Adventures-in-Joshua-Tree-National-Park/d648-335698P13",
      },
    });

    expect(selectedHero).toBe(
      ENGINE4_VIATOR_CANONICAL_HERO_BY_PRODUCT_CODE["335698P13"]
    );
    expect(diagnostics.selectionSource).toBe("override");
    expect(diagnostics.overrideUsed).toBe(true);
    expect(diagnostics.resolutionStatus).toBe("ok");
  });

  it("rejects cross-product contamination and reports missing", () => {
    const diagnostics = resolveEngine4ViatorHeroWithDiagnostics({
      productCode: "74828P5",
      apiTour: {
        productCode: "335698P13",
        title: "Injected different tour",
        sourceUrl:
          "https://www.viator.com/tours/Palm-Springs/Fake/d648-335698P13",
        primaryImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1100&h=800&s=1",
      },
    });

    expect(diagnostics.contaminationBlocked).toBe(true);
    expect(diagnostics.selectionSource).toBe("missing");
    expect(diagnostics.finalSelectedHeroUrl).toBeUndefined();
    expect(() =>
      resolveEngine4ViatorHero({
        productCode: "74828P5",
        apiTour: {
          productCode: "335698P13",
          title: "Injected different tour",
          sourceUrl:
            "https://www.viator.com/tours/Palm-Springs/Fake/d648-335698P13",
          primaryImageUrl:
            "https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1100&h=800&s=1",
        },
      })
    ).toThrow(/missing canonical hero/);
  });

  it("fails loudly when neither API image nor override exist", () => {
    const diagnostics = resolveEngine4ViatorHeroWithDiagnostics({
      productCode: "99999P2",
      apiTour: {
        productCode: "99999P2",
        title: "No safe image tour",
        sourceUrl: "https://www.viator.com/tours/Other/example/d123-99999P2",
        primaryImageUrl: "javascript:alert(1)",
      },
    });

    expect(diagnostics.selectionSource).toBe("missing");
    expect(diagnostics.resolutionStatus).toBe("missing");
    expect(diagnostics.finalSelectedHeroUrl).toBeUndefined();
    expect(() =>
      resolveEngine4ViatorHero({
        productCode: "99999P2",
        apiTour: {
          productCode: "99999P2",
          title: "No safe image tour",
          sourceUrl: "https://www.viator.com/tours/Other/example/d123-99999P2",
          primaryImageUrl: "javascript:alert(1)",
        },
      })
    ).toThrow(/missing canonical hero/);
  });

  it("builds a missing-hero report for future manual vaccines", () => {
    const report = buildEngine4ViatorMissingHeroReport({
      tours: [
        {
          engine: "engine4",
          bookingProvider: "viator",
          productCode: "335698P13",
          slug: "rock-scrambling-adventures",
          bookingUrl:
            "https://www.viator.com/tours/Palm-Springs/Fake/d648-335698P13",
          heroImage: null,
          destination: {
            country: "United States",
            state: "California",
            stateSlug: "california",
            city: "Joshua Tree",
            citySlug: "joshua-tree",
          },
        },
        {
          engine: "engine4",
          bookingProvider: "viator",
          productCode: "NOHERO1",
          slug: "missing-hero",
          bookingUrl: "https://www.viator.com/tours/Nowhere/Fake/d648-NOHERO1",
          heroImage: null,
          destination: {
            country: "United States",
            state: "Utah",
            stateSlug: "utah",
            city: "Moab",
            citySlug: "moab",
          },
        },
      ],
      apiTourByProductCode: {
        "335698P13": {
          productCode: "335698P13",
          title: "Rock Scrambling Adventures in Joshua Tree National Park",
          sourceUrl:
            "https://www.viator.com/tours/Palm-Springs/Rock-Scrambling-Adventures-in-Joshua-Tree-National-Park/d648-335698P13",
        },
        NOHERO1: {
          productCode: "NOHERO1",
          title: "No Hero Tour",
          sourceUrl: "https://www.viator.com/tours/Nowhere/Fake/d648-NOHERO1",
          primaryImageUrl: "javascript:alert(1)",
        },
      },
    });

    expect(report).toEqual([
      {
        productCode: "335698P13",
        title: "Rock Scrambling Adventures in Joshua Tree National Park",
        selectedSource: "override",
        finalHero:
          "https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1100&h=800&s=1",
        needsManualOverride: false,
      },
      {
        productCode: "NOHERO1",
        title: "No Hero Tour",
        selectedSource: "missing",
        finalHero: undefined,
        needsManualOverride: true,
      },
    ]);
  });

  it("reports diagnostics for 237571P2 and falls back to override when images[] is missing", () => {
    const diagnostics = resolveEngine4ViatorHeroWithDiagnostics({
      productCode: "237571P2",
      apiTour: {
        productCode: "237571P2",
        title: "Full-Day Hike in Joshua Tree National Park",
        sourceUrl:
          "https://www.viator.com/tours/Palm-Springs/Full-Day-Hike-in-Joshua-Tree-National-Park/d648-237571P2",
        primaryImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/2f/38/d8/0b/caption.jpg?w=1100&h=800&s=1",
      },
    });

    expect(diagnostics).toEqual({
      productCode: "237571P2",
      apiImagePresent: false,
      overridePresent: true,
      overrideUsed: true,
      finalSelectedHeroUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/d8/0b/caption.jpg?w=1100&h=800&s=1",
      selectedHeroUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/d8/0b/caption.jpg?w=1100&h=800&s=1",
      selectionSource: "override",
      contaminationBlocked: false,
      resolutionStatus: "ok",
      rejectedCandidates: [
        {
          source: "api.images[]",
          reason: "images_payload_missing",
        },
        {
          url: "https://dynamic-media.tacdn.com/media/photo-o/2f/38/d8/0b/caption.jpg?w=1100&h=800&s=1",
          source: "api.images[]",
          reason: "not_from_images_payload",
        },
      ],
      acceptedCandidateReason:
        "Accepted locked per-product override because no safe exact-product images[] candidate was available.",
      apiImagesPayloadCandidates: [],
      coverImagePresent: false,
      variantCount: 0,
      selectedVariantUrl: undefined,
      selectedVariantWidth: undefined,
    });
  });

  it("rejects 237571P2 bike-tour contamination candidates from non-images fields", () => {
    const bikeTourImage =
      "https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1100&h=800&s=1";
    const trustedImagesPayloadHero =
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/d8/0b/caption.jpg?w=1100&h=800&s=1";

    const diagnostics = resolveEngine4ViatorHeroWithDiagnostics({
      productCode: "237571P2",
      apiTour: {
        productCode: "237571P2",
        title: "Full-Day Hike in Joshua Tree National Park",
        sourceUrl:
          "https://www.viator.com/tours/Palm-Springs/Full-Day-Hike-in-Joshua-Tree-National-Park/d648-237571P2",
        primaryImageUrl: bikeTourImage,
        galleryImages: [bikeTourImage],
        sourceDerivedImageUrl: bikeTourImage,
        rawProductPayload: {
          images: [
            {
              isCover: true,
              variants: [
                {
                  name: "large",
                  width: 1600,
                  height: 900,
                  url: trustedImagesPayloadHero,
                },
              ],
            },
          ],
        },
      },
    });

    expect(diagnostics.selectionSource).toBe("api-images-payload");
    expect(diagnostics.selectedHeroUrl).toBe(trustedImagesPayloadHero);
    expect(diagnostics.apiImagesPayloadCandidates).toEqual([
      trustedImagesPayloadHero,
    ]);
    expect(diagnostics.selectedHeroUrl).not.toBe(bikeTourImage);
    expect(diagnostics.rejectedCandidates).toContainEqual({
      url: bikeTourImage,
      source: "api.images[]",
      reason: "not_from_images_payload",
    });
    expect(diagnostics.coverImagePresent).toBe(true);
    expect(diagnostics.variantCount).toBe(1);
    expect(diagnostics.selectedVariantUrl).toBe(trustedImagesPayloadHero);
    expect(diagnostics.selectedVariantWidth).toBe(1600);
  });

  it("prefers cover image variant width >=1100 from exact payload", () => {
    const diagnostics = resolveEngine4ViatorHeroWithDiagnostics({
      productCode: "237571P2",
      apiTour: {
        productCode: "237571P2",
        title: "Full-Day Hike in Joshua Tree National Park",
        sourceUrl:
          "https://www.viator.com/tours/Palm-Springs/Full-Day-Hike-in-Joshua-Tree-National-Park/d648-237571P2",
        rawProductPayload: {
          images: [
            {
              isCover: true,
              variants: [
                {
                  name: "small",
                  width: 674,
                  height: 446,
                  url: "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/73/42/6d.jpg",
                },
                {
                  name: "large",
                  width: 1600,
                  height: 900,
                  url: "https://dynamic-media.tacdn.com/media/photo-o/33/00/00/01/caption.jpg?w=1600&h=900&s=1",
                },
              ],
            },
          ],
        },
      },
    });

    expect(diagnostics.selectionSource).toBe("api-images-payload");
    expect(diagnostics.selectedHeroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/33/00/00/01/caption.jpg?w=1600&h=900&s=1"
    );
    expect(diagnostics.selectedVariantWidth).toBe(1600);
  });

  it("rejects mapped candidates not present in exact images[] variants for strict product", () => {
    const diagnostics = resolveEngine4ViatorHeroWithDiagnostics({
      productCode: "237571P2",
      apiTour: {
        productCode: "237571P2",
        title: "Full-Day Hike in Joshua Tree National Park",
        sourceUrl:
          "https://www.viator.com/tours/Palm-Springs/Full-Day-Hike-in-Joshua-Tree-National-Park/d648-237571P2",
        primaryImageUrl:
          "https://dynamic-media.tacdn.com/media/photo-o/2f/38/d8/0b/caption.jpg?w=1100&h=800&s=1",
        rawProductPayload: {
          images: [
            {
              isCover: true,
              variants: [
                {
                  name: "large",
                  width: 1200,
                  height: 800,
                  url: "https://dynamic-media.tacdn.com/media/photo-o/33/00/00/02/caption.jpg?w=1200&h=800&s=1",
                },
              ],
            },
          ],
        },
      },
    });

    expect(diagnostics.selectedHeroUrl).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/33/00/00/02/caption.jpg?w=1200&h=800&s=1"
    );
    expect(diagnostics.selectedHeroUrl).not.toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/d8/0b/caption.jpg?w=1100&h=800&s=1"
    );
  });

  it("rejects low-quality payload candidates and falls back to source hero for non-strict tours", () => {
    const sourceHero =
      "https://dynamic-media.tacdn.com/media/photo-o/30/70/d3/6d/caption.jpg?w=1100&h=800&s=1";

    const diagnostics = resolveEngine4ViatorHeroWithDiagnostics({
      productCode: "74828P5",
      apiTour: {
        productCode: "74828P5",
        title: "Aspen East End Light Hike",
        sourceUrl:
          "https://www.viator.com/tours/Aspen/Aspen-East-End-Light-Hike/d26395-74828P5",
        primaryImageUrl: sourceHero,
        rawProductPayload: {
          images: [
            {
              isCover: true,
              variants: [
                {
                  name: "thumbnail",
                  width: 360,
                  height: 240,
                  url: "https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg",
                },
                {
                  name: "portrait",
                  width: 1200,
                  height: 1600,
                  url: "https://dynamic-media.tacdn.com/media/photo-o/33/00/00/03/caption.jpg?w=1200&h=1600&s=1",
                },
                {
                  name: "small-landscape",
                  width: 999,
                  height: 600,
                  url: "https://dynamic-media.tacdn.com/media/photo-o/33/00/00/04/caption.jpg?w=999&h=600&s=1",
                },
              ],
            },
          ],
        },
      },
    });

    expect(diagnostics.selectedHeroUrl).toBe(sourceHero);
    expect(diagnostics.selectionSource).toBe("api-images-payload");
    expect(diagnostics.apiImagesPayloadCandidates).toEqual([]);
    expect(diagnostics.rejectedCandidates).toContainEqual({
      source: "api.images[]",
      reason: "images_payload_quality_too_low",
    });
    expect(diagnostics.acceptedCandidateReason).toContain(
      "mapped API fields"
    );
  });

  it("rejects tracking proxy payload candidates and keeps strict-product override fallback", () => {
    const diagnostics = resolveEngine4ViatorHeroWithDiagnostics({
      productCode: "237571P2",
      apiTour: {
        productCode: "237571P2",
        title: "Full-Day Hike in Joshua Tree National Park",
        sourceUrl:
          "https://www.viator.com/tours/Palm-Springs/Full-Day-Hike-in-Joshua-Tree-National-Park/d648-237571P2",
        rawProductPayload: {
          images: [
            {
              isCover: true,
              variants: [
                {
                  name: "proxy",
                  width: 1600,
                  height: 900,
                  url: "https://dynamic-media.tacdn.com/tracking-proxy/image.jpg?w=1600&h=900&s=1",
                },
              ],
            },
          ],
        },
      },
    });

    expect(diagnostics.selectionSource).toBe("override");
    expect(diagnostics.selectedHeroUrl).toBe(
      ENGINE4_VIATOR_CANONICAL_HERO_BY_PRODUCT_CODE["237571P2"]
    );
    expect(diagnostics.rejectedCandidates).toContainEqual({
      source: "api.images[]",
      reason: "images_payload_quality_too_low",
    });
  });

});
