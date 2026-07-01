import { describe, expect, it } from "vitest";

import {
  assertEngine6ParagonArtifactStageAllowed,
  buildEngine6ParagonProductSelectionConfig,
  ENGINE6_PARAGON_GOVERNANCE_PIPELINE_ID,
  filterEngine6ParagonCatalogByValidatedProductCodes,
  runEngine6ParagonProductSelectionPipeline,
} from "./engine6ParagonGovernancePipeline";
import type { Engine6LiveViatorValidationResult } from "./engine6LiveViatorProductionValidation";

const buildValidationResult = (
  overrides: Partial<Engine6LiveViatorValidationResult> = {}
): Engine6LiveViatorValidationResult => ({
  productCode: "TESTP1",
  sourceUrl: "https://www.viator.com/tours/Example-National-Park/Tour/d1-TESTP1",
  passed: true,
  publicPageAvailable: true,
  apiConfirmedActive: true,
  canonicalProductCodeMatches: true,
  merchantUrlMatches: true,
  bookable: true,
  knownUnavailableBlocklistHit: false,
  reason: null,
  ...overrides,
});

describe("engine6ParagonGovernancePipeline", () => {
  it("builds a shared product-selection config from destination tour catalogs", () => {
    const config = buildEngine6ParagonProductSelectionConfig({
      destinationLabel: "Example National Park",
      destinationCitySlug: "example-national-park",
      viatorDestinationSlug: "Example-National-Park",
      tours: [
        {
          productCode: "GOODP1",
          productUrl:
            "https://www.viator.com/tours/Example-National-Park/Tour/d1-GOODP1",
          title: "Example Tour",
          priceFrom: 149,
        },
      ],
    });

    expect(config.slots).toHaveLength(1);
    expect(config.slots[0]?.desiredCount).toBe(1);
    expect(config.slots[0]?.candidates[0]?.productCode).toBe("GOODP1");
  });

  it("runs the shared pipeline before downstream artifact stages", async () => {
    const config = buildEngine6ParagonProductSelectionConfig({
      destinationLabel: "Example National Park",
      destinationCitySlug: "example-national-park",
      viatorDestinationSlug: "Example-National-Park",
      tours: [
        {
          productCode: "GOODP1",
          productUrl:
            "https://www.viator.com/tours/Example-National-Park/Tour/d1-GOODP1",
          title: "Example Tour",
          priceFrom: 149,
        },
      ],
    });

    const context = await runEngine6ParagonProductSelectionPipeline({
      config,
      validateCandidate: async args =>
        buildValidationResult({
          productCode: args.productCode,
          sourceUrl: args.sourceUrl,
        }),
    });

    expect(context.pipelineId).toBe(ENGINE6_PARAGON_GOVERNANCE_PIPELINE_ID);
    expect(context.validatedProductCodes).toEqual(["GOODP1"]);
    expect(context.completedBuildStages).toEqual(["live-validation"]);

    expect(() =>
      assertEngine6ParagonArtifactStageAllowed({
        context,
        stage: "fixtures",
      })
    ).not.toThrow();

    expect(
      filterEngine6ParagonCatalogByValidatedProductCodes(
        [
          {
            productCode: "GOODP1",
            productUrl:
              "https://www.viator.com/tours/Example-National-Park/Tour/d1-GOODP1",
            title: "Example Tour",
            priceFrom: 149,
          },
        ],
        context.validatedProductCodes
      )
    ).toHaveLength(1);
  });
});
