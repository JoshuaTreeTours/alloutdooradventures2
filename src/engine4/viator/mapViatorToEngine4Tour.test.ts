import { describe, expect, it } from "vitest";

import {
  engine4ViatorApiFallbackByProductCode,
  engine4ViatorTours,
} from "../data/viatorTours";
import { mapViatorToEngine4Tour } from "./mapViatorToEngine4Tour";

describe("mapViatorToEngine4Tour", () => {
  it("maps facts and content into the Engine4 contract", () => {
    const record = engine4ViatorTours.find(
      tour => tour.productCode === "74828P5"
    );
    expect(record).toBeDefined();

    const vm = mapViatorToEngine4Tour({
      record: record!,
      apiTour: engine4ViatorApiFallbackByProductCode["74828P5"],
    });

    expect(vm.engine).toBe("engine4");
    expect(vm.bookingProvider).toBe("viator");
    const bookingUrl = new URL(vm.bookingUrl);
    expect(bookingUrl.searchParams.get("pid")).toBe("P00290915");
    expect(bookingUrl.searchParams.get("mcid")).toBe("42383");
    expect(bookingUrl.searchParams.get("medium")).toBe("link");
    expect(vm.facts.priceFrom).toBe("$65.00");
    expect(vm.facts.ratingValue).toBe(4.7);
    expect(vm.facts.duration).toBe("2 hours");
    expect(vm.facts.meetingPointFull).toContain("Wheeler Opera House");
    expect(vm.content.itinerary?.[0]?.title).toBe("Wheeler Opera House");
    expect(vm.content.overview.length).toBeGreaterThan(120);
    expect(vm.content.highlights.length).toBeGreaterThan(2);
  });
});
