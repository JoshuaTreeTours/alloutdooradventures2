import { describe, expect, it } from "vitest";

import type { Engine3TourViewModel } from "../types";
import { buildEngine3ViatorSchemaGraph } from "./buildEngine3ViatorSchemaGraph";

const canonicalBase =
  "https://www.alloutdooradventures.com/destinations/california/palm-springs/tours";

const baseTour: Engine3TourViewModel = {
  tourId: "2335P1",
  title: "San Andreas Fault Jeep Tour from Palm Springs",
  description:
    "Authoritative summary for San Andreas Fault Jeep Tour from Palm Springs.",
  country: "United States",
  stateSlug: "california",
  city: "Palm Springs",
  citySlug: "palm-springs",
  region: "California",
  canonicalPath:
    "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
  bookingUrl:
    "https://www.viator.com/tours/Palm-Springs/San-Andreas-Fault-Jeep-Tour-from-Palm-Springs/d648-2335P1",
  primaryImageUrl: "https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa",
  priceFrom: "USD 175",
  priceCurrency: "USD",
  rating: 4.5,
  reviewCount: 117,
  operatorName: "Desert Adventures Red Jeep Tours",
  latitude: 33.7226,
  longitude: -116.3745,
};

describe("buildEngine3ViatorSchemaGraph", () => {
  it("adds Product schema and points WebPage.mainEntity at TouristTrip", () => {
    const canonicalUrl = `${canonicalBase}/san-andreas-fault-jeep-tour-from-palm-springs-2335p1`;

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
            name: "San Andreas Fault Jeep Tour from Palm Springs",
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
    ).toBe(`${canonicalUrl}#trip`);

    expect(product?.name).toBe(baseTour.title);
    expect(product?.url).toBe(canonicalUrl);
    expect(product?.image).toEqual([baseTour.primaryImageUrl]);
    expect(product?.description).toBe(
      "Sentence one. Sentence two with details about this guided route."
    );

    const offer = product?.offers as Record<string, unknown> | undefined;
    expect(offer?.["@type"]).toBe("Offer");
    expect(offer?.url).toBe(baseTour.bookingUrl);
    expect(offer?.priceCurrency).toBe("USD");
    expect(offer?.availability).toBe("https://schema.org/InStock");
    expect(offer?.price).toBe("175");

    const trip = nodes.find(node => node["@type"] === "TouristTrip") as
      | Record<string, unknown>
      | undefined;
    expect(
      (product?.aggregateRating as Record<string, unknown> | undefined)
        ?.ratingValue
    ).toBe(4.5);
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

  it("adds TouristTrip Offer + AggregateRating and WebPage.mainEntity for Paragon+", () => {
    const canonicalUrl = `${canonicalBase}/san-andreas-fault-jeep-tour-from-palm-springs-2335p1`;

    const graph = buildEngine3ViatorSchemaGraph(
      {
        ...baseTour,
        paragonPlus: {
          sourceUrl:
            "https://www.viator.com/tours/Palm-Springs/San-Andreas-Fault-Jeep-Tour-from-Palm-Springs/d648-2335P1",
          price: 175,
          priceCurrency: "USD",
          rating: 4.5,
          reviewCount: 117,
          supplierImage:
            "https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa",
        },
      },
      canonicalUrl
    );

    const nodes = graph["@graph"] as Record<string, unknown>[];
    const webPage = nodes.find(node => node["@type"] === "WebPage") as Record<
      string,
      unknown
    >;
    const trip = nodes.find(node => node["@type"] === "TouristTrip") as Record<
      string,
      unknown
    >;

    expect((webPage.mainEntity as Record<string, unknown>)["@id"]).toBe(
      `${canonicalUrl}#trip`
    );
    expect((trip.offers as Record<string, unknown>).price).toBe("175");
    expect((trip.aggregateRating as Record<string, unknown>).ratingValue).toBe(
      "4.5"
    );
  });

  it("uses affiliate offer URL precedence and ISO-8601 itinerary durations", () => {
    const canonicalUrl = `${canonicalBase}/san-andreas-fault-jeep-tour-from-palm-springs-2335p1`;
    const affiliateUrl =
      "https://www.viator.com/tours/Palm-Springs/San-Andreas-Fault-Jeep-Tour-from-Palm-Springs/d648-2335P1?pid=P00058975&uid=U00174482";

    const graph = buildEngine3ViatorSchemaGraph(
      {
        ...baseTour,
        viatorAffiliateUrl: affiliateUrl,
        itinerary: [
          { title: "Stop 1", duration: "15 minutes" },
          { title: "Stop 2", duration: "1 hour 30 minutes" },
          { title: "Stop 3", duration: "about two hours" },
        ],
      },
      canonicalUrl
    );

    const nodes = graph["@graph"] as Record<string, unknown>[];
    const product = nodes.find(node => node["@type"] === "Product") as
      | Record<string, unknown>
      | undefined;
    const trip = nodes.find(node => node["@type"] === "TouristTrip") as
      | Record<string, unknown>
      | undefined;

    expect((product?.offers as Record<string, unknown>).url).toBe(affiliateUrl);

    const itinerary = (trip?.itinerary as Record<string, unknown>)
      ?.itemListElement as Array<Record<string, unknown>>;
    expect(itinerary[0].timeRequired).toBe("PT15M");
    expect(itinerary[1].timeRequired).toBe("PT1H30M");
    expect(itinerary[2].timeRequired).toBeUndefined();
  });
  it("fail-closes provider, aggregateRating, geo and FAQ schema when data is invalid", () => {
    const canonicalUrl = `${canonicalBase}/san-andreas-fault-jeep-tour-from-palm-springs-2335p1`;

    const graph = buildEngine3ViatorSchemaGraph(
      {
        ...baseTour,
        operatorName: "",
        rating: Number.NaN,
        reviewCount: 0,
        latitude: Number.NaN,
        longitude: -116.3745,
        faqs: [
          { question: "Q1", answer: "A1" },
          { question: "Q2", answer: "A2" },
          { question: "Q3", answer: "A3" },
          { question: "Q4", answer: "A4" },
        ],
      },
      canonicalUrl
    );

    const nodes = graph["@graph"] as Record<string, unknown>[];
    const trip = nodes.find(node => node["@type"] === "TouristTrip") as
      | Record<string, unknown>
      | undefined;
    const product = nodes.find(node => node["@type"] === "Product") as
      | Record<string, unknown>
      | undefined;

    expect(
      nodes.find(node => node["@id"] === `${canonicalUrl}#provider`)
    ).toBeUndefined();
    expect(trip?.provider).toBeUndefined();
    expect(product?.aggregateRating).toBeUndefined();
    expect(trip?.location).toBeUndefined();
    expect(nodes.find(node => node["@type"] === "FAQPage")).toBeUndefined();
  });

  it("emits Product schema for the 3351P15 canonical URL", () => {
    const canonicalUrl = `${canonicalBase}/palm-springs-indian-canyons-bike-and-hike-3351p15`;

    const graph = buildEngine3ViatorSchemaGraph(
      {
        ...baseTour,
        tourId: "3351P15",
        title: "Palm Springs Indian Canyons Bike and Hike",
        canonicalPath:
          "/destinations/california/palm-springs/tours/palm-springs-indian-canyons-bike-and-hike-3351p15",
      },
      canonicalUrl
    );

    const nodes = graph["@graph"] as Record<string, unknown>[];
    const product = nodes.find(node => node["@type"] === "Product") as
      | Record<string, unknown>
      | undefined;

    expect(product?.url).toBe(canonicalUrl);
  });

  it("omits Product node for non-paragon Engine3 tours", () => {
    const canonicalUrl = `${canonicalBase}/joshua-tree-hummer-adventure-from-palm-desert-6740jtree`;

    const graph = buildEngine3ViatorSchemaGraph(
      {
        ...baseTour,
        tourId: "6740JTREE",
        title: "Joshua Tree Hummer Adventure from Palm Desert",
        canonicalPath:
          "/destinations/california/palm-springs/tours/joshua-tree-hummer-adventure-from-palm-desert-6740jtree",
      },
      canonicalUrl
    );

    const nodes = graph["@graph"] as Record<string, unknown>[];
    const webpage = nodes.find(node => node["@type"] === "WebPage") as
      | Record<string, unknown>
      | undefined;

    expect(nodes.find(node => node["@type"] === "Product")).toBeUndefined();
    expect((webpage?.mainEntity as Record<string, unknown>)?.["@id"]).toBe(
      `${canonicalUrl}#trip`
    );
  });
});
