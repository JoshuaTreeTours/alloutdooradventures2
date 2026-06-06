import { describe, expect, it } from "vitest";

import { buildTourSchemaGraph } from "./buildTourSchemaGraph";
import { resolveTourSchemaActivityLabel } from "./resolveTourSchemaActivityLabel";

const buildCategoryGraph = (
  title: string,
  schemaActivityLabel: string | null
) => {
  const graph = buildTourSchemaGraph({
    url: `https://www.alloutdooradventures.com/tours/${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}`,
    pageName: title,
    pageDescription: `${title} page`,
    heroImage: "https://example.com/hero.jpg",
    place: {
      city: "Anchorage",
      region: "Alaska",
      countryCode: "US",
      lat: 61.2176,
      lng: -149.8997,
    },
    product: {
      id: `https://www.alloutdooradventures.com/#${title}`,
      name: title,
      description: `${title} product`,
      category: schemaActivityLabel,
    },
    trip: {
      id: `https://www.alloutdooradventures.com/tours/${title}#trip`,
      name: title,
      description: `${title} trip`,
      touristType: schemaActivityLabel,
      departureLocation: null,
    },
    offers: {
      url: "https://www.alloutdooradventures.com/book",
      price: 99,
      priceCurrency: "USD",
    },
    brandOrgIds: {
      orgId: "https://www.alloutdooradventures.com/#org",
      brandId: "https://www.alloutdooradventures.com/#brand",
      websiteId: "https://www.alloutdooradventures.com/#website",
    },
  })["@graph"] as Array<Record<string, unknown>>;

  return {
    product: graph.find(node => node["@type"] === "Product") as Record<
      string,
      unknown
    >,
    trip: graph.find(node => node["@type"] === "TouristTrip") as Record<
      string,
      unknown
    >,
  };
};

const expectSchemaActivityParity = (
  tour: Parameters<typeof resolveTourSchemaActivityLabel>[0],
  expectedLabel: string
) => {
  const resolvedLabel = resolveTourSchemaActivityLabel(tour);
  const { product, trip } = buildCategoryGraph(
    tour.title ?? "Tour",
    resolvedLabel
  );

  expect(resolvedLabel).toBe(expectedLabel);
  expect(product.category).toBe(expectedLabel);
  expect(trip.touristType).toBe(expectedLabel);
};

describe("resolveTourSchemaActivityLabel", () => {
  it("outputs Cycling for a legacy bike tour Product.category and TouristTrip.touristType", () => {
    expectSchemaActivityParity(
      {
        title: "Haleakala Downhill Self-Guided Bike Tour",
        shortDescription: "Self-guided cycling descent from Haleakala.",
        primaryCategory: "adventure",
        categories: ["Bike Tour", "Self-Guided Tour"],
      },
      "Cycling"
    );
  });

  it("outputs Paddle Sports for a legacy kayak/SUP tour Product.category and TouristTrip.touristType", () => {
    expectSchemaActivityParity(
      {
        title: "Sunset Kayak and SUP Tour",
        shortDescription: "Paddle a kayak or stand up paddleboard at sunset.",
        primaryCategory: "adventure",
        categories: ["Kayak", "SUP"],
      },
      "Paddle Sports"
    );
  });

  it("outputs Hiking for a legacy hiking tour Product.category and TouristTrip.touristType", () => {
    expectSchemaActivityParity(
      {
        title: "Matanuska Glacier Hike",
        shortDescription: "Guided glacier hike on Alaska ice trails.",
        primaryCategory: "adventure",
        categories: ["Guided Tour"],
      },
      "Hiking"
    );
  });

  it("leaves already-correct Product.category and TouristTrip.touristType unchanged", () => {
    expectSchemaActivityParity(
      {
        title: "Original Sea Cave Kayak Tour",
        shortDescription: "A guided kayak tour through sea caves.",
        primaryCategory: "paddle-sports",
        primaryDisplayCategory: "Paddle Sports",
        activityCategories: [{ slug: "paddle-sports", label: "Paddle Sports" }],
      },
      "Paddle Sports"
    );
  });

  it("does not emit generic TouristTrip.touristType when a resolved activity exists", () => {
    const resolvedLabel = resolveTourSchemaActivityLabel({
      title: "Downtown Food Walking Tour",
      shortDescription: "Taste local food stops on a guided walking tour.",
      primaryCategory: "adventure",
      categories: ["Food Tour", "Walking Tour"],
    });
    const { product, trip } = buildCategoryGraph(
      "Downtown Food Walking Tour",
      resolvedLabel
    );

    expect(resolvedLabel).toBeTruthy();
    expect(product.category).toBe(resolvedLabel);
    expect(trip.touristType).toBe(resolvedLabel);
    expect([
      "Adventure travelers",
      "Outdoor enthusiasts",
      "General travelers",
    ]).not.toContain(trip.touristType);
  });
});
