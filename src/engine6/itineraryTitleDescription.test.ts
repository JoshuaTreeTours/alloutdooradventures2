import { describe, expect, it } from "vitest";

import { buildEngine6ItineraryForProduct } from "./mapViatorToEngine6Tour";
import {
  normalizeEngine6ItineraryStopFields,
  splitDescriptiveProseIntoLandmarkAndDetail,
} from "./itineraryTitleDescription";

describe("Engine6 itinerary title and description splitting", () => {
  it("extracts short landmark titles without rewriting supplier descriptions", () => {
    const source =
      "Iconic carousel in Central Park built in 1908 & featuring over 50 hand-carved horses";

    expect(splitDescriptiveProseIntoLandmarkAndDetail(source)).toEqual({
      landmark: "Central Park Carousel",
      detail: source,
    });

    expect(
      normalizeEngine6ItineraryStopFields({
        title: source,
        description: source,
      })
    ).toEqual({
      title: "Central Park Carousel",
      description: source,
    });
  });

  it("keeps short landmark titles and separate supplier descriptions", () => {
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

  it("promotes misplaced supplier prose into the description without rewriting it", () => {
    const literaryWalkSource =
      "Literary Walk along the mall with statues of famous writers and poets";

    expect(
      normalizeEngine6ItineraryStopFields({
        title: literaryWalkSource,
      })
    ).toEqual({
      title: "Literary Walk",
      description: literaryWalkSource,
    });

    const sheepMeadowSource =
      "Sheep Meadow open lawn area popular for picnics and sunbathing";

    expect(
      normalizeEngine6ItineraryStopFields({
        title: sheepMeadowSource,
      })
    ).toEqual({
      title: "Sheep Meadow",
      description: sheepMeadowSource,
    });
  });

  it("builds Central Park pedicab cards with short titles and preserved supplier descriptions", () => {
    const carouselSource =
      "Iconic carousel in Central Park built in 1908 & featuring over 50 hand-carved horses";
    const literaryWalkSource =
      "Literary Walk along the mall with statues of famous writers and poets";
    const sheepMeadowSource =
      "Sheep Meadow open lawn area popular for picnics and sunbathing";

    const itinerary = buildEngine6ItineraryForProduct("414460P1", [
      {
        title: carouselSource,
        description: carouselSource,
        stopType: "stop",
      },
      {
        title: literaryWalkSource,
        description: literaryWalkSource,
        stopType: "stop",
      },
      {
        title: "Bethesda Fountain",
        description: "Photo stop and historical narration",
        duration: "15 minutes",
        stopType: "stop",
      },
      {
        title: sheepMeadowSource,
        stopType: "pass-by",
      },
    ]);

    expect(itinerary[0]?.title).toBe("Central Park Carousel");
    expect(itinerary[0]?.description).toBe(`${carouselSource}.`);
    expect(itinerary[1]?.title).toBe("Literary Walk");
    expect(itinerary[1]?.description).toBe(`${literaryWalkSource}.`);
    expect(itinerary[2]).toMatchObject({
      title: "Bethesda Fountain",
      description: "Photo stop and historical narration.",
    });
    expect(itinerary[3]?.title).toBe("Sheep Meadow");
    expect(itinerary[3]?.description).toBe(`${sheepMeadowSource}.`);
  });
});
