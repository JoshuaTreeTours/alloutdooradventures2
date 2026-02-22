import { describe, expect, it } from "vitest";

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
  it("builds US breadcrumb URLs from canonical route and never falls back to california", () => {
    const graph = buildSchemaGraph(baseTour, seo as never);
    const breadcrumb = graph.find(node => node["@type"] === "BreadcrumbList") as {
      itemListElement: Array<{ item: string }>;
    };

    const breadcrumbUrls = breadcrumb.itemListElement.map(item => item.item);
    expect(breadcrumbUrls).toContain("/destinations/united-states/hawaii/hilo");
    expect(breadcrumbUrls.join(" ")).not.toContain("/destinations/california");
  });

  it("keeps Product.url canonical and Offer.url as booking URL", () => {
    const graph = buildSchemaGraph(baseTour, seo as never);
    const product = graph.find(node => node["@type"] === "Product") as {
      url: string;
      offers: { url: string };
    };

    expect(product.url).toBe(
      "https://www.alloutdooradventures.com/destinations/united-states/hawaii/hilo/tours/discover-scuba-diving"
    );
    expect(product.offers.url).toBe(
      "https://booking.example.com/discover-scuba-diving"
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
});
