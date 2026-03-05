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
const COLORADO_SPRINGS_HERO =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/0c/fe/02/caption.jpg?w=1100&h=800&s=1";
const SANTA_BARBARA_HERO =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/38/e0/69/caption.jpg?w=1100&h=800&s=1";
const SB_ZIPLINE_HERO =
  "https://dynamic-media.tacdn.com/media/photo-o/30/70/d3/6d/caption.jpg?w=1100&h=800&s=1";

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

    expect(p3.heroImage).not.toBe(p5.heroImage);
    expect(p3.heroImage).not.toBe(PALM_SPRINGS_HERO);
    expect(p5.heroImage).not.toBe(PALM_SPRINGS_HERO);
  });

  it("uses the Santa Barbara hero consistently for page, card, og:image, and schema image", () => {
    const pageTour = mapViatorToEngine4Tour({
      record: engine4ViatorTours.find(tour => tour.productCode === "63657P1")!,
      apiTour: engine4ViatorApiFallbackByProductCode["63657P1"],
    });

    const listingTour = getEngine4ListingEntries("california", "santa-barbara").find(
      entry => entry.tour.productCode === "63657P1"
    )?.tour;
    const routeTour = getEngine4TourBySlugs(
      "california",
      "santa-barbara",
      "santa-barbara-vineyard-to-table-taste-tour-by-ebike-63657p1"
    );

    const schema = buildEngine4ViatorSchemaGraph(pageTour);
    const productNode = (
      schema["@graph"] as Array<Record<string, unknown>>
    ).find(node => node["@type"] === "Product") as Record<string, unknown>;
    const touristTripNode = (
      schema["@graph"] as Array<Record<string, unknown>>
    ).find(node => node["@type"] === "TouristTrip") as Record<string, unknown>;

    expect(pageTour.heroImage).toBe(SANTA_BARBARA_HERO);
    expect(listingTour?.heroImage).toBe(pageTour.heroImage);
    expect(routeTour?.seo.ogImage).toBe(pageTour.heroImage);
    expect(productNode.image).toBe(pageTour.heroImage);
    expect(touristTripNode.image).toBe(pageTour.heroImage);
  });


  it("uses the Santa Barbara zipline hero consistently for page, card, og:image, and schema image", () => {
    const pageTour = mapViatorToEngine4Tour({
      record: engine4ViatorTours.find(tour => tour.productCode === "421920P2")!,
      apiTour: engine4ViatorApiFallbackByProductCode["421920P2"],
    });

    const listingTour = getEngine4ListingEntries("california", "santa-barbara").find(
      entry => entry.tour.productCode === "421920P2"
    )?.tour;
    const routeTour = getEngine4TourBySlugs(
      "california",
      "santa-barbara",
      "epic-zipline-tour-over-the-santa-ynez-valley-421920p2"
    );

    const schema = buildEngine4ViatorSchemaGraph(pageTour);
    const productNode = (
      schema["@graph"] as Array<Record<string, unknown>>
    ).find(node => node["@type"] === "Product") as Record<string, unknown>;
    const touristTripNode = (
      schema["@graph"] as Array<Record<string, unknown>>
    ).find(node => node["@type"] === "TouristTrip") as Record<string, unknown>;

    expect(pageTour.heroImage).toBe(SB_ZIPLINE_HERO);
    expect(listingTour?.heroImage).toBe(pageTour.heroImage);
    expect(routeTour?.seo.ogImage).toBe(pageTour.heroImage);
    expect(productNode.image).toBe(pageTour.heroImage);
    expect(touristTripNode.image).toBe(pageTour.heroImage);
  });

  it("uses the Colorado Springs hero consistently for page, card, og:image, and schema image", () => {
    const pageTour = mapViatorToEngine4Tour({
      record: engine4ViatorTours.find(tour => tour.productCode === "41410P10")!,
      apiTour: engine4ViatorApiFallbackByProductCode["41410P10"],
    });

    const listingTour = getEngine4ListingEntries(
      "colorado",
      "colorado-springs"
    ).find(entry => entry.tour.productCode === "41410P10")?.tour;
    const routeTour = getEngine4TourBySlugs(
      "colorado",
      "colorado-springs",
      "small-group-tour-of-pikes-peak-and-the-garden-of-the-gods-from-denver-41410p10"
    );

    const schema = buildEngine4ViatorSchemaGraph(pageTour);
    const productNode = (
      schema["@graph"] as Array<Record<string, unknown>>
    ).find(node => node["@type"] === "Product") as Record<string, unknown>;

    expect(pageTour.heroImage).toBe(COLORADO_SPRINGS_HERO);
    expect(pageTour.heroImage).toMatch(
      /^https:\/\/dynamic-media\.tacdn\.com\/media\/photo-o\/2f\/0c\/fe\/02\/caption\.jpg/
    );
    expect(listingTour?.heroImage).toBe(pageTour.heroImage);
    expect(routeTour?.seo.ogImage).toBe(pageTour.heroImage);
    expect(productNode.image).toBe(pageTour.heroImage);

    expect(pageTour.heroImage).not.toContain("Tour image unavailable");
    expect(pageTour.heroImage?.startsWith("data:image/svg+xml")).toBe(false);
  });
});
