import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";

import CityTemplate from "./CityTemplate";
import {
  getFallbackCityBySlugs,
  getFallbackStateBySlug,
} from "../data/tourFallbacks";
import { getToursByCityUnified } from "../data/tours";

describe("CityTemplate destination copy", () => {
  it("uses the active destination name for fallback destination tour sections", () => {
    const state = getFallbackStateBySlug("alaska");
    const city = getFallbackCityBySlugs(
      "alaska",
      "denali-national-park-and-preserve"
    );
    const toursOverride = getToursByCityUnified(
      "alaska",
      "denali-national-park-and-preserve"
    ).map(entry => entry.tour);

    expect(state).toBeDefined();
    expect(city).toBeDefined();
    expect(toursOverride.length).toBeGreaterThan(0);

    const previousWindow = (globalThis as { window?: Window }).window;
    const previousLocation = (globalThis as { location?: Location }).location;
    (globalThis as { window?: Window }).window = {
      location: {
        pathname: "/destinations/alaska/denali-national-park-and-preserve",
        search: "",
      },
      history: { pushState: () => undefined },
    } as unknown as Window;
    (globalThis as { location?: Location }).location = (
      globalThis as { window?: Window }
    ).window!.location as unknown as Location;

    const html = renderToString(
      <CityTemplate state={state!} city={city!} toursOverride={toursOverride} />
    );

    (globalThis as { window?: Window }).window = previousWindow;
    (globalThis as { location?: Location }).location = previousLocation;

    const normalizedHtml = html.replace(/<!-- -->/g, "");

    expect(normalizedHtml).toContain("Denali National Park and Preserve tours");
    expect(normalizedHtml).toContain(
      "Denali National Park and Preserve adventures to book now"
    );
    expect(normalizedHtml).toContain(
      "Explore the curated set of tours available for Denali National Park and Preserve."
    );
    expect(normalizedHtml).toContain(
      "Denali National Park and Preserve, Alaska"
    );
    expect(normalizedHtml).not.toContain("Flagstaff adventures to book now");
    expect(normalizedHtml).not.toContain(
      "Explore the curated set of tours available for Flagstaff."
    );
  });
});
