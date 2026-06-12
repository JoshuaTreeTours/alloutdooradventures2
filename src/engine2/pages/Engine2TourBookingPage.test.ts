import { describe, expect, it } from "vitest";

import { buildBreadcrumbList } from "../../utils/structuredData";
import type { Engine2Tour } from "../data/loadEngine2";
import { getDestinationBreadcrumbs } from "./Engine2TourBookingPage";

const makeInternationalTour = ({
  country,
  countrySlug,
  city,
  citySlug,
}: {
  country: string;
  countrySlug: string;
  city: string;
  citySlug: string;
}): Engine2Tour => ({
  id: `${countrySlug}-${citySlug}-booking-fixture`,
  sourceCountrySlug: countrySlug,
  sourceCitySlug: citySlug,
  slug: `${citySlug}-tour`,
  name: `${city} Tour`,
  provider: {
    name: "Provider",
    shortName: "provider",
  },
  geo: {
    country,
    region: country,
    city,
    lat: null,
    lng: null,
  },
  seo: {
    title: `${city} Tour`,
    description: "desc",
    canonicalPath: `/destinations/${countrySlug}/${citySlug}/tours/${citySlug}-tour`,
    ogImage: "https://example.com/og.jpg",
  },
  content: {
    experienceText: "text",
    highlights: [],
  },
  images: {
    hero: "https://example.com/hero.jpg",
    gallery: [],
  },
  booking: {
    bookingUrl: "https://booking.example.com/tour",
  },
  pricing: {
    price: "199",
    currency: "USD",
  },
});

describe("Engine2TourBookingPage international guide breadcrumbs", () => {
  const bookingBreadcrumbUrlsFor = (tour: Engine2Tour) => {
    const breadcrumb = buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      ...getDestinationBreadcrumbs(tour),
      { name: tour.name, url: tour.seo.canonicalPath },
      { name: "Book", url: `${tour.seo.canonicalPath}/book` },
    ]);

    return breadcrumb.itemListElement.map(item => item.item);
  };

  const bookingBreadcrumbNamesFor = (tour: Engine2Tour) =>
    buildBreadcrumbList([
      { name: "Destinations", url: "/destinations" },
      ...getDestinationBreadcrumbs(tour),
      { name: tour.name, url: tour.seo.canonicalPath },
      { name: "Book", url: `${tour.seo.canonicalPath}/book` },
    ]).itemListElement.map(item => item.name);

  it("uses the same safe city-guide breadcrumb for Amsterdam booking JSON-LD", () => {
    const urls = bookingBreadcrumbUrlsFor(
      makeInternationalTour({
        country: "Netherlands",
        countrySlug: "netherlands",
        city: "Amsterdam",
        citySlug: "amsterdam",
      })
    );

    expect(urls).toContain("/guides/world/netherlands/amsterdam");
  });

  it("uses the same safe city-guide breadcrumb for Paris booking JSON-LD", () => {
    const urls = bookingBreadcrumbUrlsFor(
      makeInternationalTour({
        country: "France",
        countrySlug: "france",
        city: "Paris",
        citySlug: "paris",
      })
    );

    expect(urls).toContain("/guides/world/france/paris");
  });

  it("falls back to the country guide for a fake missing minor city in booking JSON-LD", () => {
    const urls = bookingBreadcrumbUrlsFor(
      makeInternationalTour({
        country: "Netherlands",
        countrySlug: "netherlands",
        city: "Tiny Missing City",
        citySlug: "tiny-missing-city",
      })
    );

    expect(urls).toContain("/guides/world/netherlands");
    expect(urls).not.toContain("/guides/world/netherlands/tiny-missing-city");
  });

  it("does not emit Guide not found in booking breadcrumb JSON-LD", () => {
    const names = bookingBreadcrumbNamesFor(
      makeInternationalTour({
        country: "Netherlands",
        countrySlug: "netherlands",
        city: "Tiny Missing City",
        citySlug: "tiny-missing-city",
      })
    );

    expect(names.join(" ")).not.toContain("Guide not found");
  });
});
