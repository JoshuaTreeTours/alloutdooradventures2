import { describe, expect, it } from "vitest";

import { buildEngine3ViatorSchemaGraph } from "./buildEngine3ViatorSchemaGraph";
import type { Engine3TourViewModel } from "../types";

const baseTour: Engine3TourViewModel = {
  tourId: "6740JTREE",
  title: "Joshua Tree Hummer Adventure from Palm Desert",
  description:
    "Authoritative summary for Joshua Tree Hummer Adventure from Palm Desert.",
  country: "United States",
  city: "palm-springs",
  region: "california",
  canonicalPath:
    "/destinations/california/palm-springs/tours/joshua-tree-hummer-adventure-from-palm-desert-6740jtree",
  bookingUrl:
    "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Hummer-Adventure-from-Palm-Desert/d648-6740JTREE",
  primaryImageUrl:
    "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
  priceFrom: "USD 199",
  priceCurrency: "USD",
  rating: 4.8,
  reviewCount: 642,
  operatorName: "Desert Adventures Red Jeep Tours",
  latitude: 33.7226,
  longitude: -116.3745,
};

const canonicalUrl =
  "https://www.alloutdooradventures.com/destinations/california/palm-springs/tours/joshua-tree-hummer-adventure-from-palm-desert-6740jtree";

describe("buildEngine3ViatorSchemaGraph", () => {
  it("emits TouristTrip, Offer, BreadcrumbList, and WebPage with offer URL on Viator", () => {
    const graph = buildEngine3ViatorSchemaGraph(baseTour, canonicalUrl);
    const nodes = graph["@graph"] as Record<string, unknown>[];

    const webpage = nodes.find(node => node["@type"] === "WebPage");
    const breadcrumb = nodes.find(node => node["@type"] === "BreadcrumbList");
    const offer = nodes.find(node => node["@type"] === "Offer");
    const trip = nodes.find(node => node["@type"] === "TouristTrip") as
      | Record<string, unknown>
      | undefined;

    expect(webpage).toBeTruthy();
    expect((webpage as Record<string, unknown>).url).toBe(canonicalUrl);
    expect(breadcrumb).toBeTruthy();
    expect(offer?.["@id"]).toBe(`${canonicalUrl}#offer`);
    expect((offer as Record<string, unknown>).url).toBe(baseTour.bookingUrl);
    expect(trip?.["@id"]).toBe(`${canonicalUrl}#trip`);
    expect((trip?.offers as Record<string, unknown>)?.["@id"]).toBe(
      `${canonicalUrl}#offer`
    );

    expect((trip as Record<string, unknown>).image).toEqual([
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
    ]);
    expect((trip?.provider as Record<string, unknown>)?.["@id"]).toBe(
      `${canonicalUrl}#provider`
    );
    expect((trip?.areaServed as unknown[]).length).toBe(3);
    expect(
      (trip?.aggregateRating as Record<string, unknown>)?.ratingValue
    ).toBe(4.8);
    expect(
      (
        (trip?.location as Record<string, unknown>)?.geo as Record<
          string,
          unknown
        >
      )?.latitude
    ).toBe(33.7226);
  });

  it("omits aggregateRating and geo when values are not present", () => {
    const graph = buildEngine3ViatorSchemaGraph(
      {
        ...baseTour,
        rating: undefined,
        reviewCount: undefined,
        latitude: undefined,
        longitude: undefined,
      },
      canonicalUrl
    );

    const nodes = graph["@graph"] as Record<string, unknown>[];
    const trip = nodes.find(node => node["@type"] === "TouristTrip") as Record<
      string,
      unknown
    >;

    expect(trip.aggregateRating).toBeUndefined();
    expect(trip.location).toBeUndefined();
  });
});
