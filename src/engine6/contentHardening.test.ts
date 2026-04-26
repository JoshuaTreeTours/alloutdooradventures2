import { describe, expect, it } from "vitest";

import { buildEngine6ItineraryDescriptions } from "./contentHardening";

describe("engine6 itinerary hardening", () => {
  it("enhances weak generic descriptions with stop-specific context", () => {
    const result = buildEngine6ItineraryDescriptions({
      itinerary: [
        {
          title: "Battery Park",
          description: "Pass by and see the area.",
        },
      ],
    });

    expect(result.itinerary[0]?.description).toMatch(/Battery Park/i);
    expect(result.itinerary[0]?.description).toMatch(/waterfront|harbor/i);
    expect(result.itinerary[0]?.description).not.toMatch(
      /take in the surrounding scenery/i
    );
  });

  it("varies phrasing across repeated weak pass-by stops", () => {
    const result = buildEngine6ItineraryDescriptions({
      itinerary: [
        { title: "North Bridge", description: "Enjoy the views." },
        { title: "South Bridge", description: "Enjoy the views." },
        { title: "East Bridge", description: "Enjoy the views." },
      ],
    });

    const descriptions = result.itinerary.map(item => item.description ?? "");
    expect(new Set(descriptions).size).toBe(descriptions.length);
    expect(descriptions[0]).not.toEqual(descriptions[1]);
    expect(descriptions[1]).not.toEqual(descriptions[2]);
  });

  it("avoids mechanical connectors and filler endings", () => {
    const result = buildEngine6ItineraryDescriptions({
      itinerary: [
        { title: "Liberty Island", description: "Take in the surrounding scenery." },
        { title: "Ellis Island", description: "Enjoy the views." },
        { title: "Battery Park", description: "Pass by and see the area." },
      ],
    });

    for (const item of result.itinerary) {
      const text = item.description ?? "";
      expect(text).not.toMatch(/and note|and take in|and enjoy|and see/i);
      expect(text).not.toMatch(/as the route continues|along the way|during the tour/i);
    }
  });

});
