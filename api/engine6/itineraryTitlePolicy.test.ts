import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "./viatorExtractors";
import { getEngine6ItineraryJsonLdTitle } from "./itineraryTitlePolicy";
import specimen276551p2Payload from "../../data/engine6/viator/276551P2.exact-product.json";
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

  it("uses neutral numbered fallback when JSON-LD names are absent", () => {
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
      title: "Itinerary Stop 1",
      titleSource: "neutral-numbered",
      description,
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
      trip?.itinerary?.itemListElement
        ?.slice(0, 5)
        .map(item => item.item?.name)
    ).toEqual([...EXPECTED_276551P2_ITINERARY_TITLES]);
  });
});
