import { describe, expect, it } from "vitest";

import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "../data/viatorTours";
import { mapViatorToEngine4Tour } from "./mapViatorToEngine4Tour";

describe("mapViatorToEngine4Tour", () => {
  it("maps Aspen facts for above-the-fold content", () => {
    const record = engine4ViatorTours.find(
      tour => tour.viator.productCode === "74828P4"
    )!;
    const vm = mapViatorToEngine4Tour({
      record,
      apiTour: engine4ViatorApiFallbackByProductCode[record.viator.productCode],
    });

    expect(vm.fromPrice).toBe("$45");
    expect(vm.rating).toBe(5.0);
    expect(vm.reviewCount).toBe(23);
    expect(vm.duration).toBe("1h 30m");
    expect(vm.meetingPoint).toContain("downtown brick pedestrian mall");
    expect(vm.cancellationPolicy).toContain("24 hours");
    expect(vm.canonicalPath).toBe(
      "/destinations/colorado/aspen/tours/aspens-off-the-beaten-path-tour-74828p4"
    );
    expect(vm.heroImage).toContain("tacdn");
  });

  it("guards against non-tacdn resolved hero images for Viator tours", () => {
    const record = engine4ViatorTours.find(
      tour => tour.viator.productCode === "74828P4"
    )!;

    expect(() =>
      mapViatorToEngine4Tour({
        record,
        apiTour: {
          ...engine4ViatorApiFallbackByProductCode[record.viator.productCode],
          sourceDerivedImageUrl: undefined,
          primaryImageUrl: "https://example.com/not-viator.jpg",
          galleryImages: ["https://example.com/not-viator-gallery.jpg"],
        },
      })
    ).toThrowError(/tacdn image/i);
  });
});
