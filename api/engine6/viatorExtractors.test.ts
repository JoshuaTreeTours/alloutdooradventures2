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

describe("extractEngine6Product itinerary source preservation", () => {
  it("preserves meaningful supplier stop descriptions and shortens mechanical pass-by titles", () => {
    const payload = {
      product: {
        productCode: "ITINERARY-PRESERVE",
        title: "Itinerary preservation audit",
        itinerary: {
          itineraryItems: [
            {
              title: "Central Park Carousel",
              description:
                "Historic carousel built in 1908 featuring more than 50 hand-carved horses.",
            },
            {
              title: "The Dairy",
              description:
                "The Dairy is a historic building that is now a visitor center and gift shop.",
            },
            {
              title: "Bethesda Fountain",
              description:
                "Bethesda Fountain is one of Central Park's most photographed landmarks.",
            },
            {
              title: "Pass By Lombard Street",
              description: "Pass by the curved hill section of Lombard Street.",
            },
            {
              title: "Jackson Square (Pass By)",
              description:
                "Jackson Square is a historic park in the French Quarter of New Orleans.",
            },
            {
              title: "Tunnel View",
              description:
                "Tunnel View offers a classic perspective of El Capitan, Half Dome, and Bridalveil Fall.",
            },
            {
              title: "El Capitan",
              description:
                "El Capitan is a granite monolith rising about 3,000 feet above Yosemite Valley.",
            },
            {
              title: "Hoover Dam",
              description:
                "Hoover Dam is a Depression-era concrete arch-gravity dam on the Colorado River.",
            },
            {
              title: "Eagle Point",
              description:
                "Eagle Point overlooks the Grand Canyon West rim and the Skywalk area.",
            },
            {
              title: "Times Square",
              description:
                "Times Square is known for illuminated billboards, theaters, and dense pedestrian activity.",
            },
          ],
        },
      },
    };

    const result = extractEngine6Product(payload as Record<string, unknown>);

    expect(result.extracted.itinerary).toMatchObject([
      {
        title: "Central Park Carousel",
        description:
          "Historic carousel built in 1908 featuring more than 50 hand-carved horses.",
      },
      {
        title: "The Dairy",
        description:
          "The Dairy is a historic building that is now a visitor center and gift shop.",
      },
      {
        title: "Bethesda Fountain",
        description:
          "Bethesda Fountain is one of Central Park's most photographed landmarks.",
      },
      {
        title: "Lombard Street",
        stopType: "pass-by",
        description: "Pass by the curved hill section of Lombard Street.",
      },
      {
        title: "Jackson Square",
        stopType: "pass-by",
        description:
          "Jackson Square is a historic park in the French Quarter of New Orleans.",
      },
      {
        title: "Tunnel View",
        description:
          "Tunnel View offers a classic perspective of El Capitan, Half Dome, and Bridalveil Fall.",
      },
      {
        title: "El Capitan",
        description:
          "El Capitan is a granite monolith rising about 3,000 feet above Yosemite Valley.",
      },
      {
        title: "Hoover Dam",
        description:
          "Hoover Dam is a Depression-era concrete arch-gravity dam on the Colorado River.",
      },
      {
        title: "Eagle Point",
        description:
          "Eagle Point overlooks the Grand Canyon West rim and the Skywalk area.",
      },
      {
        title: "Times Square",
        description:
          "Times Square is known for illuminated billboards, theaters, and dense pedestrian activity.",
      },
    ]);
  });

  it("omits only clear mechanical placeholders without inventing fallback prose", () => {
    const payload = {
      product: {
        productCode: "ITINERARY-PLACEHOLDERS",
        title: "Itinerary placeholder audit",
        itinerary: {
          itineraryItems: [
            {
              title: "Central Park Carousel",
              description:
                "Visit Central Park Carousel during the 10 minutes stop.",
              duration: "10 minutes",
            },
            {
              title: "Lombard Street",
              description: "Pass Lombard Street as part of the route.",
            },
            {
              title: "The Dairy",
              description: "Historic context",
              summary:
                "The Dairy is a historic building that is now a visitor center and gift shop.",
            },
            {
              title: "Bethesda Fountain",
              description: "Admission Ticket Free",
              admissionTicket: "Admission included",
            },
            {
              title: "Jackson Square",
              description: "This is a scheduled stop on the route.",
            },
            {
              title: "Golden Gate Bridge",
              description: "This portion is viewed from the vehicle.",
            },
            {
              title: "Palace of Fine Arts",
              description: "Scenic pass-by segment",
            },
            {
              title: "Fisherman's Wharf",
              description: "Pass By",
            },
            {
              title: "Chinatown",
              description: "By.",
            },
            {
              title: "North Beach",
              description: "Admission included",
            },
          ],
        },
      },
    };

    const result = extractEngine6Product(payload as Record<string, unknown>);

    expect(result.extracted.itinerary).toEqual([
      {
        title: "Central Park Carousel",
        stopType: "stop",
        duration: "10 minutes",
      },
      { title: "Lombard Street", stopType: "stop" },
      {
        title: "The Dairy",
        stopType: "stop",
        description:
          "The Dairy is a historic building that is now a visitor center and gift shop.",
      },
      { title: "Bethesda Fountain", stopType: "stop" },
      { title: "Jackson Square", stopType: "stop" },
      { title: "Golden Gate Bridge", stopType: "stop" },
      { title: "Palace of Fine Arts", stopType: "stop" },
      { title: "Fisherman's Wharf", stopType: "stop" },
      { title: "Chinatown", stopType: "stop" },
      { title: "North Beach", stopType: "stop" },
    ]);
  });
});
