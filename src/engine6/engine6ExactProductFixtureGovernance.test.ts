import { describe, expect, it } from "vitest";

import {
  resolveEngine6AuthoritativeHeroCandidates,
  resolveEngine6ExactProductFixtureWriteDecision,
  summarizeEngine6ExactProductFixtureDecisions,
} from "./engine6ExactProductFixtureGovernance";

const buildPayloadWithHero = (heroUrl: string) => ({
  product: {
    productCode: "TESTP1",
    media: {
      images: [
        {
          isCover: true,
          variants: {
            FULL: { url: heroUrl },
          },
        },
      ],
    },
    location: {
      city: "Chicago",
      state: "Illinois",
    },
  },
});

describe("engine6ExactProductFixtureGovernance", () => {
  it("selects authoritative hero candidates from product.media.images", () => {
    const heroUrl =
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/7f/49/38.jpg";
    const candidates = resolveEngine6AuthoritativeHeroCandidates(
      buildPayloadWithHero(heroUrl)
    );

    expect(candidates.candidates).toEqual([heroUrl]);
    expect(candidates.heroSourceFieldPath).toMatch(/^product\.media\.images/);
  });

  it("reports invalid hero instead of writing fabricated image paths", () => {
    const decision = resolveEngine6ExactProductFixtureWriteDecision({
      productCode: "TESTP1",
      destinationCitySlug: "chicago",
      proposedPayload: {
        product: {
          productCode: "TESTP1",
          media: { images: [] },
        },
      },
    });

    expect(decision.action).toBe("report-invalid-hero");
  });

  it("summarizes namespace collisions separately from writes", () => {
    const summary = summarizeEngine6ExactProductFixtureDecisions([
      {
        action: "write",
        productCode: "NEWP1",
        fixturePath: "data/engine6/viator/NEWP1.exact-product.json",
        heroUrl:
          "https://media.tacdn.com/media/attractions-splice-spp-674x446/0a/7f/49/38.jpg",
        heroSourceFieldPath: "product.media.images[0].variants.FULL.url",
      },
      {
        action: "skip-collision",
        productCode: "LEGACYP1",
        fixturePath: "data/engine6/viator/LEGACYP1.exact-product.json",
        collision: {
          productCode: "LEGACYP1",
          fixturePath: "data/engine6/viator/LEGACYP1.exact-product.json",
          existingOwnerDestination: "sedona",
          requestedDestinationCitySlug: "chicago",
          message: "collision",
        },
      },
    ]);

    expect(summary.written).toEqual(["NEWP1"]);
    expect(summary.preserved).toEqual(["LEGACYP1"]);
    expect(summary.namespaceCollisions).toHaveLength(1);
  });
});
