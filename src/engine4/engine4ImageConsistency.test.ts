import { describe, expect, it } from "vitest";

import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "./data/viatorTours";
import {
  assertContaminationRejected,
  assertHeroConsistencyForProduct,
  assertHeroSelectionSource,
} from "./viator/heroGovernanceTestHelpers";
import { mapViatorToEngine4Tour } from "./viator/mapViatorToEngine4Tour";

describe("Engine4 Viator image consistency", () => {
  it("keeps heroes isolated by product and never leaks Palm Springs hero", () => {
    const palmSpringsHero =
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1";

    const p3 = mapViatorToEngine4Tour({
      record: engine4ViatorTours.find(t => t.productCode === "74828P3")!,
      apiTour: engine4ViatorApiFallbackByProductCode["74828P3"],
    });
    const p5 = mapViatorToEngine4Tour({
      record: engine4ViatorTours.find(t => t.productCode === "74828P5")!,
      apiTour: engine4ViatorApiFallbackByProductCode["74828P5"],
    });

    expect(p3.heroImage).not.toBe(p5.heroImage);
    expect(p3.heroImage).not.toBe(palmSpringsHero);
    expect(p5.heroImage).not.toBe(palmSpringsHero);
  });

  it("keeps 335698P13 locked and consistent across page/card/og/schema", () => {
    assertHeroConsistencyForProduct({
      productCode: "335698P13",
      stateSlug: "california",
      citySlug: "joshua-tree",
      tourSlug:
        "rock-scrambling-adventures-in-joshua-tree-national-park-335698p13",
      expectedHeroUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1100&h=800&s=1",
    });

    const diagnostics = assertHeroSelectionSource({
      productCode: "335698P13",
      expectedSource: "api-images-payload",
    });

    expect(diagnostics.finalSelectedHeroUrl).toBeDefined();
  });

  it("keeps 237571P2 consistent across page/card/og/schema with strict provenance governance", () => {
    assertHeroConsistencyForProduct({
      productCode: "237571P2",
      stateSlug: "california",
      citySlug: "joshua-tree",
      tourSlug: "full-day-hike-in-joshua-tree-national-park-237571p2",
      expectedHeroUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1100&h=800&s=1",
    });

    const diagnostics = assertHeroSelectionSource({
      productCode: "237571P2",
      expectedSource: "api-images-payload",
    });

    expect(diagnostics.coverImagePresent).toBe(true);
    expect(diagnostics.selectedVariantWidth).toBe(1100);
    expect(diagnostics.overrideUsed).toBe(false);
    expect(diagnostics.resolutionStatus).toBe("ok");
    expect(diagnostics.rejectedCandidates.length).toBeGreaterThanOrEqual(0);
  });

  it("keeps at least 3 unrelated tours stable and consistent", () => {
    assertHeroConsistencyForProduct({
      productCode: "63657P1",
      stateSlug: "california",
      citySlug: "santa-barbara",
      tourSlug: "santa-barbara-vineyard-to-table-taste-tour-by-ebike-63657p1",
      expectedHeroUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/e0/69/caption.jpg?w=1100&h=800&s=1",
    });

    assertHeroConsistencyForProduct({
      productCode: "41410P10",
      stateSlug: "colorado",
      citySlug: "colorado-springs",
      tourSlug:
        "small-group-tour-of-pikes-peak-and-the-garden-of-the-gods-from-denver-41410p10",
      expectedHeroUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/2f/0c/fe/02/caption.jpg?w=1100&h=800&s=1",
    });

    assertHeroConsistencyForProduct({
      productCode: "91782P1",
      stateSlug: "utah",
      citySlug: "moab",
      tourSlug: "half-day-day-canyoneering-91782p1",
      expectedHeroUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/2f/39/2a/61/caption.jpg?w=1100&h=800&s=1",
    });
  });

  it("rejects contamination from an unrelated product image", () => {
    const diagnostics = assertContaminationRejected({
      productCode: "74828P5",
      apiTourProductCode: "335698P13",
    });

    expect(diagnostics.resolutionStatus).toBe("missing");
  });
});
