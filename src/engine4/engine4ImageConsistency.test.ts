import { describe, expect, it } from "vitest";

import { buildEngine4ViatorSchemaGraph } from "./schema/buildEngine4ViatorSchemaGraph";
import { getEngine4ListingEntries } from "./listing/getEngine4ListingEntries";
import { getEngine4TourBySlugs } from "./routing";
import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "./data/viatorTours";
import { mapViatorToEngine4Tour } from "./viator/mapViatorToEngine4Tour";

const PALM_SPRINGS_HERO =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1";

describe("Engine4 Viator image consistency", () => {
  it("uses the same resolved hero image for card, page, schema, and OG", () => {
    const tourRecord = engine4ViatorTours.find(
      tour => tour.viator.productCode === "74828P3"
    );
    expect(tourRecord).toBeDefined();

    const pageTour = mapViatorToEngine4Tour({
      record: tourRecord!,
      apiTour: engine4ViatorApiFallbackByProductCode[tourRecord!.viator.productCode],
    });
    const listingTour = getEngine4ListingEntries("colorado", "aspen").find(
      entry => entry.tour.productCode === "74828P3"
    )?.tour;
    const routeTour = getEngine4TourBySlugs(
      "colorado",
      "aspen",
      "glimpse-of-aspen-tour-74828p3"
    );

    expect(listingTour).toBeDefined();
    expect(routeTour).not.toBeNull();

    const schema = buildEngine4ViatorSchemaGraph(pageTour);
    const productNode = (schema["@graph"] as Array<Record<string, unknown>>).find(
      node => node["@type"] === "Product"
    ) as Record<string, unknown>;
    const schemaImage = (productNode.image as string[])[0];

    expect(pageTour.heroImage).toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/74/7c/8d.jpg"
    );
    expect(pageTour.heroImage).not.toBe(PALM_SPRINGS_HERO);
    expect(listingTour?.heroImage).toBe(pageTour.heroImage);
    expect(listingTour?.primaryImageUrl).toBe(pageTour.heroImage);
    expect(routeTour?.seo.ogImage).toBe(pageTour.heroImage);
    expect(schemaImage).toBe(pageTour.heroImage);
  });
});
