import { describe, expect, it } from "vitest";

import { getEngine2TourBySlug } from "../../engine2/data/loadEngine2";
import { viatorProductCacheByCode } from "../data/viatorProductCache";
import { mapViatorToEngine3ViewModel } from "./mapViatorToEngine3ViewModel";
import { getToursByCityUnified } from "../../data/tours";

describe("Engine3 Viator unified primary image", () => {
  it("uses the same TACDN primary image URL for listing card and detail hero", () => {
    const engine2Tour = getEngine2TourBySlug(
      "california",
      "palm-springs",
      "joshua-tree-hummer-adventure-from-palm-desert-6740jtree"
    );

    expect(engine2Tour).toBeTruthy();

    const detailModel = mapViatorToEngine3ViewModel(
      engine2Tour!,
      viatorProductCacheByCode[engine2Tour!.id]
    );

    const listing = getToursByCityUnified("california", "palm-springs").find(
      entry =>
        entry.href ===
        "/destinations/california/palm-springs/tours/joshua-tree-hummer-adventure-from-palm-desert-6740jtree"
    );

    expect(listing).toBeTruthy();
    expect(detailModel.primaryImageUrl).toContain("media.tacdn.com");
    expect(detailModel.primaryImageUrl.toLowerCase()).not.toContain(
      "globalnav"
    );
    expect(listing!.tour.heroImage).toBe(detailModel.primaryImageUrl);
  });

  it("keeps listing card and detail hero parity for poster child 2335P1", () => {
    const engine2Tour = getEngine2TourBySlug(
      "california",
      "palm-springs",
      "san-andreas-fault-jeep-tour-from-palm-springs-2335p1"
    );

    expect(engine2Tour).toBeTruthy();

    const detailModel = mapViatorToEngine3ViewModel(
      engine2Tour!,
      viatorProductCacheByCode[engine2Tour!.id]
    );

    const listing = getToursByCityUnified("california", "palm-springs").find(
      entry =>
        entry.href ===
        "/destinations/california/palm-springs/tours/san-andreas-fault-jeep-tour-from-palm-springs-2335p1"
    );

    expect(listing).toBeTruthy();
    expect(detailModel.primaryImageUrl).toContain("media.tacdn.com");
    expect(listing!.tour.heroImage).toBe(detailModel.primaryImageUrl);
  });
});
