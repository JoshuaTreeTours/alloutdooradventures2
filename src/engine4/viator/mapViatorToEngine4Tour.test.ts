import { describe, expect, it } from "vitest";

import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "../data/viatorTours";
import { mapViatorToEngine4Tour } from "./mapViatorToEngine4Tour";

describe("mapViatorToEngine4Tour", () => {
  it("maps Aspen facts for above-the-fold content", () => {
    const record = engine4ViatorTours.find(
      tour => tour.viator.productCode === "74828P5"
    );
    expect(record).toBeDefined();
    const vm = mapViatorToEngine4Tour({
      record: record!,
      apiTour:
        engine4ViatorApiFallbackByProductCode[record!.viator.productCode],
    });

    expect(vm.fromPrice).toBe("$65.00");
    expect(vm.rating).toBe(4.7);
    expect(vm.reviewCount).toBe(3);
    expect(vm.duration).toBe("2 hours");
    expect(vm.startTime).toBe("8:15 AM");
    expect(vm.meetingPoint).toContain("Wheeler Opera House");
    expect(vm.cancellationPolicy).toContain("24 hours");
    expect(vm.itinerary?.length).toBeGreaterThan(0);
    expect(vm.itinerary?.[0]?.title).toBe("Wheeler Opera House");
    expect(vm.descriptionLong).toContain("beginner-friendly");
  });
});

it("maps Aspen off-the-beaten-path facts for above-the-fold content", () => {
  const record = engine4ViatorTours.find(
    tour => tour.viator.productCode === "74828P4"
  );
  expect(record).toBeDefined();

  const vm = mapViatorToEngine4Tour({
    record: record!,
    apiTour: engine4ViatorApiFallbackByProductCode["74828P4"],
  });

  expect(vm.fromPrice).toBe("$145.00");
  expect(vm.rating).toBe(5);
  expect(vm.reviewCount).toBe(42);
  expect(vm.duration).toBe("3 hours");
  expect(vm.cancellationPolicy).toContain("24 hours");
  expect(vm.itinerary?.length).toBeGreaterThan(0);
});

it("maps Glimpse of Aspen Tour facts for above-the-fold content", () => {
  const record = engine4ViatorTours.find(
    tour => tour.viator.productCode === "74828P3"
  );
  expect(record).toBeDefined();

  const vm = mapViatorToEngine4Tour({
    record: record!,
    apiTour: engine4ViatorApiFallbackByProductCode["74828P3"],
  });

  expect(vm.title).toBe("Glimpse of Aspen Tour");
  expect(vm.fromPrice).toBe("$55.00");
  expect(vm.rating).toBe(4.8);
  expect(vm.reviewCount).toBe(14);
  expect(vm.duration).toBe("2 hours");
  expect(vm.meetingPoint).toContain("320 E Hyman Ave");
  expect(vm.heroImage).toBe(
    "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/74/7c/8d.jpg"
  );
});
