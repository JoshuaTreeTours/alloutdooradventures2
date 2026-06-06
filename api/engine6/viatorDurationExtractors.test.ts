import { describe, expect, it } from "vitest";

import { extractEngine6Product } from "./viatorExtractors";

describe("extractEngine6Product duration mapping", () => {
  it("maps Viator variable itinerary duration minutes to display text", () => {
    const result = extractEngine6Product({
      product: {
        productCode: "6740P7",
        title: "Joshua Tree National Park Scenic Tour",
        itinerary: {
          duration: {
            variableDurationFromMinutes: 180,
            variableDurationToMinutes: 300,
          },
        },
      },
    });

    expect(result.extracted.durationText).toBe("3 to 5 hours");
    expect(result.diagnostics.durationFieldPath).toBe(
      "product.itinerary.duration.variableDurationFromMinutes|product.itinerary.duration.variableDurationToMinutes"
    );
  });
});
