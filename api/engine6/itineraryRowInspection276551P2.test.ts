import { describe, expect, it, vi } from "vitest";

import specimen276551p2Payload from "../../data/engine6/viator/276551P2.exact-product.json";
import { extractEngine6Product } from "./viatorExtractors";

describe("276551P2 itinerary row inspection diagnostics", () => {
  it("captures the first five raw itinerary rows reaching normalizeSingleItineraryItem", () => {
    const logSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    const result = extractEngine6Product(
      specimen276551p2Payload as Record<string, unknown>,
      { payloadSource: "bundled-exact-product-fixture" }
    );

    expect(result.diagnostics.itineraryRowInspection276551P2).toHaveLength(5);
    expect(result.diagnostics.itineraryRowInspection276551P2?.[0]).toMatchObject(
      {
        rowIndex: 0,
        itineraryRowFieldPath: "product.itineraryItems[0]",
        keys: expect.arrayContaining(["title", "description", "stopType"]),
        title: "French Quarter",
        name: null,
        label: null,
        pointOfInterestLocation: null,
        location: null,
        attraction: null,
        stopName: null,
        stop: null,
        pointOfInterest: null,
        otherNamingFields: {},
      }
    );
    expect(
      result.diagnostics.itineraryRowInspection276551P2?.map(row => row.title)
    ).toEqual([
      "French Quarter",
      "St. Louis Cathedral",
      "Jackson Square",
      "Royal Street",
      "Lafitte's Blacksmith Shop Bar",
    ]);
    expect(logSpy).toHaveBeenCalledWith(
      "[engine6-itinerary-inspection:276551P2]",
      expect.stringContaining("French Quarter")
    );

    logSpy.mockRestore();
  });

  it("does not emit row inspection diagnostics for other products", () => {
    const logSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    const result = extractEngine6Product({
      product: {
        productCode: "OTHERP1",
        title: "Other tour",
        itineraryItems: [{ title: "Stop A", description: "Details" }],
      },
    } as Record<string, unknown>);

    expect(result.diagnostics.itineraryRowInspection276551P2).toBeUndefined();
    expect(
      logSpy.mock.calls.some(call =>
        String(call[0]).includes("[engine6-itinerary-inspection:276551P2]")
      )
    ).toBe(false);

    logSpy.mockRestore();
  });
});
