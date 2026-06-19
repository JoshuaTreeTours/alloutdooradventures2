import { describe, expect, it } from "vitest";

import {
  buildEngine6ItineraryItemTitleFieldPath,
  readEngine6ViatorItineraryItemSourceTitle,
  resolveEngine6ItinerarySourceTitle,
} from "./itineraryTitlePolicy";

describe("Engine6 itinerary title policy", () => {
  it("preserves exact Viator itinerary item title strings", () => {
    expect(readEngine6ViatorItineraryItemSourceTitle("French Quarter")).toBe(
      "French Quarter"
    );
    expect(
      readEngine6ViatorItineraryItemSourceTitle("Lafitte's Blacksmith Shop Bar")
    ).toBe("Lafitte's Blacksmith Shop Bar");
    expect(
      resolveEngine6ItinerarySourceTitle({
        sourceTitle: " St. Louis Cathedral ",
        sourceTitleFieldPath: "product.itineraryItems[1].title",
      })
    ).toMatchObject({
      title: " St. Louis Cathedral ",
      sourceTitleFieldPath: "product.itineraryItems[1].title",
      usedConfirmedTitleOverride: false,
    });
  });

  it("uses only the itinerary item title field path", () => {
    expect(
      buildEngine6ItineraryItemTitleFieldPath("product.itineraryItems", 0)
    ).toBe("product.itineraryItems[0].title");
  });

  it("uses confirmed overrides only when the itinerary title field is absent", () => {
    expect(
      resolveEngine6ItinerarySourceTitle({
        sourceTitle: null,
        sourceTitleFieldPath: "product.itineraryItems[0].title",
        confirmedTitleOverride: "Wollman Rink",
      })
    ).toMatchObject({
      title: "Wollman Rink",
      usedConfirmedTitleOverride: true,
    });
  });

  it("does not infer titles from descriptions or POI naming fields", () => {
    expect(
      resolveEngine6ItinerarySourceTitle({
        sourceTitle: null,
        sourceTitleFieldPath: "product.itineraryItems[0].title",
      })
    ).toMatchObject({
      title: null,
      usedConfirmedTitleOverride: false,
    });
  });
});
