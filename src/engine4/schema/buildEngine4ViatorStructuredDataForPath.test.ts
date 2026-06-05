import { describe, expect, it } from "vitest";

import { normalizeStructuredData } from "../../utils/structuredData";
import {
  buildEngine4ViatorStructuredDataNodesForPath,
  getEngine4ViatorTourViewModelByPath,
} from "./buildEngine4ViatorStructuredDataForPath";

const MULHOLLAND_PATH =
  "/destinations/california/los-angeles/tours/mulholland-trail-horseback-tour-379799p1";

const getGraph = () => {
  const nodes = buildEngine4ViatorStructuredDataNodesForPath(MULHOLLAND_PATH);
  const structuredData = normalizeStructuredData({
    "@context": "https://schema.org",
    "@graph": nodes ?? [],
  }) as { "@graph": Array<Record<string, unknown>> } | null;

  expect(structuredData).toBeTruthy();
  return structuredData!["@graph"];
};

const hasType = (node: Record<string, unknown>, type: string) => {
  const nodeType = node["@type"];
  return Array.isArray(nodeType) ? nodeType.includes(type) : nodeType === type;
};

describe("Engine4 Viator structured data for prerendered routes", () => {
  it("builds the 379799P1 Engine4 view model used by the detail renderer", () => {
    const tour = getEngine4ViatorTourViewModelByPath(MULHOLLAND_PATH);

    expect(tour?.productCode).toBe("379799P1");
    expect(tour?.title).toBe("Mulholland Trail Horseback Tour");
    expect(tour?.canonicalPath).toBe(MULHOLLAND_PATH);
    expect(tour?.facts.priceFrom).toBe("$75.00");
    expect(tour?.facts.ratingValue).toBe(5);
    expect(tour?.facts.reviewCount).toBe(232);
  });

  it("emits site, WebPage, and full Engine4 tour graph nodes for 379799P1", () => {
    const graph = getGraph();

    expect(graph.some(node => hasType(node, "Organization"))).toBe(true);
    expect(graph.some(node => hasType(node, "TravelAgency"))).toBe(true);
    expect(graph.some(node => hasType(node, "WebSite"))).toBe(true);
    expect(graph.some(node => hasType(node, "WebPage"))).toBe(true);
    expect(graph.some(node => hasType(node, "BreadcrumbList"))).toBe(true);
    expect(graph.some(node => hasType(node, "TouristTrip"))).toBe(true);
    expect(graph.some(node => hasType(node, "Product"))).toBe(true);
    expect(graph.some(node => hasType(node, "Offer"))).toBe(true);
    expect(graph.some(node => hasType(node, "AggregateRating"))).toBe(true);

    const product = graph.find(node => hasType(node, "Product"));
    const offer = graph.find(node => hasType(node, "Offer"));
    const aggregateRating = graph.find(node =>
      hasType(node, "AggregateRating")
    );

    expect(product).toMatchObject({
      name: "Mulholland Trail Horseback Tour",
      aggregateRating: { "@id": expect.stringContaining("#aggregate-rating") },
    });
    expect(offer).toMatchObject({
      price: "75.00",
      priceCurrency: "USD",
    });
    expect(aggregateRating).toMatchObject({
      ratingValue: 5,
      reviewCount: 232,
    });
  });

  it("does not emit duplicate JSON-LD node ids in the merged production graph", () => {
    const graph = getGraph();
    const ids = graph
      .map(node => node["@id"])
      .filter((id): id is string => typeof id === "string");

    expect(new Set(ids).size).toBe(ids.length);
  });
});
