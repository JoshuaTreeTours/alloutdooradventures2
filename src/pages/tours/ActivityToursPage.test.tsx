import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getToursByActivityCategory } from "../../data/activityDiscovery";
import ActivityToursPage from "./ActivityToursPage";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/",
};

describe("ActivityToursPage", () => {
  it("/tours/cycling renders cycling tours", () => {
    const html = renderToStaticMarkup(
      <ActivityToursPage params={{ activitySlug: "cycling" }} />
    );

    expect(html).toContain("Cycling Tours &amp; Outdoor Adventures");
    expect(html).toContain("Explore cycling tour cards");
  });

  it("/tours/hiking renders hiking tours", () => {
    const html = renderToStaticMarkup(
      <ActivityToursPage params={{ activitySlug: "hiking" }} />
    );

    expect(html).toContain("Hiking Tours &amp; Outdoor Adventures");
    expect(html).toContain("Explore hiking tour cards");
  });

  it("/tours/horseback-riding renders Horseback Riding with the route-backed count", () => {
    const horsebackCount =
      getToursByActivityCategory("horseback-riding").length;
    const html = renderToStaticMarkup(
      <ActivityToursPage params={{ activitySlug: "horseback-riding" }} />
    );

    expect(horsebackCount).toBeGreaterThan(0);
    expect(html).toContain("Horseback Riding Tours &amp; Outdoor Adventures");
    expect(html).toContain(`${horsebackCount} tours`);
    expect(html).toContain("Explore horseback riding tour cards");
  });

  it("/tours/walking-tours renders Walking Tours with the route-backed count", () => {
    const walkingCount = getToursByActivityCategory("walking-tours").length;
    const html = renderToStaticMarkup(
      <ActivityToursPage params={{ activitySlug: "walking-tours" }} />
    );

    expect(walkingCount).toBeGreaterThan(0);
    expect(html).toContain("Walking Tours &amp; Outdoor Adventures");
    expect(html).toContain(`${walkingCount} tours`);
    expect(html).toContain("Explore walking tours tour cards");
  });

  it("/tours/boating renders Boating with the route-backed count", () => {
    const boatingCount = getToursByActivityCategory("boating").length;
    const html = renderToStaticMarkup(
      <ActivityToursPage params={{ activitySlug: "boating" }} />
    );

    expect(boatingCount).toBeGreaterThan(0);
    expect(html).toContain("Boating Tours &amp; Outdoor Adventures");
    expect(html).toContain(`${boatingCount} tours`);
    expect(html).toContain("Explore boating tour cards");
  });

  it("/tours/fishing renders Fishing with the route-backed count", () => {
    const fishingCount = getToursByActivityCategory("fishing").length;
    const html = renderToStaticMarkup(
      <ActivityToursPage params={{ activitySlug: "fishing" }} />
    );

    expect(fishingCount).toBeGreaterThan(0);
    expect(html).toContain("Fishing Tours &amp; Outdoor Adventures");
    expect(html).toContain(`${fishingCount} tours`);
    expect(html).toContain("Explore fishing tour cards");
  });

  it("/tours/paddle-sports includes kayak/canoe/SUP tours", () => {
    const html = renderToStaticMarkup(
      <ActivityToursPage params={{ activitySlug: "paddle-sports" }} />
    );

    expect(html).toContain("Paddle Sports Tours &amp; Outdoor Adventures");
    expect(html).toMatch(/kayak|canoe|SUP|paddle/i);
  });
});
