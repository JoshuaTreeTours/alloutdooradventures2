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
  it("adds Product schema + WebPage.mainEntity for the 6740JTREE canonical URL", () => {
    const canonicalUrl = `${canonicalBase}/joshua-tree-hummer-adventure-from-palm-desert-6740jtree`;

    const graph = buildEngine3ViatorSchemaGraph(
      {
        ...baseTour,
        description:
          "Sentence one. Sentence one. Sentence two with details about this guided route.",
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
          {
            name: "Joshua Tree Hummer Adventure from Palm Desert",
            item: canonicalUrl,
          },
        ],
      }
    );

    const nodes = graph["@graph"] as Record<string, unknown>[];
    const webpage = nodes.find(node => node["@type"] === "WebPage") as
      | Record<string, unknown>
      | undefined;
    const product = nodes.find(node => node["@type"] === "Product") as
      | Record<string, unknown>
      | undefined;

    expect(
      (webpage?.mainEntity as Record<string, unknown> | undefined)?.["@id"]
    ).toBe(`${canonicalUrl}#product`);

    expect(product?.name).toBe(baseTour.title);
    expect(product?.url).toBe(canonicalUrl);
    expect(product?.image).toEqual([baseTour.primaryImageUrl]);
    expect(product?.description).toBe(
      "Sentence one. Sentence two with details about this guided route."
    );

    const offer = product?.offers as Record<string, unknown> | undefined;
    expect(offer?.["@type"]).toBe("Offer");
    expect(offer?.url).toBe(canonicalUrl);
    expect(offer?.priceCurrency).toBe("USD");
    expect(offer?.availability).toBe("https://schema.org/InStock");
    expect(offer?.price).toBe("199");

    const trip = nodes.find(node => node["@type"] === "TouristTrip") as
      | Record<string, unknown>
      | undefined;
    expect(
      (product?.aggregateRating as Record<string, unknown> | undefined)
        ?.ratingValue
    ).toBe(4.8);
    expect(trip?.aggregateRating).toBeUndefined();

    const breadcrumb = nodes.find(
      node => node["@type"] === "BreadcrumbList"
    ) as Record<string, unknown>;
    const items =
      (breadcrumb.itemListElement as Record<string, unknown>[] | undefined) ??
      [];
    expect(items.map(item => item.item)).toContain(
      "https://www.alloutdooradventures.com/tours?state=california&city=palm-springs"
    );
  });

  it("does not emit Product node for non-allowlisted Engine3 tours", () => {
    const canonicalUrl = `${canonicalBase}/san-andreas-fault-jeep-tour-from-palm-springs-2335p1`;

    const graph = buildEngine3ViatorSchemaGraph(
      {
        ...baseTour,
        tourId: "2335P1",
        title: "San Andreas Fault Jeep Tour from Palm Springs",
        canonicalPath:
          "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
      },
      canonicalUrl
    );

    const nodes = graph["@graph"] as Record<string, unknown>[];
    const webpage = nodes.find(node => node["@type"] === "WebPage") as
      | Record<string, unknown>
      | undefined;

    expect(nodes.find(node => node["@type"] === "Product")).toBeUndefined();
    expect(webpage?.mainEntity).toBeUndefined();
  });
});
