import { describe, expect, it } from "vitest";

import {
  SITE_BRAND_ID,
  SITE_ORGANIZATION_ID,
  SITE_WEBSITE_ID,
  buildTourProductStructuredData,
  buildTourTripStructuredData,
  buildWebPageStructuredData,
  buildBreadcrumbList,
  dedupeGraphNodesById,
  getSiteStructuredDataNodes,
  normalizeStructuredData,
  resetMissingGeoFallbackReport,
} from "./structuredData";
import type { Tour } from "../data/tours.types";

const baseTour: Tour = {
  id: "tour-1",
  slug: "tour-1",
  title: "Test Tour",
  destination: {
    state: "California",
    stateSlug: "california",
    city: "San Diego",
    citySlug: "san-diego",
    country: "United States",
  },
  heroImage: "https://example.com/hero.jpg",
  badges: {},
  activitySlugs: ["hiking"],
  bookingProvider: "viator",
  bookingUrl: "https://example.com/book",
  longDescription: "desc",
  startingPrice: 99,
  currency: "USD",
};

describe("global structured data graph", () => {
  it("matches canonical global organization/brand/website IDs and values", () => {
    const nodes = getSiteStructuredDataNodes();
    expect(nodes).toHaveLength(3);

    expect(nodes[0]).toMatchObject({
      "@type": "Organization",
      "@id": SITE_ORGANIZATION_ID,
      name: "Outdoor Adventures, Inc.",
      url: "https://www.alloutdooradventures.com",
      logo: "https://www.alloutdooradventures.com/images/Logo.png",
      telephone: "+1-855-314-8687",
    });

    expect(nodes[1]).toMatchObject({
      "@type": ["Organization", "TravelAgency"],
      "@id": SITE_BRAND_ID,
      name: "All Outdoor Adventures",
      url: "https://www.alloutdooradventures.com",
      logo: "https://www.alloutdooradventures.com/images/Logo.png",
      telephone: "+1-855-314-8687",
      parentOrganization: { "@id": SITE_ORGANIZATION_ID },
      areaServed: [{ "@type": "GeoShape", name: "Worldwide" }],
    });

    expect(nodes[2]).toMatchObject({
      "@type": "WebSite",
      "@id": SITE_WEBSITE_ID,
      url: "https://www.alloutdooradventures.com",
      name: "All Outdoor Adventures",
      publisher: { "@id": SITE_ORGANIZATION_ID },
      about: { "@id": SITE_BRAND_ID },
    });
  });

  it("does not emit local-business signals or address on org/brand", () => {
    const serialized = JSON.stringify(getSiteStructuredDataNodes());
    expect(serialized).not.toContain("LocalBusiness");
    expect(serialized).not.toContain('"address"');
    expect(serialized).not.toContain('"geo"');
    expect(serialized).not.toContain('"hasMap"');
    expect(serialized).not.toContain('"openingHours"');
    expect(serialized).not.toContain('"priceRange"');
  });
});

describe("tour product/trip schema safety", () => {
  it("emits Product with Offer and textual price specification", () => {
    const product = buildTourProductStructuredData({
      tour: baseTour,
      detailUrl:
        "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1",
    });

    expect(product).toMatchObject({
      "@type": "Product",
      "@id":
        "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1#product",
      brand: { "@id": SITE_BRAND_ID },
      provider: { "@id": SITE_BRAND_ID },
      priceSpecification: {
        "@type": "PriceSpecification",
      },
      offers: {
        "@type": "Offer",
        price: "99.00",
        priceCurrency: "USD",
      },
    });

    const validIds = new Set(
      getSiteStructuredDataNodes().map(node => node["@id"])
    );
    expect(validIds.has((product.brand as { "@id": string })["@id"])).toBe(
      true
    );
  });

  it("emits TouristTrip with stable ID and Offer", () => {
    const trip = buildTourTripStructuredData({
      tour: baseTour,
      detailUrl:
        "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1",
    });

    expect(trip).toMatchObject({
      "@type": "TouristTrip",
      "@id":
        "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1#touristtrip",
      provider: { "@id": SITE_BRAND_ID },
      priceSpecification: {
        "@type": "PriceSpecification",
      },
      offers: {
        "@type": "Offer",
        price: "99.00",
        priceCurrency: "USD",
      },
    });
  });

  it("applies a USD 129.00 offer floor when price is missing or below threshold", () => {
    const product = buildTourProductStructuredData({
      tour: {
        ...baseTour,
        startingPrice: 0,
      },
      detailUrl:
        "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1",
    });

    expect(product).toMatchObject({
      offers: {
        price: "129.00",
        priceCurrency: "USD",
      },
    });
  });

  it("emits Place/PostalAddress location with locality and country on tours", () => {
    const trip = buildTourTripStructuredData({
      tour: baseTour,
      detailUrl:
        "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1",
    });

    expect(trip.location).toMatchObject({
      "@type": "Place",
      name: "San Diego, California",
      address: {
        "@type": "PostalAddress",
        addressLocality: "San Diego",
        addressRegion: "California",
        addressCountry: "US",
      },
    });
  });



  it("uses US fallback country for united-states URL when destination country is missing", () => {
    resetMissingGeoFallbackReport();
    const trip = buildTourTripStructuredData({
      tour: {
        ...baseTour,
        destination: {
          ...baseTour.destination,
          country: undefined,
        },
      },
      detailUrl:
        "https://www.alloutdooradventures.com/destinations/united-states/hawaii/hilo/tours/discover-scuba-diving",
    });

    expect(trip.location).toMatchObject({
      address: {
        addressCountry: "US",
      },
    });
  });

  it("uses Product.url as detailUrl and Offer.url as bookingUrl when provided", () => {
    const product = buildTourProductStructuredData({
      tour: baseTour,
      detailUrl:
        "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1",
      bookingUrl: "https://booking.example.com/tour-1",
    });

    expect(product).toMatchObject({
      url: "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1",
      mainEntityOfPage: {
        "@type": "WebPage",
      },
      offers: {
        url: "https://booking.example.com/tour-1",
      },
    });
  });

  it("maps destination country names to ISO 3166-1 alpha-2 codes", () => {
    const trip = buildTourTripStructuredData({
      tour: {
        ...baseTour,
        destination: {
          ...baseTour.destination,
          state: "Capital Region of Denmark",
          country: "Denmark",
        },
      },
      detailUrl:
        "https://www.alloutdooradventures.com/tours/denmark/copenhagen/tour-1",
    });

    expect(trip.location).toMatchObject({
      address: {
        addressCountry: "DK",
      },
    });
  });
});

describe("graph dedupe by @id", () => {
  it("keeps first instance for duplicate #org/#brand/#website nodes", () => {
    const [orgNode, brandNode, webSiteNode] = getSiteStructuredDataNodes();

    const deduped = dedupeGraphNodesById([
      orgNode,
      brandNode,
      webSiteNode,
      { ...orgNode, name: "Should Not Replace" },
      { ...brandNode, name: "Should Not Replace" },
      { ...webSiteNode, name: "Should Not Replace" },
      buildWebPageStructuredData({
        url: "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1",
        name: "Tour 1",
        description: "Tour 1 description",
      }),
    ]);

    expect(
      deduped.filter(
        node =>
          typeof node === "object" &&
          node !== null &&
          (node as { "@id"?: string })["@id"] === SITE_ORGANIZATION_ID
      )
    ).toHaveLength(1);
    expect(
      deduped.filter(
        node =>
          typeof node === "object" &&
          node !== null &&
          (node as { "@id"?: string })["@id"] === SITE_BRAND_ID
      )
    ).toHaveLength(1);
    expect(
      deduped.filter(
        node =>
          typeof node === "object" &&
          node !== null &&
          (node as { "@id"?: string })["@id"] === SITE_WEBSITE_ID
      )
    ).toHaveLength(1);
  });

  it("dedupes @graph payloads while preserving nodes without @id", () => {
    const [orgNode, brandNode, webSiteNode] = getSiteStructuredDataNodes();
    const detailUrl =
      "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1";
    const product = buildTourProductStructuredData({
      tour: baseTour,
      detailUrl,
    });
    const trip = buildTourTripStructuredData({
      tour: baseTour,
      detailUrl,
    });
    const breadcrumb = buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      { name: "California", url: "/destinations/united-states/california" },
    ]);
    const webPage = buildWebPageStructuredData({
      url: detailUrl,
      name: "Tour 1",
      description: "Tour 1 description",
    });

    const normalized = normalizeStructuredData({
      "@context": "https://schema.org",
      "@graph": [
        orgNode,
        brandNode,
        webSiteNode,
        { ...orgNode, name: "Duplicate" },
        { ...brandNode, name: "Duplicate" },
        { ...webSiteNode, name: "Duplicate" },
        webPage,
        product,
        trip,
        breadcrumb,
      ],
    });

    expect(normalized).not.toBeNull();
    expect(typeof normalized).toBe("object");
    expect(Array.isArray((normalized as { "@graph": unknown[] })["@graph"]))
      .toBe(true);

    const graph = (normalized as { "@graph": unknown[] })["@graph"];
    expect(graph.length).toBeGreaterThan(0);

    const graphIds = graph
      .map(node =>
        typeof node === "object" && node !== null
          ? (node as { "@id"?: unknown })["@id"]
          : undefined
      )
      .filter((id): id is string => typeof id === "string");

    expect(graphIds.filter(id => id === SITE_ORGANIZATION_ID)).toHaveLength(1);
    expect(graphIds.filter(id => id === SITE_BRAND_ID)).toHaveLength(1);
    expect(graphIds.filter(id => id === SITE_WEBSITE_ID)).toHaveLength(1);

    const graphTypes = graph
      .map(node =>
        typeof node === "object" && node !== null
          ? (node as { "@type"?: string | string[] })["@type"]
          : undefined
      )
      .flatMap(type => (Array.isArray(type) ? type : type ? [type] : []));

    expect(graphTypes).toContain("WebPage");
    expect(graphTypes).toContain("Product");
    expect(graphTypes).toContain("TouristTrip");
    expect(graphTypes).toContain("BreadcrumbList");
  });

  it("is idempotent across repeated normalize calls", () => {
    const [orgNode, brandNode, webSiteNode] = getSiteStructuredDataNodes();
    const payload = {
      "@context": "https://schema.org",
      "@graph": [
        orgNode,
        brandNode,
        webSiteNode,
        { ...orgNode, name: "Duplicate" },
        buildWebPageStructuredData({
          url: "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1",
          name: "Tour 1",
          description: "Tour 1 description",
        }),
      ],
    };

    const once = normalizeStructuredData(payload);
    expect(once).not.toBeNull();
    const twice = normalizeStructuredData(once as never);
    expect(twice).not.toBeNull();
    expect(JSON.stringify(twice)).toBe(JSON.stringify(once));
  });
});
