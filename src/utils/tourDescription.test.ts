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
});
