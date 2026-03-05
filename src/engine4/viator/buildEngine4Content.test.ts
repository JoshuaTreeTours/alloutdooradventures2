import { describe, expect, it } from "vitest";

import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "../data/viatorTours";
import { mapViatorToEngine4Tour } from "./mapViatorToEngine4Tour";
import {
  buildFaqs,
  buildHighlights,
  buildOverview,
} from "./buildEngine4Content";

describe("buildEngine4Content", () => {
  it("builds a rich overview that includes itinerary locations", () => {
    const record = engine4ViatorTours.find(
      tour => tour.viator.productCode === "74828P5"
    );
    const tour = mapViatorToEngine4Tour({
      record: record!,
      apiTour: engine4ViatorApiFallbackByProductCode["74828P5"],
    });

    const overview = buildOverview(tour);

    expect(overview).toContain("Wheeler Opera House");
    expect(overview.toLowerCase()).not.toContain("rating");
    expect(overview.toLowerCase()).not.toContain("reviews");
    expect(overview.toLowerCase()).not.toContain("product code");
  });

  it("prioritizes itinerary stops in highlights", () => {
    const record = engine4ViatorTours.find(
      tour => tour.viator.productCode === "74828P3"
    );
    const tour = mapViatorToEngine4Tour({
      record: record!,
      apiTour: engine4ViatorApiFallbackByProductCode["74828P3"],
    });

    const highlights = buildHighlights(tour);

    expect(highlights.some(item => item.includes("Wheeler Opera House"))).toBe(
      true
    );
    expect(highlights.some(item => item.includes("Aspen Art Museum"))).toBe(
      true
    );
  });

  it("builds FAQ answers from tour logistics and experience details", () => {
    const record = engine4ViatorTours.find(
      tour => tour.viator.productCode === "74828P3"
    );
    const tour = mapViatorToEngine4Tour({
      record: record!,
      apiTour: engine4ViatorApiFallbackByProductCode["74828P3"],
    });

    const faqs = buildFaqs(tour);

    expect(faqs.some(item => item.answer.includes("320 E Hyman Ave"))).toBe(
      true
    );
    expect(
      faqs.some(item =>
        item.answer.toLowerCase().includes("comfortable walking shoes")
      )
    ).toBe(true);
  });
});
