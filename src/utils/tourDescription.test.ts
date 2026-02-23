import { describe, expect, it } from "vitest";

import {
  buildTourDescriptionResult,
  looksTokenizedSlug,
  normalizeDescriptionForDedupe,
} from "./tourDescription";

describe("tourDescription", () => {
  it("keeps clean base description when not duplicate", () => {
    const result = buildTourDescriptionResult({
      baseDescription: "Guided river paddle with expert local instructors.",
      tourName: "River Paddle Tour",
      cityName: "Sedona",
      stateName: "Arizona",
      tourId: "123",
    });

    expect(result.description).toBe(
      "Guided river paddle with expert local instructors."
    );
    expect(result.didDedupe).toBe(false);
    expect(result.slugGuardTriggered).toBe(false);
  });

  it("adds deterministic dedupe suffix", () => {
    const result = buildTourDescriptionResult({
      baseDescription: "Sunset cruise with wildlife viewing.",
      tourName: "Harbor Sunset Cruise",
      cityName: "San Diego",
      stateName: "California",
      tourId: "456",
      variantLabel: "Pick-up",
      isDuplicate: true,
    });

    expect(result.description).toBe(
      "Sunset cruise with wildlife viewing. — Harbor Sunset Cruise (San Diego, California) · ID 456 · Pick-up"
    );
  });

  it("strips tokenized slug fragments", () => {
    const result = buildTourDescriptionResult({
      baseDescription:
        "snorkel-adventure-in-waikiki-beach Book your guided trip today.",
      tourName: "Waikiki Snorkel Adventure",
      cityName: "Honolulu",
      stateName: "Hawaii",
      tourId: "999",
      tourSlug: "snorkel-adventure-in-waikiki-beach-999",
      isDuplicate: false,
    });

    expect(looksTokenizedSlug(result.description)).toBe(false);
    expect(result.slugGuardTriggered).toBe(false);
    expect(normalizeDescriptionForDedupe(result.description)).toBe(
      "book your guided trip today."
    );
  });

  it("injects Palm Springs jeep specifics", () => {
    const result = buildTourDescriptionResult({
      baseDescription: "Guided desert outing with stops.",
      tourName: "Private San Andreas Fault Jeep Tour",
      cityName: "Palm Springs",
      stateName: "California",
      citySlug: "palm-springs",
      tourId: "34897",
    });

    expect(result.description).toContain(
      "This tour lasts approximately 3 hours"
    );
    expect(result.description).toContain(
      "includes travel through desert canyons and San Andreas Fault formations in a 4×4 vehicle."
    );
  });

  it("does not inject Palm Springs specifics for non-Palm Springs tours", () => {
    const result = buildTourDescriptionResult({
      baseDescription: "Guided desert outing with stops.",
      tourName: "Private San Andreas Fault Jeep Tour",
      cityName: "Sedona",
      stateName: "Arizona",
      citySlug: "sedona",
      tourId: "34897",
    });

    expect(result.description).toBe("Guided desert outing with stops.");
  });
});
