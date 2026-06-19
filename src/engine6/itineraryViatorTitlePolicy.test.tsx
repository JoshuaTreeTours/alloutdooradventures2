import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import { extractEngine6Product } from "../../api/engine6/viatorExtractors";
import Engine6TourPage from "./components/Engine6TourPage";
import { mapViatorToEngine6Tour } from "./mapViatorToEngine6Tour";
import { buildEngine6SchemaGraph } from "./schema/buildEngine6SchemaGraph";
import type { Engine6ApiResponse } from "./types";
import { ENGINE6_VALIDATION_FIXTURES } from "./validationFixtures";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const toPayload = (
  fixture: (typeof ENGINE6_VALIDATION_FIXTURES)[number]
): Engine6ApiResponse => {
  const extraction = extractEngine6Product(fixture.rawPayload);

  return {
    source: "bundled-fallback",
    rawProductCode: fixture.productCode,
    rawProduct: extraction.product,
    diagnostics: {
      source: "bundled-fallback",
      hasViatorApiKey: false,
      attemptedLiveFetch: false,
      upstreamStatus: null,
      upstreamContentType: "application/json fixture",
      upstreamOk: null,
      usedBundledFallbackBecause: "itinerary-viator-title-policy-test",
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

const expected276551P2Titles = [
  "French Quarter",
  "St. Louis Cathedral",
  "Jackson Square",
  "Royal Street",
  "Lafitte's Blacksmith Shop Bar",
  "Central Business District",
  "Congo Square",
  "Treme",
  "Frenchmen Street",
  "Mississippi River",
  "Garden District",
  "Lafayette Cemetery No. 1",
];

describe("Engine6 Viator itinerary title policy", () => {
  const fixture276551P2 = ENGINE6_VALIDATION_FIXTURES.find(
    entry => entry.productCode === "276551P2"
  );

  it("preserves 276551P2 source titles exactly through extraction and mapping", () => {
    expect(fixture276551P2).toBeDefined();
    const extracted = extractEngine6Product(fixture276551P2!.rawPayload);
    const tour = mapViatorToEngine6Tour(toPayload(fixture276551P2!));

    expect(extracted.diagnostics.itineraryFieldPath).toBe(
      "product.itineraryItems"
    );
    expect(extracted.diagnostics.itinerarySourceTitleFieldPath).toBe(
      "product.itineraryItems[].title"
    );
    expect(extracted.diagnostics.itineraryMissingSourceTitleFieldPaths).toEqual(
      []
    );
    expect(extracted.extracted.itinerary.map(item => item.title)).toEqual(
      expected276551P2Titles
    );
    expect(tour.itinerary.map(item => item.title)).toEqual(
      expected276551P2Titles
    );
  });

  it("preserves source descriptions without rewriting them", () => {
    expect(fixture276551P2).toBeDefined();
    const extracted = extractEngine6Product(fixture276551P2!.rawPayload);
    const sourceDescriptions =
      (
        fixture276551P2!.rawPayload as {
          product?: { itineraryItems?: Array<{ description?: string }> };
        }
      ).product?.itineraryItems?.map(item => item.description) ?? [];
    const tour = mapViatorToEngine6Tour(toPayload(fixture276551P2!));

    expect(extracted.extracted.itinerary.map(item => item.description)).toEqual(
      sourceDescriptions
    );
    expect(tour.itinerary.map(item => item.description)).toEqual(
      sourceDescriptions
    );
  });

  it("uses Stop and Pass By instead of description-derived titles when source titles are missing", () => {
    const extracted = extractEngine6Product({
      product: {
        productCode: "TITLEPOLICY1",
        title: "Title policy test",
        media: {
          images: [
            {
              variants: {
                FULL: {
                  url: "https://dynamic-media.tacdn.com/media/photo-o/aa/bb/cc/dd.jpg",
                  width: 1024,
                  height: 683,
                },
              },
            },
          ],
        },
        itineraryItems: [
          {
            description:
              "Pedal past the lively music district with guide commentary.",
            stopType: "pass-by",
          },
          {
            description:
              "Filled with the city's best restaurants and historic architecture.",
            stopType: "stop",
          },
          {
            title: "This",
            description:
              "The big muddy river is the reason New Orleans exists.",
            stopType: "stop",
          },
        ],
      },
    } as Record<string, unknown>);

    expect(extracted.extracted.itinerary.map(item => item.title)).toEqual([
      "Pass By",
      "Stop",
      "Stop",
    ]);
    expect(extracted.diagnostics.itinerarySourceTitleFieldPath).toBe(
      "product.itineraryItems[].title"
    );
    expect(extracted.diagnostics.itineraryMissingSourceTitleFieldPaths).toEqual([
      "product.itineraryItems[0].title",
      "product.itineraryItems[1].title",
    ]);
    expect(extracted.extracted.itinerary.map(item => item.description)).toEqual(
      [
        "Pedal past the lively music district with guide commentary.",
        "Filled with the city's best restaurants and historic architecture.",
        "The big muddy river is the reason New Orleans exists.",
      ]
    );
  });

  it("uses the same final title in visible cards and JSON-LD TouristAttraction names", () => {
    expect(fixture276551P2).toBeDefined();
    const tour = mapViatorToEngine6Tour(toPayload(fixture276551P2!));
    const html = renderToString(<Engine6TourPage tour={tour} />);
    const schema = buildEngine6SchemaGraph(tour);
    const trip = (schema["@graph"] as Array<Record<string, unknown>>).find(
      node => node["@type"] === "TouristTrip"
    );
    const itinerary = trip?.itinerary as
      | {
          itemListElement?: Array<{
            item?: { name?: string };
          }>;
        }
      | undefined;
    const schemaTitles =
      itinerary?.itemListElement?.map(entry => entry.item?.name) ?? [];

    expect(schemaTitles).toEqual(expected276551P2Titles);
    for (const title of expected276551P2Titles) {
      expect(html).toContain(title);
    }
  });
});
