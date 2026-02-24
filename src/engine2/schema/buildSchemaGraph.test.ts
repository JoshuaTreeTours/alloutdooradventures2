import { afterEach, describe, expect, it } from "vitest";

import type { Engine2Tour } from "../data/loadEngine2";
import { buildSchemaGraph } from "./buildSchemaGraph";

const baseTour: Engine2Tour = {
  id: "eng2-1",
  sourceCountrySlug: "united-states",
  sourceCitySlug: "hilo",
  slug: "discover-scuba-diving",
  name: "Discover Scuba Diving",
  provider: {
    name: "Provider",
    shortName: "provider",
  },
  geo: {
    country: "United States",
    region: "Hawaii",
    city: "Hilo",
    lat: 19.7,
    lng: -155.08,
  },
  seo: {
    title: "Discover Scuba Diving in Hilo",
    description: "desc",
    canonicalPath:
      "/destinations/united-states/hawaii/hilo/tours/discover-scuba-diving",
    ogImage: "https://example.com/og.jpg",
  },
  content: {
    experienceText: "text",
    highlights: [],
  },
  images: {
    hero: "https://example.com/hero.jpg",
    gallery: [],
  },
  booking: {
    bookingUrl: "https://booking.example.com/discover-scuba-diving",
  },
  pricing: {
    price: "199",
    currency: "USD",
  },
};

const seo = {
  title: baseTour.seo.title,
  description: baseTour.seo.description,
  canonical: `https://www.alloutdooradventures.com${baseTour.seo.canonicalPath}`,
  og: {
    image: baseTour.seo.ogImage,
  },
};

describe("buildSchemaGraph", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SCHEMA_TOUR_SAFE_V1;
  });
  it("builds US breadcrumb URLs from canonical route and never falls back to california", () => {
    const graph = buildSchemaGraph(baseTour, seo as never);
    const breadcrumb = graph.find(
      node => node["@type"] === "BreadcrumbList"
    ) as {
      itemListElement: Array<{ item: string }>;
    };

    const breadcrumbUrls = breadcrumb.itemListElement.map(item => item.item);
    expect(breadcrumbUrls).toContain("/destinations/united-states/hawaii/hilo");
    expect(breadcrumbUrls.join(" ")).not.toContain("/destinations/california");
  });

  it("keeps standard Offer when no rewrite aggregate pricing is provided", () => {
    const graph = buildSchemaGraph(baseTour, seo as never);
    const product = graph.find(node => node["@type"] === "Product") as {
      offers: { "@type": string; price?: string };
    };

    expect(product.offers["@type"]).toBe("Offer");
    expect(product.offers.price).toBe("199.00");
  });

  it("keeps Product.url canonical and uses /book Offer.url when enabled", () => {
    const graph = buildSchemaGraph(baseTour, seo as never);
    const product = graph.find(node => node["@type"] === "Product") as {
      url: string;
      offers: { url: string };
    };

    expect(product.url).toBe(
      "https://www.alloutdooradventures.com/destinations/united-states/hawaii/hilo/tours/discover-scuba-diving"
    );
    expect(product.offers.url).toBe(
      "https://www.alloutdooradventures.com/destinations/united-states/hawaii/hilo/tours/discover-scuba-diving/book"
    );
  });

  it("keeps global org/brand/website nodes and sameAs", () => {
    const graph = buildSchemaGraph(baseTour, seo as never);
    const org = graph.find(
      node => node["@id"] === "https://www.alloutdooradventures.com/#org"
    ) as { sameAs: string[] };
    const brand = graph.find(
      node => node["@id"] === "https://www.alloutdooradventures.com/#brand"
    ) as { sameAs: string[] };
    const website = graph.find(
      node => node["@id"] === "https://www.alloutdooradventures.com/#website"
    );

    expect(org.sameAs).toContain(
      "https://www.facebook.com/alloutdooradventuresonline/"
    );
    expect(brand.sameAs).toContain(
      "https://www.linkedin.com/company/all-outdoor-adventures/"
    );
    expect(website).toBeTruthy();
  });

  it("falls back to partner booking URL when offer flag is disabled", () => {
    process.env.ENABLE_AOA_BOOKING_OFFER_URL = "false";

    const graph = buildSchemaGraph(baseTour, seo as never);
    const product = graph.find(node => node["@type"] === "Product") as {
      offers: { url: string };
    };

    expect(product.offers.url).toBe(
      "https://booking.example.com/discover-scuba-diving"
    );

    delete process.env.ENABLE_AOA_BOOKING_OFFER_URL;
  });

  it("keeps org/brand IDs, addressCountry, and priceValidUntil for Hilo/Joshua Tree/London", () => {
    const samples: Engine2Tour[] = [
      baseTour,
      {
        ...baseTour,
        id: "eng2-jt",
        sourceCitySlug: "joshua-tree",
        slug: "joshua-tree-jeep-tour",
        name: "Joshua Tree Jeep Tour",
        seo: {
          ...baseTour.seo,
          canonicalPath:
            "/destinations/united-states/california/joshua-tree/tours/joshua-tree-jeep-tour",
        },
        geo: {
          ...baseTour.geo,
          region: "California",
          city: "Joshua Tree",
        },
        booking: {
          bookingUrl: "https://booking.example.com/joshua-tree-jeep-tour",
        },
      },
      {
        ...baseTour,
        id: "eng2-london",
        sourceCountrySlug: "united-kingdom",
        sourceCitySlug: "london",
        slug: "london-e-bike-tour-private-366443",
        name: "London E-Bike Tour",
        seo: {
          ...baseTour.seo,
          canonicalPath:
            "/tours/united-kingdom/london/london-e-bike-tour-private-366443",
        },
        geo: {
          ...baseTour.geo,
          country: "United Kingdom",
          region: "England",
          city: "London",
        },
        booking: {
          bookingUrl:
            "https://booking.example.com/london-e-bike-tour-private-366443",
        },
      },
    ];

    for (const sample of samples) {
      const sampleSeo = {
        title: sample.seo.title,
        description: sample.seo.description,
        canonical: `https://www.alloutdooradventures.com${sample.seo.canonicalPath}`,
        og: {
          image: sample.seo.ogImage,
        },
      };

      const graph = buildSchemaGraph(sample, sampleSeo as never);
      const product = graph.find(node => node["@type"] === "Product") as {
        offers: { priceValidUntil?: string };
      };
      const place = graph.find(node => node["@type"] === "Place") as {
        address: { addressCountry: string };
      };
      const org = graph.find(
        node => node["@id"] === "https://www.alloutdooradventures.com/#org"
      );
      const brand = graph.find(
        node => node["@id"] === "https://www.alloutdooradventures.com/#brand"
      );

      expect(org).toBeTruthy();
      expect(brand).toBeTruthy();
      expect(place.address.addressCountry).toBeTypeOf("string");
      expect(product.offers.priceValidUntil).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("adds WebPage mainEntity and TouristTrip destination itinerary", () => {
    const graph = buildSchemaGraph(
      baseTour,
      seo as never,
      null,
      false,
      undefined,
      undefined,
      true,
      {
        whatYoullExperience: ["x"],
        highlights: ["y"],
        schemaDescription: "desc",
        durationISO: "PT3H",
      }
    );

    const webPage = graph.find(node => node["@type"] === "WebPage") as {
      mainEntity?: { "@id": string };
    };
    const trip = graph.find(node => node["@type"] === "TouristTrip") as {
      touristDestination?: { "@id": string };
      itinerary?: {
        "@type": string;
        itemListElement: Array<{ item: { "@id": string } }>;
      };
    };

    expect(webPage.mainEntity).toEqual({ "@id": `${seo.canonical}#product` });
    expect(trip.touristDestination).toEqual({
      "@id": `${seo.canonical}#place`,
    });
    expect(trip.itinerary?.["@type"]).toBe("ItemList");
    expect(trip.itinerary?.itemListElement[0].item).toEqual({
      "@id": `${seo.canonical}#place`,
    });
  });

  it("uses 3-5 list-item itinerary steps for tour 34849 rollout", () => {
    const graph = buildSchemaGraph(
      { ...baseTour, id: "34849", geo: { ...baseTour.geo, city: "Indio" } },
      seo as never,
      null,
      false,
      undefined,
      undefined,
      true,
      {
        whatYoullExperience: [
          "Open-air Jeep route with geology interpretation in the fault zone.",
        ],
        highlights: [
          "Open-air Jeep drive into the Indio Hills fault zone",
          "Short stops for geology interpretation and photos near slot canyon views",
          "Palm oasis habitat viewpoint with local history context",
        ],
        schemaDescription: "desc",
        durationISO: "PT3H",
        durationLabel: "3 hours",
        meetingPoint: {
          name: "Metate Ranch",
          city: "Indio",
        },
      }
    );

    const trip = graph.find(node => node["@type"] === "TouristTrip") as {
      itinerary?: {
        "@type": string;
        itemListElement: Array<{ position: number; name: string }>;
      };
    };

    expect(trip.itinerary?.["@type"]).toBe("ItemList");
    expect(trip.itinerary?.itemListElement.length).toBeGreaterThanOrEqual(3);
    expect(trip.itinerary?.itemListElement.length).toBeLessThanOrEqual(5);
    const listItems = trip.itinerary?.itemListElement ?? [];

    expect(listItems[0].name).toContain("Metate Ranch");
    expect(listItems[listItems.length - 1].name).toContain(
      "Return to Metate Ranch"
    );
  });
  it("uses rewrite-v3 category, meeting point and schema price in Product/TouristTrip", () => {
    const graph = buildSchemaGraph(
      baseTour,
      seo as never,
      null,
      false,
      undefined,
      undefined,
      true,
      {
        heroPriceText: "$175 adult / $150 child",
        schemaPrice: 175,
        priceCurrency: "USD",
        category: { primary: "Jeep tour", tags: ["geology"] },
        meetingPoint: {
          name: "Metate Ranch",
          addressLine1: "38635 Monroe St",
          city: "Indio",
          region: "CA",
          postalCode: "92203",
          country: "US",
        },
        durationLabel: "3 hours",
        durationISO: "PT3H",
        pricing: {
          currency: "USD",
          low: 150,
          high: 175,
          displayText: "$175 adult / $150 child",
          isAggregate: true,
        },
        canonicalPath:
          "/destinations/california/palm-springs/tours/shared-san-andreas-fault-jeep-tour-34849",
        whatYoullExperience: ["x"],
        highlights: ["y"],
        schemaDescription: "desc",
        heroImage: "https://cdn.filestackcontent.com/H4abOlNUQlmRczadXw7c",
        image2: "https://cdn.filestackcontent.com/9n2dX1uRT0eI7x9AqkLm",
      }
    );
    const product = graph.find(node => node["@type"] === "Product") as {
      category?: string;
      image?: string[];
      offers: {
        "@type": string;
        lowPrice?: string;
        highPrice?: string;
        priceCurrency: string;
      };
    };
    const trip = graph.find(node => node["@type"] === "TouristTrip") as {
      duration?: string;
      image?: string[];
      departureLocation?: { name: string; address: { streetAddress: string } };
      offers: { "@type": string; lowPrice?: string; highPrice?: string };
    };
    const breadcrumb = graph.find(
      node => node["@type"] === "BreadcrumbList"
    ) as {
      itemListElement: Array<{ item: string }>;
    };

    expect(product.category).toBe("Jeep tour");
    expect(product.offers["@type"]).toBe("AggregateOffer");
    expect(product.offers.lowPrice).toBe("150.00");
    expect(product.offers.highPrice).toBe("175.00");
    expect(product.offers.priceCurrency).toBe("USD");
    expect(trip.offers["@type"]).toBe("AggregateOffer");
    expect(trip.duration).toBe("PT3H");
    expect(product.image).toEqual([
      baseTour.images.hero,
      "https://cdn.filestackcontent.com/9n2dX1uRT0eI7x9AqkLm",
    ]);
    expect(trip.image).toEqual([
      baseTour.images.hero,
      "https://cdn.filestackcontent.com/9n2dX1uRT0eI7x9AqkLm",
    ]);

    const breadcrumbUrls = breadcrumb.itemListElement.map(item => item.item);
    expect(breadcrumbUrls.join(" ")).toContain(
      "/destinations/california/palm-springs/tours"
    );
    expect(breadcrumbUrls.join(" ")).not.toContain(
      "/destinations/united-states"
    );
    expect(trip.departureLocation?.name).toBe("Metate Ranch");
    expect(trip.departureLocation?.address.streetAddress).toBe(
      "38635 Monroe St"
    );
  });
});
