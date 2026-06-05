import { describe, expect, it } from "vitest";

import { getToursByCityUnified } from "../../data/tours";
import type { Engine6LiveProductFields } from "../../engine6/liveProductFields";
import { hydrateEngine6ListingEntries } from "./ToursLanding";

describe("ToursLanding Engine6 filtered listing hydration", () => {
  it("hydrates /tours?state=california&city=joshua-tree card fields from live Engine6 data", () => {
    const entries = getToursByCityUnified("california", "joshua-tree");
    const target = entries.find(entry => entry.tour.productCode === "6740P7");
    expect(target).toBeDefined();

    const liveFieldsByProductCode: Record<string, Engine6LiveProductFields> = {
      "6740P7": {
        priceAmount: 127.2,
        priceFormatted: "From $127.20",
        aggregateRating: 4.7,
        reviewCount: 556,
        durationText: "6 hours",
        meetingPointText: null,
      },
    };

    const hydrated = hydrateEngine6ListingEntries(
      entries,
      liveFieldsByProductCode
    );
    const hydratedTarget = hydrated.find(
      entry => entry.tour.productCode === "6740P7"
    );
    expect(hydratedTarget).toBeDefined();

    expect(hydratedTarget?.tour.badges.priceFrom).toBe("From $127.20");
    expect(hydratedTarget?.tour.badges.rating).toBe(4.7);
    expect(hydratedTarget?.tour.badges.reviewCount).toBe(556);
    expect(hydratedTarget?.tour.badges.duration).toBe("6 hours");
    expect(hydratedTarget?.tour.productCode).toBe(target?.tour.productCode);
    expect(hydratedTarget?.href).toBe(target?.href);
    expect(hydratedTarget?.tour.primaryImageUrl).toBe(
      target?.tour.primaryImageUrl
    );
    expect(hydratedTarget?.tour.heroImage).toBe(target?.tour.heroImage);
  });
});

describe("ToursLanding activity selector routing", () => {
  it("routes Activity → State → City selections to crawlable activity discovery pages", async () => {
    const { resolveActivitySelectorRoute } = await import("./ToursLanding");

    expect(resolveActivitySelectorRoute({ activitySlug: "cycling" })).toBe(
      "/tours/cycling"
    );
    expect(
      resolveActivitySelectorRoute({
        activitySlug: "cycling",
        stateSlug: "california",
      })
    ).toBe("/tours/cycling/california");
    expect(
      resolveActivitySelectorRoute({
        activitySlug: "cycling",
        stateSlug: "california",
        citySlug: "santa-barbara",
      })
    ).toBe("/tours/cycling/california/santa-barbara");
  });

  it("keeps existing /tours state/city query selection working", async () => {
    const { resolveToursLandingInitialSelection } =
      await import("./ToursLanding");

    expect(
      resolveToursLandingInitialSelection(
        "?state=california&city=santa-barbara"
      )
    ).toEqual({
      stateSlug: "california",
      citySlug: "santa-barbara",
      type: "tours",
    });
  });
});
