import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Engine3TourPage from "../../engine3/components/Engine3TourPage";
import type { Engine3TourViewModel } from "../../engine3/types";
import type { Engine4TourViewModel } from "../types";
import Engine4TourPage from "./Engine4TourPage";

const engine4Tour: Engine4TourViewModel = {
  tourId: "engine4-74828P5",
  productCode: "74828P5",
  title: "Aspen East End Light Hike",
  canonicalPath:
    "/destinations/colorado/aspen/tours/aspen-east-end-light-hike-74828p5",
  bookingUrl:
    "https://www.viator.com/tours/Aspen/Aspen-East-End-Light-Hike/d26395-74828P5?pid=P00290915&mcid=42383&medium=link",
  city: "Aspen",
  state: "Colorado",
  country: "United States",
  heroImage:
    "https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg",
  galleryImages: [
    "https://media.tacdn.com/media/attractions-splice-spp-360x240/11/8a/ad/05.jpg",
  ],
  fromPrice: "$65.00",
  rating: 4.7,
  reviewCount: 3,
  duration: "2 hours",
  startTime: "8:15 AM",
  meetingPoint: "Wheeler Opera House, 320 E Hyman Ave, Aspen, CO 81611",
  meetingPointShort: "Wheeler Opera House",
  cancellationPolicy: "Free cancellation up to 24 hours in advance.",
  overview: "Sample overview",
  highlights: ["Guided hike", "2-hour duration"],
  faqs: [
    {
      question: "Where do we meet?",
      answer: "Wheeler Opera House",
    },
  ],
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

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

describe("Engine4TourPage booking CTA", () => {
  it("renders two booking CTA links for Engine4 Viator tours", () => {
    const html = renderToStaticMarkup(<Engine4TourPage tour={engine4Tour} />);
    const hrefMatches = html.match(/href="[^"]*74828P5[^"]*"/g) ?? [];

    expect(hrefMatches).toHaveLength(2);
    expect(html.split("Book This Tour").length - 1).toBe(2);
    expect(html).toContain("Ready to book?");
    expect(html.match(/target="_blank"/g) ?? []).toHaveLength(2);
    expect(html.match(/rel="noopener"/g) ?? []).toHaveLength(2);
  });

  it("does not force new-tab behavior for internal booking links", () => {
    const html = renderToStaticMarkup(
      <Engine4TourPage
        tour={{
          ...engine4Tour,
          bookingUrl:
            "/destinations/colorado/aspen/tours/aspen-east-end-light-hike-74828p5/book",
        }}
      />
    );

    expect(html).not.toContain('target="_blank"');
    expect(html).not.toContain('rel="noopener"');
  });

  it("keeps non-Engine4 tour rendering unchanged", () => {
    const html = renderToStaticMarkup(<Engine3TourPage tour={engine3Tour} />);

    expect(html).not.toContain("Ready to book?");
  });
});
