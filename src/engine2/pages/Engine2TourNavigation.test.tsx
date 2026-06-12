import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Router } from "wouter";

import { getTourBySlugs } from "../../data/tours";
import { getEngine2CanadaTourBySlug } from "../data/loadEngine2";
import Engine2TourPage from "./Engine2TourPage";
import { resolveSafeTourListHref } from "../../utils/tours/tourNavigation";
import { resolveDestinationGuideHref } from "../../utils/guides/guideResolver";
import CityTourBookingRoute from "../../pages/destinations/states/tours/CityTourBookingRoute";

const LILLOOET_TOUR_SLUG =
  "limestone-multi-pitch-paradise-2-day-climbing-adventure-at-marble-canyon-603511";
const UNSUPPORTED_LILLOOET_TOURS_INDEX =
  "/destinations/world/canada/british-columbia/lillooet/tours";

const renderWithRoute = (route: string, component: React.ReactNode) =>
  renderToStaticMarkup(
    <Router hook={() => [route, () => undefined]}>{component}</Router>
  );

describe("Engine2 tour navigation", () => {
  it("does not render the unsupported Canada city/province tours index for the Lillooet Back to tours link", () => {
    const tour = getEngine2CanadaTourBySlug(
      "british-columbia",
      "lillooet",
      LILLOOET_TOUR_SLUG
    );

    expect(tour).toBeTruthy();
    const html = renderWithRoute(
      tour!.seo.canonicalPath,
      <Engine2TourPage tour={tour!} isFHPilotEnabled={false} />
    );

    expect(html).toContain("Back to tours");
    expect(html).not.toContain(`href="${UNSUPPORTED_LILLOOET_TOURS_INDEX}"`);
  });

  it("falls the Canada Lillooet Back to tours link back to the country destination page", () => {
    const tour = getEngine2CanadaTourBySlug(
      "british-columbia",
      "lillooet",
      LILLOOET_TOUR_SLUG
    );

    expect(tour).toBeTruthy();
    const html = renderWithRoute(
      tour!.seo.canonicalPath,
      <Engine2TourPage tour={tour!} isFHPilotEnabled={false} />
    );

    expect(html).toContain('href="/destinations/world/canada"');
    expect(
      resolveSafeTourListHref({
        canonicalPath: tour!.seo.canonicalPath,
        countrySlug: tour!.sourceCountrySlug,
        stateSlug: tour!.sourceProvinceSlug,
        citySlug: tour!.sourceCitySlug,
      })
    ).toBe("/destinations/world/canada");
  });

  it("does not route international Germany guide links through the U.S. guide namespace", () => {
    const germanyTour = getTourBySlugs(
      "germany",
      "berlin",
      "highlights-bike-tour---berlins-best-233461"
    );

    expect(germanyTour).toBeTruthy();
    const href = resolveDestinationGuideHref({
      stateSlug: "germany",
      citySlug: "berlin",
      countrySlug:
        germanyTour!.destination.countrySlug ??
        germanyTour!.destination.stateSlug,
      countryName: germanyTour!.destination.country,
      cityName: germanyTour!.destination.city,
    }).href;

    expect(href).not.toBe("/guides/us/germany");
    expect(href).not.toMatch(/^\/guides\/us\/germany(?:\/|$)/);
  });

  it("uses a world Germany guide or a safe international fallback for Germany guide links", () => {
    const germanyTour = getTourBySlugs(
      "germany",
      "berlin",
      "highlights-bike-tour---berlins-best-233461"
    );

    expect(germanyTour).toBeTruthy();
    const href = resolveDestinationGuideHref({
      stateSlug: "germany",
      citySlug: "berlin",
      countrySlug:
        germanyTour!.destination.countrySlug ??
        germanyTour!.destination.stateSlug,
      countryName: germanyTour!.destination.country,
      cityName: germanyTour!.destination.city,
    }).href;

    expect([
      "/guides/world/germany/berlin",
      "/guides/world/germany",
      "/guides/world",
      "/destinations/world/germany",
    ]).toContain(href);
  });

  it("renders the Germany /book breadcrumb without a U.S. country guide URL", () => {
    const html = renderWithRoute(
      "/destinations/germany/berlin/tours/highlights-bike-tour---berlins-best-233461/book",
      <CityTourBookingRoute
        params={{
          stateSlug: "germany",
          citySlug: "berlin",
          tourSlug: "highlights-bike-tour---berlins-best-233461",
        }}
      />
    );

    expect(html).not.toContain('href="/guides/us/germany"');
    expect(html).toMatch(
      /href="(?:\/guides\/world\/germany(?:\/berlin)?|\/destinations\/world\/germany)"/
    );
  });

  it("preserves U.S. guide routing for domestic booking breadcrumbs", () => {
    const href = resolveDestinationGuideHref({
      stateSlug: "california",
      citySlug: "santa-barbara",
      countrySlug: "united-states",
      countryName: "United States",
      cityName: "Santa Barbara",
    }).href;

    expect(href).toMatch(/^\/guides\/us\/california(?:\/|$)/);
  });
});
