import { describe, expect, it } from "vitest";

import { generateEngine3Description } from "./generateEngine3Description";

describe("generateEngine3Description", () => {
  it("returns an authoritative paragraph between 120 and 170 words with structured facts", () => {
    const description = generateEngine3Description({
      title: "Joshua Tree Hummer Adventure from Palm Desert",
      duration: "3 hours",
      highlights: [
        "open-air Hummer travel through desert washes",
        "geologic landmarks and panoramic viewpoints",
        "guide commentary on geology and desert ecology",
      ],
      shortInclusions: ["professional guide", "bottled water"],
      meetingPoint: "Palm Desert",
      cancellationWindowHours: 48,
      city: "Palm Springs",
      region: "California",
    });

    const wordCount = description.split(/\s+/).filter(Boolean).length;
    expect(wordCount).toBeGreaterThanOrEqual(120);
    expect(wordCount).toBeLessThanOrEqual(170);

    expect(description).toContain("Departures operate from Palm Desert");
    expect(description).toContain(
      "Cancellations are accepted up to 48 hours before departure"
    );

    expect(description.toLowerCase()).not.toContain("viator");
    expect(description.toLowerCase()).not.toContain("tripadvisor");
    expect(description.toLowerCase()).not.toContain("booking page");
    expect(description.toLowerCase()).not.toContain("confirmation");
    expect(description.toLowerCase()).not.toContain("checkout");
  });

  it("injects group size and age facts when available", () => {
    const description = generateEngine3Description({
      title: "San Andreas Fault Jeep Tour from Palm Springs",
      duration: "3 hours",
      highlights: [
        "open-air Jeep ride through the San Andreas Fault zone",
        "stops near desert washes and fan-palm oasis habitat",
      ],
      shortInclusions: ["guided Jeep transportation"],
      meetingPoint: "Metate Ranch - Indio",
      maxGroupSize: 7,
      minAge: 5,
      city: "Palm Springs",
      region: "California",
    });

    expect(description).toContain(
      "Group size is limited to 7 guests per vehicle"
    );
    expect(description).toContain("Participants must be at least 5 years old");
  });
});
