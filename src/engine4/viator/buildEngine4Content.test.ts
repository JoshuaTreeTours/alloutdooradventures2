import { describe, expect, it } from "vitest";

import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "../data/viatorTours";
import { mapViatorToEngine4Tour } from "./mapViatorToEngine4Tour";

describe("buildEngine4Content", () => {
  it("keeps overview substantive when descriptionLong exists", () => {
    const record = engine4ViatorTours.find(
      tour => tour.productCode === "74828P5"
    );
    const tour = mapViatorToEngine4Tour({
      record: record!,
      apiTour: engine4ViatorApiFallbackByProductCode["74828P5"],
    });

    expect(tour.content.overview.length).toBeGreaterThan(120);
    expect(tour.content.overview.toLowerCase()).not.toContain("review count");
  });

  it("includes itinerary-derived highlights when itinerary exists", () => {
    const record = engine4ViatorTours.find(
      tour => tour.productCode === "74828P3"
    );
    const tour = mapViatorToEngine4Tour({
      record: record!,
      apiTour: engine4ViatorApiFallbackByProductCode["74828P3"],
    });

    expect(tour.content.highlights.some(item => item.includes("Stop:"))).toBe(
      true
    );
  });
});
