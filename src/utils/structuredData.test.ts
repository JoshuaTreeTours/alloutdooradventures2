import { afterEach, describe, expect, it } from "vitest";

import {
  SITE_BRAND_ID,
  SITE_ORGANIZATION_ID,
  SITE_POSTAL_ADDRESS,
  SITE_WEBSITE_ID,
  buildTourProductNodeId,
  buildTourProductStructuredData,
  buildTourTripStructuredData,
  buildWebPageStructuredData,
  buildBreadcrumbList,
  dedupeGraphNodesById,
  getMissingGeoFallbackReport,
  getSiteStructuredDataNodes,
  normalizeStructuredData,
  resetMissingGeoFallbackReport,
  resolveOfferUrl,
} from "./structuredData";
import type { Tour } from "../data/tours.types";
import { buildImageUrl, ROOT_OG_IMAGE } from "./seo";

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
      logo: "https://www.alloutdooradventures.com/images/Outdoor-Adventures-Logo-Transparent.png",
      telephone: "+1-855-314-8687",
      address: SITE_POSTAL_ADDRESS,
    });

    expect(nodes[1]).toMatchObject({
      "@type": ["Organization", "TravelAgency"],
      "@id": SITE_BRAND_ID,
      name: "All Outdoor Adventures",
      url: "https://www.alloutdooradventures.com",
      logo: "https://www.alloutdooradventures.com/images/Outdoor-Adventures-Logo-Transparent.png",
      telephone: "+1-855-314-8687",
      parentOrganization: { "@id": SITE_ORGANIZATION_ID },
      address: SITE_POSTAL_ADDRESS,
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

  it("only includes the root hero on explicit organization-level metadata", () => {
    const [defaultOrgNode, defaultBrandNode] = getSiteStructuredDataNodes();
    const [rootOrgNode, rootBrandNode, webSiteNode] =
      getSiteStructuredDataNodes({
        includeRootImage: true,
      });
    const image = buildImageUrl(ROOT_OG_IMAGE);

    expect(defaultOrgNode).not.toHaveProperty("image");
    expect(defaultBrandNode).not.toHaveProperty("image");
    expect(rootOrgNode.image).toBe(image);
    expect(rootBrandNode.image).toBe(image);
    expect(webSiteNode).not.toHaveProperty("image");
  });

  it("includes a shared Las Vegas postal address on org/brand", () => {
    const serialized = JSON.stringify(getSiteStructuredDataNodes());
    expect(serialized).toContain('"address"');
    expect(serialized).toContain("732 S 6th St, Ste N");
    expect(nodesWithAddress(getSiteStructuredDataNodes())).toBe(true);
  });

  it("does not emit local-business-only fields on org/brand", () => {
    const serialized = JSON.stringify(getSiteStructuredDataNodes());
    expect(serialized).not.toContain("LocalBusiness");
    expect(serialized).not.toContain('"geo"');
    expect(serialized).not.toContain('"hasMap"');
    expect(serialized).not.toContain('"openingHours"');
    expect(serialized).not.toContain('"priceRange"');
  });
});

const nodesWithAddress = (
  nodes: ReturnType<typeof getSiteStructuredDataNodes>
) =>
  [0, 1].every(
    index =>
      JSON.stringify(nodes[index]?.address) ===
      JSON.stringify(SITE_POSTAL_ADDRESS)
  );

describe("tour product/trip schema safety", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SCHEMA_TOUR_SAFE_V1;
    delete process.env.ENABLE_RATINGS_SCHEMA;
  });
  it("emits Product with Offer and textual price specification", () => {
    const product = buildTourProductStructuredData({
      tour: baseTour,
      detailUrl:
        "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1",
    });

    expect(product).toMatchObject({
      "@type": "Product",
      "@id": "https://www.alloutdooradventures.com/#ptour-1",
      brand: { "@id": SITE_BRAND_ID },
      provider: { "@id": SITE_BRAND_ID },
      seller: { "@id": SITE_ORGANIZATION_ID },
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

  it("builds stable product node IDs from tour IDs", () => {
    expect(buildTourProductNodeId("2335P1")).toBe(
      "https://www.alloutdooradventures.com/#p2335P1"
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

  it("emits a single cleaned hero image and omits the default placeholder", () => {
    const product = buildTourProductStructuredData({
      tour: baseTour,
      detailUrl:
        "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1",
      images: [
        "https://example.com/tour-main.jpg",
        "https://www.alloutdooradventures.com/default-tour.jpg",
      ],
    });

    expect(product.image).toBe("https://example.com/tour-main.jpg");
  });

  it("adds safe-v1 Product/TouristTrip links and areaServed when feature flag is enabled", () => {
    process.env.NEXT_PUBLIC_SCHEMA_TOUR_SAFE_V1 = "true";

    const detailUrl =
      "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1";
    const product = buildTourProductStructuredData({
      tour: {
        ...baseTour,
        badges: {
          ...baseTour.badges,
          duration: "2 hours",
        },
      },
      detailUrl,
    });
    const trip = buildTourTripStructuredData({
      tour: {
        ...baseTour,
        badges: {
          ...baseTour.badges,
          duration: "2 hours",
        },
      },
      detailUrl,
    });

    expect(product).toMatchObject({
      duration: "2 hours",
      areaServed: { "@id": `${detailUrl}#place` },
      isRelatedTo: { "@id": `${detailUrl}#trip` },
    });

    expect(trip).toMatchObject({
      duration: "2 hours",
      areaServed: { "@id": `${detailUrl}#place` },
      isRelatedTo: { "@id": "https://www.alloutdooradventures.com/#ptour-1" },
    });
  });

  it("keeps TouristTrip aggregateRating off in safe-v1 while Product remains eligible", () => {
    process.env.NEXT_PUBLIC_SCHEMA_TOUR_SAFE_V1 = "true";
    process.env.ENABLE_RATINGS_SCHEMA = "true";

    const detailUrl =
      "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1";
    const ratedTour = {
      ...baseTour,
      badges: {
        ...baseTour.badges,
        rating: 4.7,
        reviewCount: 120,
      },
    };

    const product = buildTourProductStructuredData({
      tour: ratedTour,
      detailUrl,
    }) as { aggregateRating?: unknown };
    const trip = buildTourTripStructuredData({
      tour: ratedTour,
      detailUrl,
    }) as { aggregateRating?: unknown };

    expect(product.aggregateRating).toBeTruthy();
    expect(trip.aggregateRating).toBeUndefined();
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

  it("emits Place/PostalAddress with US region code and containing state on tours", () => {
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
        addressRegion: "CA",
        addressCountry: "US",
      },
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "California",
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

  it("infers FR from /destinations/europe/france/... URLs", () => {
    const trip = buildTourTripStructuredData({
      tour: {
        ...baseTour,
        destination: {
          ...baseTour.destination,
          country: undefined,
        },
      },
      detailUrl:
        "https://www.alloutdooradventures.com/destinations/europe/france/cities/paris/tours/x-195968",
    });

    expect(trip.location).toMatchObject({
      address: {
        addressCountry: "FR",
      },
    });
  });

  it("infers FR from /destinations/france/... URLs", () => {
    const trip = buildTourTripStructuredData({
      tour: {
        ...baseTour,
        destination: {
          ...baseTour.destination,
          country: undefined,
        },
      },
      detailUrl:
        "https://www.alloutdooradventures.com/destinations/france/paris/tours/x-195968",
    });

    expect(trip.location).toMatchObject({
      address: {
        addressCountry: "FR",
      },
    });
  });

  it("uses US for state slug routes under /destinations", () => {
    const trip = buildTourTripStructuredData({
      tour: {
        ...baseTour,
        destination: {
          ...baseTour.destination,
          country: undefined,
        },
      },
      detailUrl:
        "https://www.alloutdooradventures.com/destinations/california/joshua-tree/tours/x",
    });

    expect(trip.location).toMatchObject({
      address: {
        addressCountry: "US",
      },
    });
  });

  it("records fallback when country slug cannot be mapped", () => {
    resetMissingGeoFallbackReport();

    const detailUrl =
      "https://www.alloutdooradventures.com/destinations/atlantis/poseidon/tours/x";
    const trip = buildTourTripStructuredData({
      tour: {
        ...baseTour,
        destination: {
          ...baseTour.destination,
          country: undefined,
        },
      },
      detailUrl,
    });

    expect(trip.location).toMatchObject({
      address: {
        addressCountry: "US",
      },
    });

    expect(getMissingGeoFallbackReport()).toContainEqual(
      expect.objectContaining({
        tourId: baseTour.id,
        title: baseTour.title,
        detailUrl,
        inferredISO2: "US",
      })
    );
  });

  it("keeps Product.url canonical while Offer.url resolves to /book when route exists", () => {
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
        url: "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1/book",
      },
    });
  });

  it("uses /book offer URLs by default when booking routes exist", () => {
    const detailUrl =
      "https://www.alloutdooradventures.com/tours/united-kingdom/london/london-e-bike-tour-private-366443";
    const product = buildTourProductStructuredData({
      tour: baseTour,
      detailUrl,
      bookingUrl: "https://booking.example.com/tour-1",
    });
    const trip = buildTourTripStructuredData({
      tour: baseTour,
      detailUrl,
      bookingUrl: "https://booking.example.com/tour-1",
    });

    expect(product.url).toBe(detailUrl);
    expect(product.offers).toMatchObject({
      url: `${detailUrl}/book`,
    });
    expect(trip.offers).toMatchObject({
      url: `${detailUrl}/book`,
    });
  });

  it("falls back to partner booking URL then canonical URL when flag is disabled", () => {
    process.env.ENABLE_AOA_BOOKING_OFFER_URL = "false";

    const detailUrl =
      "https://www.alloutdooradventures.com/tours/united-kingdom/london/london-e-bike-tour-private-366443";
    expect(
      resolveOfferUrl({
        canonicalUrl: detailUrl,
        partnerBookingUrl: "https://booking.example.com/tour-1",
      })
    ).toBe("https://booking.example.com/tour-1");

    expect(
      resolveOfferUrl({
        canonicalUrl: detailUrl,
      })
    ).toBe(detailUrl);

    delete process.env.ENABLE_AOA_BOOKING_OFFER_URL;
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
    expect(
      Array.isArray((normalized as { "@graph": unknown[] })["@graph"])
    ).toBe(true);

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

  it("sets both about and mainEntity when mainEntityId is provided", () => {
    const detailUrl =
      "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1";
    const productNodeId = "https://www.alloutdooradventures.com/#ptour-1";

    const webPage = buildWebPageStructuredData({
      url: detailUrl,
      name: "Tour 1",
      description: "Tour 1 description",
      mainEntityId: productNodeId,
    });

    expect(webPage).toMatchObject({
      "@id": `${detailUrl}#webpage`,
      about: { "@id": productNodeId },
      mainEntity: { "@id": productNodeId },
    });
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
