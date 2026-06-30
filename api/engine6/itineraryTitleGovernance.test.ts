import { describe, expect, it } from "vitest";

import {
  buildEngine6NeutralItineraryStopTitle,
  governEngine6ItineraryStopTitle,
  isEngine6GenericItineraryTitleFragment,
} from "./itineraryTitleGovernance";

describe("governEngine6ItineraryStopTitle", () => {
  it("keeps structured explicit POI titles", () => {
    expect(
      governEngine6ItineraryStopTitle({
        candidateTitle: "Old Faithful",
        titleSource: "explicit",
        rowIndex: 0,
      })
    ).toEqual({ title: "Old Faithful", titleSource: "explicit" });
  });

  it("rejects description-inferred prose in favor of a neutral fallback", () => {
    expect(
      governEngine6ItineraryStopTitle({
        candidateTitle:
          "Upper Geyser Basin boardwalk timed for an Old Faithful eruption",
        titleSource: "description-inferred",
        rowIndex: 2,
      })
    ).toEqual({ title: "Itinerary Stop 3", titleSource: "explicit" });
  });

  it("rejects generic This fragments", () => {
    expect(
      governEngine6ItineraryStopTitle({
        candidateTitle: "This",
        titleSource: "description-inferred",
        rowIndex: 6,
      })
    ).toEqual({ title: "Itinerary Stop 7", titleSource: "explicit" });
  });

  it("rejects explicit prose titles derived from supplier sentences", () => {
    expect(
      governEngine6ItineraryStopTitle({
        candidateTitle:
          "This 12-block greenspace stretches north through the heart of the city, intersected by the Portland Streetcar.",
        titleSource: "explicit",
        rowIndex: 4,
      })
    ).toEqual({ title: "Itinerary Stop 5", titleSource: "explicit" });
  });
});

describe("isEngine6GenericItineraryTitleFragment", () => {
  it("flags This and other generic fragments", () => {
    expect(isEngine6GenericItineraryTitleFragment("This")).toBe(true);
    expect(isEngine6GenericItineraryTitleFragment("this stop")).toBe(true);
    expect(isEngine6GenericItineraryTitleFragment("Then")).toBe(true);
    expect(isEngine6GenericItineraryTitleFragment("Hayden Valley")).toBe(false);
  });
});

describe("buildEngine6NeutralItineraryStopTitle", () => {
  it("uses one-based numbering", () => {
    expect(buildEngine6NeutralItineraryStopTitle(0)).toBe("Itinerary Stop 1");
    expect(buildEngine6NeutralItineraryStopTitle(4)).toBe("Itinerary Stop 5");
  });
});
