import { describe, expect, it } from "vitest";

import type { Engine3TourViewModel } from "../types";
import { buildEngine3ViatorSchemaGraph } from "./buildEngine3ViatorSchemaGraph";

const canonicalBase =
  "https://www.alloutdooradventures.com/destinations/california/palm-springs/tours";

const baseTour: Engine3TourViewModel = {
  tourId: "6740JTREE",
  title: "Joshua Tree Hummer Adventure from Palm Desert",
  description:
    "Authoritative summary for Joshua Tree Hummer Adventure from Palm Desert.",
  country: "United States",
  stateSlug: "california",
  city: "Palm Springs",
  citySlug: "palm-springs",
  region: "California",
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

describe("buildEngine3ViatorSchemaGraph", () => {
  it.each([
    {
      tourId: "6740JTREE",
      title: "Joshua Tree Hummer Adventure from Palm Desert",
      canonicalUrl: `${canonicalBase}/joshua-tree-hummer-adventure-from-palm-desert-6740jtree`,
      bookingUrl:
        "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Hummer-Adventure-from-Palm-Desert/d648-6740JTREE",
      primaryImageUrl:
        "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
      priceFrom: "USD 199",
    },
    {
      tourId: "2335P1",
      title: "San Andreas Fault Jeep Tour from Palm Springs",
      canonicalUrl: `${canonicalBase}/san-andreas-fault-jeep-tour-from-palm-springs-2335p1`,
      bookingUrl:
        "https://www.viator.com/tours/Palm-Springs/San-Andreas-Fault-Jeep-Tour-from-Palm-Springs/d648-2335P1",
      primaryImageUrl: "https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa",
      priceFrom: "USD 175",
    },
  ])(
    "emits Product + Offer + BreadcrumbList for $tourId",
    ({ canonicalUrl, title, primaryImageUrl, bookingUrl, priceFrom }) => {
      const graph = buildEngine3ViatorSchemaGraph(
        {
          ...baseTour,
          tourId: title.includes("San Andreas") ? "2335P1" : "6740JTREE",
          title,
          bookingUrl,
          primaryImageUrl,
          priceFrom,
        },
        canonicalUrl,
        {
          breadcrumbItems: [
            { name: "Home", item: "/" },
            { name: "Tours", item: "/tours" },
            {
              name: "Palm Springs",
              item: "/tours?state=california&city=palm-springs",
            },
            { name: title, item: canonicalUrl },
          ],
        }
      );

      const nodes = graph["@graph"] as Record<string, unknown>[];
      const breadcrumb = nodes.find(
        node => node["@type"] === "BreadcrumbList"
      ) as Record<string, unknown>;
      const product = nodes.find(node => node["@type"] === "Product") as
        | Record<string, unknown>
        | undefined;
      const offer = nodes.find(node => node["@type"] === "Offer") as
        | Record<string, unknown>
        | undefined;

      expect(product?.name).toBe(title);
      expect(product?.image).toEqual([primaryImageUrl]);
      expect(offer?.priceCurrency).toBe("USD");
      expect(offer?.price).toBeDefined();
      expect(offer?.url).toBe(bookingUrl);

      const items =
        (breadcrumb.itemListElement as Record<string, unknown>[] | undefined) ??
        [];
      expect(items.map(item => item.item)).toContain(
        "https://www.alloutdooradventures.com/tours?state=california&city=palm-springs"
      );
    }
  );

  it("omits Offer and Product.offers when price is missing", () => {
    const canonicalUrl =
      "https://www.alloutdooradventures.com/destinations/california/palm-springs/tours/no-price";

    const graph = buildEngine3ViatorSchemaGraph(
      {
        ...baseTour,
        priceFrom: undefined,
      },
      canonicalUrl
    );

    const nodes = graph["@graph"] as Record<string, unknown>[];
    const offer = nodes.find(node => node["@type"] === "Offer");
    const product = nodes.find(node => node["@type"] === "Product") as
      | Record<string, unknown>
      | undefined;
    const trip = nodes.find(node => node["@type"] === "TouristTrip") as
      | Record<string, unknown>
      | undefined;

    expect(offer).toBeUndefined();
    expect(product?.offers).toBeUndefined();
    expect(trip?.offers).toBeUndefined();
  });
});
