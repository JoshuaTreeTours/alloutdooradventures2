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
      },
    });

    expect(selectedHero).toContain("30/70/d3/6d/caption.jpg");
    expect(diagnostics.selectionSource).toBe("api");
    expect(diagnostics.overrideUsed).toBe(false);
    expect(diagnostics.resolutionStatus).toBe("ok");
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

  it("reports full diagnostics for 237571P2 via API source", () => {
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
      apiImagePresent: true,
      overridePresent: false,
      overrideUsed: false,
      finalSelectedHeroUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/d8/0b/caption.jpg?w=1100&h=800&s=1",
      selectionSource: "api",
      contaminationBlocked: false,
      resolutionStatus: "ok",
    });
  });
});
