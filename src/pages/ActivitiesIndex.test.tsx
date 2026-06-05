import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Header from "../components/Header";
import {
  getActivityIndexCards,
  getToursByActivityCategory,
  resolveActivityHeroImage,
} from "../data/activityDiscovery";
import ActivitiesIndex from "./ActivitiesIndex";

(globalThis as { location?: { pathname: string } }).location = {
  pathname: "/activities",
};

describe("Activities index", () => {
  it("renders activity discovery cards that link to crawlable activity pages", () => {
    const cards = getActivityIndexCards();
    const html = renderToStaticMarkup(<ActivitiesIndex />);

    expect(html).toContain("Explore Outdoor Activities");
    expect(cards.length).toBeGreaterThan(0);

    cards.forEach(card => {
      const activityTours = getToursByActivityCategory(card.slug);

      expect(card.tourCount).toBe(activityTours.length);
      expect(card.tourCount).toBeGreaterThan(0);
      expect(card.href).toBe(`/tours/${card.slug}`);
      expect(html).toContain(`href="${card.href}"`);
      expect(html).toContain(card.label.replace(/&/g, "&amp;"));
    });
  });

  it("shows the Horseback Riding card only when backed by route inventory", () => {
    const horsebackTours = getToursByActivityCategory("horseback-riding");
    const horsebackCard = getActivityIndexCards().find(
      card => card.slug === "horseback-riding"
    );

    expect(horsebackTours.length).toBeGreaterThan(0);
    expect(horsebackCard?.tourCount).toBe(horsebackTours.length);
    expect(horsebackCard?.href).toBe("/tours/horseback-riding");
  });

  it("shows the Walking Tours card only when backed by route inventory", () => {
    const walkingTours = getToursByActivityCategory("walking-tours");
    const walkingCard = getActivityIndexCards().find(
      card => card.slug === "walking-tours"
    );

    expect(walkingTours.length).toBeGreaterThan(0);
    expect(walkingCard?.tourCount).toBe(walkingTours.length);
    expect(walkingCard?.href).toBe("/tours/walking-tours");
  });

  it("shows the Fishing card only when backed by route inventory", () => {
    const fishingTours = getToursByActivityCategory("fishing");
    const fishingCard = getActivityIndexCards().find(
      card => card.slug === "fishing"
    );

    expect(fishingTours.length).toBeGreaterThan(0);
    expect(fishingCard?.tourCount).toBe(fishingTours.length);
    expect(fishingCard?.href).toBe("/tours/fishing");
  });

  it("uses full activity route inventory for counts and images", () => {
    getActivityIndexCards().forEach(card => {
      const routeActivityTours = getToursByActivityCategory(card.slug);

      expect(card.tourCount).toBe(routeActivityTours.length);
      expect(card.image).toBe(resolveActivityHeroImage(routeActivityTours));
      expect(
        routeActivityTours.some(tour =>
          [
            tour.heroImage,
            tour.primaryImageUrl,
            tour.resolvedImageUrl,
          ].includes(card.image ?? undefined)
        )
      ).toBe(true);
    });
  });

  it("sorts cards in the preferred brand order and excludes empty activities", () => {
    const cards = getActivityIndexCards();

    expect(cards.map(card => card.slug)).toEqual([
      "hiking",
      "horseback-riding",
      "walking-tours",
      "cycling",
      "paddle-sports",
      "water-sports",
      "sailing",
      "fishing",
      "wildlife",
      "stargazing",
      "jeep-off-road",
      "air-tours",
      "food-wine",
      "sightseeing-city-tours",
    ]);
    expect(cards.every(card => card.tourCount > 0)).toBe(true);
    expect(
      cards.find(card => card.slug === "hiking")?.tourCount
    ).toBeGreaterThan(11);
    expect(
      cards.find(card => card.slug === "cycling")?.tourCount
    ).toBeGreaterThan(17);
    expect(
      cards.find(card => card.slug === "paddle-sports")?.tourCount
    ).toBeGreaterThan(7);
  });

  it("adds Activities to header navigation without changing Tours dropdown links", () => {
    const html = renderToStaticMarkup(<Header />);

    expect(html).toContain('href="/activities"');
    expect(html).toContain(">Activities</a>");

    [
      'href="/tours"',
      'href="/tours/day"',
      'href="/tours/day/cycling"',
      'href="/tours/day/hiking"',
      'href="/tours/day/paddle"',
      'href="/tours/multi-day"',
    ].forEach(expectedToursHref => {
      expect(html).toContain(expectedToursHref);
    });
  });

  it("includes /activities in the static pages sitemap", () => {
    const sitemapPagesXml = readFileSync("public/sitemap-pages.xml", "utf8");

    expect(sitemapPagesXml).toContain(
      "https://www.alloutdooradventures.com/activities"
    );
  });
});
