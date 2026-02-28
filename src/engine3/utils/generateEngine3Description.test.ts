import { describe, expect, it } from "vitest";

import { generateEngine3Description } from "./generateEngine3Description";

describe("generateEngine3Description", () => {
  it("returns 100-120 words, avoids forbidden terms, and includes itinerary stops", () => {
    const description = generateEngine3Description({
      title: "San Andreas Fault Jeep Tour from Palm Springs",
      city: "Palm Springs",
      region: "California",
      duration: "3 hours",
      departureLocation: "Metate Ranch in Indio",
      itineraryStopNames: [
        "San Andreas Fault",
        "Pushawalla Palms",
        "Metate Ranch",
      ],
      maxGroupSize: 7,
      specialHighlightPhrase:
        "The route explores the San Andreas Fault zone and desert oasis terrain.",
      highlights: ["Geologic viewpoints", "Fan-palm oasis habitat"],
    });

    const wordCount = description.split(/\s+/).filter(Boolean).length;
    expect(wordCount).toBeGreaterThanOrEqual(100);
    expect(wordCount).toBeLessThanOrEqual(120);

    expect(description).toContain("in about 3 hours");
    expect(description).toContain("After meeting in Metate Ranch in Indio");
    expect(description).toContain("San Andreas Fault");
    expect(description).toContain("Pushawalla Palms");

    const lowered = description.toLowerCase();
    for (const forbidden of [
      "viator",
      "tripadvisor",
      "third-party",
      "listed on",
      "published details",
      "confirmation",
    ]) {
      expect(lowered).not.toContain(forbidden);
    }
  });

  it("includes at least two itinerary stop names when two or more are available", () => {
    const description = generateEngine3Description({
      title: "Joshua Tree Hummer Adventure from Palm Desert",
      city: "Palm Springs",
      region: "California",
      duration: "3 hours",
      departureLocation: "Palm Desert",
      vehicleType: "open-air Hummer",
      itineraryStopNames: ["Keys View", "Barker Dam Trail", "Cap Rock Trail"],
      highlights: ["Panoramic viewpoints", "Geologic landmarks"],
    });

    const matchedStopCount = [
      "Keys View",
      "Barker Dam Trail",
      "Cap Rock Trail",
    ].filter(stop => description.includes(stop)).length;

    expect(matchedStopCount).toBeGreaterThanOrEqual(2);
    expect(description).toContain("open-air Hummer");
  });
});
