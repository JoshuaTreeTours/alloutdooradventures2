import { describe, expect, it } from "vitest";

import type { Engine3TourViewModel } from "../types";
import { buildEngine3SchemaGraph } from "./buildEngine3SchemaGraph";

const canonicalBase =
  "https://www.alloutdooradventures.com/destinations/california/palm-springs/tours";

const baseTour: Engine3TourViewModel = {
  tourId: "2335P1",
  bookingProvider: "viator",
  title: "San Andreas Fault Jeep Tour from Palm Springs",
  description:
    "Authoritative summary for San Andreas Fault Jeep Tour from Palm Springs.",
  overview:
    "San Andreas Fault Jeep Tour from Palm Springs is a guided off-road experience in the Coachella Valley.",
  country: "United States",
  stateSlug: "california",
  city: "Palm Springs",
  citySlug: "palm-springs",
  region: "California",
  canonicalPath:
    "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
  bookingUrl:
    "https://www.viator.com/tours/Palm-Springs/San-Andreas-Fault-Jeep-Tour-from-Palm-Springs/d648-2335P1?pid=P00290915&mcid=42383&medium=link",
  primaryImageUrl: "https://cdn.filestackcontent.com/6OnyIE1yQwmb10T4bMJa",
  priceFrom: "USD 175",
  priceCurrency: "USD",
  rating: 4.5,
  reviewCount: 117,
  operatorName: "Desert Adventures Red Jeep Tours",
  latitude: 33.7226,
  longitude: -116.3745,
  itinerary: [
    {
      title: "San Andreas Fault Zone",
      description: "Learn fault geology from a naturalist guide.",
      duration: "45 minutes",
      order: 1,
    },
  ],
  faqs: [{ question: "Is pickup included?", answer: "No, meet onsite." }],
};

describe("buildEngine3SchemaGraph paragon parity", () => {
  it("emits the full paragon node set for 2335P1 and keeps affiliate booking urls", () => {
    const canonicalUrl = `${canonicalBase}/san-andreas-fault-jeep-tour-from-palm-springs-2335p1`;

    const nodes = buildEngine3SchemaGraph({
      tour: baseTour,
      seo: {
        canonicalUrl,
        title: baseTour.title,
        description: baseTour.overview ?? baseTour.description,
        image: baseTour.primaryImageUrl,
      },
      route: {
        pathname: baseTour.canonicalPath,
        isBookingRoute: false,
      },
      affiliateBookingUrl: baseTour.bookingUrl,
      breadcrumbs: [
        { name: "Destinations", url: "/destinations" },
        { name: "California", url: "/destinations/california" },
        { name: "Palm Springs", url: "/destinations/california/palm-springs" },
        { name: "Tours", url: "/destinations/california/palm-springs/tours" },
        { name: baseTour.title, url: baseTour.canonicalPath },
      ],
    });

    const graphTypes = nodes.map(node => node["@type"]);
    expect(graphTypes).toContain("Organization");
    expect(graphTypes).toContain("WebPage");
    expect(graphTypes).toContain("BreadcrumbList");
    expect(graphTypes).toContain("Product");
    expect(graphTypes).toContain("TouristTrip");
    expect(
      graphTypes.some(
        typeValue =>
          Array.isArray(typeValue) && typeValue.includes("TravelAgency")
      )
    ).toBe(true);

    const product = nodes.find(node => node["@type"] === "Product") as
      | Record<string, unknown>
      | undefined;
    const trip = nodes.find(node => node["@type"] === "TouristTrip") as
      | Record<string, unknown>
      | undefined;

    expect(product?.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.5,
      reviewCount: 117,
    });

    const offer = product?.offers as Record<string, unknown> | undefined;
    expect(offer?.url).toContain("pid=P00290915");
    expect(offer?.url).toContain("mcid=42383");
    expect(offer?.url).toContain("medium=link");

    expect(trip?.itinerary).toEqual({
      "@id": `${canonicalUrl}#itinerary`,
    });
    expect(nodes.find(node => node["@type"] === "FAQPage")).toBeDefined();
  });

  it("omits FAQ and itinerary nodes when data is missing", () => {
    const canonicalUrl = `${canonicalBase}/joshua-tree-backroads-hummer-h2-tour-6740p7`;

    const nodes = buildEngine3SchemaGraph({
      tour: {
        ...baseTour,
        canonicalPath:
          "/destinations/california/palm-springs/tours/joshua-tree-backroads-hummer-h2-tour-6740p7",
        title: "Joshua Tree Backroads Hummer H2 Tour",
        faqs: [],
        itinerary: [],
      },
      seo: {
        canonicalUrl,
        title: "Joshua Tree Backroads Hummer H2 Tour",
      },
      route: {
        pathname: canonicalUrl,
        isBookingRoute: false,
      },
      affiliateBookingUrl: baseTour.bookingUrl,
      breadcrumbs: [
        { name: "Tours", url: "/tours" },
        { name: "Joshua Tree Backroads Hummer H2 Tour", url: canonicalUrl },
      ],
    });

    expect(nodes.find(node => node["@type"] === "FAQPage")).toBeUndefined();
    expect(
      nodes.find(node => node["@id"] === `${canonicalUrl}#itinerary`)
    ).toBeUndefined();
  });
});
