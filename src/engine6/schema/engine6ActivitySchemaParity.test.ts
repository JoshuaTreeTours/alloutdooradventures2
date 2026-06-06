import { describe, expect, it } from "vitest";

import { classifyTourCategories } from "../../lib/tourCategoryClassifier";
import { getEngine6NativeTourByCanonicalPath } from "../registry";
import { buildEngine6SchemaGraph } from "./buildEngine6SchemaGraph";

const getSchemaCategoryValues = (canonicalPath: string) => {
  const tour = getEngine6NativeTourByCanonicalPath(canonicalPath);
  expect(tour).toBeTruthy();

  const graph = buildEngine6SchemaGraph(tour!)["@graph"] as Array<
    Record<string, unknown>
  >;
  const trip = graph.find(node => node["@type"] === "TouristTrip") as Record<
    string,
    unknown
  >;
  const product = graph.find(node => node["@type"] === "Product") as Record<
    string,
    unknown
  >;

  return { tour: tour!, trip, product };
};

describe("Engine6 schema activity parity", () => {
  it("emits Sailing, not Cycling, for San Diego Bay Day Sail", () => {
    const { tour, trip, product } = getSchemaCategoryValues(
      "/destinations/california/san-diego/tours/san-diego-bay-day-sail"
    );

    expect(tour.primaryDisplayCategory).toBe("Sailing");
    expect(trip.touristType).toBe("Sailing");
    expect(product.category).toBe("Sailing");
    expect(trip.duration).toBe("PT2H30M");
    expect(JSON.stringify({ trip, product })).not.toContain("Cycling");
  });

  it("emits Boating for a known boating page", () => {
    const { trip, product } = getSchemaCategoryValues(
      "/destinations/california/san-diego/tours/san-diego-sunday-brunch-cruise"
    );

    expect(trip.touristType).toBe("Boating");
    expect(product.category).toBe("Boating");
  });

  it("emits Hiking for a known hiking page", () => {
    const { trip, product } = getSchemaCategoryValues(
      "/destinations/california/los-angeles/tours/hollywood-hills-hiking-tour-in-los-angeles"
    );

    expect(trip.touristType).toBe("Hiking");
    expect(product.category).toBe("Hiking");
  });

  it("keeps parasailing in Water Sports", () => {
    const { trip, product } = getSchemaCategoryValues(
      "/destinations/california/santa-barbara/tours/soar-above-beautiful-santa-barbara"
    );

    expect(trip.touristType).toBe("Water Sports");
    expect(product.category).toBe("Water Sports");
  });

  it("keeps city/private sightseeing in Sightseeing & City Tours", () => {
    const classification = classifyTourCategories({
      title: "Private North Shore and Salem Tour",
      overview:
        "A private day trip by road focused on Salem history, landmarks, and coastal sightseeing.",
      categories: ["private tour", "city tour"],
    });

    expect(classification.primaryDisplayCategory).toBe(
      "Sightseeing & City Tours"
    );
    expect(classification.matchedCategorySlugs[0]).toBe(
      "sightseeing-city-tours"
    );
  });
});
