import { describe, expect, it } from "vitest";

import { buildEngine4ViatorSchemaGraph } from "./schema/buildEngine4ViatorSchemaGraph";
import { getEngine4ListingEntries } from "./listing/getEngine4ListingEntries";
import { getEngine4TourBySlugs } from "./routing";
import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "./data/viatorTours";
import { mapViatorToEngine4Tour } from "./viator/mapViatorToEngine4Tour";

describe("Engine4 Viator image consistency", () => {
  it("uses the same resolved hero image for card, page, schema, and OG", () => {
    const tourRecord = engine4ViatorTours.find(
      tour => tour.viator.productCode === "74828P4"
    )!;
    const pageTour = mapViatorToEngine4Tour({
      record: tourRecord,
      apiTour:
        engine4ViatorApiFallbackByProductCode[tourRecord.viator.productCode],
    });
    const listingTour = getEngine4ListingEntries("colorado", "aspen").find(
      entry => entry.tour.productCode === "74828P4"
    )!.tour;
    const routeTour = getEngine4TourBySlugs(
      "colorado",
      "aspen",
      `${tourRecord.slug}-${tourRecord.viator.productCode.toLowerCase()}`
    );

    expect(routeTour).not.toBeNull();

    const schema = buildEngine4ViatorSchemaGraph(pageTour);
    const productNode = (
      schema["@graph"] as Array<Record<string, unknown>>
    ).find(node => node["@type"] === "Product") as Record<string, unknown>;
    const schemaImage = productNode.image as string;
    const schemaGraph = schema["@graph"] as Array<Record<string, unknown>>;
    const tripNode = schemaGraph.find(
      node => node["@type"] === "TouristTrip"
    ) as Record<string, unknown>;
    const breadcrumbNode = schemaGraph.find(
      node => node["@type"] === "BreadcrumbList"
    );

    expect(breadcrumbNode).toBeDefined();
    expect(tripNode.image).toBe(pageTour.heroImage);
    expect(listingTour.heroImage).toBe(pageTour.heroImage);
    expect(listingTour.primaryImageUrl).toBe(pageTour.heroImage);
    expect(routeTour?.seo.ogImage).toBe(pageTour.heroImage);
    expect(schemaImage).toBe(pageTour.heroImage);
    expect(pageTour.heroImage).toContain("tacdn");
    expect(pageTour.heroImage).toContain("caption.jpg");
  });
});
