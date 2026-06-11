import { beforeEach, describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import type { Engine2Tour } from "../data/loadEngine2";
import Engine2TourBookingPage from "./Engine2TourBookingPage";
import Engine2TourPage from "./Engine2TourPage";

const amsterdamLegacyTour: Engine2Tour = {
  id: "amsterdam-missing-guide",
  sourceCountrySlug: "netherlands",
  sourceCitySlug: "amsterdam",
  slug: "amsterdam-canal-bike-tour",
  name: "Amsterdam Canal Bike Tour",
  provider: {
    name: "Amsterdam Outdoor Co.",
    shortName: "amsterdamoutdoor",
  },
  geo: {
    country: "Netherlands",
    region: "North Holland",
    city: "Amsterdam",
    lat: 52.3676,
    lng: 4.9041,
  },
  seo: {
    title: "Amsterdam Canal Bike Tour",
    description: "Explore Amsterdam by bike.",
    canonicalPath:
      "/destinations/netherlands/amsterdam/tours/amsterdam-canal-bike-tour",
    ogImage: "https://example.com/amsterdam.jpg",
  },
  content: {
    experienceText: "Ride along Amsterdam canals with a local guide.",
    highlights: ["Canal neighborhoods", "Local bike routes"],
  },
  images: {
    hero: "https://example.com/amsterdam.jpg",
    gallery: [],
  },
  booking: {
    bookingUrl: "https://booking.example.com/amsterdam-canal-bike-tour",
  },
  bookingUrl: "https://booking.example.com/amsterdam-canal-bike-tour",
  pricing: {
    price: "89",
    currency: "EUR",
  },
};

const parisLegacyTour: Engine2Tour = {
  ...amsterdamLegacyTour,
  id: "paris-retained-guide",
  sourceCountrySlug: "france",
  sourceCitySlug: "paris",
  slug: "paris-sightseeing-bike-tour",
  name: "Paris Sightseeing Bike Tour",
  geo: {
    country: "France",
    region: "Île-de-France",
    city: "Paris",
    lat: 48.8566,
    lng: 2.3522,
  },
  seo: {
    title: "Paris Sightseeing Bike Tour",
    description: "Explore Paris by bike.",
    canonicalPath:
      "/destinations/france/paris/tours/paris-sightseeing-bike-tour",
    ogImage: "https://example.com/paris.jpg",
  },
};

describe("Engine2 international legacy breadcrumb rendering", () => {
  beforeEach(() => {
    (globalThis as { location?: Partial<Location> }).location = {
      pathname: "/",
      search: "",
      hash: "",
    };
  });

  it("renders missing-city-guide tour pages with a country-guide breadcrumb fallback", () => {
    const html = renderToString(
      <Engine2TourPage tour={amsterdamLegacyTour} isFHPilotEnabled={false} />
    );

    expect(html).toContain("Amsterdam Canal Bike Tour");
    expect(html).toContain('href="/guides/world/netherlands"');
    expect(html).not.toContain('href="/guides/world/netherlands/amsterdam"');
    expect(html.toLowerCase()).not.toContain("guide not found");
  });

  it("renders missing-city-guide booking pages with a country-guide breadcrumb fallback", () => {
    const html = renderToString(
      <Engine2TourBookingPage tour={amsterdamLegacyTour} />
    );

    expect(html).toContain("Amsterdam Canal Bike Tour");
    expect(html).toContain('href="/guides/world/netherlands"');
    expect(html).not.toContain('href="/guides/world/netherlands/amsterdam"');
    expect(html.toLowerCase()).not.toContain("guide not found");
  });

  it("keeps retained international city-guide breadcrumbs on the city guide URL", () => {
    const html = renderToString(
      <Engine2TourPage tour={parisLegacyTour} isFHPilotEnabled={false} />
    );

    expect(html).toContain('href="/guides/world/france"');
    expect(html).toContain('href="/guides/world/france/paris"');
    expect(html.toLowerCase()).not.toContain("guide not found");
  });
});
