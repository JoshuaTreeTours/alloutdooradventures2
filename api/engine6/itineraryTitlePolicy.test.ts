import { describe, expect, it } from "vitest";

import {
  isGenericEngine6ItineraryTitle,
  resolveEngine6ItineraryFallbackTitle,
  resolveEngine6ItineraryTitle,
} from "./itineraryTitlePolicy";

describe("Engine6 itinerary title policy", () => {
  it("preserves meaningful source titles exactly", () => {
    expect(
      resolveEngine6ItineraryTitle({
        sourceTitleFields: ["French Quarter"],
        stopType: "stop",
      })
    ).toBe("French Quarter");
  });

  it("rejects generic source titles and falls back to Stop or Pass By", () => {
    expect(
      resolveEngine6ItineraryTitle({
        sourceTitleFields: ["Stop"],
        stopType: "stop",
      })
    ).toBe("Stop");
    expect(
      resolveEngine6ItineraryTitle({
        sourceTitleFields: ["Pass By"],
        stopType: "pass-by",
      })
    ).toBe("Pass By");
    expect(
      resolveEngine6ItineraryTitle({
        sourceTitleFields: ["This"],
        stopType: "stop",
      })
    ).toBe("Stop");
  });

  it("uses POI naming fields before neutral fallbacks", () => {
    expect(
      resolveEngine6ItineraryTitle({
        sourceTitleFields: ["Location"],
        namingFields: ["Jackson Square"],
        stopType: "stop",
      })
    ).toBe("Jackson Square");
  });

  it("does not derive titles from descriptions", () => {
    expect(
      resolveEngine6ItineraryTitle({
        sourceTitleFields: [],
        namingFields: [],
        stopType: "pass-by",
      })
    ).toBe("Pass By");
    expect(
      isGenericEngine6ItineraryTitle(
        "Pedal past the lively music district"
      )
    ).toBe(false);
    expect(
      resolveEngine6ItineraryTitle({
        sourceTitleFields: [],
        namingFields: [],
        stopType: "stop",
      })
    ).toBe("Stop");
  });

  it("uses Itinerary Item only when stop type is unknown", () => {
    expect(resolveEngine6ItineraryFallbackTitle(undefined)).toBe(
      "Itinerary Item"
    );
    expect(
      resolveEngine6ItineraryTitle({
        sourceTitleFields: ["Item"],
        namingFields: [],
      })
    ).toBe("Itinerary Item");
  });
});
