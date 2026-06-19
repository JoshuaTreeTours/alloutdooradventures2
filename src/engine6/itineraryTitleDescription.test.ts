import { describe, expect, it } from "vitest";

import { buildEngine6ItineraryForProduct } from "./mapViatorToEngine6Tour";
import {
  normalizeEngine6ItineraryStopFields,
  splitDescriptiveProseIntoLandmarkAndDetail,
} from "./itineraryTitleDescription";

describe("Engine6 itinerary title and description splitting", () => {
  it("splits Central Park carousel prose into a short landmark title and factual detail", () => {
    const source =
      "Iconic carousel in Central Park built in 1908 & featuring over 50 hand-carved horses";

    expect(splitDescriptiveProseIntoLandmarkAndDetail(source)).toEqual({
      landmark: "Central Park Carousel",
      detail: "Built in 1908 and featuring over 50 hand-carved horses.",
    });

    expect(
      normalizeEngine6ItineraryStopFields({
        title: source,
        description: source,
      })
    ).toEqual({
      title: "Central Park Carousel",
      description: "Built in 1908 and featuring over 50 hand-carved horses.",
    });
  });

  it("keeps short landmark titles and separate factual descriptions", () => {
    expect(
      normalizeEngine6ItineraryStopFields({
        title: "Bethesda Fountain",
        description: "Photo stop and historical narration",
      })
    ).toEqual({
      title: "Bethesda Fountain",
      description: "Photo stop and historical narration",
    });
  });

  it("splits landmark-leading prose when descriptive detail follows the name", () => {
    expect(
      normalizeEngine6ItineraryStopFields({
        title:
          "Literary Walk along the mall with statues of famous writers and poets",
      })
    ).toEqual({
      title: "Literary Walk",
      description:
        "Along the mall with statues of famous writers and poets.",
    });

    expect(
      normalizeEngine6ItineraryStopFields({
        title: "Sheep Meadow open lawn area popular for picnics and sunbathing",
      })
    ).toEqual({
      title: "Sheep Meadow",
      description: "Open lawn area popular for picnics and sunbathing.",
    });

    expect(
      normalizeEngine6ItineraryStopFields({
        title:
          "Chess & Checkers House where visitors can borrow pieces for outdoor games",
      })
    ).toEqual({
      title: "Chess & Checkers House",
      description:
        "Where visitors can borrow pieces for outdoor games.",
    });
  });

  it("builds Central Park pedicab itinerary cards with short titles and non-duplicative descriptions", () => {
    const itinerary = buildEngine6ItineraryForProduct("414460P1", [
      {
        title:
          "Iconic carousel in Central Park built in 1908 & featuring over 50 hand-carved horses",
        description:
          "Iconic carousel in Central Park built in 1908 & featuring over 50 hand-carved horses",
        stopType: "stop",
      },
      {
        title:
          "Literary Walk along the mall with statues of famous writers and poets",
        description:
          "Literary Walk along the mall with statues of famous writers and poets",
        stopType: "stop",
      },
      {
        title: "Bethesda Fountain",
        description: "Photo stop and historical narration",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: "Sheep Meadow open lawn area popular for picnics and sunbathing",
        stopType: "pass-by",
      },
    ]);

    expect(itinerary[0]?.title).toBe("Central Park Carousel");
    expect(itinerary[0]?.description).toBe(
      "Built in 1908 and featuring over 50 hand-carved horses."
    );
    expect(itinerary[1]?.title).toBe("Literary Walk");
    expect(itinerary[1]?.description).toContain("Along the mall");
    expect(itinerary[1]?.description).not.toMatch(/Literary Walk/i);
    expect(itinerary[2]).toMatchObject({
      title: "Bethesda Fountain",
      description: "Photo stop and historical narration.",
    });
    expect(itinerary[3]?.title).toBe("Sheep Meadow");
    expect(itinerary[3]?.description).toContain("Open lawn area");
    expect(itinerary[3]?.description).not.toMatch(/Sheep Meadow/i);
  });

  it("splits Visit-during source lines into a short landmark title and timed detail", () => {
    expect(
      normalizeEngine6ItineraryStopFields({
        title:
          "Visit Jackson Square during a 15-minute stop in the French Quarter area.",
      })
    ).toEqual({
      title: "Jackson Square",
      description: "During a 15-minute stop in the French Quarter area.",
    });
  });
});
