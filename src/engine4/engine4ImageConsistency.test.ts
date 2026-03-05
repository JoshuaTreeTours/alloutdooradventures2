import { describe, expect, it } from "vitest";

import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "./data/viatorTours";
import { getEngine4ListingEntries } from "./listing/getEngine4ListingEntries";
import { getEngine4TourBySlugs } from "./routing";
import { buildEngine4ViatorSchemaGraph } from "./schema/buildEngine4ViatorSchemaGraph";
import { mapViatorToEngine4Tour } from "./viator/mapViatorToEngine4Tour";

const PALM_SPRINGS_HERO =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1";

describe("Engine4 Viator image consistency", () => {
  it("keeps heroes isolated by product and never leaks Palm Springs hero", () => {
    const p3 = mapViatorToEngine4Tour({
      record: engine4ViatorTours.find(t => t.productCode === "74828P3")!,
      apiTour: engine4ViatorApiFallbackByProductCode["74828P3"],
    });
    const p5 = mapViatorToEngine4Tour({
      record: engine4ViatorTours.find(t => t.productCode === "74828P5")!,
      apiTour: engine4ViatorApiFallbackByProductCode["74828P5"],
    });
    const p151 = mapViatorToEngine4Tour({
      record: engine4ViatorTours.find(t => t.productCode === "172188P151")!,
      apiTour: engine4ViatorApiFallbackByProductCode["172188P151"],
    });

    expect(p3.heroImage).not.toBe(p5.heroImage);
    expect(p151.heroImage).not.toBe(p3.heroImage);
    expect(p151.heroImage).not.toBe(p5.heroImage);
    expect(p3.heroImage).not.toBe(PALM_SPRINGS_HERO);
    expect(p5.heroImage).not.toBe(PALM_SPRINGS_HERO);
    expect(p151.heroImage).not.toBe(PALM_SPRINGS_HERO);
  });

  it("uses the same hero for page, card, og:image, and schema image", () => {
    const pageTour = mapViatorToEngine4Tour({
      record: engine4ViatorTours.find(
        tour => tour.productCode === "172188P151"
      )!,
      apiTour: engine4ViatorApiFallbackByProductCode["172188P151"],
    });

    const listingTour = getEngine4ListingEntries("colorado", "aspen").find(
      entry => entry.tour.productCode === "172188P151"
    )?.tour;
    const routeTour = getEngine4TourBySlugs(
      "colorado",
      "aspen",
      "private-professional-photoshoot-in-aspen-172188p151"
    );

    const schema = buildEngine4ViatorSchemaGraph(pageTour);
    const productNode = (
      schema["@graph"] as Array<Record<string, unknown>>
    ).find(node => node["@type"] === "Product") as Record<string, unknown>;

    expect(listingTour?.heroImage).toBe(pageTour.heroImage);
    expect(routeTour?.seo.ogImage).toBe(pageTour.heroImage);
    expect(productNode.image).toBe(pageTour.heroImage);
  });
});
