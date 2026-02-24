import { describe, expect, it } from "vitest";

import { buildTourItinerary } from "./buildTourItinerary";

describe("buildTourItinerary", () => {
  it("builds a 3-5 step factual itinerary with meeting and return steps", () => {
    const itinerary = buildTourItinerary({
      tourTitle: "San Andreas Fault Jeep Tour",
      cityName: "Indio",
      departureLocationName: "Metate Ranch",
      duration: "3 hours",
      highlights: [
        "Open-air Jeep drive through the Indio Hills fault zone",
        "Short walk stops near slot canyon formations for photos",
        "Palm oasis habitat and Cahuilla history interpretation",
      ],
      experienceText:
        "Guides cover geology interpretation and photo stops in the fault zone.",
    });

    const steps = itinerary.itemListElement.map(item => item.name);

    expect(itinerary["@type"]).toBe("ItemList");
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps.length).toBeLessThanOrEqual(5);
    expect(steps[0]).toContain("Metate Ranch");
    expect(steps[steps.length - 1]).toContain("Return to Metate Ranch");
  });

  it("falls back to a compact 3-step itinerary when highlights are missing", () => {
    const itinerary = buildTourItinerary({
      cityName: "Palm Springs",
      duration: "PT3H",
      highlights: [],
      experienceText: "",
    });

    const steps = itinerary.itemListElement.map(item => item.name);
    expect(steps).toHaveLength(3);
    expect(steps[0]).toContain("Meet at Palm Springs");
    expect(steps[1]).toContain("Guided drive and interpretation");
    expect(steps[2]).toContain("Return to Palm Springs");
  });
});
