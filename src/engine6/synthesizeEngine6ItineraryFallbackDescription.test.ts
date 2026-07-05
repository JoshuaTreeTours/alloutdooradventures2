import { describe, expect, it } from "vitest";

import {
  isEngine6YosemiteItineraryDestination,
  resolveEngine6ItineraryFallbackDestinationLabel,
  synthesizeEngine6ItineraryFallbackDescription,
} from "./synthesizeEngine6ItineraryFallbackDescription";

describe("synthesizeEngine6ItineraryFallbackDescription", () => {
  const rmnpDestination = {
    city: "Rocky Mountain National Park",
    state: "Colorado",
    citySlug: "rocky-mountain-national-park",
  };

  const yosemiteDestination = {
    city: "Yosemite",
    state: "California",
    citySlug: "yosemite",
  };

  it("derives RMNP destination labels from the product city", () => {
    expect(
      resolveEngine6ItineraryFallbackDestinationLabel(rmnpDestination)
    ).toBe("Rocky Mountain National Park");
  });

  it("does not classify RMNP as a Yosemite destination", () => {
    expect(isEngine6YosemiteItineraryDestination(rmnpDestination)).toBe(false);
  });

  it("uses destination-aware fallback copy for RMNP stops", () => {
    expect(
      synthesizeEngine6ItineraryFallbackDescription({
        title: "Bear Lake",
        duration: "30 minutes",
        stopType: "stop",
        destination: rmnpDestination,
      })
    ).toBe(
      "Bear Lake is a scheduled stop in Rocky Mountain National Park in about 30 minutes."
    );
  });

  it("does not apply Yosemite waterfall templates to RMNP fall-named stops", () => {
    const description = synthesizeEngine6ItineraryFallbackDescription({
      title: "Horseshoe Falls",
      duration: null,
      stopType: "pass-by",
      destination: rmnpDestination,
    });

    expect(description).not.toMatch(/Yosemite/i);
    expect(description).toBe(
      "Horseshoe Falls is viewed along the route through Rocky Mountain National Park."
    );
  });

  it("keeps Yosemite landmark templates for Yosemite products", () => {
    expect(
      synthesizeEngine6ItineraryFallbackDescription({
        title: "Tunnel View",
        duration: null,
        stopType: "stop",
        destination: yosemiteDestination,
      })
    ).toContain("Yosemite Valley");
  });
});
