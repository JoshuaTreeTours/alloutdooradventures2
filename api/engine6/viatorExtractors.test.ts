import { describe, expect, it } from "vitest";
import { extractEngine6Product } from "./viatorExtractors";

describe("extractEngine6Product operatorReviews mapping", () => {
  it("maps operatorReviews rating and totalReviews without dropping to zero", () => {
    const payload = {
      product: {
        productCode: "335698P13",
        title: "Rock Scrambling Adventures in Joshua Tree National Park",
        productUrl:
          "https://www.viator.com/tours/Palm-Springs/Rock-Scrambling-Adventures-in-Joshua-Tree-National-Park/d648-335698P13",
        operatorReviews: {
          combinedAverageRating: 5,
          totalReviews: 86,
        },
      },
    };

    const result = extractEngine6Product(payload as Record<string, unknown>);

    expect(result.extracted.aggregateRating).toBe(5);
    expect(result.extracted.reviewCount).toBe(86);
    expect(result.extracted.reviewCount).toBeGreaterThan(0);
    expect(result.diagnostics.ratingFieldPath).toBe(
      "product.operatorReviews.combinedAverageRating"
    );
    expect(result.diagnostics.reviewCountFieldPath).toBe(
      "product.operatorReviews.totalReviews"
    );
  });

  it("prefers normalized reviews/operatorReviews counts over top-level zero reviewCount", () => {
    const payload = {
      product: {
        productCode: "335698P13",
        reviewCount: 0,
        reviews: { totalReviews: 86, combinedAverageRating: 5 },
        operatorReviews: { totalReviews: 86, combinedAverageRating: 5 },
      },
    };

    const result = extractEngine6Product(payload as Record<string, unknown>);

    expect(result.extracted.reviewCount).toBe(86);
    expect(result.extracted.aggregateRating).toBe(5);
    expect(result.diagnostics.reviewCountFieldPath).toBe(
      "product.reviews.totalReviews"
    );
  });
});

describe("extractEngine6Product category normalization", () => {
  it("canonicalizes bike, e-bike, mountain bike, hiking, and walking category labels", () => {
    const payload = {
      product: {
        productCode: "CATEGORYTEST",
        title: "Category test",
        categories: [
          "Bike Tours",
          "E-Bike Tours",
          "Mountain Bike Tours",
          "Hiking Tours",
          "Walking Tours",
        ],
      },
    };

    const result = extractEngine6Product(payload as Record<string, unknown>);

    expect(result.extracted.primaryCategory).toBe("cycling");
    expect(result.extracted.categories).toEqual([
      "cycling",
      "hiking",
      "sightseeing-city-tours",
    ]);
    expect(result.extracted.primaryDisplayCategory).toBe("Cycling");
    expect(result.extracted.activityCategories).toEqual([
      { slug: "cycling", label: "Cycling" },
      { slug: "hiking", label: "Hiking" },
      { slug: "sightseeing-city-tours", label: "Sightseeing & City Tours" },
    ]);
  });
});

describe("extractEngine6Product itinerary title overrides", () => {
  const centralParkDescriptions = [
    "In winter guests can watch ice skating, pickleball, Home Alone 2 and Serendipity scenes here.",
    "The 1908 carousel has more than 50 hand-carved horses.",
    "The 24 game tables sit under a wooden trellis built in 1952.",
    "Statues of Shakespeare, Robert Burns, and other writers line this walk.",
    "Balto was the lead sled dog honored with a statue in Central Park.",
    "Remote-control model boats sail here, and Stuart Little fans may recognize it.",
    "This lakeside restaurant and bar is a Central Park landmark.",
    "Bethesda Terrace and its famous fountain are a highlight of the route.",
    "Cherry trees and the Friends Fountain make this a favorite photo stop.",
    "This Victorian bridge is also called Romantic Bridge or Proposal Bridge.",
    "The second-largest man-made body of water in the park offers rowboats.",
    "The Daniel Webster monument stands near the route.",
    "The Dakota building is associated with John Lennon and Yoko Ono.",
    "Tavern on the Green is one of Central Park's best-known restaurants.",
    "The largest lawn once held sheep from 1864 to 1934.",
    "Pinebank Arch is one of Central Park's historic arches.",
    "A traffic circle with the Christopher Columbus monument marks this gateway.",
  ];

  it("applies confirmed 414460P1 Central Park Pedicab row title overrides", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "414460P1",
        title: "VIP Central Park Pedicab Guided Tour",
        itinerary: {
          itineraryItems: centralParkDescriptions.map(description => ({
            description,
            pointOfInterestLocation: { location: { ref: "opaque-ref" } },
          })),
        },
      },
    } as Record<string, unknown>);

    expect(result.extracted.itinerary.map(item => item.title)).toEqual([
      "Wollman Rink",
      "Central Park Carousel",
      "Chess & Checkers House",
      "Literary Walk",
      "Balto Statue",
      "Conservatory Water",
      "Central Park Boathouse",
      "Bethesda Fountain",
      "Cherry Hill",
      "Bow Bridge",
      "The Lake",
      "Daniel Webster Monument",
      "The Dakota",
      "Tavern on the Green",
      "Sheep Meadow",
      "Pinebank Arch",
      "Columbus Circle",
    ]);
  });

  it("preserves itinerary descriptions when title overrides are applied", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "414460P1",
        title: "VIP Central Park Pedicab Guided Tour",
        itineraryItems: centralParkDescriptions.map(description => ({
          description,
        })),
      },
    } as Record<string, unknown>);

    expect(result.extracted.itinerary.map(item => item.description)).toEqual(
      centralParkDescriptions
    );
  });

  it("leaves rows without confirmed overrides on the existing description-derived path", () => {
    const description =
      "Unconfirmed Landmark is not in the confirmed audit list.";
    const result = extractEngine6Product({
      product: {
        productCode: "414460P1",
        title: "VIP Central Park Pedicab Guided Tour",
        itineraryItems: [
          ...centralParkDescriptions.map(item => ({ description: item })),
          { description },
        ],
      },
    } as Record<string, unknown>);

    expect(result.extracted.itinerary[17]).toMatchObject({
      title: "Unconfirmed Landmark",
      description,
    });
  });

  it("does not apply 414460P1 row overrides to other Engine6 products", () => {
    const description = centralParkDescriptions[0];
    const result = extractEngine6Product({
      product: {
        productCode: "OTHERP1",
        title: "Another Engine6 Tour",
        itineraryItems: [{ description }],
      },
    } as Record<string, unknown>);

    expect(result.extracted.itinerary[0]).toMatchObject({
      title:
        "In winter guests can watch ice skating, pickleball, Home Alone 2 and Serendipity scenes here",
      description,
    });
  });
});
