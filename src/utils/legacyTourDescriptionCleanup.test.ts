import { describe, expect, it } from "vitest";

import { engine6ResolvedTours } from "../engine6/registry";
import { buildEngine6SchemaGraph } from "../engine6/schema/buildEngine6SchemaGraph";
import { buildTourSchemaGraph } from "../schema/buildTourSchemaGraph";
import { buildTourMetaDescription } from "./seo";

const LEGACY_BRAND_IDS = {
  orgId: "https://www.alloutdooradventures.com/#org",
  brandId: "https://www.alloutdooradventures.com/#brand",
  websiteId: "https://www.alloutdooradventures.com/#website",
};

const findSchemaNode = (
  graph: Array<Record<string, unknown>>,
  type: "WebPage" | "Product" | "TouristTrip"
) => {
  const node = graph.find(candidate => candidate["@type"] === type);
  expect(node).toBeTruthy();
  return node as Record<string, unknown>;
};

const buildLegacyDescriptions = ({
  title,
  city,
  state,
  operator,
  rawDescription,
  category,
}: {
  title: string;
  city: string;
  state: string;
  operator: string;
  rawDescription: string;
  category: string;
}) => {
  const canonicalUrl = `https://www.alloutdooradventures.com/destinations/${state.toLowerCase()}/${city.toLowerCase().replace(/\s+/g, "-")}/tours/${title.toLowerCase().replace(/\s+/g, "-")}`;
  const metaDescription = buildTourMetaDescription({
    id: `${operator}-${title}`,
    slug: title.toLowerCase().replace(/\s+/g, "-"),
    title,
    operator,
    shortDescription: rawDescription,
    longDescription: rawDescription,
    destination: {
      city,
      state,
      citySlug: city.toLowerCase().replace(/\s+/g, "-"),
      stateSlug: state.toLowerCase(),
    },
    badges: {},
  });
  const graph = buildTourSchemaGraph({
    url: canonicalUrl,
    pageName: title,
    pageDescription: metaDescription,
    heroImage: "https://example.com/legacy-tour.jpg",
    place: { city, region: state, countryCode: "US" },
    product: {
      id: `${canonicalUrl}#product`,
      name: title,
      description: metaDescription,
      category,
    },
    trip: {
      id: `${canonicalUrl}#trip`,
      name: title,
      description: metaDescription,
      touristType: category,
      departureLocation: null,
    },
    offers: {
      url: `${canonicalUrl}/book`,
      price: 99,
      priceCurrency: "USD",
    },
    brandOrgIds: LEGACY_BRAND_IDS,
  })["@graph"] as Array<Record<string, unknown>>;

  return {
    metaDescription,
    webPage: findSchemaNode(graph, "WebPage"),
    product: findSchemaNode(graph, "Product"),
    trip: findSchemaNode(graph, "TouristTrip"),
  };
};

describe("legacy tour description cleanup", () => {
  it("keeps Engine6 tour descriptions on the Engine6 schema path", () => {
    const tour = engine6ResolvedTours.find(
      candidate => candidate.productCode === "37126P9"
    );
    expect(tour).toBeTruthy();

    const graph = buildEngine6SchemaGraph(tour!)["@graph"] as Array<
      Record<string, unknown>
    >;
    const descriptions = [
      findSchemaNode(graph, "WebPage").description,
      findSchemaNode(graph, "Product").description,
      findSchemaNode(graph, "TouristTrip").description,
    ].map(String);

    for (const description of descriptions) {
      expect(description).toContain(
        "Skip the crowded tour boats. Liberty carries just six guests"
      );
      expect(description).not.toBe(
        "San Diego Bay Day Sail in San Diego, California with San Diego Sailing Tours."
      );
    }
  });

  it("replaces legacy raw category bullet fragments in meta and schema descriptions without changing schema category fields", () => {
    const { metaDescription, webPage, product, trip } = buildLegacyDescriptions(
      {
        title: "Sample Lake Outing",
        city: "Jackson",
        state: "Wyoming",
        operator: "Willow Creek Horseback Rides",
        rawDescription: "canoeing • with Willow Creek Horseback Rides",
        category: "Horseback Riding",
      }
    );

    const descriptions = [
      metaDescription,
      webPage.description,
      product.description,
      trip.description,
    ].map(String);

    for (const description of descriptions) {
      expect(description).toBe(
        "Sample Lake Outing in Jackson, Wyoming with Willow Creek Horseback Rides."
      );
      expect(description).not.toMatch(/\bcanoeing\s*•\s*with\b/i);
    }
    expect(product.category).toBe("Horseback Riding");
    expect(trip.touristType).toBe("Horseback Riding");
  });

  it("does not output detours bullets for SUP - Coronado legacy descriptions", () => {
    const { metaDescription, webPage, product, trip } = buildLegacyDescriptions(
      {
        title: "SUP - Coronado",
        city: "Coronado",
        state: "California",
        operator: "Seaforth Boat Rentals",
        rawDescription: "detours • with Seaforth Boat Rentals",
        category: "detours",
      }
    );

    for (const description of [
      metaDescription,
      webPage.description,
      product.description,
      trip.description,
    ].map(String)) {
      expect(description).toBe(
        "SUP - Coronado in Coronado, California with Seaforth Boat Rentals."
      );
      expect(description).not.toMatch(/\bdetours\s*•/i);
    }
  });

  it("does not output canoeing bullets for Trapper Pack Trip legacy descriptions", () => {
    const { metaDescription, webPage, product, trip } = buildLegacyDescriptions(
      {
        title: "The Trapper Pack Trip 2 Days 1 Night",
        city: "Jackson",
        state: "Wyoming",
        operator: "Willow Creek Horseback Rides",
        rawDescription: "canoeing • with Willow Creek Horseback Rides",
        category: "Horseback Riding",
      }
    );

    for (const description of [
      metaDescription,
      webPage.description,
      product.description,
      trip.description,
    ].map(String)) {
      expect(description).toBe(
        "The Trapper Pack Trip 2 Days 1 Night in Jackson, Wyoming with Willow Creek Horseback Rides."
      );
      expect(description).not.toMatch(/\bcanoeing\s*•/i);
    }
  });
});
