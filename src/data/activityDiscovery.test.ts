import { describe, expect, it } from "vitest";

import {
  ACTIVITY_DISCOVERY_PAGES,
  buildActivityDiscoveryPath,
  getActivityCityOptions,
  getActivityStateOptions,
  getToursByActivityCategory,
  getToursByActivityLocation,
} from "./activityDiscovery";

describe("activity discovery data", () => {
  it("finds cycling tours from activityCategories", () => {
    const cyclingTours = getToursByActivityCategory("cycling");

    expect(cyclingTours.length).toBeGreaterThan(0);
    expect(
      cyclingTours.every(tour =>
        tour.activityCategories?.some(category => category.slug === "cycling")
      )
    ).toBe(true);
  });

  it("finds hiking tours from activityCategories", () => {
    const hikingTours = getToursByActivityCategory("hiking");

    expect(hikingTours.length).toBeGreaterThan(0);
    expect(
      hikingTours.every(tour =>
        tour.activityCategories?.some(category => category.slug === "hiking")
      )
    ).toBe(true);
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
