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

  it("merges fallback facts when API payload is partial", () => {
    const record = engine4ViatorTours.find(
      tour => tour.productCode === "41410P10"
    );
    expect(record).toBeDefined();

    const vm = mapViatorToEngine4Tour({
      record: record!,
      apiTour: {
        productCode: "41410P10",
        title:
          "Small Group Tour of Pikes Peak and the Garden of the Gods from Denver",
        sourceUrl:
          "https://www.viator.com/tours/Denver/Small-group-tour-of-Pikes-Peak-and-the-Garden-of-the-Gods-from-Denver/d4837-41410P10",
      },
    });

    expect(vm.facts.priceFrom).toBe("$179.00");
    expect(vm.facts.ratingValue).toBe(5);
    expect(vm.facts.reviewCount).toBe(131);
    expect(vm.facts.duration).toBe("8 hours");
    expect(vm.facts.startTime).toBe("8:00 AM");
    expect(vm.facts.meetingPointFull).toBe(
      "1747 Wynkoop St, Denver, CO 80202, USA"
    );
    expect(vm.facts.cancellationPolicy).toBe(
      "Free cancellation up to 24 hours in advance."
    );
    expect(vm.heroImage).toMatch(/^https:\/\/(dynamic-media|media)\.tacdn\.com\//);
  });

  it("maps the Santa Barbara zipline tour with TACDN hero, populated facts, and affiliate booking URL", () => {
    const record = engine4ViatorTours.find(
      tour => tour.productCode === "421920P2"
    );
    expect(record).toBeDefined();

    const vm = mapViatorToEngine4Tour({
      record: record!,
      apiTour: engine4ViatorApiFallbackByProductCode["421920P2"],
    });

    expect(vm.heroImage).toMatch(/^https:\/\/(dynamic-media|media)\.tacdn\.com\//);
    expect(vm.facts.priceFrom).toBeTruthy();
    expect(vm.facts.ratingValue).toBeTruthy();
    expect(vm.facts.reviewCount).toBeTruthy();
    expect(vm.facts.duration).toBeTruthy();
    expect(vm.facts.startTime).toBeTruthy();
    expect(vm.facts.meetingPointFull).toBeTruthy();

    const bookingUrl = new URL(vm.bookingUrl);
    expect(bookingUrl.searchParams.get("pid")).toBe("P00290915");
    expect(bookingUrl.searchParams.get("mcid")).toBe("42383");
    expect(bookingUrl.searchParams.get("medium")).toBe("link");
  });

  it("maps Joshua Tree API facts without hardcoded fallbacks", () => {
    const record = engine4ViatorTours.find(
      tour => tour.productCode === "6740P7"
    );
    expect(record).toBeDefined();

    const vm = mapViatorToEngine4Tour({
      record: record!,
      apiTour: {
        productCode: "6740P7",
        title: "Joshua Tree National Park Scenic Tour | Rated #1",
        sourceUrl:
          "https://www.viator.com/tours/Palm-Springs/Joshua-Tree-Backroads-Hummer-H2-Tour/d648-6740P7",
        fromPrice: "219.00",
        priceCurrency: "USD",
        rating: 4.9,
        reviewCount: 88,
        duration: "5 hours",
        startTime: "8:00 AM",
        meetingPoint: "Palm Springs, California, USA",
      },
    });

    expect(vm.facts.priceFrom).toBe("$219.00");
    expect(vm.facts.ratingValue).toBe(4.9);
    expect(vm.facts.reviewCount).toBe(88);
    expect(vm.facts.duration).toBe("5 hours");
    expect(vm.facts.startTime).toBe("8:00 AM");
    expect(vm.facts.meetingPointFull).toBe("Palm Springs, California, USA");
    expect(vm.facts.meetingPointShort).toBe("Palm Springs");
  });

  it("maps Joshua Tree rock scrambling with populated facts and TACDN hero", () => {
    const record = engine4ViatorTours.find(
      tour => tour.productCode === "335698P13"
    );
    expect(record).toBeDefined();

    const vm = mapViatorToEngine4Tour({
      record: record!,
      apiTour: engine4ViatorApiFallbackByProductCode["335698P13"],
    });

    expect(vm.heroImage).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1100&h=800&s=1"
    );
    expect(vm.heroImage).not.toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/2f/38/a3/07/caption.jpg?w=1100&h=800&s=1"
    );
    expect(vm.heroImage).not.toBe(
      "https://media.tacdn.com/media/attractions-splice-spp-674x446/06/73/42/6d.jpg"
    );
    expect(vm.facts.priceFrom).toBe("$199.00");
    expect(vm.facts.ratingValue).toBe(5);
    expect(vm.facts.reviewCount).toBe(4);
    expect(vm.facts.duration).toBe("5 hours");
    expect(vm.facts.startTime).toBe("8:00 AM");
    expect(vm.facts.meetingPointFull).toBe("Palm Springs, California");
    expect(vm.content.overview.length).toBeGreaterThan(120);

    const bookingUrl = new URL(vm.bookingUrl);
    expect(bookingUrl.searchParams.get("pid")).toBe("P00290915");
    expect(bookingUrl.searchParams.get("mcid")).toBe("42383");
    expect(bookingUrl.searchParams.get("medium")).toBe("link");
  });

  it("maps 237571P2 with API-derived hero and full-day facts", () => {
    const record = engine4ViatorTours.find(
      tour => tour.productCode === "237571P2"
    );
    expect(record).toBeDefined();

    const vm = mapViatorToEngine4Tour({
      record: record!,
      apiTour: engine4ViatorApiFallbackByProductCode["237571P2"],
    });

    expect(vm.title).toBe("Full-Day Hike in Joshua Tree National Park");
    expect(vm.heroImage).toBe(
      "https://dynamic-media.tacdn.com/media/photo-o/32/28/7e/d5/caption.jpg?w=1100&h=800&s=1"
    );
    expect(vm.facts.priceFrom).toBe("$199.00");
    expect(vm.facts.ratingValue).toBe(5);
    expect(vm.facts.reviewCount).toBe(3);
    expect(vm.facts.duration).toBe("6 hours");
    expect(vm.facts.startTime).toBe("8:00 AM");
    expect(vm.facts.meetingPointFull).toBe("Palm Springs, California, USA");
    expect(vm.content.overview.length).toBeGreaterThan(120);

    const bookingUrl = new URL(vm.bookingUrl);
    expect(bookingUrl.searchParams.get("pid")).toBe("P00290915");
    expect(bookingUrl.searchParams.get("mcid")).toBe("42383");
    expect(bookingUrl.searchParams.get("medium")).toBe("link");
  });

});
