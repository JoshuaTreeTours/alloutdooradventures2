import { describe, expect, it, vi } from "vitest";

import specimen276551p2Payload from "../../data/engine6/viator/276551P2.exact-product.json";
import { extractEngine6Product } from "./viatorExtractors";

describe("276551P2 itinerary title source report", () => {
  it("reports exact Viator title field paths and values for the first five rows", () => {
    const logSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    const result = extractEngine6Product(
      specimen276551p2Payload as Record<string, unknown>,
      { payloadSource: "bundled-exact-product-fixture" }
    );

    expect(result.diagnostics.itineraryTitleSourceReport276551P2).toMatchObject({
      productCode: "276551P2",
      payloadSource: "bundled-exact-product-fixture",
      itineraryFieldPath: "product.itineraryItems",
      sourceTitleFieldPattern: "product.itineraryItems[].title",
      rows: [
        {
          rowIndex: 0,
          sourceTitleFieldPath: "product.itineraryItems[0].title",
          sourceTitle: "French Quarter",
          renderedTitle: "French Quarter",
          titleSource: "viator-itinerary-item-title",
        },
        {
          rowIndex: 1,
          sourceTitleFieldPath: "product.itineraryItems[1].title",
          sourceTitle: "St. Louis Cathedral",
          renderedTitle: "St. Louis Cathedral",
          titleSource: "viator-itinerary-item-title",
        },
        {
          rowIndex: 2,
          sourceTitleFieldPath: "product.itineraryItems[2].title",
          sourceTitle: "Jackson Square",
          renderedTitle: "Jackson Square",
          titleSource: "viator-itinerary-item-title",
        },
        {
          rowIndex: 3,
          sourceTitleFieldPath: "product.itineraryItems[3].title",
          sourceTitle: "Royal Street",
          renderedTitle: "Royal Street",
          titleSource: "viator-itinerary-item-title",
        },
        {
          rowIndex: 4,
          sourceTitleFieldPath: "product.itineraryItems[4].title",
          sourceTitle: "Lafitte's Blacksmith Shop Bar",
          renderedTitle: "Lafitte's Blacksmith Shop Bar",
          titleSource: "viator-itinerary-item-title",
        },
      ],
    });
    expect(result.extracted.itinerary.map(item => item.title)).toEqual([
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
    ]);
    expect(logSpy).toHaveBeenCalledWith(
      "[engine6-itinerary-title-source:276551P2]",
      expect.stringContaining("product.itineraryItems[0].title")
    );

    logSpy.mockRestore();
  });
});
