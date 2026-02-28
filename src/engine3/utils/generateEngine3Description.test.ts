import { describe, expect, it } from "vitest";

import { generateEngine3Description } from "./generateEngine3Description";

describe("generateEngine3Description", () => {
  it("returns 100-140 words without third-party terms and includes at least three facts", () => {
    const description = generateEngine3Description({
      title: "San Andreas Fault Jeep Tour from Palm Springs",
      city: "Palm Springs",
      region: "California",
      duration: "3 hours",
      departureLocation: "Metate Ranch in Indio",
      maxGroupSize: 7,
      minAge: 5,
      cancellationWindowHours: 48,
      specialHighlightPhrase:
        "The route explores the San Andreas Fault zone and desert oasis terrain.",
      shortInclusions: ["Professional guide", "Open-air Jeep transportation"],
      highlights: ["Geologic viewpoints", "Fan-palm oasis habitat"],
    });

    const wordCount = description.split(/\s+/).filter(Boolean).length;
    expect(wordCount).toBeGreaterThanOrEqual(100);
    expect(wordCount).toBeLessThanOrEqual(140);

    expect(description).toContain("The guided route runs about 3 hours");
    expect(description).toContain(
      "Departures operate from Metate Ranch in Indio"
    );
    expect(description).toContain(
      "Group size is limited to 7 guests per vehicle"
    );

    const lowered = description.toLowerCase();
    for (const forbidden of [
      "viator",
      "tripadvisor",
      "tacdn",
      "confirmation",
      "booking page",
      "listed as",
      "published details",
    ]) {
      expect(lowered).not.toContain(forbidden);
    }
  });

  it("uses Joshua Tree-specific facts when provided", () => {
    const description = generateEngine3Description({
      title: "Joshua Tree Hummer Adventure from Palm Desert",
      city: "Palm Springs",
      region: "California",
      duration: "3 hours",
      departureLocation: "Palm Desert",
      cancellationWindowHours: 48,
      vehicleType: "open-air Hummer",
      specialHighlightPhrase:
        "Guests ride in an open-air Hummer through Joshua Tree desert scenery and geologic viewpoints.",
      shortInclusions: ["Professional guide", "Bottled water"],
      highlights: ["Panoramic viewpoints", "Geologic landmarks"],
    });

    expect(description).toContain("Palm Desert");
    expect(description).toContain("open-air Hummer");
    expect(description).toContain("48 hours");
  });
});
