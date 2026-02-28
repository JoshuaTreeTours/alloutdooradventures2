import { describe, expect, it } from "vitest";

import { getEngine2TourBySlug } from "../../engine2/data/loadEngine2";
import { viatorProductCacheByCode } from "../data/viatorProductCache";
import { mapViatorToEngine3ViewModel } from "../viator/mapViatorToEngine3ViewModel";
import { getEngine3ListingEntries } from "./getEngine3ListingEntries";

const LOCKED =
  "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1";

describe("getEngine3ListingEntries", () => {
  it("includes 6740JTREE for Palm Springs with canonical slug and locked image", () => {
    const entries = getEngine3ListingEntries("california", "palm-springs");

    const target = entries.find(
      entry =>
        entry.tour.title === "Joshua Tree Hummer Adventure from Palm Desert"
    );

    expect(target).toBeTruthy();
    expect(target?.href).toBe(
      "/destinations/california/palm-springs/tours/joshua-tree-hummer-adventure-from-palm-desert-6740jtree"
    );
    expect(target?.tour.bookingUrl).toBe(
      "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Hummer-Adventure-from-Palm-Desert/d648-6740JTREE"
    );
    expect(target?.tour.heroImage).toBe(LOCKED);
  });

  it("keeps 2335P1 listing image equal to the detail page hero image", () => {
    const entries = getEngine3ListingEntries("california", "palm-springs");
    const listingEntry = entries.find(
      entry => entry.tour.productCode === "2335P1"
    );

    const detailTour = getEngine2TourBySlug(
      "california",
      "palm-springs",
      "san-andreas-fault-jeep-tour-from-palm-springs-2335p1"
    );

    expect(detailTour).toBeTruthy();
    const detailVm = mapViatorToEngine3ViewModel(
      detailTour!,
      viatorProductCacheByCode["2335P1"]
    );

    expect(detailVm.primaryImageUrl).toBeDefined();
    expect(listingEntry?.tour.primaryImageUrl).toBe(detailVm.primaryImageUrl);
  });
  it("includes 3351P15 with the required product-code suffix in the canonical href", () => {
    const entries = getEngine3ListingEntries("california", "palm-springs");

    const target = entries.find(entry => entry.tour.productCode === "3351P15");

    expect(target).toBeTruthy();
    expect(target?.href).toBe(
      "/destinations/california/palm-springs/tours/palm-springs-indian-canyons-bike-and-hike-3351p15"
    );
    expect(target?.tour.heroImage).toBeTruthy();
  });
});
