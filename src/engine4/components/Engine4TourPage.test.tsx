import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Engine3TourPage from "../../engine3/components/Engine3TourPage";
import type { Engine3TourViewModel } from "../../engine3/types";
import type { Engine4TourViewModel } from "../types";
import Engine4TourPage from "./Engine4TourPage";

const engine4Tour: Engine4TourViewModel = {
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
    "https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg",
  galleryImages: [],
  facts: {
    priceFrom: "$65.00",
    ratingValue: 4.7,
    reviewCount: 3,
    duration: "2 hours",
    startTime: "8:15 AM",
    meetingPointShort: "Wheeler Opera House",
    meetingPointFull: "Wheeler Opera House, 320 E Hyman Ave, Aspen, CO 81611",
    cancellationPolicy: "Free cancellation up to 24 hours in advance.",
  },
  content: {
    overview: "Sample overview",
    highlights: ["Guided hike", "2-hour duration"],
    faqs: [{ question: "Where do we meet?", answer: "Wheeler Opera House" }],
    itinerary: [
      { title: "Wheeler Opera House", description: "Meet and greet" },
    ],
    inclusions: [],
    exclusions: [],
  },
};

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

const engine3Tour: Engine3TourViewModel = {
  tourId: "2335P1",
  bookingProvider: "viator",
  title: "San Andreas Fault Jeep Tour from Palm Springs",
  description: "Engine3 sample.",
  country: "usa",
  stateSlug: "california",
  city: "Palm Springs",
  citySlug: "palm-springs",
  region: "California",
  canonicalPath:
    "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-from-palm-springs-2335p1",
  bookingUrl: "https://www.viator.com/tours/Palm-Springs/example",
  primaryImageUrl:
    "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
};

describe("Engine4TourPage booking CTA", () => {
  it("renders two booking CTA links for Engine4 Viator tours with new-tab attrs", () => {
    const html = renderToStaticMarkup(<Engine4TourPage tour={engine4Tour} />);

    expect(html.split("Book This Tour").length - 1).toBe(2);
    expect(html.match(/target=\"_blank\"/g) ?? []).toHaveLength(2);
    expect(html.match(/rel=\"noopener noreferrer\"/g) ?? []).toHaveLength(2);
    expect(html).toContain("Ready to book?");
  });


  it("hides empty fact rows and renders rows only when values exist", () => {
    const withoutFacts: Engine4TourViewModel = {
      ...engine4Tour,
      facts: {
        ...engine4Tour.facts,
        priceFrom: undefined,
        ratingValue: undefined,
        reviewCount: undefined,
        duration: undefined,
        startTime: undefined,
        meetingPointShort: undefined,
      },
    };

    const emptyFactsHtml = renderToStaticMarkup(
      <Engine4TourPage tour={withoutFacts} />
    );
    expect(emptyFactsHtml).not.toContain("From:</strong>");
    expect(emptyFactsHtml).not.toContain("Rating:");
    expect(emptyFactsHtml).not.toContain("Meeting point:");
    expect(emptyFactsHtml).not.toContain("Start time:");
    expect(emptyFactsHtml).not.toContain("Duration:");

    const withFallbackPrice: Engine4TourViewModel = {
      ...withoutFacts,
      facts: {
        ...withoutFacts.facts,
        priceFrom: "$199.00",
      },
    };

    const withPriceHtml = renderToStaticMarkup(
      <Engine4TourPage tour={withFallbackPrice} />
    );
    expect(withPriceHtml).toContain("From:</strong> $199.00 per person");

    const withRating: Engine4TourViewModel = {
      ...withoutFacts,
      facts: {
        ...withoutFacts.facts,
        ratingValue: 4.9,
        reviewCount: 12,
      },
    };

    const withRatingHtml = renderToStaticMarkup(
      <Engine4TourPage tour={withRating} />
    );
    expect(withRatingHtml).toContain("Rating:</strong> 4.9 (12 reviews)");
  });

  it("keeps non-Engine4 tour rendering unchanged", () => {
    const html = renderToStaticMarkup(<Engine3TourPage tour={engine3Tour} />);

    expect(html).not.toContain("Ready to book?");
  });
});
