import { describe, expect, it } from "vitest";

import {
  rewriteEngine6ItineraryDescription,
  validateEngine6GovernedItinerary,
} from "./itineraryGovernance";

describe("Engine6 itinerary governance", () => {
  it("rewrites source itinerary context into one concise factual sentence", () => {
    const description = rewriteEngine6ItineraryDescription({
      index: 0,
      item: {
        title: "Alcatraz Island",
        stopType: "stop",
        description:
          "Travel by ferry to Alcatraz Island and explore the former prison site using the app-guided format. Guests may spend time around the cellhouse.",
      },
    });

    expect(description).toBe(
      "Visit Alcatraz Island with ferry access, former prison site context and app-guided format."
    );
    expect(description.split(/(?<=[.!?])\s+/).filter(Boolean)).toHaveLength(1);
  });

  it("flags supplier-mirrored, multi-sentence, and mechanical itinerary prose", () => {
    const violations = validateEngine6GovernedItinerary({
      renderedItems: [
        {
          title: "Alcatraz Island",
          description:
            "Travel by ferry to Alcatraz Island and explore the former prison site using the app-guided format.",
        },
        {
          title: "Golden Gate Bridge",
          description:
            "This stop provides a focused destination experience with local context and guided interpretation.",
        },
        {
          title: "Fisherman's Wharf",
          description:
            "Visit Fisherman's Wharf for waterfront views. Browse nearby piers.",
        },
      ],
      sourceItems: [
        {
          title: "Alcatraz Island",
          description:
            "Travel by ferry to Alcatraz Island and explore the former prison site using the app-guided format.",
        },
      ],
    });

    expect(violations.join(" ")).toContain(
      "closely mirrors Viator itinerary prose"
    );
    expect(violations.join(" ")).toContain("generic or mechanical phrasing");
    expect(violations.join(" ")).toContain(
      "description must be exactly one concise sentence"
    );
  });
});
