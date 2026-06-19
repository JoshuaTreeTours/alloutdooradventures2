import { describe, expect, it } from "vitest";

import {
  buildEngine6ItineraryItemTitleFieldPath,
  buildEngine6ItinerarySourceTitleFieldPattern,
  isGenericEngine6ItineraryTitle,
  resolveEngine6ItineraryFallbackTitle,
  resolveEngine6ItineraryTitle,
} from "./itineraryTitlePolicy";

describe("Engine6 itinerary title policy", () => {
  it("preserves meaningful Viator itinerary item title fields exactly", () => {
    expect(
      resolveEngine6ItineraryTitle({
        sourceTitle: "French Quarter",
        sourceTitleFieldPath: "product.itineraryItems[0].title",
        stopType: "stop",
      })
    ).toMatchObject({
      title: "French Quarter",
      usedSourceTitleField: true,
      usedNeutralFallback: false,
      missingSourceTitleFieldPath: null,
    });
  });

  it("documents the canonical Viator itinerary title field path pattern", () => {
    expect(
      buildEngine6ItinerarySourceTitleFieldPattern("product.itineraryItems")
    ).toBe("product.itineraryItems[].title");
    expect(
      buildEngine6ItineraryItemTitleFieldPath("product.itineraryItems", 3)
    ).toBe("product.itineraryItems[3].title");
  });

  it("uses POI naming fields only when the Viator title field is absent", () => {
    expect(
      resolveEngine6ItineraryTitle({
        sourceTitle: null,
        sourceTitleFieldPath: "product.itineraryItems[0].title",
        namingFields: [
          {
            value: "Jackson Square",
            fieldPath: "product.itineraryItems[0].pointOfInterest.name",
          },
        ],
        stopType: "stop",
      })
    ).toMatchObject({
      title: "Jackson Square",
      usedNamingField: true,
      usedNeutralFallback: false,
      missingSourceTitleFieldPath: null,
    });
  });

  it("does not use POI naming fields when a generic Viator title is present", () => {
    expect(
      resolveEngine6ItineraryTitle({
        sourceTitle: "Location",
        sourceTitleFieldPath: "product.itineraryItems[0].title",
        namingFields: [
          {
            value: "Jackson Square",
            fieldPath: "product.itineraryItems[0].pointOfInterest.name",
          },
        ],
        stopType: "stop",
      })
    ).toMatchObject({
      title: "Stop",
      usedNeutralFallback: true,
      usedNamingField: false,
      missingSourceTitleFieldPath: null,
    });
  });

  it("reports missing source-title field paths when falling back to Stop or Pass By", () => {
    expect(
      resolveEngine6ItineraryTitle({
        sourceTitle: null,
        sourceTitleFieldPath: "product.itineraryItems[1].title",
        stopType: "pass-by",
      })
    ).toMatchObject({
      title: "Pass By",
      usedNeutralFallback: true,
      missingSourceTitleFieldPath: "product.itineraryItems[1].title",
    });
    expect(
      resolveEngine6ItineraryTitle({
        sourceTitle: "This",
        sourceTitleFieldPath: "product.itineraryItems[2].title",
        stopType: "stop",
      })
    ).toMatchObject({
      title: "Stop",
      usedNeutralFallback: true,
      missingSourceTitleFieldPath: null,
    });
  });

  it("does not derive titles from descriptions", () => {
    expect(
      isGenericEngine6ItineraryTitle("Pedal past the lively music district")
    ).toBe(false);
    expect(
      resolveEngine6ItineraryTitle({
        sourceTitle: null,
        sourceTitleFieldPath: "product.itineraryItems[0].title",
        stopType: "stop",
      }).title
    ).toBe("Stop");
  });

  it("uses Itinerary Item only when stop type is unknown", () => {
    expect(resolveEngine6ItineraryFallbackTitle(undefined)).toBe(
      "Itinerary Item"
    );
    expect(
      resolveEngine6ItineraryTitle({
        sourceTitle: "Item",
        sourceTitleFieldPath: "product.itineraryItems[0].title",
      }).title
    ).toBe("Itinerary Item");
  });
});
