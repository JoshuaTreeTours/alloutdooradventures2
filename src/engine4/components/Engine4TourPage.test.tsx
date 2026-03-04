import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Engine3TourPage from "../../engine3/components/Engine3TourPage";
import type { Engine3TourViewModel } from "../../engine3/types";
import type { Engine4TourViewModel } from "../types";
import Engine4TourPage from "./Engine4TourPage";

const engine4Tour: Engine4TourViewModel = {
  tourId: "engine4-74828P4",
  productCode: "74828P4",
  title: "Aspen’s Off the Beaten Path Tour",
  canonicalPath:
    "/destinations/colorado/aspen/tours/aspens-off-the-beaten-path-tour-74828p4",
  bookingUrl:
    "https://www.viator.com/tours/Aspen/Aspens-Off-the-Beaten-Path-Tour/d26395-74828P4",
  city: "Aspen",
  state: "Colorado",
  country: "United States",
  heroImage:
    "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
  galleryImages: [
    "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1",
  ],
  fromPrice: "$45",
  rating: 5.0,
  reviewCount: 23,
  duration: "1h 30m",
  meetingPoint:
    "Across from Wheeler Opera House on the downtown brick pedestrian mall",
  meetingPointShort: "Wheeler Opera House pedestrian mall",
  cancellationPolicy: "Free cancellation up to 24 hours in advance.",
  overview: "Sample overview",
  highlights: [
    "Guided walking tour through Aspen’s historic West End",
    "Approximate duration of 1 hour 30 minutes",
  ],
  faqs: [
    {
      question: "Where does the tour start?",
      answer:
        "Meet near the Wheeler Opera House on Aspen’s downtown pedestrian mall.",
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
    const hrefMatches = html.match(/href="[^"]*74828P4[^"]*"/g) ?? [];

    expect(hrefMatches).toHaveLength(2);
    expect(html.split("Book This Tour").length - 1).toBe(2);
    expect(html).toContain("Ready to Book?");
    expect(html.match(/target="_blank"/g) ?? []).toHaveLength(2);
    expect(html.match(/rel="noopener"/g) ?? []).toHaveLength(2);
  });

  it("does not force new-tab behavior for internal booking links", () => {
    const html = renderToStaticMarkup(
      <Engine4TourPage
        tour={{
          ...engine4Tour,
          bookingUrl:
            "/destinations/colorado/aspen/tours/aspens-off-the-beaten-path-tour-74828p4/book",
        }}
      />
    );

    expect(html).not.toContain('target="_blank"');
    expect(html).not.toContain('rel="noopener"');
  });

  it("keeps non-Engine4 tour rendering unchanged", () => {
    const html = renderToStaticMarkup(<Engine3TourPage tour={engine3Tour} />);

    expect(html).not.toContain("Ready to Book?");
  });
});
