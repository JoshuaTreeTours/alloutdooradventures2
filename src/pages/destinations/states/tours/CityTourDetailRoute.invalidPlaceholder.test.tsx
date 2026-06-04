import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import CityTourDetailRoute from "./CityTourDetailRoute";
import { getTourBySlugs } from "../../../../data/tours";
import {
  getInvalidPlaceholderTourPaths,
  isInvalidPlaceholderTourPath,
} from "../../../../utils/tours/invalidPlaceholderTours";

const INVALID_TOUR_ROUTES = [
  {
    stateSlug: "wyoming",
    citySlug: "jackson",
    tourSlug: "full-day-tours-650824",
    forbiddenText: "Full Day Tours",
  },
  {
    stateSlug: "california",
    citySlug: "coronado",
    tourSlug: "bike-661652",
    forbiddenText: "Bike",
  },
  {
    stateSlug: "australia",
    citySlug: "summerlands",
    tourSlug: "camp-talks-519110",
    forbiddenText: "Camp Talks",
  },
  {
    stateSlug: "colorado",
    citySlug: "oak-creek",
    tourSlug: "__SEO_CANONICAL__",
    forbiddenText: "__SEO_CANONICAL__",
  },
  {
    stateSlug: "north-carolina",
    citySlug: "raleigh",
    tourSlug: "raleigh-express-1hr-rydables-tour-662502",
    forbiddenText: "Raleigh Express",
  },
  {
    stateSlug: "utah",
    citySlug: "st-george",
    tourSlug: "a-617022",
    forbiddenText: "A",
  },
] as const;

describe("invalid placeholder tour routes", () => {
  it("audits the known invalid placeholder tour URL set", () => {
    expect(getInvalidPlaceholderTourPaths()).toHaveLength(228);
    expect(
      getInvalidPlaceholderTourPaths().filter(isInvalidPlaceholderTourPath)
    ).toHaveLength(228);
  });

  it("does not expose route-backed canonical tour records for invalid placeholders", () => {
    for (const route of INVALID_TOUR_ROUTES) {
      expect(
        getTourBySlugs(route.stateSlug, route.citySlug, route.tourSlug)
      ).toBeUndefined();
    }
  });

  it("does not render placeholder detail pages or Tour not found soft-404 content", () => {
    for (const route of INVALID_TOUR_ROUTES) {
      const html = renderToStaticMarkup(<CityTourDetailRoute params={route} />);

      expect(html).toBe("");
      expect(html).not.toContain("Tour not found");
      expect(html).not.toContain(route.forbiddenText);
    }
  });
});
