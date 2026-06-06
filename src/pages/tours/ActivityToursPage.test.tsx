import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import TourCard from "../../components/TourCard";
import {
  getActivityTourEntriesByLocation,
  getToursByActivityCategory,
  HIKING_ACTIVITY_HERO_IMAGE,
  SAILING_ACTIVITY_HERO_IMAGE,
} from "../../data/activityDiscovery";
import {
  hydrateEngine6TourCardEntries,
  type Engine6LiveProductFields,
} from "../../engine6/liveProductFields";
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

  it("/tours/hiking renders hiking tours with the dedicated Hiking hero image", () => {
    const hikingCount = getToursByActivityCategory("hiking").length;
    const html = renderToStaticMarkup(
      <ActivityToursPage params={{ activitySlug: "hiking" }} />
    );

    expect(hikingCount).toBeGreaterThan(0);
    expect(html).toContain("Hiking Tours &amp; Outdoor Adventures");
    expect(html).toContain(`${hikingCount} tours`);
    expect(html).toContain("Explore hiking tour cards");
    expect(html).toContain(HIKING_ACTIVITY_HERO_IMAGE);
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

  it("/tours/sailing uses the dedicated Sailing hero image", () => {
    const sailingCount = getToursByActivityCategory("sailing").length;
    const html = renderToStaticMarkup(
      <ActivityToursPage params={{ activitySlug: "sailing" }} />
    );

    expect(sailingCount).toBeGreaterThan(0);
    expect(html).toContain("Sailing Tours &amp; Outdoor Adventures");
    expect(html).toContain(`${sailingCount} tours`);
    expect(html).toContain(SAILING_ACTIVITY_HERO_IMAGE);
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

  it("/tours/paddle-sports does not surface obvious non-paddle boat products", () => {
    const titles = getToursByActivityCategory("paddle-sports").map(
      tour => tour.title
    );

    expect(titles).not.toContain("Mooloolaba Whale Watching");
    expect(titles).not.toContain(
      "Bamboo Rafting & Reggae Catamaran Cruise Party"
    );
    expect(
      titles.some(title =>
        /kennedy space center|nasa|airboat rental|dinner boat|ocean boat tour/i.test(
          title
        )
      )
    ).toBe(false);
  });
});

describe("ActivityToursPage Engine6 live card authority", () => {
  it("hydrates 6740P7 activity cards from the same live commercial resolver as product pages", () => {
    const entries = getActivityTourEntriesByLocation({
      activitySlug: "jeep-off-road",
    });
    const target = entries.find(entry => entry.tour.productCode === "6740P7");
    expect(target).toBeDefined();

    const liveByProductCode: Record<string, Engine6LiveProductFields> = {
      "6740P7": {
        priceAmount: 127.2,
        priceFormatted: "From $127.20",
        aggregateRating: 4.7,
        reviewCount: 565,
        durationText: "6 hours",
        meetingPointText: null,
      },
    };

    const hydratedTarget = hydrateEngine6TourCardEntries(
      [target!],
      liveByProductCode
    )[0];
    const html = renderToStaticMarkup(
      <TourCard tour={hydratedTarget.tour} href={hydratedTarget.href} />
    );

    expect(hydratedTarget.tour.badges.priceFrom).toBe("From $127.20");
    expect(hydratedTarget.tour.badges.rating).toBe(4.7);
    expect(hydratedTarget.tour.badges.reviewCount).toBe(565);
    expect(html).toContain("From $127.20");
    expect(html).toContain("★ 4.7 (565 reviews)");
    expect(html).not.toContain("From $179");
    expect(html).not.toContain("★ 4.8 (453 reviews)");
  });

  it("keeps Engine6 activity card commercial fields in parity with product-page resolved fields", () => {
    const [target] = getActivityTourEntriesByLocation({
      activitySlug: "jeep-off-road",
    }).filter(entry => entry.tour.productCode === "6740P7");
    expect(target).toBeDefined();

    const productPageResolvedFields: Engine6LiveProductFields = {
      priceAmount: 127.2,
      priceFormatted: "From $127.20",
      aggregateRating: 4.7,
      reviewCount: 565,
      durationText: "6 hours",
      meetingPointText: null,
    };

    const [cardEntry] = hydrateEngine6TourCardEntries([target!], {
      "6740P7": productPageResolvedFields,
    });

    expect(cardEntry.tour.startingPrice).toBe(
      productPageResolvedFields.priceAmount
    );
    expect(cardEntry.tour.badges.rating).toBe(
      productPageResolvedFields.aggregateRating
    );
    expect(cardEntry.tour.badges.reviewCount).toBe(
      productPageResolvedFields.reviewCount
    );
  });
});
