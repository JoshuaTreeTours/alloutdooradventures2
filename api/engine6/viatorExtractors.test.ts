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

describe("extractEngine6Product itinerary title normalization", () => {
  const extractTitles = (
    productCode: string,
    title: string,
    itineraryItems: unknown[]
  ) =>
    extractEngine6Product({
      product: {
        productCode,
        title,
        itineraryItems,
      },
    } as Record<string, unknown>).extracted.itinerary.map(item => ({
      title: item.title,
      description: item.description,
    }));

  it("keeps Central Park Pedicab stop names concise while preserving supplier descriptions", () => {
    const descriptions = [
      "Photo stop and historical narration",
      "Scenic stop featured in many films",
      "Hear stories about the memorial and nearby landmarks",
    ];

    const stops = extractTitles(
      "414460P1",
      "VIP Central Park Pedicab Guided Tour",
      [
        { title: "Bethesda Fountain", description: descriptions[0] },
        { title: "Bow Bridge", description: descriptions[1] },
        {
          title: "Strawberry Fields, John Lennon Memorial",
          description: descriptions[2],
        },
      ]
    );

    expect(stops.map(stop => stop.title)).toEqual([
      "Bethesda Fountain",
      "Bow Bridge",
      "Strawberry Fields, John Lennon Memorial",
    ]);
    expect(stops.map(stop => stop.description)).toEqual(descriptions);
  });

  it("repairs Half-Day NYC narrative supplier titles from explicit landmark fields", () => {
    const stops = extractTitles(
      "122012P17",
      "Half-Day Bus Tour of NYC Top Highlights",
      [
        {
          title:
            "Next on the tour is Central Park, the world’s most famous urban park",
          pointOfInterestLocation: { locationName: "Central Park" },
          description: "Pass By",
        },
        {
          title:
            "See the famous Lincoln Center - home to the Metropolitan Opera and other performance spaces",
          pointOfInterest: { name: "Lincoln Center Theater" },
          description: "Pass By",
        },
        {
          title:
            "You will then visit the Dakota Building, a historic landmark near Central Park",
          location: { name: "The Dakota" },
          description: "Pass By",
        },
        {
          title:
            "Iconic carousel in Central Park built in 1908 & featuring over 50 hand-carved horses",
          stop: { name: "Central Park Carousel" },
          description: "Pass By",
        },
      ]
    );

    expect(stops.map(stop => stop.title)).toEqual([
      "Central Park",
      "Lincoln Center Theater",
      "The Dakota",
      "Central Park Carousel",
    ]);
    expect(stops.map(stop => stop.description)).toEqual([
      "Pass By",
      "Pass By",
      "Pass By",
      "Pass By",
    ]);
  });

  it("preserves San Francisco Love Tour concise stop titles", () => {
    const stops = extractTitles("23068P2", "San Francisco Love Tour", [
      {
        title: "Fisherman's Wharf",
        description:
          "Pass through the waterfront district near historic piers.",
      },
      {
        title: "Palace of Fine Arts Theatre",
        description: "Short photo stop at the lagoon and colonnade.",
      },
      {
        title: "Crissy Field",
        description: "Stop for Golden Gate Bridge and bay views.",
      },
      {
        title: "Lombard Street",
        description: "Pass by the curved hill section of Lombard Street.",
      },
    ]);

    expect(stops.map(stop => stop.title)).toEqual([
      "Fisherman's Wharf",
      "Palace of Fine Arts Theatre",
      "Crissy Field",
      "Lombard Street",
    ]);
  });

  it("preserves Yosemite in a Day concise stop titles", () => {
    const stops = extractTitles(
      "36001P1",
      "Yosemite In A Day Tour from San Francisco",
      [
        {
          title: "Tunnel View",
          description: "Panoramic first look across Yosemite Valley.",
        },
        {
          title: "Yosemite Valley",
          description: "Guided orientation and free time.",
        },
        {
          title: "Half Dome",
          description: "Stop focused on Half Dome geology.",
        },
        { title: "Yosemite Falls", description: "Visit Yosemite Falls area." },
      ]
    );

    expect(stops.map(stop => stop.title)).toEqual([
      "Tunnel View",
      "Yosemite Valley",
      "Half Dome",
      "Yosemite Falls",
    ]);
  });

  it("preserves Grand Canyon West concise stop titles", () => {
    const stops = extractTitles(
      "5119P13",
      "Grand Canyon West 6-in-1 Tour with Helicopter and Landing",
      [
        { title: "Hoover Dam", description: "Photo stop and guide commentary" },
        { title: "Grand Canyon West", description: "Admission included" },
        {
          title: "Eagle Point and Guano Point",
          description: "Viewpoint exploration",
        },
        {
          title: "Colorado River Helicopter Landing",
          description: "Optional helicopter upgrade experience",
        },
      ]
    );

    expect(stops.map(stop => stop.title)).toEqual([
      "Hoover Dam",
      "Grand Canyon West",
      "Eagle Point and Guano Point",
      "Colorado River Helicopter Landing",
    ]);
  });

  it("preserves New Orleans Engine6 concise stop titles", () => {
    const stops = extractTitles(
      "3780SUPER",
      "New Orleans in a Day - Includes 75 Minute Riverboat Cruise",
      [
        {
          title: "Cafe Beignet departure",
          description:
            "Meet outside Cafe Beignet in the JAX Brewery Building on Decatur Street.",
        },
        {
          title: "French Quarter walking tour",
          description:
            "Walk through the historic French Quarter with guide-led context.",
        },
        {
          title: "Jackson Square",
          description:
            "Pass Jackson Square while moving through the French Quarter portion.",
        },
        {
          title: "French Market lunch break",
          description: "Pause at the French Market for independent lunch time.",
        },
      ]
    );

    expect(stops.map(stop => stop.title)).toEqual([
      "Cafe Beignet departure",
      "French Quarter walking tour",
      "Jackson Square",
      "French Market lunch break",
    ]);
  });
});
