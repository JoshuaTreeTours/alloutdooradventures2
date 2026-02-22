import { describe, expect, it } from "vitest";

import {
  SITE_BRAND_ID,
  SITE_ORGANIZATION_ID,
  SITE_WEBSITE_ID,
  buildTourBreadcrumbItems,
  buildTourProductStructuredData,
  buildTourTripStructuredData,
  getSiteStructuredDataNodes,
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


  it("builds destination breadcrumbs with United States hierarchy", () => {
    const breadcrumbs = buildTourBreadcrumbItems(
      {
        ...baseTour,
        destination: {
          ...baseTour.destination,
          state: "Hawaii",
          stateSlug: "hawaii",
          city: "Hilo",
          citySlug: "hilo",
        },
      },
      "https://www.alloutdooradventures.com/tours/hawaii/hilo/discover-scuba-diving-17418"
    );

    expect(breadcrumbs).toEqual([
      { name: "Destinations", url: "/destinations" },
      { name: "United States", url: "/destinations/united-states" },
      { name: "Hawaii", url: "/destinations/united-states/hawaii" },
      { name: "Hilo", url: "/destinations/united-states/hawaii/hilo" },
      { name: "Tours", url: "/destinations/united-states/hawaii/hilo/tours" },
      {
        name: "Test Tour",
        url: "https://www.alloutdooradventures.com/tours/hawaii/hilo/discover-scuba-diving-17418",
      },
    ]);
  });

  it("throws when location country is missing", () => {
    expect(() =>
      buildTourTripStructuredData({
        tour: {
          ...baseTour,
          destination: {
            ...baseTour.destination,
            country: undefined,
          },
        },
        detailUrl:
          "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1",
      })
    ).toThrow(/missing destination country/i);
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
