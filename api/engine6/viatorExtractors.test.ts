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
    expect(result.extracted.categories).toEqual(["cycling"]);
    expect(result.extracted.primaryDisplayCategory).toBe("Cycling");
    expect(result.extracted.activityCategories).toEqual([
      { slug: "cycling", label: "Cycling" },
    ]);
  });
});

describe("extractEngine6Product description-only itinerary titles", () => {
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

  it("uses neutral stop titles for description-only Central Park Pedicab rows", () => {
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

    expect(result.extracted.itinerary.map(item => item.title)).toEqual(
      centralParkDescriptions.map((_, index) => `Itinerary Stop ${index + 1}`)
    );
  });

  it("preserves itinerary descriptions when neutral stop titles are applied", () => {
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

  it("uses neutral stop titles for extra description-only rows", () => {
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
      title: "Itinerary Stop 18",
      description,
    });
  });

  it("uses neutral stop titles for other description-only Engine6 products", () => {
    const description = centralParkDescriptions[0];
    const result = extractEngine6Product({
      product: {
        productCode: "OTHERP1",
        title: "Another Engine6 Tour",
        itineraryItems: [{ description }],
      },
    } as Record<string, unknown>);

    expect(result.extracted.itinerary[0]).toMatchObject({
      title: "Itinerary Stop 1",
      description,
    });
  });
  it("applies reviewed public JSON-LD names for Mount Titlis when row counts align", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "3885SW303BS",
        title: "Mount Titlis and Lucerne Day Trip from Zurich",
        itinerary: {
          itineraryItems: [
            {
              description:
                "From the centrally located Sihlquai Bus Station, the scenic coach journey begins through the city of Zurich, the beautiful views of the countryside, and along the shores of the Lake of the Four Cantons to Lucerne.",
            },
            {
              description:
                "Enjoy a brief orientation drive, where your guide points out the main attractions of this charming town like the Chapel Bridge, the Town Hall, the Jesuit Church, and the Culture and Convention Centre (KKL).",
            },
            {
              description:
                "At the valley station the breathtaking journey with the different aerial cable cars to the top of Mt. Titlis begins.",
            },
            {
              description:
                "Visit the Glacier Cave and pass over Europe's highest suspension bridge - the Cliff Walk!",
            },
            {
              description:
                "Your action-packed day trip to Mt Titlis concludes with drop-off at Sihlquai Coach Terminal in central Zurich at approximately 7pm.",
            },
          ],
        },
      },
    } as Record<string, unknown>);

    expect(result.extracted.itinerary.map(item => item.title)).toEqual([
      "Zurich",
      "Luzern Altstadt",
      "Titlis",
      "Titlis Cliff Walk",
      "Zurich",
    ]);
    expect(result.extracted.itinerary.map(item => item.titleSource)).toEqual([
      "public-json-ld",
      "public-json-ld",
      "public-json-ld",
      "public-json-ld",
      "public-json-ld",
    ]);
  });

  it("applies reviewed public JSON-LD names for Grindelwald, Interlaken, and Lauterbrunnen when row counts align", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "3885GRINDEL_ZUR",
        title: "Grindelwald, Interlaken & Lauterbrunnen Day Trip from Zurich",
        itineraryItems: [
          { description: "Zurich is passed on departure." },
          {
            description:
              "Arrive in Interlaken, where you'll enjoy some leisure time to explore this charming village at your own pace.",
          },
          {
            description:
              "Next, continue to the postcard-perfect mountain village of Grindelwald.",
          },
          {
            description:
              "Lauterbrunnen is a breathtaking valley home to waterfalls.",
          },
          {
            description:
              "After a full day of alpine discovery, relax on the scenic return journey to Zurich, where your tour concludes.",
          },
        ],
      },
    } as Record<string, unknown>);

    expect(result.extracted.itinerary.map(item => item.title)).toEqual([
      "Zurich",
      "Interlaken",
      "Grindelwald",
      "Lauterbrunnen Valley Waterfalls",
      "Zurich",
    ]);
    expect(result.extracted.itinerary.map(item => item.titleSource)).toEqual([
      "public-json-ld",
      "public-json-ld",
      "public-json-ld",
      "public-json-ld",
      "public-json-ld",
    ]);
  });

  it("does not apply reviewed public JSON-LD names when the Engine6 row count differs", () => {
    const descriptions = [
      "From the centrally located Sihlquai Bus Station, the scenic coach journey begins through the city of Zurich.",
      "Enjoy a brief orientation drive through Lucerne.",
      "At the valley station the breathtaking journey with the different aerial cable cars to the top of Mt. Titlis begins.",
      "Visit the Glacier Cave and pass over Europe's highest suspension bridge - the Cliff Walk!",
    ];
    const result = extractEngine6Product({
      product: {
        productCode: "3885SW303BS",
        title: "Mount Titlis and Lucerne Day Trip from Zurich",
        itineraryItems: descriptions.map(description => ({ description })),
      },
    } as Record<string, unknown>);

    expect(result.extracted.itinerary).toHaveLength(4);
    expect(
      result.extracted.itinerary.map(item => item.titleSource)
    ).not.toContain("public-json-ld");
    expect(result.extracted.itinerary[1]).toMatchObject({
      title: "Itinerary Stop 2",
      titleSource: "explicit",
    });
  });
});
