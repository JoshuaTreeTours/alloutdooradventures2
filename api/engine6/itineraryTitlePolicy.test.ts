import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "./viatorExtractors";
import {
  getEngine6AlignedPublicJsonLdItineraryTitle,
  getEngine6ItineraryJsonLdTitle,
} from "./itineraryTitlePolicy";
import specimen163975p1Payload from "../../data/engine6/viator/163975P1.exact-product.json";
import specimen117409p1Payload from "../../data/engine6/viator/117409P1.exact-product.json";
import specimen191303p1Payload from "../../data/engine6/viator/191303P1.exact-product.json";
import specimen2335p1Payload from "../../data/engine6/viator/2335P1.exact-product.json";
import specimen447486p4Payload from "../../data/engine6/viator/447486P4.exact-product.json";
import specimen67760p2Payload from "../../data/engine6/viator/67760P2.exact-product.json";
import specimen170119p1Payload from "../../data/engine6/viator/170119P1.exact-product.json";
import specimen70058p145Payload from "../../data/engine6/viator/70058P145.exact-product.json";
import specimen36001p14Payload from "../../data/engine6/viator/36001P14.exact-product.json";
import specimen276551p2Payload from "../../data/engine6/viator/276551P2.exact-product.json";
import specimen106439p1Payload from "../../data/engine6/viator/106439P1.exact-product.json";
import specimen32779p6Payload from "../../data/engine6/viator/32779P6.exact-product.json";
import specimen5569hikePayload from "../../data/engine6/viator/5569HIKE.exact-product.json";
import specimen5144brunchPayload from "../../data/engine6/viator/5144BRUNCH.exact-product.json";
import specimen69764p1Payload from "../../data/engine6/viator/69764P1.exact-product.json";
import specimen18125p5Payload from "../../data/engine6/viator/18125P5.exact-product.json";
import specimen5046SanSeaPayload from "../../data/engine6/viator/5046SAN_SEA.exact-product.json";
import specimen37126p9Payload from "../../data/engine6/viator/37126P9.exact-product.json";
import specimen28758p1Payload from "../../data/engine6/viator/28758P1.exact-product.json";
import specimen5553984p5Payload from "../../data/engine6/viator/5553984P5.exact-product.json";
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

describe("public JSON-LD itinerary title enrichment", () => {
  it.each([
    {
      productCode: "117409P1",
      payload: specimen117409p1Payload,
      expectedTitles: ["Santa Ynez Valley"],
    },
    {
      productCode: "191303P1",
      payload: specimen191303p1Payload,
      expectedTitles: ["Coronado Island"],
    },
    {
      productCode: "2335P1",
      payload: specimen2335p1Payload,
      expectedTitles: ["San Andreas Fault"],
    },
    {
      productCode: "447486P4",
      payload: specimen447486p4Payload,
      expectedTitles: ["Santa Barbara Maritime Museum"],
    },
    {
      productCode: "67760P2",
      payload: specimen67760p2Payload,
      expectedTitles: [
        "Santa Monica Pier",
        "The Original Farmers Market",
        "Griffith Observatory",
        "Hollywood Walk of Fame",
      ],
    },
    {
      productCode: "170119P1",
      payload: specimen170119p1Payload,
      expectedTitles: [
        "Santa Monica Pier",
        "Venice Beach",
        "Venice Canals",
        "Beverly Hills and Rodeo Drive",
        "Original Farmers Market",
        "The Grove",
        "Hollywood Boulevard",
        "Hollywood Sign Viewpoint",
      ],
    },
    {
      productCode: "70058P145",
      payload: specimen70058p145Payload,
      expectedTitles: [
        "Griffith Observatory",
        "Hollywood Walk of Fame",
        "Rodeo Drive",
        "Hollywood Sign",
        "The Original Farmers Market",
      ],
    },
  ])(
    "enriches reviewed $productCode public JSON-LD itinerary names only by exact row alignment",
    ({ payload, expectedTitles }) => {
      const result = extractEngine6Product(payload);

      expect(result.extracted.itinerary).toHaveLength(expectedTitles.length);
      expect(result.extracted.itinerary.map(item => item.title)).toEqual(
        expectedTitles
      );
      expect(result.extracted.itinerary.map(item => item.titleSource)).toEqual(
        Array(expectedTitles.length).fill("public-json-ld")
      );
      expect(
        result.extracted.itinerary.every(
          item => (item.description?.length ?? 0) > 0
        )
      ).toBe(true);
    }
  );

  it("does not apply reviewed public JSON-LD names when the Engine6 row count differs", () => {
    expect(
      getEngine6AlignedPublicJsonLdItineraryTitle({
        productCode: "67760P2",
        rowIndex: 0,
        rowCount: 3,
      })
    ).toBeNull();
  });

  it("enriches 163975P1 by position when the public JSON-LD count matches Engine6 rows and preserves descriptions", () => {
    const result = extractEngine6Product(specimen163975p1Payload);

    expect(result.extracted.itinerary).toHaveLength(9);
    expect(result.extracted.itinerary.map(item => item.title)).toEqual([
      "Stearns Wharf",
      "East Beach",
      "Andrée Clark Bird Refuge",
      "Butterfly Beach",
      "Santa Barbara Museum of Natural History",
      "Old Mission Santa Barbara",
      "Santa Barbara County Courthouse",
      "El Presidio de Santa Barbara State Historic Park",
      "Santa Barbara Harbor",
    ]);
    expect(result.extracted.itinerary.map(item => item.titleSource)).toEqual(
      Array(9).fill("public-json-ld")
    );
    expect(result.extracted.itinerary[0].description).toContain(
      "Enjoy the seaside sights and sounds of Stearns Wharf"
    );
    expect(result.extracted.itinerary[6].description).toContain(
      "Santa Barbara County Courthouse"
    );
  });

  it("does not let mismatched JSON-LD overwrite 36001P14 Engine6 rows", () => {
    const sourceProduct = (specimen36001p14Payload as Record<string, unknown>)
      .product as Record<string, unknown>;
    const sourceItinerary = sourceProduct.itinerary as
      | Record<string, unknown>
      | undefined;
    const result = extractEngine6Product({
      product: {
        ...sourceProduct,
        itinerary: {
          ...(sourceItinerary ?? {}),
          itemListElement: [
            { item: { name: "Wrong Public JSON-LD Stop One" } },
            { item: { name: "Wrong Public JSON-LD Stop Two" } },
          ],
        },
      },
    });

    expect(result.extracted.itinerary).toHaveLength(6);
    expect(result.extracted.itinerary.map(item => item.title)).toEqual([
      "Pacific Coast Highway",
      "Monterey",
      "Cannery Row",
      "17-Mile Drive",
      "Carmel-by-the-Sea",
      "Big Sur",
    ]);
    expect(result.extracted.itinerary.map(item => item.title)).not.toContain(
      "Wrong Public JSON-LD Stop One"
    );
    expect(result.extracted.itinerary.map(item => item.titleSource)).toEqual(
      Array(6).fill("explicit")
    );
  });
});

describe("Engine6 definitely broken itinerary title repairs", () => {
  it("uses reviewed product-specific overrides for only the definitely broken rows", () => {
    const cases = [
      {
        payload: specimen106439p1Payload,
        expectedByIndex: {
          1: "Rodeo Drive",
          2: "Greystone Mansion",
          3: "Beverly Gardens Park",
          5: "Beverly Canon Gardens",
          6: "Beverly Hills Civic Center",
          7: "Golden Triangle and Platinum Triangle",
          8: "Sunset Boulevard",
          9: "Celebrity Homes Neighborhoods",
          10: "Beverly Hills Hotel",
        },
      },
      {
        payload: specimen5569hikePayload,
        expectedByIndex: {
          0: "Safety Briefing",
          2: "Hollywood Hills Trail",
          3: "Griffith Observatory",
          4: "Tiffany Point",
          8: "Griffith Park",
          9: "Santa Monica Mountains",
          10: "Mount Hollywood",
          11: "Hollywood Sign",
          12: "Century City Views",
          13: "Warner Bros. Studios",
          14: "Downtown Los Angeles Views",
          16: "Hollywood Views",
          17: "Los Angeles Zoo",
          18: "Autry Museum of the American West",
          19: "Griffith Park Bird Sanctuary",
          20: "Walt Disney Studios",
        },
      },
      {
        payload: specimen5144brunchPayload,
        expectedByIndex: {
          3: "San Diego Bay Open-Water Panoramas",
        },
      },
      {
        payload: specimen69764p1Payload,
        expectedByIndex: {
          0: "San Diego Bay Departure",
          1: "San Diego Coastline Wildlife Viewing",
        },
      },
      {
        payload: specimen18125p5Payload,
        expectedByIndex: {
          0: "Balboa Park",
          2: "Alcazar Garden",
        },
      },
      {
        payload: specimen37126p9Payload,
        expectedByIndex: {
          0: "Star of India",
        },
      },
      {
        payload: specimen28758p1Payload,
        expectedByIndex: {
          0: "Tijuana",
          1: "Tijuana Walking Tour",
          2: "Tijuana Historic Center",
        },
      },
      {
        payload: specimen5553984p5Payload,
        expectedByIndex: {
          0: "Zurich Old Town",
          2: "Lindenhof",
          3: "Zurich Old Town (Altstadt)",
          5: "Bahnhofstrasse",
          6: "Lake Zurich Cruise",
          8: "Paradeplatz",
        },
      },
    ] as const;

    cases.forEach(({ payload, expectedByIndex }) => {
      const result = extractEngine6Product(payload);

      Object.entries(expectedByIndex).forEach(([index, title]) => {
        const item = result.extracted.itinerary[Number(index)];
        expect(item.title).toBe(title);
        expect(item.titleSource).toBe("product-override");
      });
    });
  });

  it("does not modify probably broken rows, false positives, or leave-unchanged products", () => {
    expect(extractEngine6Product(specimen5569hikePayload).extracted.itinerary[1])
      .toMatchObject({
        title: "We'll meet you in front of the Greek Theatre",
        titleSource: "description-inferred",
      });
    expect(extractEngine6Product(specimen5144brunchPayload).extracted.itinerary[0])
      .toMatchObject({
        title:
          "Cruise San Diego Bay on a Sunday brunch cruise experience with skyline views and live onboard entertainment",
        titleSource: "description-inferred",
      });
    expect(extractEngine6Product(specimen37126p9Payload).extracted.itinerary[6])
      .toMatchObject({
        title: "The San Diego Convention Center",
        titleSource: "description-inferred",
      });
    expect(extractEngine6Product(specimen32779p6Payload).extracted.itinerary[0])
      .toMatchObject({
        title:
          "As you venture ten miles into the rugged interior, you will view the protected side of Catalina Island seldom seen by most visitors",
        titleSource: "description-inferred",
      });
    expect(
      extractEngine6Product(specimen5046SanSeaPayload).extracted.itinerary[0]
    ).toMatchObject({
      title:
        "This 90-minute shore excursion is a fantastic way to see the best of the Bay and San Diego during your limited time in port",
      titleSource: "description-inferred",
    });
  });

  it("uses the reviewed 5569HIKE Warner Bros. Studios override without changing the description", () => {
    expect(extractEngine6Product(specimen5569hikePayload).extracted.itinerary[13])
      .toMatchObject({
        title: "Warner Bros. Studios",
        titleSource: "product-override",
        description:
          "Check out Warner Brothers, the most famous film studio in LA, in a bird's eye view on this Hollywood Hills Tour.",
      });
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
