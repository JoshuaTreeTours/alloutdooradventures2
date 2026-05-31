import { describe, expect, it } from "vitest";

import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import {
  MERCHANT_APPROVED_DESCRIPTIONS,
  buildEngine6AuthoritativeMerchantDescription,
  resolveMerchantDescription,
} from "./merchantDescriptions";
import type { Engine6Tour } from "./types";

const categoryPrefixPattern =
  /^(?:Bike|Food|Boat|Guided|Walking|Attractions?|Hiking|Paddle|Air|Sightseeing|Adventure)\s+Tour:/;

describe("Engine6 post-55 merchant description governance", () => {
  it("leaves the original merchant-approved product descriptions authoritative", () => {
    const approved = MERCHANT_APPROVED_DESCRIPTIONS["152424P1"]!;

    expect(
      resolveMerchantDescription({
        productCode: "152424P1",
        title: "Changed live title must not matter",
        city: "San Francisco",
        productOverviewDescription:
          "A newer live overview should not overwrite merchant-approved copy.",
      })
    ).toBe(approved);
  });

  it("builds rich traveler-facing post-55 descriptions from source content and itinerary data", () => {
    const description = buildEngine6AuthoritativeMerchantDescription({
      title: "Joshua Tree Scenic Tour",
      city: "Joshua Tree",
      state: "California",
      productOverviewDescription:
        "Guided sightseeing through Joshua Tree National Park with desert geology, wildlife habitat, and time for short walks among granite formations and Joshua tree forests.",
      itineraryStops: [
        { title: "Hidden Valley" },
        { title: "Keys View" },
        { title: "Cap Rock" },
      ],
      included: ["National park interpretation", "Small-group guide support"],
    });

    expect(description.length).toBeGreaterThanOrEqual(250);
    expect(description.length).toBeLessThanOrEqual(500);
    expect(description).toContain("Joshua Tree National Park");
    expect(description).toContain("Hidden Valley");
    expect(description).toContain("Keys View");
    expect(description).not.toMatch(categoryPrefixPattern);
    expect(description).not.toMatch(/This tour offers/i);
    expect(description).toMatch(/[.!?]$/);
  });

  it("uses the merchant description as the JSON-LD source for post-55 products", () => {
    const tour = {
      productCode: "POST55P1",
      title: "Joshua Tree Scenic Tour",
      seoTitle: "Joshua Tree Scenic Tour",
      seoDescription:
        "Explore Joshua Tree National Park with a guide and scenic viewpoints.",
      description: "Short source description.",
      merchantDescription:
        "Explore Joshua Tree National Park with an expert guide through desert landscapes, granite rock formations, and Joshua tree forests. The route includes Hidden Valley, Keys View, and Cap Rock with time for scenic viewpoints and short walks.",
      metaDescription:
        "Explore Joshua Tree National Park with a guide and scenic viewpoints.",
      city: "Joshua Tree",
      state: "California",
      resolvedImageUrl: null,
      heroImageUrl: null,
      resolvedHero: null,
      priceAmount: null,
      priceFormatted: "",
      aggregateRating: null,
      reviewCount: null,
      meetingPointText: "See booking details",
      durationText: null,
      overviewText: null,
      highlights: [],
      itinerary: [],
      faqs: [],
      included: [],
      requirements: [],
      primaryCategory: "sightseeing-tour",
      categories: ["sightseeing-tour"],
      categoryLabel: "Sightseeing Tour",
      pagePath:
        "/destinations/california/joshua-tree/tours/joshua-tree-scenic-tour",
      canonicalPath:
        "/destinations/california/joshua-tree/tours/joshua-tree-scenic-tour",
      bookingUrl: "/book/joshua-tree-scenic-tour",
      ownership: {
        routeOwner: "viator",
        ctaOwner: "viator",
        presentationOwner: "engine6",
        commercialOwner: "viator",
        commercialFallbackReason: "none",
      },
      diagnostics: {} as Engine6Tour["diagnostics"],
    } satisfies Engine6Tour;

    const graph = buildEngine6SchemaGraph(tour)["@graph"] as Array<
      Record<string, unknown>
    >;
    const product = graph.find(node => node["@type"] === "Product");
    const trip = graph.find(node => node["@type"] === "TouristTrip");
    const webPage = graph.find(node => node["@type"] === "WebPage");

    expect(product?.description).toBe(tour.merchantDescription);
    expect(trip?.description).toBe(tour.merchantDescription);
    expect(webPage?.description).toBe(tour.merchantDescription);
  });
});
