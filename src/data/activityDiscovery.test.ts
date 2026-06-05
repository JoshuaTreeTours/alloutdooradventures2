import { describe, expect, it } from "vitest";

import {
  ACTIVITY_DISCOVERY_PAGES,
  buildActivityDiscoveryPath,
  getActivityCityOptions,
  getActivityDiscoveryPage,
  getActivityDiscoveryRouteDefinitions,
  getActivityStateOptions,
  getToursByActivityCategory,
  getToursByActivityLocation,
} from "./activityDiscovery";
import { TOUR_ACTIVITY_CATEGORIES } from "../lib/tourCategoryClassifier";
import { tours } from "./tours";

describe("activity discovery data", () => {
  it("resolves every activityCategories slug emitted in tour inventory", () => {
    const discoverySlugs = new Set(
      ACTIVITY_DISCOVERY_PAGES.map(activity => activity.slug)
    );
    const routePaths = new Set(
      getActivityDiscoveryRouteDefinitions().map(route => route.path)
    );
    const emittedSlugs = new Set(
      tours.flatMap(tour =>
        (tour.activityCategories ?? []).map(category => category.slug)
      )
    );

    expect(emittedSlugs.size).toBeGreaterThan(0);
    emittedSlugs.forEach(slug => {
      expect(discoverySlugs.has(slug)).toBe(true);
      expect(routePaths.has(`/tours/${slug}`)).toBe(true);
    });
  });

  it("registers every classifier-emitted activity slug for discovery routing", () => {
    const discoverySlugs = new Set(
      ACTIVITY_DISCOVERY_PAGES.map(activity => activity.slug)
    );
    const routePaths = new Set(
      getActivityDiscoveryRouteDefinitions().map(route => route.path)
    );

    TOUR_ACTIVITY_CATEGORIES.forEach(category => {
      expect(discoverySlugs.has(category.slug)).toBe(true);
      expect(getActivityDiscoveryPage(category.slug)?.label).toBe(
        category.label
      );
      expect(routePaths.has(`/tours/${category.slug}`)).toBe(true);
    });
  });

  it("creates state and city discovery routes for every classifier slug with inventory", () => {
    const routePaths = new Set(
      getActivityDiscoveryRouteDefinitions().map(route => route.path)
    );

    TOUR_ACTIVITY_CATEGORIES.forEach(category => {
      const stateOptions = getActivityStateOptions(category.slug);

      stateOptions.forEach(state => {
        expect(routePaths.has(`/tours/${category.slug}/${state.slug}`)).toBe(
          true
        );

        getActivityCityOptions(category.slug, state.slug).forEach(city => {
          expect(
            routePaths.has(`/tours/${category.slug}/${state.slug}/${city.slug}`)
          ).toBe(true);
        });
      });
    });
  });

  it("finds cycling tours from activityCategories", () => {
    const cyclingTours = getToursByActivityCategory("cycling");

    expect(cyclingTours.length).toBeGreaterThan(0);
    expect(
      cyclingTours.some(tour => /bike|bicycle|cycling|pedal/i.test(tour.title))
    ).toBe(true);
  });

  it("finds hiking tours from activityCategories", () => {
    const hikingTours = getToursByActivityCategory("hiking");

    expect(hikingTours.length).toBeGreaterThan(0);
    expect(
      hikingTours.some(tour =>
        /hike|hiking|trek|trail|canyon|mountain|national park/i.test(
          `${tour.title} ${tour.longDescription}`
        )
      )
    ).toBe(true);
  });

  it("finds Walking Tours from route-backed activity inventory", () => {
    const walkingTours = getToursByActivityCategory("walking-tours");
    const walkingText = walkingTours
      .map(
        tour =>
          `${tour.title} ${tour.longDescription} ${(tour.tags ?? []).join(" ")}`
      )
      .join(" ");

    expect(walkingTours.length).toBeGreaterThan(0);
    expect(walkingText).toMatch(/walking tour|walking outing|walk/i);
    expect(getActivityDiscoveryPage("walking-tours")?.label).toBe(
      "Walking Tours"
    );
    expect(buildActivityDiscoveryPath({ activitySlug: "walking-tours" })).toBe(
      "/tours/walking-tours"
    );
  });

  it("keeps Walking Tours out of Hiking route-backed results", () => {
    const hikingTitles = getToursByActivityCategory("hiking").map(tour =>
      tour.title.toLowerCase()
    );

    expect(hikingTitles.some(title => title.includes("ghost walk"))).toBe(
      false
    );
    expect(
      hikingTitles.some(title => title.includes("historic city walking tour"))
    ).toBe(false);
  });

  it("uses paddle-sports for kayak/canoe/SUP tour discovery", () => {
    const paddleTours = getToursByActivityCategory("paddle-sports");
    const paddleText = paddleTours
      .map(tour => `${tour.title} ${tour.longDescription}`)
      .join(" ");

    expect(paddleTours.length).toBeGreaterThan(0);
    expect(paddleText).toMatch(/kayak|canoe|sup|paddle/i);
    expect(
      ACTIVITY_DISCOVERY_PAGES.some(page => page.slug === "canoeing")
    ).toBe(false);
  });

  it("filters Activity → State → City selector options and routes correctly", () => {
    const cyclingStates = getActivityStateOptions("cycling");
    expect(cyclingStates.length).toBeGreaterThan(0);

    const state = cyclingStates[0];
    const cities = getActivityCityOptions("cycling", state.slug);
    expect(cities.length).toBeGreaterThan(0);

    const city = cities[0];
    expect(
      getToursByActivityLocation({
        activitySlug: "cycling",
        stateSlug: state.slug,
        citySlug: city.slug,
      }).length
    ).toBeGreaterThan(0);

    expect(buildActivityDiscoveryPath({ activitySlug: "cycling" })).toBe(
      "/tours/cycling"
    );
    expect(
      buildActivityDiscoveryPath({
        activitySlug: "cycling",
        stateSlug: state.slug,
      })
    ).toBe(`/tours/cycling/${state.slug}`);
    expect(
      buildActivityDiscoveryPath({
        activitySlug: "cycling",
        stateSlug: state.slug,
        citySlug: city.slug,
      })
    ).toBe(`/tours/cycling/${state.slug}/${city.slug}`);
  });
});
