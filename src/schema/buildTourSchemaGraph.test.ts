import { describe, expect, it } from "vitest";

import {
  buildTourBreadcrumbNode,
  buildTourOfferNode,
  resolveTourDurationISO,
} from "./buildTourSchemaGraph";

describe("buildTourSchemaGraph helpers", () => {
  it("builds destination breadcrumbs from canonical path family", () => {
    const breadcrumb = buildTourBreadcrumbNode({
      canonicalPath:
        "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849",
      tourName: "Shared San Andreas Fault Jeep Tour",
    });

    const urls = breadcrumb.itemListElement.map(item => item.item);
    expect(urls).toContain("/destinations/california");
    expect(urls).toContain("/destinations/california/palm-springs/tours");
    expect(urls.join(" ")).not.toContain("/destinations/united-states");
  });

  it("builds aggregate offer when rewrite includes tiered pricing", () => {
    const offer = buildTourOfferNode({
      offerUrl: "https://example.com/book",
      currency: "USD",
      fallbackPrice: 175,
      rewrite: {
        whatYoullExperience: [],
        highlights: [],
        schemaDescription: "desc",
        pricing: {
          currency: "USD",
          low: 150,
          high: 175,
          isAggregate: true,
        },
      },
    });

    expect(offer["@type"]).toBe("AggregateOffer");
    expect(offer.lowPrice).toBe("150.00");
    expect(offer.highPrice).toBe("175.00");
  });

  it("derives PT3H from duration minutes", () => {
    expect(
      resolveTourDurationISO({
        whatYoullExperience: [],
        highlights: [],
        schemaDescription: "desc",
        durationMinutes: 180,
      })
    ).toBe("PT3H");
  });
});
