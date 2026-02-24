import { describe, expect, it } from "vitest";

import {
  buildTourBreadcrumbNode,
  buildTourSchemaGraph,
  resolveTourDurationISO,
} from "./buildTourSchemaGraph";

const baseArgs = {
  url: "https://www.alloutdooradventures.com/tours/test-tour",
  pageName: "Test Tour",
  pageDescription: "Page description",
  heroImage: "https://example.com/hero.jpg",
  place: {
    city: "Hilo",
    region: "Hawaii",
    countryCode: "US",
    lat: 19.7,
    lng: -155.08,
  },
  product: {
    id: "https://www.alloutdooradventures.com/tours/test-tour#product",
    name: "Test Tour",
    description: "Product description",
    category: "Kayaking",
  },
  trip: {
    id: "https://www.alloutdooradventures.com/tours/test-tour#trip",
    name: "Test Tour",
    description: "Trip description",
    duration: "PT3H",
    touristType: "Adventure travelers",
    departureLocation: null,
  },
  offers: {
    url: "https://www.alloutdooradventures.com/tours/test-tour/book",
    price: 199,
    priceCurrency: "USD",
  },
  brandOrgIds: {
    orgId: "https://www.alloutdooradventures.com/#org",
    brandId: "https://www.alloutdooradventures.com/#brand",
    websiteId: "https://www.alloutdooradventures.com/#website",
  },
};

describe("buildTourSchemaGraph", () => {
  it("builds destination breadcrumbs from canonical path family", () => {
    const breadcrumb = buildTourBreadcrumbNode({
      canonicalPath:
        "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849",
      tourName: "Shared San Andreas Fault Jeep Tour",
    });

    const urls = breadcrumb.itemListElement.map(item => item.item);
    expect(urls).toContain("/destinations/california");
    expect(urls).toContain("/destinations/california/palm-springs/tours");
    expect(urls.join(" ")).not.toContain("/destinations/united-states");
  });

  it("uses a single hero image without default fallback", () => {
    const graph = buildTourSchemaGraph(baseArgs)["@graph"] as Array<
      Record<string, unknown>
    >;
    const product = graph.find(node => node["@type"] === "Product") as {
      image: string;
    };

    expect(product.image).toBe("https://example.com/hero.jpg");
  });

  it("excludes filestack resize base URL junk from derived images", () => {
    const graph = buildTourSchemaGraph({
      ...baseArgs,
      derivedImages: [
        "https://cdn.filestackcontent.com/resize",
        "https://example.com/tour-1.jpg",
      ],
    })["@graph"] as Array<Record<string, unknown>>;

    const product = graph.find(node => node["@type"] === "Product") as {
      image: string[];
    };

    expect(product.image).not.toContain(
      "https://cdn.filestackcontent.com/resize"
    );
    expect(product.image).toContain("https://example.com/tour-1.jpg");
  });

  it("keeps hero first and caps image array at ten", () => {
    const graph = buildTourSchemaGraph({
      ...baseArgs,
      derivedImages: Array.from(
        { length: 12 },
        (_, i) => `https://example.com/img-${i + 1}.jpg`
      ),
    })["@graph"] as Array<Record<string, unknown>>;

    const product = graph.find(node => node["@type"] === "Product") as {
      image: string[];
    };

    expect(product.image[0]).toBe("https://example.com/hero.jpg");
    expect(product.image.length).toBeLessThanOrEqual(10);
  });

  it("adds WebPage.mainEntity and TouristTrip place destination/itinerary", () => {
    const graph = buildTourSchemaGraph(baseArgs)["@graph"] as Array<
      Record<string, unknown>
    >;
    const webPage = graph.find(node => node["@type"] === "WebPage") as {
      mainEntity: { "@id": string };
    };
    const trip = graph.find(node => node["@type"] === "TouristTrip") as {
      touristDestination: { "@id": string };
      itinerary: {
        "@type": string;
        itemListElement: Array<{ item: { "@id": string } }>;
      };
    };

    expect(webPage.mainEntity).toEqual({ "@id": `${baseArgs.url}#product` });
    expect(trip.touristDestination).toEqual({ "@id": `${baseArgs.url}#place` });
    expect(trip.itinerary["@type"]).toBe("ItemList");
    expect(trip.itinerary.itemListElement[0].item).toEqual({
      "@id": `${baseArgs.url}#place`,
    });
  });


  it("aligns WebPage.primaryImageOfPage.url and WebPage.image to the hero image", () => {
    const graph = buildTourSchemaGraph(baseArgs)["@graph"] as Array<Record<string, unknown>>;
    const webPage = graph.find(node => node["@type"] === "WebPage") as {
      image: string;
      primaryImageOfPage: { url: string };
    };

    expect(webPage.image).toBe("https://example.com/hero.jpg");
    expect(webPage.primaryImageOfPage.url).toBe("https://example.com/hero.jpg");
  });

  it("normalizes US state names to USPS region codes and adds containing state", () => {
    const graph = buildTourSchemaGraph({
      ...baseArgs,
      place: {
        ...baseArgs.place,
        region: "California",
        countryCode: "US",
      },
    })["@graph"] as Array<Record<string, unknown>>;
    const place = graph.find(node => node["@type"] === "Place") as {
      address: { addressRegion: string };
      containedInPlace: { "@type": string; name: string };
    };

    expect(place.address.addressRegion).toBe("CA");
    expect(place.containedInPlace).toEqual({
      "@type": "AdministrativeArea",
      name: "California",
    });
  });

  it("keeps non-US region values unchanged", () => {
    const graph = buildTourSchemaGraph({
      ...baseArgs,
      place: {
        ...baseArgs.place,
        region: "British Columbia",
        countryCode: "CA",
      },
    })["@graph"] as Array<Record<string, unknown>>;
    const place = graph.find(node => node["@type"] === "Place") as {
      address: { addressRegion: string };
    };

    expect(place.address.addressRegion).toBe("British Columbia");
  });

  it("adds source attribution nodes and references when source URL is present", () => {
    const sourceUrl =
      "https://fareharbor.com/embeds/book/red-jeep/items/34849/?asn=fhdn";
    const graph = buildTourSchemaGraph({
      ...baseArgs,
      derivedImages: ["https://example.com/second.jpg"],
      source: {
        name: "FareHarbor",
        url: sourceUrl,
      },
    })["@graph"] as Array<Record<string, unknown>>;

    const product = graph.find(node => node["@type"] === "Product") as {
      image: string[];
      isBasedOn: string;
      subjectOf: { "@id": string };
    };
    const trip = graph.find(node => node["@type"] === "TouristTrip") as {
      image: string[];
      subjectOf: { "@id": string };
    };
    const sourceNode = graph.find(
      node => node["@id"] === `${sourceUrl}#source`
    ) as {
      "@type": string;
      url: string;
      name: string;
    };

    expect(product.image).toEqual([
      "https://example.com/hero.jpg",
      "https://example.com/second.jpg",
    ]);
    expect(trip.image).toEqual([
      "https://example.com/hero.jpg",
      "https://example.com/second.jpg",
    ]);
    expect(product.isBasedOn).toBe(sourceUrl);
    expect(product.subjectOf).toEqual({ "@id": `${sourceUrl}#source` });
    expect(trip.subjectOf).toEqual({ "@id": `${sourceUrl}#source` });
    expect(sourceNode).toMatchObject({
      "@type": "WebPage",
      url: sourceUrl,
      name: "FareHarbor booking page",
    });
  });

  it("derives PT3H from duration minutes", () => {
    expect(
      resolveTourDurationISO({
        whatYoullExperience: [],
        highlights: [],
        schemaDescription: "desc",
        durationMinutes: 180,
      })
    ).toBe("PT3H");
  });
});
