import { describe, expect, it } from "vitest";

import {
  assertEngine4ViatorTour,
  type Engine4TourViewModel,
} from "./types";

const baseTour: Engine4TourViewModel = {
  tourId: "engine4-74828P5",
  engine: "engine4",
  bookingProvider: "viator",
  productCode: "74828P5",
  slug: "aspen-east-end-light-hike",
  title: "Aspen East End Light Hike",
  canonicalPath:
    "/destinations/colorado/aspen/tours/aspen-east-end-light-hike-74828p5",
  bookingUrl:
    "https://www.viator.com/tours/Aspen/Aspen-East-End-Light-Hike/d26395-74828P5?pid=P00290915&mcid=42383&medium=link",
  destination: {
    country: "United States",
    state: "Colorado",
    stateSlug: "colorado",
    city: "Aspen",
    citySlug: "aspen",
  },
  heroImage:
    "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
  galleryImages: [],
  facts: {
    priceFrom: "$65.00",
    duration: "2 hours",
    meetingPointShort: "Wheeler Opera House",
  },
  content: {
    overview: "Sample overview that satisfies the runtime contract.",
    highlights: [],
    faqs: [],
    inclusions: [],
    exclusions: [],
  },
};

describe("assertEngine4ViatorTour", () => {
  it("accepts a valid TACDN hero image URL", () => {
    expect(() => assertEngine4ViatorTour(baseTour)).not.toThrow();
  });

  it("rejects non-TACDN hero URLs", () => {
    expect(() =>
      assertEngine4ViatorTour({
        ...baseTour,
        heroImage: "https://example.com/foo.jpg",
      })
    ).toThrow(
      "Engine4 heroImage must be a TACDN image (dynamic-media|media.tacdn.com)"
    );
  });

  it("rejects TACDN host URLs without an image path", () => {
    expect(() =>
      assertEngine4ViatorTour({
        ...baseTour,
        heroImage: "https://media.tacdn.com",
      })
    ).toThrow(
      "Engine4 heroImage must be a TACDN image (dynamic-media|media.tacdn.com)"
    );
  });

  it("rejects missing minimum facts", () => {
    expect(() =>
      assertEngine4ViatorTour({
        ...baseTour,
        facts: {
          priceFrom: undefined,
          duration: undefined,
          meetingPointShort: undefined,
          meetingPointFull: undefined,
        },
      })
    ).toThrow("Invalid Engine4 Viator contract: missing facts.priceFrom for 74828P5");

    expect(() =>
      assertEngine4ViatorTour({
        ...baseTour,
        facts: {
          ...baseTour.facts,
          duration: undefined,
        },
      })
    ).toThrow("Invalid Engine4 Viator contract: missing facts.duration for 74828P5");

    expect(() =>
      assertEngine4ViatorTour({
        ...baseTour,
        facts: {
          ...baseTour.facts,
          meetingPointShort: undefined,
          meetingPointFull: undefined,
        },
      })
    ).toThrow("Invalid Engine4 Viator contract: missing facts.meetingPoint for 74828P5");
  });
});
