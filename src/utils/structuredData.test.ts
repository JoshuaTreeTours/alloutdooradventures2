import { describe, expect, it } from "vitest";

import {
  SITE_BRAND_ID,
  SITE_ORGANIZATION_ID,
  SITE_WEBSITE_ID,
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

describe("tour product/trip schema", () => {
  const detailUrl =
    "https://www.alloutdooradventures.com/tours/california/san-diego/tour-1";

  it("emits textual price range via PriceSpecification and no Offer linkage", () => {
    const product = buildTourProductStructuredData({
      tour: baseTour,
      detailUrl,
    });
    const trip = buildTourTripStructuredData({
      tour: baseTour,
      detailUrl,
    });

    expect(product).toMatchObject({
      "@type": "Product",
      "@id": `${detailUrl}#product`,
      brand: { "@id": SITE_BRAND_ID },
      manufacturer: { "@id": SITE_ORGANIZATION_ID },
      provider: { "@id": SITE_BRAND_ID },
      category: "Tour",
      url: detailUrl,
      priceSpecification: {
        "@type": "PriceSpecification",
        description: "Price range: $$–$$$",
      },
    });
    expect(product).not.toHaveProperty("offers");

    expect(trip).toMatchObject({
      "@type": "TouristTrip",
      "@id": `${detailUrl}#touristtrip`,
      touristType: ["Adventure", "Sightseeing"],
      provider: { "@id": SITE_BRAND_ID },
      priceSpecification: {
        "@type": "PriceSpecification",
        description: "Price range: $$–$$$",
      },
    });
    expect(trip).not.toHaveProperty("offers");
  });

  it("emits Place/PostalAddress location with locality and country on tours", () => {
    const trip = buildTourTripStructuredData({
      tour: baseTour,
      detailUrl,
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
});
