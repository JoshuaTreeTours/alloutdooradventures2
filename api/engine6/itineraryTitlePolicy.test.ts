import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "./viatorExtractors";
import { getEngine6ItineraryJsonLdTitle } from "./itineraryTitlePolicy";
import specimen276551p2Payload from "../../data/engine6/viator/276551P2.exact-product.json";
import specimen3885grindelzurPayload from "../../data/engine6/viator/3885GRINDEL_ZUR.exact-product.json";
import specimen3885sw303bsPayload from "../../data/engine6/viator/3885SW303BS.exact-product.json";
import specimen3351p13Payload from "../../data/engine6/viator/3351P13.exact-product.json";
import specimen6400p7Payload from "../../data/engine6/viator/6400P7.exact-product.json";
import specimen3454ye3dPayload from "../../data/engine6/viator/3454YE3D.exact-product.json";
import specimen106439p1Payload from "../../data/engine6/viator/106439P1.exact-product.json";
import specimen117409p1Payload from "../../data/engine6/viator/117409P1.exact-product.json";
import { mapViatorToEngine6Tour } from "../../src/engine6/mapViatorToEngine6Tour";
import { buildEngine6SchemaGraph } from "../../src/engine6/schema/buildEngine6SchemaGraph";
import type { Engine6ApiResponse } from "../../src/engine6/types";

const EXPECTED_276551P2_ITINERARY_TITLES = [
  "French Quarter",
  "St. Louis Cathedral",
  "Jackson Square",
  "Royal Street",
  "Lafitte's Blacksmith Shop Bar",
] as const;

describe("getEngine6ItineraryJsonLdTitle", () => {
  it("reads authoritative names from product.itinerary.itemListElement[n].item.name", () => {
    const product = {
      itinerary: {
        itemListElement: [
          { item: { name: "French Quarter" } },
          { item: { name: "St. Louis Cathedral" } },
        ],
      },
    };

    expect(getEngine6ItineraryJsonLdTitle(product, 0)).toBe("French Quarter");
    expect(getEngine6ItineraryJsonLdTitle(product, 1)).toBe(
      "St. Louis Cathedral"
    );
    expect(getEngine6ItineraryJsonLdTitle(product, 2)).toBeNull();
  });

  it("ignores blank or invalid JSON-LD names", () => {
    const product = {
      itinerary: {
        itemListElement: [{ item: { name: "   " } }, { item: {} }, {}],
      },
    };

    expect(getEngine6ItineraryJsonLdTitle(product, 0)).toBeNull();
    expect(getEngine6ItineraryJsonLdTitle(product, 1)).toBeNull();
    expect(getEngine6ItineraryJsonLdTitle(product, 2)).toBeNull();
  });
});

describe("extractEngine6Product itinerary JSON-LD title governance", () => {
  it("prefers JSON-LD itinerary names over location, row, and description-derived titles", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "276551P2",
        title: "New Orleans City Bike Tour",
        itinerary: {
          itemListElement: EXPECTED_276551P2_ITINERARY_TITLES.map(name => ({
            item: { name },
          })),
          itineraryItems: [
            {
              title: "Wrong French Quarter title",
              description:
                "Jackson Square is the historic center of New Orleans.",
              pointOfInterestLocation: { locationName: "Wrong Cathedral" },
            },
            {
              name: "Wrong Cathedral name",
              description:
                "St. Louis Cathedral is the historic center of New Orleans.",
              pointOfInterestLocation: { locationName: "Wrong Cathedral" },
            },
            {
              label: "Wrong Jackson Square label",
              description:
                "Royal Street is the historic center of New Orleans.",
            },
            {
              description:
                "Royal Street is the historic center of New Orleans.",
            },
            {
              description:
                "Lafitte's Blacksmith Shop Bar is the historic center of New Orleans.",
            },
          ],
        },
      },
    } as Record<string, unknown>);

    expect(result.extracted.itinerary.map(item => item.title)).toEqual([
      ...EXPECTED_276551P2_ITINERARY_TITLES,
    ]);
  });

  it("preserves existing fallback behavior when JSON-LD names are absent", () => {
    const description =
      "Unconfirmed Landmark is not in the confirmed audit list.";
    const result = extractEngine6Product({
      product: {
        productCode: "OTHERP1",
        title: "Another Engine6 Tour",
        itineraryItems: [{ description }],
      },
    } as Record<string, unknown>);

    expect(result.extracted.itinerary[0]).toMatchObject({
      title: "Unconfirmed Landmark",
      titleSource: "description-inferred",
      description,
    });
  });
});

describe("Engine6 prose-quality itinerary title governance", () => {
  it("uses reviewed POI-style titles for Mount Titlis instead of sentence-derived prose", () => {
    const result = extractEngine6Product(specimen3885sw303bsPayload);

    expect(result.extracted.itinerary.map(item => item.title)).toEqual([
      "Sihlquai Bus Station departure",
      "Lucerne orientation drive",
      "Mount Titlis cable car ascent",
      "Glacier Cave and Titlis Cliff Walk",
      "Sihlquai Coach Terminal return",
    ]);
    expect(result.extracted.itinerary.map(item => item.titleSource)).toEqual([
      "product-override",
      "product-override",
      "product-override",
      "product-override",
      "product-override",
    ]);
  });

  it("uses reviewed place titles for the Zurich Interlaken, Grindelwald, and Lauterbrunnen route", () => {
    const result = extractEngine6Product(specimen3885grindelzurPayload);

    expect(result.extracted.itinerary.map(item => item.title)).toEqual([
      "Zurich departure",
      "Interlaken",
      "Grindelwald",
      "Lauterbrunnen",
      "Return to Zurich",
    ]);
    expect(result.extracted.itinerary.map(item => item.titleSource)).toEqual([
      "product-override",
      "product-override",
      "product-override",
      "product-override",
      "product-override",
    ]);
  });

  it("applies audit quality gates to bad description-derived fixture titles", () => {
    const cases = [
      {
        code: "3351P13",
        payload: specimen3351p13Payload,
        disallowed: [
          "The route cuts through the heart of the San Andreas Fault in the Meccacopia Wilderness just outside of Mecca, CA",
          "Magnificent views of the Salton Sea as guests round the last corner coming out of the canyon",
        ],
      },
      {
        code: "6400P7",
        payload: specimen6400p7Payload,
        disallowed: ["Enjoy the best of the lake Lucerne and"],
      },
      { code: "3454YE3D", payload: specimen3454ye3dPayload, disallowed: [] },
      {
        code: "106439P1",
        payload: specimen106439p1Payload,
        disallowed: ["This section", "This stop"],
      },
      {
        code: "117409P1",
        payload: specimen117409p1Payload,
        disallowed: ["Explore the stunning vineyards"],
      },
    ];

    for (const { code, payload, disallowed } of cases) {
      const result = extractEngine6Product(payload);
      const titles = result.extracted.itinerary.map(item => item.title);

      expect(titles.length, code).toBeGreaterThan(0);
      for (const badTitle of disallowed) {
        expect(
          titles.some(title => title.startsWith(badTitle)),
          code
        ).toBe(false);
      }
      expect(
        titles.every(
          title =>
            !/^(?:this|that|it|they|we|you|here\s+you|this\s+section|this\s+stop)\b/i.test(
              title
            ) &&
            !/^(?:explore|enjoy|experience|discover|visit|see|stop|drive|walk|ride|sail|cruise|pass|head|continue|return|depart|meet|board|now\s+it(?:'|’)s\s+time|are\s+you\s+ready)\b/i.test(
              title
            ) &&
            !/\b(?:and|or|with|to|from|at|in|on|for)$/i.test(title)
        ),
        code
      ).toBe(true);
    }
  });

  it("falls back for Niagara-style pronoun sentence titles and extracts safe named entities", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "NIAGARA-PRONOUN-REGRESSION",
        title: "Niagara Falls Tour",
        itineraryItems: [
          {
            description:
              "This is where your guide introduces the falls viewpoint and tour route.",
          },
          {
            description:
              "It is a popular place to pause before the boat portion of the trip.",
          },
          { description: "Visit Venice Beach for a short guided walk." },
          {
            description:
              "Drive through Beverly Hills before returning to your hotel.",
          },
          {
            description:
              "Pass the Spanish Village Art Center on the way through Balboa Park.",
          },
          {
            description:
              "Scenic transfer to Zion National Park with time for photos.",
          },
        ],
      },
    } as Record<string, unknown>);

    expect(result.extracted.itinerary.map(item => item.title)).toEqual([
      "Itinerary Stop 1",
      "Itinerary Stop 2",
      "Venice Beach",
      "Beverly Hills",
      "Spanish Village Art Center",
      "Zion National Park",
    ]);
  });

  it("extracts concise place names from common prose-led itinerary descriptions", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "OTHERP2",
        title: "Swiss Villages Tour",
        itineraryItems: [
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
              "After a full day of alpine discovery, relax on the scenic return journey to Zurich, where your tour concludes.",
          },
        ],
      },
    } as Record<string, unknown>);

    expect(result.extracted.itinerary.map(item => item.title)).toEqual([
      "Interlaken",
      "Grindelwald",
      "Zurich",
    ]);
  });
});

describe("Engine6 itinerary title governance for 276551P2", () => {
  const toPayload = (): Engine6ApiResponse => {
    const extraction = extractEngine6Product(specimen276551p2Payload);

    return {
      source: "bundled-fallback",
      rawProductCode: "276551P2",
      rawProduct: extraction.product,
      diagnostics: {
        source: "bundled-fallback",
        hasViatorApiKey: false,
        attemptedLiveFetch: false,
        upstreamStatus: null,
        upstreamContentType: "application/json fixture",
        upstreamOk: null,
        usedBundledFallbackBecause: "276551p2-itinerary-title-governance-test",
        ...extraction.diagnostics,
        bookingUrlSource:
          extraction.diagnostics.productUrlFieldPath ??
          "generated:viator-search-product-code",
        fieldLevelFallbackUsed: false,
        fallbackFieldNames: [],
      },
      extracted: extraction.extracted,
    };
  };

  it("renders authoritative Viator itinerary titles for the first five stops", () => {
    const tour = mapViatorToEngine6Tour(toPayload());
    const schema = buildEngine6SchemaGraph(tour);
    const graph = schema["@graph"] as Array<Record<string, unknown>>;
    const trip = graph.find(node => node["@type"] === "TouristTrip") as
      | {
          itinerary?: { itemListElement?: Array<{ item?: { name?: string } }> };
        }
      | undefined;

    expect(tour.itinerary.slice(0, 5).map(item => item.title)).toEqual([
      ...EXPECTED_276551P2_ITINERARY_TITLES,
    ]);
    expect(
      trip?.itinerary?.itemListElement?.slice(0, 5).map(item => item.item?.name)
    ).toEqual([...EXPECTED_276551P2_ITINERARY_TITLES]);
  });
});
